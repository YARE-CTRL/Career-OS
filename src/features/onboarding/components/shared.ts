import type { Variants } from 'framer-motion';

// Typed bezier easing constant — satisfies framer-motion v12 Easing tuple requirement
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Shared animation variants for all onboarding step components
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

// Shared Tailwind class strings for inputs
export const inputCls =
  'w-full bg-background/60 border border-text-main/15 text-text-main placeholder:text-text-main/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200';

export const selectCls =
  'w-full bg-background/60 border border-text-main/15 text-text-main rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none cursor-pointer';

export const labelCls =
  'block text-text-main/60 text-xs font-semibold uppercase tracking-widest mb-2';
