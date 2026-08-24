import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── Inicializar Redis (solo si hay credenciales configuradas) ─────────────────

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Crea un rate limiter con límite fijo mensual.
 * Free: 3 generaciones por mes.
 * Pro: 999 generaciones por mes (efectivamente ilimitado).
 */
function createLimiter(max: number): Ratelimit {
  return new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.fixedWindow(max, '30 d'),
    analytics: true,
  });
}

// ─── Límites por tipo de identificador ────────────────────────────────────────
const FREE_LIMIT = 3;

// ─── Proxy (Next.js Middleware) ───────────────────────────────────────────────

export const proxy = auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // ─── RATE LIMITING ANTI-ABUSO — Triple barrera ────────────────────────────
  if (pathname === '/api/generate-system' && req.method === 'POST') {
    if (redis) {
      // 1. Identificar las 3 dimensiones de rate limit
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'anonymous';
      const userId = req.auth?.user?.id || `anon-${ip}`;
      const fingerprint = req.headers.get('x-fp-id') || `no-fp-${ip}`;

      // 2. Comprobar si el usuario es Pro (clave: pro:{userId} en Redis)
      let isPro = false;
      try {
        const proStatus = await redis.get<string>(`pro:${userId}`);
        isPro = proStatus === 'active' || proStatus === 'lifetime';
      } catch {
        // Si Redis falla en la consulta Pro, continuar como Free (fail-safe)
        isPro = false;
      }

      const limit = isPro ? 999 : FREE_LIMIT;
      const limiter = createLimiter(limit);

      // 3. Ejecutar las 3 comprobaciones en paralelo (máxima eficiencia)
      const [byUser, byIp, byFingerprint] = await Promise.all([
        limiter.limit(`user:${userId}`),
        limiter.limit(`ip:${ip}`),
        limiter.limit(`fp:${fingerprint}`),
      ]);

      // El menor de los 3 "remaining" es el que mostramos al usuario
      const minRemaining = Math.min(
        byUser.remaining,
        byIp.remaining,
        byFingerprint.remaining
      );

      console.log(
        `[Rate Limit] user:${userId.slice(0, 8)}… | ip:${ip} | fp:${fingerprint.slice(0, 8)}… | remaining:${minRemaining}/${limit} | isPro:${isPro}`
      );

      // 4. Si cualquiera de los 3 límites se agota → bloquear
      if (!byUser.success || !byIp.success || !byFingerprint.success) {
        return NextResponse.json(
          {
            error: isPro
              ? 'Has alcanzado el límite de generaciones de tu plan. Contacta soporte.'
              : 'Has alcanzado el límite gratuito de 3 roadmaps al mes. Desbloquea el Plan Pro para generar ilimitado.',
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': byUser.reset.toString(),
            },
          }
        );
      }

      // 5. Pasar la petición al handler con el contador actualizado en los headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', minRemaining.toString());
      response.headers.set('X-RateLimit-Reset', byUser.reset.toString());
      return response;
    }
  }

  return NextResponse.next();
});

export const config = {
  // Proteger rutas privadas y las rutas API críticas
  matcher: ['/onboarding', '/dashboard', '/api/generate-system'],
};
