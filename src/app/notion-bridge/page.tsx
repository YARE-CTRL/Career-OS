'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

function BridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (accessToken && id && name) {
      // Call NextAuth signIn with our custom credentials provider
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
