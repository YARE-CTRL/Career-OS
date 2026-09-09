import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { grantProAccess, grantProAccessUntil, revokeProAccess, type PlanType } from '@/lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
});

const PRICE_TO_PLAN: Record<string, PlanType> = {
  [process.env.STRIPE_PRICE_MONTHLY!]:  'monthly',
  [process.env.STRIPE_PRICE_ANNUAL!]:   'annual',
  [process.env.STRIPE_PRICE_LIFETIME!]: 'lifetime',
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook signature missing or misconfigured.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  console.log(`[Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {

      // ── Pago completado (suscripción o pago único) ─────────────────────────
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

      // ── Renovación automática (mensual/anual) ──────────────────────────────
      // FIX CRÍTICO: Sin este handler, el TTL en Redis expira y el usuario
      // que paga recurrentemente es degradado a Free.
      // FIX API: En Stripe 2026-07-29.dahlia, invoice.subscription fue reemplazado
      // por invoice.parent.subscription_details.subscription
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Solo procesar renovaciones (no la creación inicial)
        if (invoice.billing_reason === 'subscription_create') break;

        // Nueva estructura: invoice.parent.subscription_details.subscription
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;

        if (!subscriptionId) break;

        // El userId puede venir del snapshot metadata del invoice o de la suscripción
        const metadataUserId = invoice.parent?.subscription_details?.metadata?.userId as string | undefined;

        let userId = metadataUserId;
        // Siempre recuperamos la suscripción para obtener current_period_end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!userId) {
          userId = subscription.metadata?.userId;
        }

        if (!userId) {
          console.warn(`[Webhook] invoice.payment_succeeded sin userId. sub=${subscriptionId}`);
          break;
        }

        const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end;
        const expiresAtMs = itemPeriodEnd ? itemPeriodEnd * 1000 : Date.now() + 32 * 24 * 60 * 60 * 1000;
        await grantProAccessUntil(userId, expiresAtMs);
        console.log(`[Webhook] Pro renewed: user=${userId}, expires=${new Date(expiresAtMs).toISOString()}`);
        break;
      }

      // ── Fallo de pago en renovación ────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // API 2026-07-29.dahlia: usar parent.subscription_details.subscription
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status !== 'past_due' && subscription.status !== 'unpaid') break;

        const userId = subscription.metadata?.userId;
        if (userId) {
          console.warn(`[Webhook] Pago fallido para user=${userId}. Status sub: ${subscription.status}`);
        }
        break;
      }

      // ── Cancelación de suscripción ─────────────────────────────────────────
      // FIX CRÍTICO: Antes leíamos customer.metadata.userId (siempre undefined).
      // Ahora leemos subscription.metadata.userId (seteado en checkout).
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.warn(`[Webhook] customer.subscription.deleted sin userId en metadata. sub=${subscription.id}`);
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
