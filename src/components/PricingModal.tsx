"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Zap, Star, Infinity, Check, Loader2, Smartphone } from "lucide-react";
import { useSession } from "next-auth/react";
import { LocalPaymentModal } from "./LocalPaymentModal";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: "monthly",
    name: "Plan Pro",
    price: "9.900",
    period: "/único", // O mensual, según indique (dejaremos único o mensual)
    description: "Acceso completo al sistema",
    badge: "⭐ Más Popular",
    icon: <Star size={20} className="text-yellow-400" />,
    borderClass: "border-primary/40 shadow-xl shadow-primary/10",
    features: [
      "Generaciones ilimitadas",
      "Roadmap personalizado con IA",
      "Export a Google Sheets",
      "Copiloto IA activado",
    ],
    cta: "Comenzar ahora",
    ctaClass: "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90",
  }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [localPaymentPlan, setLocalPaymentPlan] = useState<{ id: string; name: string; price: string } | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[PricingModal] No se recibió URL de Stripe:", data);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error("[PricingModal] Error al crear sesión de pago:", err);
      setLoadingPlan(null);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl bg-background border border-text-main/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-6 text-center border-b border-text-main/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-main/40 hover:text-text-main transition-colors p-1"
          >
            <X size={20} />
          </button>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={22} className="text-primary" />
            <h2 className="text-2xl font-black text-white">Desbloquea Career OS Pro</h2>
          </div>
          <p className="text-text-main/50 text-sm max-w-md mx-auto">
            Para continuar construyendo tu carrera con el Copiloto IA y acceso ilimitado, obtén el Plan Pro. Pago único, acceso permanente.
          </p>
        </div>

        {/* Planes */}
        <div className="max-w-md mx-auto p-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-200 ${plan.borderClass} ${
                plan.badge ? "bg-primary/5" : "bg-surface"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 mt-1">
                {plan.icon}
                <span className="font-bold text-white text-base">{plan.name}</span>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-black text-white">${plan.price}</span>
                <span className="text-text-main/40 text-sm"> COP{plan.period}</span>
              </div>
              <div className="mb-3" />

              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-text-main/70">
                    <Check size={13} className="text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={!!loadingPlan}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed ${plan.ctaClass}`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {plan.cta}
                </button>
                <button
                  onClick={() => setLocalPaymentPlan({ id: plan.id, name: plan.name, price: plan.price })}
                  className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm transition-all text-text-main/70 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
                >
                  <Smartphone size={14} />
                  Pagar con Nequi
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer legal */}
        <div className="px-6 pb-6 text-center">
          <p className="text-text-main/30 text-xs">
            ✓ Pago seguro con Stripe &nbsp;·&nbsp; ✓ Cancela cuando quieras (planes mensuales y anuales) &nbsp;·&nbsp; ✓ Precios en COP
          </p>
        </div>
      </div>

      {/* Modal de Pago Local */}
      {localPaymentPlan && (
        <LocalPaymentModal
          isOpen={true}
          onClose={() => setLocalPaymentPlan(null)}
          userId={session?.user?.id}
          planName={localPaymentPlan.name}
          price={localPaymentPlan.price}
        />
      )}
    </div>
  );
}
