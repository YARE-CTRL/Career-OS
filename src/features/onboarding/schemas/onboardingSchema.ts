import { z } from 'zod';

// ─── Step 1: Perfil Básico ────────────────────────────────────────────────────

export const step1Schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.string().min(3, 'El rol debe tener al menos 3 caracteres'),
  level: z.enum(['Estudiante', 'Practicante', 'Junior'] as const, {
    error: 'Selecciona tu nivel actual',
  }),
});

export type Step1Data = z.infer<typeof step1Schema>;

// ─── Step 2: Objetivo Profesional ─────────────────────────────────────────────

export const step2Schema = z.object({
  goal: z.string().min(20, 'Describe tu objetivo con al menos 20 caracteres'),
  sector: z.string().min(1, 'Selecciona un sector tecnológico'),
  hoursPerWeek: z.number().min(1).max(40),
});

export type Step2Data = z.infer<typeof step2Schema>;

// ─── Step 3: Habilidades (sin validación obligatoria, es libre) ───────────────

export const step3Schema = z.object({
  technologies: z.array(z.string()),
  courses: z.array(z.string()),
  projects: z.array(z.string()),
});

export type Step3Data = z.infer<typeof step3Schema>;

// ─── Full Combined Schema (para el payload final a la API) ───────────────────

export const onboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type OnboardingData = z.infer<typeof onboardingSchema>;
