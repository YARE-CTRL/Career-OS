/**
 * Tests unitarios para POST /api/generate-system
 *
 * Estrategia de mocking:
 * - auth()              → sesión con accessToken ficticio
 * - GoogleGenerativeAI  → responde con JSON simulado (sin gastar créditos)
 * - @notionhq/client    → espía sobre pages.create() (search ya NO se usa)
 *
 * CAMBIO ARQUITECTÓNICO (v2):
 * El backend ya NO hace notion.search() para descubrir el parent_id.
 * El cliente envía parent_id en el payload (elegido por el usuario en el
 * Selector de páginas). Los tests ahora incluyen ese campo en sampleFormData.
 *
 * NOTA: Vitest no permite usar arrow functions como constructor de clase.
 *       Los mocks de GoogleGenerativeAI y Client usan funciones normales.
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

// ─── 2. Mock de @notionhq/client (Client es una clase) ────────────────────────
const mockPagesCreate = vi.fn().mockResolvedValue({
  id: 'fake-page-id',
  url: 'https://www.notion.so/fake-career-os-page',
});

vi.mock('@notionhq/client', () => {
  function Client() {}
  // search ya no se usa en generate-system → no necesita estar mockeado aquí
  Client.prototype.pages = { create: mockPagesCreate };
  return { Client };
});

// ─── 3. Mock de @google/generative-ai (GoogleGenerativeAI es una clase) ───────
const fakeRoadmap = [
  {
    id: '1',
    title: 'Fundamentos de TypeScript',
    description: 'Aprende los tipos básicos y avanzados de TypeScript.',
    type: 'HABILIDAD',
    status: 'pendiente',
  },
  {
    id: '2',
    title: 'Next.js App Router',
    description: 'Domina el paradigma de Server Components.',
    type: 'FRAMEWORK',
    status: 'pendiente',
  },
];

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: { text: vi.fn().mockReturnValue(JSON.stringify(fakeRoadmap)) },
});

vi.mock('@google/generative-ai', () => {
  function GoogleGenerativeAI() {}
  GoogleGenerativeAI.prototype.getGenerativeModel = vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  });
  return {
    GoogleGenerativeAI,
    SchemaType: { ARRAY: 'ARRAY', OBJECT: 'OBJECT', STRING: 'STRING' },
  };
});

// ─── 4. Setup: variables de entorno y reset de mocks ──────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  process.env.GEMINI_API_KEY = 'fake-gemini-key';
  mockPagesCreate.mockResolvedValue({
    id: 'fake-page-id',
    url: 'https://www.notion.so/fake-career-os-page',
  });
  mockGenerateContent.mockResolvedValue({
    response: { text: vi.fn().mockReturnValue(JSON.stringify(fakeRoadmap)) },
  });
});

// ─── 5. Importación dinámica del handler (después de los mocks) ────────────────
const { POST } = await import('@/app/api/generate-system/route');

// ─── 6. Helper para construir Request ─────────────────────────────────────────
function buildRequest(body: object): Request {
  return new Request('http://localhost:3000/api/generate-system', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// payload correcto: incluye parent_id elegido por el usuario en el Selector
const sampleFormData = {
  name: 'Ana García',
  role: 'Frontend Developer',
  level: 'Junior',
  goal: 'Conseguir mi primer trabajo como dev',
  sector: 'FinTech',
  hoursPerWeek: 10,
  technologies: ['React', 'TypeScript'],
  courses: ['CS50'],
  projects: ['Portfolio personal'],
  parent_id: 'fake-parent-page-id',   // ← requerido por el backend
};

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe('POST /api/generate-system', () => {
  it('Happy Path: debería retornar 200 con roadmap y notionUrl', async () => {
    const request = buildRequest(sampleFormData);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty('roadmap');
    expect(json).toHaveProperty('notionUrl');
    expect(Array.isArray(json.roadmap)).toBe(true);
    expect(json.roadmap).toHaveLength(2);
    expect(json.notionUrl).toBe('https://www.notion.so/fake-career-os-page');
  });

  it('debería llamar a notion.pages.create() con el parent_id del payload', async () => {
    const request = buildRequest(sampleFormData);
    await POST(request);

    expect(mockPagesCreate).toHaveBeenCalledOnce();
    const callArgs = mockPagesCreate.mock.calls[0][0];
    expect(callArgs.parent).toEqual({ page_id: 'fake-parent-page-id' });
    expect(callArgs.properties.title.title[0].text.content).toContain('Ana García');
  });

  it('debería retornar 400 si el payload no incluye parent_id', async () => {
    const { parent_id: _, ...bodyWithoutParentId } = sampleFormData;
    const request = buildRequest(bodyWithoutParentId);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('parent_id requerido');
  });

  it('debería retornar 401 si no hay sesión activa', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValueOnce(
      null as unknown as Awaited<ReturnType<typeof auth>>
    );

    const request = buildRequest(sampleFormData);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toContain('No autorizado');
  });

  it('debería retornar 500 si GEMINI_API_KEY no está configurada', async () => {
    delete process.env.GEMINI_API_KEY;

    const request = buildRequest(sampleFormData);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toContain('Gemini');
  });
});
