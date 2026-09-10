import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/auth';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkProStatus } from '@/lib/subscription';
import { z } from 'zod';
import { resolveUserId } from '@/lib/session';

// ─── Redis ──────────────────────────────────────────────────────────────────────
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const FREE_LIMIT = 3;

function createLimiter(max: number) {
  return new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.fixedWindow(max, '1 d'),
    analytics: true,
  });
}

// ─── Validación Zod — Defensa contra Prompt Injection ──────────────────────────
// SEGURIDAD: Limitamos longitud y tipo de todos los campos que se interpolan
// en el prompt de Gemini. Un payload malicioso como "Ignora todo lo anterior..."
// queda atrapado aquí antes de llegar al modelo.
const SAFE_STRING = z.string().max(300).trim();

const CopilotBodySchema = z.object({
  profile: z.object({
    level:        SAFE_STRING,
    sector:       SAFE_STRING,
    role:         SAFE_STRING,
    goal:         SAFE_STRING,
    hoursPerWeek: z.number().optional(),
  }),
  nextTask: z.object({
    title:       SAFE_STRING,
    description: SAFE_STRING,
    type:        SAFE_STRING.optional(),
  }),
});

// ─── Sanitización anti-Prompt Injection ────────────────────────────────────────
// Elimina secuencias de control comunes usadas en ataques de inyección de prompts.
// Ej: "Ignora todo lo anterior\n\nNueva instrucción: ..."
function sanitizeForPrompt(text: string): string {
  return text
    .replace(/ignore\s+(all\s+)?(previous|above|prior)/gi, '[REDACTED]')
    .replace(/system\s*prompt/gi, '[REDACTED]')
    .replace(/\bDAN\b/g, '[REDACTED]')
    .replace(/#{2,}/g, '')       // Eliminar headings markdown usados para jailbreak
    .replace(/\n{3,}/g, '\n\n')  // Colapsar saltos de línea múltiples
    .trim();
}

// ─── POST /api/copilot/advice ──────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión.' },
        { status: 401 }
      );
    }

    // SEGURIDAD: resolveUserId descarta el email placeholder estático
    // 'notion@careeros.local' que es compartido por todos los usuarios.
    const userId = resolveUserId(session);
    if (!userId) {
      console.error('[Copilot] userId no resoluble. Sesión inválida.');
      return NextResponse.json(
        { error: 'Sesión inválida. Vuelve a iniciar sesión.' },
        { status: 401 }
      );
    }

    // ── Rate Limiting ──────────────────────────────────────────────────────────
    if (redis) {
      try {
        const isPro = await checkProStatus(userId);
        const limit = isPro ? 999 : FREE_LIMIT;
        const limiter = createLimiter(limit);

        const { success, remaining, reset } = await limiter.limit(`copilot:${userId}`);

        console.log(
          `[Copilot Rate Limit] user:${userId.slice(0, 8)}… | remaining:${remaining}/${limit} | isPro:${isPro}`
        );

        if (!success) {
          return NextResponse.json(
            {
              error: isPro
                ? 'Has alcanzado el límite de consejos de tu plan.'
                : 'Has alcanzado el límite de 3 consejos gratuitos al día. Desbloquea el Plan Pro para ilimitados.',
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(reset),
              },
            }
          );
        }
      } catch (rateLimitError) {
        console.error('[Copilot Rate Limit] Error, permitiendo petición:', rateLimitError);
      }
    }

    // ── Gemini API Key ─────────────────────────────────────────────────────────
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta (Gemini).' },
        { status: 500 }
      );
    }

    // ── Validación y Sanitización del Body ────────────────────────────────────
    // SEGURIDAD: Zod valida tipos y longitud. sanitizeForPrompt() elimina
    // patrones conocidos de prompt injection antes de interpolar en Gemini.
    const rawBody = await request.json();
    const parsed = CopilotBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      console.warn('[Copilot] Payload inválido:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'Datos del perfil inválidos o demasiado largos.' },
        { status: 400 }
      );
    }

    const { profile, nextTask } = parsed.data;

    // Sanitizar cada campo antes de interpolarlo en el prompt
    const safeLevel     = sanitizeForPrompt(profile.level);
    const safeSector    = sanitizeForPrompt(profile.sector);
    const safeRole      = sanitizeForPrompt(profile.role);
    const safeGoal      = sanitizeForPrompt(profile.goal);
    const safeTaskTitle = sanitizeForPrompt(nextTask.title);
    const safeTaskDesc  = sanitizeForPrompt(nextTask.description);

    // ── Generación con Gemini ──────────────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `Eres un Mentor Técnico Experto. Tu alumno te está pidiendo un consejo rápido y altamente accionable para empezar su semana.

PERFIL: ${safeLevel} en ${safeSector}, Rol objetivo: ${safeRole}.
META A 6 MESES: ${safeGoal}
TAREA ACTUAL DEL ROADMAP: "${safeTaskTitle}" - ${safeTaskDesc}

Instrucciones estrictas:
- Genera un párrafo corto (máximo 2 a 3 oraciones).
- NO uses saludos ("Hola", "Qué tal").
- NO repitas la información de la tarea, dale un tip secreto o "hack" directo de la industria para completar esa tarea más rápido o con mejor calidad.
- Sé motivador, directo y sin relleno (no fluff).`;

    const result = await model.generateContent(prompt);
    const advice = result.response.text().trim();

    return NextResponse.json({ advice });

  } catch (error: unknown) {
    console.error('[copilot-advice] Unhandled error:', error);
    const message = error instanceof Error
      ? error.message
      : 'Ocurrió un error inesperado al generar tu consejo.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
