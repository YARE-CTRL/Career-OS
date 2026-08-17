/**
 * Tests unitarios para GET /api/notion/pages
 *
 * Contrato verificado:
 *   { pages: NotionPageDTO[] }
 *
 *   NotionPageDTO {
 *     id:          string  — ID de la página en Notion
 *     title:       string  — Texto plano del título (o "Sin título")
 *     url:         string  — URL pública de la página
 *     lastEdited:  string  — ISO timestamp de última edición
 *   }
 *
 * Escenarios cubiertos:
 *   1. 401 Unauthorized  — Sin sesión activa
 *   2. 200 Happy Path    — Dos páginas ficticias, formato DTO correcto
 *   3. 500 Internal      — La API de Notion falla / error de red
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── 1. Mock de auth() ─────────────────────────────────────────────────────────
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { name: 'Test User', email: 'test@example.com' },
    accessToken: 'fake-notion-access-token',
    expires: '9999-01-01T00:00:00.000Z',
  }),
}));

// ─── 2. Mock de @notionhq/client (clase) ──────────────────────────────────────
// Simulamos dos páginas de Notion con la estructura real de PageObjectResponse
const fakePage1 = {
  object: 'page',
  id: 'page-id-001',
  url: 'https://www.notion.so/Mi-Workspace-page-id-001',
  last_edited_time: '2026-07-19T10:00:00.000Z',
  properties: {
    title: {
      type: 'title',
      title: [{ plain_text: 'Mi Workspace Principal', type: 'text' }],
    },
  },
};

const fakePage2 = {
  object: 'page',
  id: 'page-id-002',
  url: 'https://www.notion.so/Proyectos-page-id-002',
  last_edited_time: '2026-07-18T08:30:00.000Z',
  properties: {
    title: {
      type: 'title',
      title: [{ plain_text: 'Proyectos 2026', type: 'text' }],
    },
  },
};

const mockSearch = vi.fn().mockResolvedValue({
  results: [fakePage1, fakePage2],
});

vi.mock('@notionhq/client', () => {
  function Client() {}
  Client.prototype.search = mockSearch;
  return { Client };
});

// ─── 3. Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  // Restaurar happy-path por defecto en cada test
  mockSearch.mockResolvedValue({ results: [fakePage1, fakePage2] });
});

// ─── 4. Importación dinámica del handler (después de los mocks) ────────────────
const { GET } = await import('@/app/api/notion/pages/route');

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('GET /api/notion/pages', () => {
  // ─── Caso 1: Sin sesión ────────────────────────────────────────────────────
  it('Caso 1 (401): debería fallar si no hay sesión activa', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValueOnce(
      null as unknown as Awaited<ReturnType<typeof auth>>
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty('error');
    expect(json.error).toContain('No autorizado');
  });

  // ─── Caso 2: Happy Path ────────────────────────────────────────────────────
  it('Caso 2 (200): debería retornar las páginas mapeadas al contrato DTO', async () => {
    const response = await GET();
    const json = await response.json();

    // Status
    expect(response.status).toBe(200);

    // Estructura raíz
    expect(json).toHaveProperty('pages');
    expect(Array.isArray(json.pages)).toBe(true);
    expect(json.pages).toHaveLength(2);

    // Verificar contrato DTO de la primera página
    const page1 = json.pages[0];
    expect(page1).toEqual({
      id: 'page-id-001',
      title: 'Mi Workspace Principal',
      url: 'https://www.notion.so/Mi-Workspace-page-id-001',
      lastEdited: '2026-07-19T10:00:00.000Z',
    });

    // Verificar contrato DTO de la segunda página
    const page2 = json.pages[1];
    expect(page2).toEqual({
      id: 'page-id-002',
      title: 'Proyectos 2026',
      url: 'https://www.notion.so/Proyectos-page-id-002',
      lastEdited: '2026-07-18T08:30:00.000Z',
    });
  });

  it('Caso 2b: notion.search() debe recibir los parámetros correctos', async () => {
    await GET();

    expect(mockSearch).toHaveBeenCalledOnce();
    expect(mockSearch).toHaveBeenCalledWith({
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      page_size: 20,
    });
  });

  it('Caso 2c: debería filtrar resultados que no sean páginas (ej. databases)', async () => {
    // Añadimos un database que debe ser excluido del resultado
    const fakeDatabase = {
      object: 'database',
      id: 'db-id-003',
      url: 'https://www.notion.so/DB',
      last_edited_time: '2026-07-17T00:00:00.000Z',
      properties: {},
    };

    mockSearch.mockResolvedValueOnce({
      results: [fakePage1, fakeDatabase, fakePage2],
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    // Solo deben aparecer las 2 páginas, no el database
    expect(json.pages).toHaveLength(2);
    expect(json.pages.every((p: { id: string }) => p.id !== 'db-id-003')).toBe(true);
  });

  it('Caso 2d: debería manejar páginas sin título y retornar "Sin título"', async () => {
    const pageWithNoTitle = {
      object: 'page',
      id: 'page-id-empty',
      url: 'https://www.notion.so/page-id-empty',
      last_edited_time: '2026-07-10T00:00:00.000Z',
      properties: {
        title: {
          type: 'title',
          title: [],   // array vacío = sin título
        },
      },
    };

    mockSearch.mockResolvedValueOnce({ results: [pageWithNoTitle] });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.pages[0].title).toBe('Sin título');
  });

  // ─── Caso 3: Error interno ────────────────────────────────────────────────
  it('Caso 3 (500): debería manejar errores de red o de la API de Notion', async () => {
    mockSearch.mockRejectedValueOnce(new Error('Notion API timeout'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty('error');
    expect(json.error).toBe('Notion API timeout');
  });
});
