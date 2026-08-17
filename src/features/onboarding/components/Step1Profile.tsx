'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { step1Schema, type Step1Data } from '../schemas/onboardingSchema';
import { stagger, fadeUp, inputCls, labelCls } from './shared';
import { NotionPageSelector } from '@/components/NotionPageSelector';
import { useCareerStore } from '@/store';

interface Props {
  defaultValues: Step1Data;
  onNext: (data: Step1Data) => void;
}

const LEVELS = ['Estudiante', 'Practicante', 'Junior'] as const;

export function Step1Profile({ defaultValues, onNext }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const selectedLevel = watch('level');
  const selectedPageId = useCareerStore((s) => s.selectedPageId);

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
          Paso 1 de 4
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
          Perfil Básico
        </h2>
        <p className="text-text-main/40 text-sm mt-1">
          Cuéntanos un poco sobre ti para personalizar tu experiencia.
        </p>
      </motion.div>

      {/* Notion Page Selector */}
      <motion.div variants={fadeUp} className="mb-2">
        <NotionPageSelector />
      </motion.div>

      {/* Nombre */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Nombre completo</label>
        <input
          id="step1-name"
          type="text"
          className={inputCls}
          placeholder="Ej: María García"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </motion.div>

      {/* Rol */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Rol profesional deseado</label>
        <input
          id="step1-role"
          type="text"
          className={inputCls}
          placeholder="Ej: Frontend Developer, Data Analyst..."
          {...register('role')}
        />
        {errors.role && (
          <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>
        )}
      </motion.div>

      {/* Nivel */}
      <motion.div variants={fadeUp} className="flex flex-col gap-2">
        <label className={labelCls}>Nivel actual</label>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              id={`level-${lvl.toLowerCase()}`}
              type="button"
              onClick={() => setValue('level', lvl, { shouldValidate: true })}
              className={`rounded-xl py-3 text-sm font-semibold border transition-all duration-200 ${
                selectedLevel === lvl
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'bg-background/60 border-text-main/15 text-text-main/60 hover:border-text-main/30'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        {errors.level && (
          <p className="text-red-400 text-xs">{errors.level.message}</p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeUp} className="pt-2">
        <button
          id="step1-next"
          type="submit"
          disabled={!selectedPageId}
          className={`w-full flex items-center justify-center gap-2 rounded-full font-bold py-4 text-sm shadow-lg transition-all duration-200 ${
            selectedPageId
              ? 'bg-primary text-background shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
              : 'bg-primary/50 text-background/50 cursor-not-allowed shadow-none'
          }`}
        >
          Siguiente
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </motion.form>
  );
}
