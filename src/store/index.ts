import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import '@/features/onboarding/schemas/mockInjector';
import type { NotionPageDTO } from '@/types/notion';
import type { OnboardingData } from '@/features/onboarding/schemas/onboardingSchema';

// ─── Tipos del dominio ─────────────────────────────────────────────────────────

export type { NotionPageDTO };

/**
 * UserProfile es un alias de OnboardingData (la fuente de verdad está en el
 * schema de Zod). Esto garantiza que store y formulario nunca diverjan.
 */
export type UserProfile = OnboardingData;

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'practice';
  status: 'todo' | 'in-progress' | 'done';
  // Nuevos campos Premium
  duration: string;
  resources: string[];
  successCriteria: string;
}

// ─── Interfaz del Store ────────────────────────────────────────────────────────

export interface CareerStore {
  // ── Perfil de usuario ───────────────────────────────────────────────────────
  profile: UserProfile | null;

  // ── Resultado del generador ─────────────────────────────────────────────────
  roadmap: RoadmapItem[];
  notionUrl: string | null;

  // ── Páginas de Notion autorizadas ───────────────────────────────────────────
  notionPages: NotionPageDTO[];
  selectedPageId: string | null;
  loadingPages: boolean;

  // ── Acciones de perfil / resultado ─────────────────────────────────────────
  setProfile: (profile: UserProfile) => void;
  setSystemData: (roadmap: RoadmapItem[], notionUrl: string) => void;
  clearStore: () => void;

  // ── Acciones de páginas de Notion ───────────────────────────────────────────
  setSelectedPageId: (id: string) => void;
  fetchNotionPages: () => Promise<void>;

  // ── Acción de generación ────────────────────────────────────────────────────
  generateRoadmap: (formData: UserProfile) => Promise<void>;
}

// ─── Implementación ────────────────────────────────────────────────────────────

export const useCareerStore = create<CareerStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      profile: null,
      roadmap: [],
      notionUrl: null,
      notionPages: [],
      selectedPageId: null,
      loadingPages: false,

      // ── Perfil / resultado ────────────────────────────────────────────────
      setProfile: (profile) => set({ profile }),
      setSystemData: (roadmap, notionUrl) => set({ roadmap, notionUrl }),
      clearStore: () =>
        set({
          profile: null,
          roadmap: [],
          notionUrl: null,
          notionPages: [],
          selectedPageId: null,
        }),

      // ── Páginas de Notion ─────────────────────────────────────────────────
      setSelectedPageId: (id) => set({ selectedPageId: id }),

      fetchNotionPages: async () => {
        set({ loadingPages: true });
        try {
          const res = await fetch('/api/notion/pages');

          // Si no está autenticado (401) o hay otro error HTTP, salimos sin romper la UI
          if (!res.ok) {
            console.error('[store] fetchNotionPages — respuesta no ok:', res.status);
            return;
          }

          const data = await res.json();
          set({ notionPages: data.pages ?? [] });
        } catch (err) {
          console.error('[store] fetchNotionPages — error de red:', err);
        } finally {
          set({ loadingPages: false });
        }
      },

      // ── Generación de Roadmap ─────────────────────────────────────────────
      generateRoadmap: async (formData: UserProfile) => {
        const { selectedPageId } = get();

        if (!selectedPageId) {
          throw new Error(
            'Debes seleccionar una página de Notion antes de generar tu roadmap.'
          );
        }

        const res = await fetch('/api/generate-system', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, parent_id: selectedPageId }),
        });

        const data = await res.json();

        if (res.status === 429) {
          throw Object.assign(new Error(data.error), { status: 429 });
        }

        if (!res.ok) {
          throw new Error(data.error ?? 'Error al generar el sistema.');
        }

        set({ roadmap: data.roadmap, notionUrl: data.notionUrl, profile: formData });
      },
    }),
    {
      name: 'career-os-storage',
      // No persistir estados transitorios ni páginas (se recargan en cada sesión)
      partialize: (state) => ({
        profile: state.profile,
        roadmap: state.roadmap,
        notionUrl: state.notionUrl,
        selectedPageId: state.selectedPageId,
      }),
    }
  )
);

// Exponer el store en la consola del navegador para inyección de pruebas (Stress Testing)
if (typeof window !== 'undefined') {
  (window as any).__STORE__ = useCareerStore;
}
