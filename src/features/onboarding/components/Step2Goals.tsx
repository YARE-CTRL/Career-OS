'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { step2Schema, type Step2Data } from '../schemas/onboardingSchema';
import { stagger, fadeUp, inputCls, selectCls, labelCls } from './shared';

interface Props {
  defaultValues: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

const SECTORS = [
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Data Science / IA',
  'DevOps / Cloud',
  'Ciberseguridad',
  'UX/UI Design',
  'Backend / Microservicios',
  'Blockchain / Web3',
];

export function Step2Goals({ defaultValues, onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });

  const hoursPerWeek = watch('hoursPerWeek');

  return (
    <motion.form
      onSubmit={handleSubmit(onNext)}
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.div variants={fadeUp}>
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-1">
          Paso 2 de 4
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
          Objetivo Profesional
        </h2>
        <p className="text-text-main/40 text-sm mt-1">
          Define a dónde quieres llegar y en cuánto tiempo.
        </p>
      </motion.div>

      {/* Goal */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>¿Qué quieres lograr en 6 meses?</label>
        <textarea
          id="step2-goal"
          rows={3}
          className={`${inputCls} resize-none leading-relaxed`}
          placeholder="Ej: Conseguir mi primer empleo como desarrollador web full-stack..."
          {...register('goal')}
        />
        {errors.goal && (
          <p className="text-red-400 text-xs mt-1">{errors.goal.message}</p>
        )}
      </motion.div>

      {/* Sector */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Sector tecnológico de interés</label>
        <div className="relative">
          <select
            id="step2-sector"
            className={selectCls}
            {...register('sector')}
          >
            <option value="">Selecciona un sector...</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-main/40">
            ▾
          </div>
        </div>
        {errors.sector && (
          <p className="text-red-400 text-xs mt-1">{errors.sector.message}</p>
        )}
      </motion.div>

      {/* Hours per week */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Horas semanales de estudio</label>
        <div className="flex items-center gap-4">
          <input
            id="step2-hours"
            type="range"
            min={1}
            max={40}
            step={1}
            className="flex-1 accent-[#00D4AA] cursor-pointer"
            {...register('hoursPerWeek', { valueAsNumber: true })}
            onChange={(e) =>
              setValue('hoursPerWeek', Number(e.target.value), {
                shouldValidate: true,
              })
            }
          />
          <span className="flex-shrink-0 w-16 text-center bg-primary/15 text-primary text-sm font-bold rounded-lg py-1.5">
            {hoursPerWeek}h/sem
          </span>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex gap-3 pt-2">
        <button
          id="step2-back"
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-full border border-text-main/20 text-text-main/60 font-semibold py-4 px-6 text-sm hover:border-text-main/40 hover:text-text-main transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>
        <button
          id="step2-next"
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-background font-bold py-4 text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
        >
          Siguiente
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.form>
  );
}
