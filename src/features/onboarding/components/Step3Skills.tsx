'use client';

import { useState, KeyboardEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import { step3Schema, type Step3Data } from '../schemas/onboardingSchema';
import { stagger, fadeUp, labelCls } from './shared';

interface Props {
  defaultValues: Step3Data;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}

// ─── Tag Input ────────────────────────────────────────────────────────────────

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !value.includes(val)) {
      onChange([...value, val]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="min-h-[52px] flex flex-wrap gap-2 items-center bg-background/60 border border-text-main/15 rounded-xl px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-primary/60 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-text-main text-sm placeholder:text-text-main/30 focus:outline-none"
      />
    </div>
  );
}

// ─── Step 3 Component ─────────────────────────────────────────────────────────

export function Step3Skills({ defaultValues, onNext, onBack }: Props) {
  const { handleSubmit, control } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues,
  });

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
          Paso 3 de 4
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
          Habilidades Actuales
        </h2>
        <p className="text-text-main/40 text-sm mt-1">
          Escribe y presiona Enter para añadir etiquetas.
        </p>
      </motion.div>

      {/* Technologies */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Tecnologías actuales</label>
        <Controller
          name="technologies"
          control={control}
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Ej: React, Python, SQL... (Enter para añadir)"
            />
          )}
        />
      </motion.div>

      {/* Courses */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Cursos y certificaciones</label>
        <Controller
          name="courses"
          control={control}
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Ej: Google UX, AWS Cloud Practitioner..."
            />
          )}
        />
      </motion.div>

      {/* Projects */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
        <label className={labelCls}>Proyectos propios</label>
        <Controller
          name="projects"
          control={control}
          render={({ field }) => (
            <TagInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Ej: E-commerce con Next.js, App de clima..."
            />
          )}
        />
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex gap-3 pt-2">
        <button
          id="step3-back"
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-full border border-text-main/20 text-text-main/60 font-semibold py-4 px-6 text-sm hover:border-text-main/40 hover:text-text-main transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>
        <button
          id="step3-generate"
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary text-background font-bold py-4 text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200"
        >
          <Sparkles size={16} />
          Generar mi Roadmap
        </button>
      </motion.div>
    </motion.form>
  );
}
