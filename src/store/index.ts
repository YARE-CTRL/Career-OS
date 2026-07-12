import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  role: string;
  level: string;
  goal: string;
  sector: string;
  hoursPerWeek: number;
  technologies: string[];
  courses: string[];
  projects: string[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'practice';
  status: 'todo' | 'in-progress' | 'done';
}

export interface CareerStore {
  profile: UserProfile | null;
  roadmap: RoadmapItem[];
  notionUrl: string | null;
  setProfile: (profile: UserProfile) => void;
  setSystemData: (roadmap: RoadmapItem[], notionUrl: string) => void;
  clearStore: () => void;
}

export const useCareerStore = create<CareerStore>()(
  persist(
    (set) => ({
      profile: null,
      roadmap: [],
      notionUrl: null,
      setProfile: (profile) => set({ profile }),
      setSystemData: (roadmap, notionUrl) => set({ roadmap, notionUrl }),
      clearStore: () => set({ profile: null, roadmap: [], notionUrl: null }),
    }),
    {
      name: 'career-os-storage',
    }
  )
);
