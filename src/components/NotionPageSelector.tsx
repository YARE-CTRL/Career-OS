'use client';

import { useEffect } from 'react';
import { useCareerStore } from '@/store';
import { Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { NotionHelpTooltip } from '@/components/ui/NotionHelpTooltip';

export function NotionPageSelector() {
  const {
    notionPages,
    selectedPageId,
    loadingPages,
    fetchNotionPages,
    setSelectedPageId,
  } = useCareerStore();

  useEffect(() => {
    fetchNotionPages();
  }, [fetchNotionPages]);

  if (loadingPages) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-text-main/10 bg-background/40 animate-pulse">
        <div className="h-4 bg-text-main/10 rounded w-1/3"></div>
        <div className="h-10 bg-text-main/5 rounded w-full mt-2"></div>
      </div>
    );
  }

  if (!loadingPages && notionPages.length === 0) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-sm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p>
          No se encontraron páginas autorizadas en tu cuenta de Notion. Asegúrate de
          haber otorgado permisos a al menos una página durante el inicio de sesión.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <label className="text-sm font-bold text-text-main/80 tracking-wide">
          Selecciona la página destino
        </label>
        <NotionHelpTooltip />
      </div>
      <p className="text-xs text-text-main/50 -mt-2 mb-1">
        ¿Dónde quieres que la IA guarde tu Roadmap?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
        {notionPages.map((page) => {
          const isSelected = page.id === selectedPageId;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => setSelectedPageId(page.id)}
              className={`text-left relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-sm shadow-primary/20 ring-1 ring-primary'
                  : 'bg-background/60 border-text-main/15 hover:border-text-main/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText
                    size={16}
                    className={`shrink-0 ${isSelected ? 'text-primary' : 'text-text-main/60'}`}
                  />
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-text-main/80'}`}>
                    {page.title || 'Sin título'}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-text-main/40 mt-1">
                Editado: {new Date(page.lastEdited).toLocaleDateString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
