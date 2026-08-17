import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Inicializar el Rate Limiter (solo se ejecuta si hay credenciales para evitar errores locales)
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  ratelimit = new Ratelimit({
    redis,
    // Límite permisivo para pruebas de UI y Chaos Mode
    limiter: Ratelimit.slidingWindow(100, '12 h'),
    analytics: true,
  });
}

export const proxy = auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // ─── RATE LIMITING PARA GENERAR ROADMAP ───
  if (pathname === '/api/generate-system' && req.method === 'POST') {
    if (ratelimit) {
      // Usar el ID del usuario (o IP de los headers como fallback) para identificarlo
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
      const identifier = req.auth?.user?.id || ip;
      const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
      
      console.log(`[Rate Limit] User ${identifier} | Remaining: ${remaining}/${limit}`);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Has alcanzado el límite de 3 roadmaps cada 12 horas. Intenta más tarde.' },
          { 
            status: 429, 
            headers: { 
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString()
            } 
          }
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  // Proteger rutas privadas y las rutas API críticas
  matcher: ['/onboarding', '/dashboard', '/api/generate-system'],
};
