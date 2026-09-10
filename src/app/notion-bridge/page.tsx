'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

function BridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const otc = searchParams.get('otc');

    // ── Modo OTC (producción con Redis) ────────────────────────────────────────
    // El callback almacenó el token en Redis y nos redirigió con un código
    // aleatorio de un solo uso. Lo canjeamos server-side para que el access_token
    // nunca viaje en la URL ni quede en el historial del browser.
    if (otc) {
      const exchangeAndSignIn = async () => {
        try {
          const res = await fetch('/api/notion/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otc }),
          });

          if (!res.ok) {
            console.error('[Bridge] Error canjeando OTC:', res.status);
            router.push('/?error=OTCExchangeFailed');
            return;
          }

          const { access_token, id, name } = await res.json();

          if (!access_token || !id || !name) {
            router.push('/?error=MissingBridgeData');
            return;
          }

          await signIn('notion-manual', {
            access_token,
            id,
            name,
            callbackUrl: '/onboarding',
          });
        } catch (err) {
          console.error('[Bridge] Error en exchange:', err);
          router.push('/?error=NetworkFailure');
        }
      };

      exchangeAndSignIn();
      return;
    }

    // ── Modo Fallback (dev local sin Redis) ────────────────────────────────────
    // Solo ocurre cuando Redis no está configurado en el entorno de desarrollo.
    // En producción (Vercel + Upstash) este path nunca se ejecuta.
    const accessToken = searchParams.get('access_token');
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (accessToken && id && name) {
      signIn('notion-manual', {
        access_token: accessToken,
        id,
        name,
        callbackUrl: '/onboarding',
      });
    } else {
      router.push('/?error=MissingBridgeData');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mb-6"
      />
      <h2 className="text-xl font-bold text-text-main">
        Autenticando con Notion...
      </h2>
      <p className="text-sm text-text-main/50 mt-2">
        Asegurando tu conexión.
      </p>
    </div>
  );
}

export default function NotionBridgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BridgeContent />
    </Suspense>
  );
}
