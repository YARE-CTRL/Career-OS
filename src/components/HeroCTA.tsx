'use client';

import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroCTA() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full bg-primary/70 text-background font-bold text-base px-8 py-4 shadow-lg opacity-80 cursor-not-allowed">
        <Loader2 size={18} className="animate-spin" />
        Verificando sesión...
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <Link
        href="/onboarding"
        id="hero-cta-primary-auth"
        className="group flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-background font-bold text-base px-8 py-4 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300"
      >
        Continuar al Onboarding
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signIn('notion', { callbackUrl: '/onboarding' })}
      id="hero-cta-primary-unauth"
      className="group flex items-center justify-center gap-2 rounded-full bg-primary text-background font-bold text-base px-8 py-4 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
    >
      Empieza gratis hoy
      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
    </motion.button>
  );
}
