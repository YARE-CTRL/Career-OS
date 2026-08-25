"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap, Star, Infinity } from "lucide-react";
import { useCareerStore } from "@/store";

const PLAN_INFO: Record<string, { name: string; emoji: string; color: string }> = {
  monthly: { name: "Pro Mensual", emoji: "⚡", color: "text-blue-400" },
  annual: { name: "Pro Anual", emoji: "⭐", color: "text-yellow-400" },
  lifetime: { name: "Lifetime", emoji: "♾️", color: "text-purple-400" },
};

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { isPro } = useCareerStore();

  // Al cargar la página de éxito, sincronizamos el estado Pro con el servidor
  useEffect(() => {
    const syncProStatus = async () => {
      try {
        const res = await fetch('/api/me/pro-status');
        if (res.ok) {
          const data = await res.json();
          if (data.isPro) {
            // Actualizar el store de Zustand para reflejar el estado Pro
            useCareerStore.setState({ isPro: true, remainingGenerations: null });
          }
        }
      } catch (err) {
        console.error('[Success] Error syncing pro status:', err);
      }
    };
    syncProStatus();
  }, []);

  // Detectar plan desde el sessionId (Stripe pasa parámetros extra) o default a "annual"
  const [plan] = useState<string>("annual");
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.annual;

  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full text-center"
      >
        {/* Icono animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle size={48} className="text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">
            ¡Pago exitoso!
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Bienvenido al {planInfo.emoji} Plan {planInfo.name}
          </h1>
          <p className="text-text-main/50 text-base mb-8">
            Tu acceso Pro ya está activado. Ahora puedes generar roadmaps sin límites y usar todas las funcionalidades premium.
          </p>

          {/* Benefits recap */}
          <div className="bg-surface rounded-2xl border border-text-main/10 p-5 mb-8 text-left">
            <p className="text-sm font-bold text-white mb-3">Lo que desbloqueas hoy:</p>
            <ul className="flex flex-col gap-2.5">
              {[
                "Generaciones de roadmap ilimitadas",
                "Exportación a Google Sheets",
                "Sincronización con Google Calendar",
                "Soporte prioritario",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-text-main/70">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-primary" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:opacity-90 hover:scale-[1.02] text-base"
          >
            Ir a mi Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-text-main/30 text-xs mt-6">
            Recibirás un correo de confirmación de Stripe. ¿Preguntas? Contáctanos.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-white">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
