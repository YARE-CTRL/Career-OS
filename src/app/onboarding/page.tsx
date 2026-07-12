'use client';

import { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

import { Step1Profile } from '@/features/onboarding/components/Step1Profile';
import { Step2Goals } from '@/features/onboarding/components/Step2Goals';
import { Step3Skills } from '@/features/onboarding/components/Step3Skills';
import { Step4Processing, Step5Success } from '@/features/onboarding/components/Step4Processing';
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  OnboardingData,
} from '@/features/onboarding/schemas/onboardingSchema';

// ─── Slide animation for transitions ─────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: EASE },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  }),
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(((current - 1) / (total - 1)) * 100, 100);
  return (
    <div className="w-full h-1 bg-text-main/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_META: Record<number, { label: string; cardBg: string }> = {
  1: { label: 'Perfil Básico', cardBg: 'bg-surface' },
  2: { label: 'Objetivo Profesional', cardBg: 'bg-surface' },
  3: { label: 'Habilidades Actuales', cardBg: 'bg-surface' },
  4: { label: 'IA Procesando', cardBg: 'bg-secondary' },
  5: { label: 'Sistema Listo', cardBg: 'bg-primary' },
};

const TOTAL_STEPS = 5;

// ─── Default values (initial state for each step) ─────────────────────────────

const DEFAULT_STEP1: Step1Data = { name: '', role: '', level: 'Estudiante' };
const DEFAULT_STEP2: Step2Data = { goal: '', sector: '', hoursPerWeek: 10 };
const DEFAULT_STEP3: Step3Data = { technologies: [], courses: [], projects: [] };

// ─── Page (Container) ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // RHF owns state while typing. Zustand receives validated data on submit.
  // We keep minimal local copies here only to pre-fill if user goes back.
  const [step1Data, setStep1Data] = useState<Step1Data>(DEFAULT_STEP1);
  const [step2Data, setStep2Data] = useState<Step2Data>(DEFAULT_STEP2);
  const [step3Data, setStep3Data] = useState<Step3Data>(DEFAULT_STEP3);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data);
    goNext();
  };

  const handleStep2 = (data: Step2Data) => {
    setStep2Data(data);
    goNext();
  };

  const handleStep3 = (data: Step3Data) => {
    setStep3Data(data);
    goNext();
  };

  // Combined payload (only available after step 3 is validated)
  const fullFormData: OnboardingData = { ...step1Data, ...step2Data, ...step3Data };

  const { cardBg, label } = STEP_META[step];
  const showHeader = step <= 3;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[100px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-text-main font-black text-xl tracking-tight"
      >
        CAREER{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          OS AI
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        layout
        className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl ${
          step === 4
            ? 'border-secondary/30 shadow-secondary/20'
            : step === 5
            ? 'border-primary/40 shadow-primary/25'
            : 'border-text-main/8 shadow-black/40'
        }`}
        transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
      >
        {/* Progress header (steps 1–3) */}
        {showHeader && (
          <div className="bg-surface px-6 pt-5 pb-4 border-b border-text-main/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-main/40 text-xs font-semibold">
                {step} / 4 — {label}
              </span>
              <span className="text-text-main/30 text-xs">
                {Math.round(((step - 1) / 3) * 100)}% completado
              </span>
            </div>
            <ProgressBar current={step} total={4} />
          </div>
        )}

        {/* Step content */}
        <div className={`${cardBg} p-6 sm:p-8`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 1 && (
                <Step1Profile defaultValues={step1Data} onNext={handleStep1} />
              )}
              {step === 2 && (
                <Step2Goals
                  defaultValues={step2Data}
                  onNext={handleStep2}
                  onBack={goBack}
                />
              )}
              {step === 3 && (
                <Step3Skills
                  defaultValues={step3Data}
                  onNext={handleStep3}
                  onBack={goBack}
                />
              )}
              {step === 4 && (
                <Step4Processing formData={fullFormData} onDone={goNext} />
              )}
              {step === 5 && <Step5Success />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Step dots (steps 1–3) */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 mt-6"
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 h-2 bg-primary'
                  : s < step
                  ? 'w-2 h-2 bg-primary/50'
                  : 'w-2 h-2 bg-text-main/15'
              }`}
            />
          ))}
        </motion.div>
      )}

      {/* Footer */}
      <p className="mt-8 text-text-main/20 text-xs">
        © 2025 Career OS AI · Tu privacidad está protegida
      </p>
    </div>
  );
}
