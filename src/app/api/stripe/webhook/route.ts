import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { grantProAccess, revokeProAccess, type PlanType } from '@/lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

const PRICE_TO_PLAN: Record<string, PlanType> = {
  [process.env.STRIPE_PRICE_MONTHLY!]: 'monthly',
  [process.env.STRIPE_PRICE_ANNUAL!]: 'annual',
  [process.env.STRIPE_PRICE_LIFETIME!]: 'lifetime',
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook signature missing or misconfigured.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature.' },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          console.warn('[Webhook] checkout.session.completed sin client_reference_id. Ignorando.');
          break;
        }

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

        if (!plan) {
          console.warn(`[Webhook] Price ID desconocido: ${priceId}. No se otorga acceso.`);
          break;
        }

        await grantProAccess(userId, plan);
        console.log(`[Webhook] Pro access granted: user=${userId}, plan=${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const userId = (customer as Stripe.Customer).metadata?.userId;
        if (!userId) {
          console.warn(`[Webhook] No userId en metadata del customer ${customerId}.`);
          break;
        }

        await revokeProAccess(userId);
        console.log(`[Webhook] Pro access revoked: user=${userId}`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[Webhook] Error procesando evento ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler error.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
