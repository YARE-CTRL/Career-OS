import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { checkProStatus, grantProAccess, type PlanType } from '@/lib/subscription';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { resolveUserId } from '@/lib/session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

// SEGURIDAD: Rate limit para el path de reconciliación con session_id.
// Sin esto, un atacante puede hacer fuerza bruta de session_id para encontrar
// sesiones de pago ajenas y otorgarse acceso Pro sin pagar.
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Máximo 5 reconciliaciones con session_id por usuario cada 10 minutos.
// En un pago normal el usuario solo necesita 1 o 2 intentos (redireccionado desde Stripe).
const sessionIdLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '10 m'),
      analytics: true,
    })
  : null;

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isPro: false });
    }

    const userId = resolveUserId(session);
    if (!userId) return NextResponse.json({ isPro: false });

    let isPro = await checkProStatus(userId);

    // FIX: Reconciliación activa con Stripe cuando viene session_id
    // Cubre la condición de carrera entre la redirección del usuario
    // y la llegada del webhook (500–2500ms de latencia).
    if (!isPro) {
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get('session_id');

      if (sessionId) {
        // SEGURIDAD: Validar formato del session_id antes de llamar a Stripe.
        // Los session_id de Stripe siempre empiezan con 'cs_' (live) o 'cs_test_'.
        // Cualquier otra cosa es un intento de probe o fuzzing.
        const isValidFormat = /^cs_(test_|live_)?[a-zA-Z0-9]{10,}$/.test(sessionId);
        if (!isValidFormat) {
          console.warn(`[ProStatus] session_id con formato inválido descartado: ${sessionId.slice(0, 20)}`);
          return NextResponse.json({ isPro: false });
        }

        // SEGURIDAD: Aplicar rate limit por usuario para prevenir fuerza bruta.
        if (sessionIdLimiter) {
          const { success } = await sessionIdLimiter.limit(`pro-reconcile:${userId}`);
          if (!success) {
            console.warn(`[ProStatus] Rate limit de reconciliación alcanzado para user=${userId.slice(0, 8)}`);
            return NextResponse.json({ isPro: false }, { status: 429 });
          }
        }

        try {
          const checkout = await stripe.checkout.sessions.retrieve(sessionId);
          if (
            checkout.payment_status === 'paid' &&
            checkout.client_reference_id === userId
          ) {
            const plan = (checkout.metadata?.plan as PlanType) || 'monthly';
            await grantProAccess(userId, plan);
            isPro = true;
            console.log(`[ProStatus] Reconciliación activa: Pro otorgado a ${userId} via session_id`);
          }
        } catch (stripeErr) {
          // Si Stripe falla, no bloqueamos — el webhook lo procesará tarde
          console.error('[ProStatus] Error en reconciliación con Stripe:', stripeErr);
        }
      }
    }

    return NextResponse.json({ isPro });
  } catch (error) {
    console.error('[/api/me/pro-status] Error:', error);
    return NextResponse.json({ isPro: false });
  }
}
