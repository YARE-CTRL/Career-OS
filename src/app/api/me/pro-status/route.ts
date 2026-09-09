import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { checkProStatus, grantProAccess, type PlanType } from '@/lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isPro: false });
    }

    const userId = session.user.id || session.user.email;
    if (!userId) return NextResponse.json({ isPro: false });

    let isPro = await checkProStatus(userId);

    // FIX: Reconciliación activa con Stripe cuando viene session_id
    // Cubre la condición de carrera entre la redirección del usuario
    // y la llegada del webhook (500–2500ms de latencia).
    if (!isPro) {
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get('session_id');

      if (sessionId) {
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
