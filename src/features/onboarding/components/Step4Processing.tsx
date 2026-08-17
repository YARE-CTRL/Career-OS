'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Brain, CheckCircle, LayoutDashboard, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCareerStore } from '@/store';
import type { OnboardingData } from '../schemas/onboardingSchema';
import { stagger, fadeUp } from './shared';

// ─── Processing messages ──────────────────────────────────────────────────────

const PROCESSING_MESSAGES = [
  'Analizando tus habilidades actuales...',
  'Mapeando el mercado laboral...',
  'Identificando brechas de conocimiento...',
  'Construyendo tu roadmap personalizado...',
  'Configurando tu workspace Notion...',
];

// ─── Step 4: IA Procesando ────────────────────────────────────────────────────

interface Step4Props {
  formData: OnboardingData;
  onDone: () => void;
}

export function Step4Processing({ formData, onDone }: Step4Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  // ─── FIX: usar generateRoadmap del store, que ya inyecta parent_id ──────────
  // El fetch manual anterior enviaba solo `formData` sin `parent_id`, causando
  // el error 400. generateRoadmap() lee selectedPageId del store e incluye
  // parent_id en el POST. También llama setProfile y setSystemData internamente.
  const generateRoadmap = useCareerStore((s) => s.generateRoadmap);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % PROCESSING_MESSAGES.length);
    }, 600);

    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout;

    const generateSystem = async () => {
      try {
        // Fallback de seguridad: Si la promesa se queda colgada (pasa a veces con middleware o proxy), 
        // forzamos un error tras 60 segundos.
        const timeoutPromise = new Promise((_, reject) => {
          fallbackTimeout = setTimeout(() => reject(new Error('La petición tardó demasiado.')), 60000);
        });

        await Promise.race([
          generateRoadmap(formData),
          timeoutPromise
        ]);

        if (isMounted) {
          clearInterval(msgInterval);
          clearTimeout(fallbackTimeout);
          onDone();
        }
      } catch (err: any) {
        if (!isMounted) return;
        clearInterval(msgInterval);
        clearTimeout(fallbackTimeout);

        console.error('[Step4] API Error caught:', err);

        const errorMessage = err?.message || String(err);
        
        // Comprobar si es el límite de Upstash (ya sea por status o texto)
        if (err?.status === 429 || errorMessage.toLowerCase().includes('límite')) {
          setIsQuotaError(true);
          setError(errorMessage || 'Límite de uso alcanzado temporalmente.');
          return;
        }

        setError(errorMessage || 'Error desconocido al procesar.');
      }
    };

    generateSystem();

    return () => {
      isMounted = false;
      clearInterval(msgInterval);
    };
  }, [formData, onDone, generateRoadmap]);

  // ─── Error State ─────────────────────────────────────────────────────────────

  // ─── Quota Error State (429) ──────────────────────────────────────────────────

  if (isQuotaError) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 py-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-amber-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            Límite temporal alcanzado
          </h2>
          <p className="text-white/60 text-sm max-w-sm">{error}</p>
          <p className="text-white/30 text-xs mt-1">
            El plan gratuito de Gemini tiene un límite de llamadas por minuto.
          </p>
        </div>
        <button
          onClick={() => {
            setIsQuotaError(false);
            setError(null);
          }}
          className="mt-2 px-6 py-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold hover:bg-amber-500/30 transition-all"
        >
          Intentar de nuevo
        </button>
      </motion.div>
    );
  }

  // ─── Generic Error State ──────────────────────────────────────────────────────

  if (error) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 py-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Hubo un problema
          </h2>
          <p className="text-white/60 text-sm max-w-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  // ─── Loading State ────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-8 py-6 text-center"
    >
      {/* Pulsing brain icon with rings + AI background */}
      <motion.div variants={fadeUp} className="relative flex items-center justify-center">
        {/* Blurred AI visual behind spinner */}
        <div className="absolute w-52 h-52 rounded-full overflow-hidden -z-10">
          <Image
            src="/assets/processing_ai.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-30 blur-sm scale-110"
            aria-hidden
          />
        </div>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/20"
            initial={{ width: 64, height: 64, opacity: 0.6 }}
            animate={{ width: 64 + i * 36, height: 64 + i * 36, opacity: 0 }}
            transition={{ duration: 1.8, delay: i * 0.35, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Brain size={32} className="text-white" />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          IA Procesando tu perfil
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-white/60 text-sm"
          >
            {PROCESSING_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        variants={fadeUp}
        className="w-full max-w-xs h-1.5 bg-white/15 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
        />
      </motion.div>

      {/* Dots loader */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Step 5: Sistema Listo ────────────────────────────────────────────────────

export function Step5Success() {
  const SUCCESS_ITEMS = [
    { icon: Rocket, text: 'Tu roadmap fue generado' },
    { icon: LayoutDashboard, text: 'Tu workspace Notion está configurado' },
    { icon: Sparkles, text: 'IA Copiloto activada y lista' },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-6 py-4 text-center"
    >
      {/* Check icon with burst animation + celebration background */}
      <motion.div
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: 'spring', stiffness: 260, damping: 18, delay: 0.1 },
          },
        }}
        className="relative"
      >
        {/* Celebration background image */}
        <div className="absolute -inset-12 rounded-full overflow-hidden -z-10 pointer-events-none" aria-hidden>
          <Image
            src="/assets/success_celebration.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20 blur-[2px] scale-110"
          />
        </div>
        <div className="w-24 h-24 rounded-full bg-background/20 flex items-center justify-center">
          <CheckCircle size={56} className="text-background" strokeWidth={2.5} />
        </div>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-background/60"
            style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((deg * Math.PI) / 180) * 52,
              y: Math.sin((deg * Math.PI) / 180) * 52,
              opacity: 0,
            }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-background tracking-tight">
          SISTEMA LISTO
        </h2>
        <p className="text-background/70 text-sm font-medium">
          Tu roadmap fue generado exitosamente
        </p>
      </motion.div>

      <motion.div variants={stagger} className="flex flex-col gap-3 w-full max-w-xs">
        {SUCCESS_ITEMS.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: -16 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.4 + i * 0.12 } },
            }}
            className="flex items-center gap-3 bg-background/15 rounded-xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-lg bg-background/15 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-background" />
            </div>
            <span className="text-background/90 text-sm font-medium">{text}</span>
            <CheckCircle size={14} className="text-background/70 ml-auto flex-shrink-0" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="w-full pt-2">
        <Link
          href="/dashboard"
          id="go-to-dashboard"
          className="group w-full flex items-center justify-center gap-2 rounded-full bg-background text-primary font-bold py-4 text-sm shadow-xl hover:bg-background/90 hover:scale-[1.02] transition-all duration-200"
        >
          <LayoutDashboard size={16} />
          Ir a mi Dashboard
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
