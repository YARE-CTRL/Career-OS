import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCareerStore } from './index';

describe('CareerStore', () => {
  beforeEach(() => {
    // Limpiamos el store antes de cada prueba
    useCareerStore.getState().clearStore();
    vi.resetAllMocks();
  });

  it('debería inicializarse con el estado correcto', () => {
    const state = useCareerStore.getState();
    expect(state.profile).toBeNull();
    expect(state.roadmap).toEqual([]);
    expect(state.notionUrl).toBeNull();
    expect(state.selectedPageId).toBeNull();
  });

  it('debería actualizar el profile correctamente', () => {
    const mockProfile = {
      name: 'Test',
      role: 'Dev',
      level: 'Junior' as const,
      goal: 'Aprender',
      sector: 'Tech',
      hoursPerWeek: 10,
      technologies: [],
      courses: [],
      projects: []
    };

    useCareerStore.getState().setProfile(mockProfile);
    expect(useCareerStore.getState().profile).toEqual(mockProfile);
  });

  it('debería lanzar error si no hay selectedPageId al generar', async () => {
    const state = useCareerStore.getState();
    const mockProfile = {
      name: 'Test', role: 'Dev', level: 'Junior' as const, goal: 'Aprender',
      sector: 'Tech', hoursPerWeek: 10, technologies: [], courses: [], projects: []
    };

    // No seteamos selectedPageId a propósito
    await expect(state.generateRoadmap(mockProfile)).rejects.toThrow(
      'Debes seleccionar una página de Notion'
    );
  });

  it('clearStore debería resetear todo el estado', () => {
    useCareerStore.getState().setSelectedPageId('page-123');
    useCareerStore.getState().setSystemData([{ id: '1', title: 'A', description: 'B', type: 'course', status: 'todo', duration: '1h', resources: [], successCriteria: 'C' }], 'url');
    
    useCareerStore.getState().clearStore();
    
    const state = useCareerStore.getState();
    expect(state.selectedPageId).toBeNull();
    expect(state.roadmap.length).toBe(0);
    expect(state.notionUrl).toBeNull();
  });
});
