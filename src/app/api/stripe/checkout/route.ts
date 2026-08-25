import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const PLAN_CONFIG: Record<string, { priceId: string; mode: Stripe.Checkout.SessionCreateParams.Mode }> = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    mode: 'subscription',
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    mode: 'subscription',
  },
  lifetime: {
    priceId: process.env.STRIPE_PRICE_LIFETIME!,
    mode: 'payment',
  },
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { plan } = await request.json();
    const config = PLAN_CONFIG[plan];

    if (!config || !config.priceId) {
      return NextResponse.json({ error: `Plan desconocido: ${plan}` }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const userId = session.user.id || session.user.email || 'unknown';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: config.priceId, quantity: 1 }],
      client_reference_id: userId,
      customer_email: session.user.email ?? undefined,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: {
        userId,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    const message = error instanceof Error ? error.message : 'Error al crear la sesión de pago.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
