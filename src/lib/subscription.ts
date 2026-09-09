import { Redis } from '@upstash/redis';

const getRedis = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[Subscription] Upstash Redis credentials missing.');
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

const redis = getRedis();

export type PlanType = 'free' | 'monthly' | 'annual' | 'lifetime';

export interface UserSubscription {
  plan: PlanType;
  expiresAt: number | null;
}

/**
 * Verifica si un usuario tiene acceso Pro activo.
 */
export async function checkProStatus(userId: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const status = await redis.get<string>(`pro:${userId}`);
    if (status === 'lifetime') return true;
    if (status === 'active') {
      const expiresAt = await redis.get<number>(`pro_expires:${userId}`);
      if (expiresAt && Date.now() > expiresAt) {
        await revokeProAccess(userId);
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[Subscription] Error checking pro status for ${userId}:`, error);
    return false;
  }
}

/**
 * Otorga acceso Pro basado en el tipo de plan (calcula la expiración internamente).
 * Usar para checkout.session.completed.
 */
export async function grantProAccess(userId: string, plan: PlanType): Promise<void> {
  if (!redis) return;
  try {
    const pipeline = redis.pipeline();

    if (plan === 'lifetime') {
      pipeline.set(`pro:${userId}`, 'lifetime');
      pipeline.del(`pro_expires:${userId}`);
    } else {
      pipeline.set(`pro:${userId}`, 'active');

      const now = new Date();
      if (plan === 'monthly') now.setMonth(now.getMonth() + 1);
      else if (plan === 'annual') now.setFullYear(now.getFullYear() + 1);
      now.setDate(now.getDate() + 2); // 2 días de gracia

      const expiresAt = now.getTime();
      pipeline.set(`pro_expires:${userId}`, expiresAt);
      pipeline.expire(`pro:${userId}`, Math.floor((expiresAt - Date.now()) / 1000));
    }

    await pipeline.exec();
    console.log(`[Subscription] Granted ${plan} Pro access to ${userId}`);
  } catch (error) {
    console.error(`[Subscription] Error granting pro access to ${userId}:`, error);
    throw error;
  }
}

/**
 * Otorga acceso Pro usando la fecha REAL de Stripe (current_period_end * 1000).
 * Usar para invoice.payment_succeeded (renovaciones automáticas).
 * Así el TTL en Redis siempre coincide con el periodo de Stripe.
 */
export async function grantProAccessUntil(userId: string, expiresAtMs: number): Promise<void> {
  if (!redis) return;
  try {
    const gracePeriodMs = 2 * 24 * 60 * 60 * 1000; // 2 días de gracia
    const expiresWithGrace = expiresAtMs + gracePeriodMs;
    const ttlSeconds = Math.floor((expiresWithGrace - Date.now()) / 1000);

    if (ttlSeconds <= 0) {
      console.warn(`[Subscription] grantProAccessUntil: TTL negativo para ${userId}. Ignorando.`);
      return;
    }

    const pipeline = redis.pipeline();
    pipeline.set(`pro:${userId}`, 'active');
    pipeline.set(`pro_expires:${userId}`, expiresWithGrace);
    pipeline.expire(`pro:${userId}`, ttlSeconds);
    await pipeline.exec();

    console.log(`[Subscription] Renewed Pro for ${userId} until ${new Date(expiresWithGrace).toISOString()}`);
  } catch (error) {
    console.error(`[Subscription] Error in grantProAccessUntil for ${userId}:`, error);
    throw error;
  }
}

/**
 * Revoca el acceso Pro (cancelaciones o expiraciones manuales).
 */
export async function revokeProAccess(userId: string): Promise<void> {
  if (!redis) return;
  try {
    const pipeline = redis.pipeline();
    pipeline.del(`pro:${userId}`);
    pipeline.del(`pro_expires:${userId}`);
    await pipeline.exec();
    console.log(`[Subscription] Revoked Pro access for ${userId}`);
  } catch (error) {
    console.error(`[Subscription] Error revoking pro access for ${userId}:`, error);
  }
}
