'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function NotionHelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2 z-50">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-main/50 hover:text-primary transition-colors focus:outline-none"
        aria-label="Ayuda sobre Notion"
      >
        <HelpCircle size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-6 top-0 w-72 p-4 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-2xl text-sm"
          >
            <div className="flex flex-col gap-3">
              <div>
                <span className="font-bold text-white block mb-1">¿Qué es Notion?</span>
                <span className="text-white/70 text-xs leading-relaxed block">
                  Es una app gratuita de productividad donde organizaremos y guardaremos tu plan de estudio de forma estructurada.
                </span>
              </div>
              
              <div>
                <span className="font-bold text-white block mb-1">¿Qué debes hacer?</span>
                <span className="text-white/70 text-xs leading-relaxed block">
                  Crea una cuenta, abre una página en blanco y luego dale permisos a Career OS AI para guardar tu Roadmap allí.
                </span>
              </div>

              <a 
                href="https://www.notion.so/signup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-semibold text-xs mt-1 transition-colors underline underline-offset-2"
              >
                Crear cuenta gratis en Notion
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
