"use client";

import { useState } from "react";
import { Zap, Lock } from "lucide-react";
import { useCareerStore } from "@/store";

interface GenerationsCounterProps {
  onUpgradeClick: () => void;
}

export function GenerationsCounter({ onUpgradeClick }: GenerationsCounterProps) {
  const { remainingGenerations, isPro } = useCareerStore();

  if (remainingGenerations === null && !isPro) return null;

  if (isPro) {
    return (
      <div className="bg-surface rounded-3xl p-5 border border-primary/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Plan Pro Activo</p>
            <p className="text-text-main/60 text-xs mt-0.5">Generaciones ilimitadas</p>
          </div>
          <span className="ml-auto text-lg">✨</span>
        </div>
      </div>
    );
  }

  const total = 3;
  const remaining = remainingGenerations ?? total;
  const used = total - remaining;
  const progress = (remaining / total) * 100;

  const barColor =
    remaining === 0
      ? "bg-red-500"
      : remaining === 1
      ? "bg-yellow-500"
      : "bg-primary";

  return (
    <div className={`bg-surface rounded-3xl p-5 border transition-all shadow-lg ${
      remaining === 0 ? "border-red-500/30" : "border-text-main/5"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className={remaining === 0 ? "text-red-400" : "text-primary"} />
          <p className="text-xs font-bold uppercase tracking-wider text-text-main/60">
            Generaciones gratuitas
          </p>
        </div>
        <span className={`text-xs font-black ${remaining === 0 ? "text-red-400" : "text-text-main/80"}`}>
          {remaining}/{total}
        </span>
      </div>

      <div className="w-full h-1.5 bg-background/80 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {remaining === 0 ? (
        <button
          onClick={onUpgradeClick}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-100"
        >
          <Lock size={13} />
          Desbloquear acceso ilimitado
        </button>
      ) : (
        <p className="text-text-main/40 text-xs text-center">
          {used === 0
            ? "Tienes 3 generaciones gratuitas este mes."
            : `Usaste ${used} de ${total} este mes.`}
        </p>
      )}
    </div>
  );
}
