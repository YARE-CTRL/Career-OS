import { Redis } from '@upstash/redis';

// Inicializar Redis de forma segura
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
  expiresAt: number | null; // Timestamp en ms. Null para lifetime o free.
}

/**
 * Verifica si un usuario tiene acceso Pro activo en este momento.
 */
export async function checkProStatus(userId: string): Promise<boolean> {
  if (!redis) return false;
  
  try {
    const status = await redis.get<string>(`pro:${userId}`);
    if (status === 'lifetime') return true;
    if (status === 'active') {
      // Verificamos si expiró (por seguridad, aunque Redis borra las keys con TTL)
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
 * Otorga acceso Pro a un usuario basándose en el plan adquirido.
 */
export async function grantProAccess(userId: string, plan: PlanType): Promise<void> {
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();

    if (plan === 'lifetime') {
      pipeline.set(`pro:${userId}`, 'lifetime');
      // Limpiamos expiración si tuviera una de un plan anterior
      pipeline.del(`pro_expires:${userId}`); 
    } else {
      pipeline.set(`pro:${userId}`, 'active');
      
      // Calcular fecha de expiración
      const now = new Date();
      if (plan === 'monthly') {
        now.setMonth(now.getMonth() + 1);
      } else if (plan === 'annual') {
        now.setFullYear(now.getFullYear() + 1);
      }
      
      // Añadimos 2 días de gracia para que la renovación automática no corte el servicio
      now.setDate(now.getDate() + 2); 
      const expiresAt = now.getTime();
      
      pipeline.set(`pro_expires:${userId}`, expiresAt);
      
      // Configuramos TTL real en la key principal para que Redis limpie automáticamente (en segundos)
      const ttlSeconds = Math.floor((expiresAt - Date.now()) / 1000);
      pipeline.expire(`pro:${userId}`, ttlSeconds);
    }

    await pipeline.exec();
    console.log(`[Subscription] Granted ${plan} Pro access to ${userId}`);
  } catch (error) {
    console.error(`[Subscription] Error granting pro access to ${userId}:`, error);
    throw error;
  }
}

/**
 * Revoca el acceso Pro (útil para cancelaciones o expiraciones manuales).
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
