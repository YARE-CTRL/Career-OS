"use client";

import { useEffect } from "react";
import { X, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";

interface LocalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  planName: string;
  price: string;
}

export function LocalPaymentModal({
  isOpen,
  onClose,
  userId,
  planName,
  price,
}: LocalPaymentModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Número de WhatsApp (puedes cambiarlo)
  const WHATSAPP_NUMBER = "573053421833"; 
  const message = `Hola! Acabo de transferir ${price} COP para el plan ${planName} de Career OS. Mi User ID es: ${userId || "desconocido"}. Aquí adjunto el comprobante:`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-surface border border-primary/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Smartphone size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pago con Nequi</h3>
              <p className="text-sm text-white/50">Transferencia manual rápida</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-white/90">
                  Transfiere exactamente <strong className="text-primary">${price} COP</strong> a la siguiente cuenta Nequi:
                </p>
                <div className="mt-2 bg-background p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-2xl font-black text-white tracking-widest">
                    300 000 0000
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <p className="text-sm text-white/90">
                Toma una captura de pantalla (screenshot) del comprobante exitoso.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <p className="text-sm text-white/90">
                Haz clic en el botón de abajo para enviarnos el comprobante por WhatsApp. Tu cuenta será activada en menos de 5 minutos.
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl transition-all hover:bg-[#20bd5a] hover:scale-[1.02]"
          >
            Enviar Comprobante por WhatsApp
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
