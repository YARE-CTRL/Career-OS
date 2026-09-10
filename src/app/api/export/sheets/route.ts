import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkProStatus } from '@/lib/subscription';
import { z } from 'zod';
import { resolveUserId } from '@/lib/session';

// FIX SEGURIDAD: Validar payload del cliente con Zod
const RoadmapItemSchema = z.object({
  title: z.string().max(500),
  type: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  resources: z.array(z.string()).optional(),
  successCriteria: z.string().optional(),
  status: z.string().optional(),
});

const ExportBodySchema = z.object({
  roadmap: z.array(RoadmapItemSchema).min(1).max(50),
  profile: z.object({ name: z.string().optional() }).optional(),
});

// FIX SEGURIDAD: Sanitizar celdas para prevenir CSV Formula Injection (OWASP)
// Un atacante podría poner =CMD() en un campo de texto para ejecutar fórmulas maliciosas.
function sanitizeCsvCell(value: string): string {
  const dangerous = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerous.some(ch => value.startsWith(ch))) {
    return `'${value}`; // Prefijo de apóstrofe fuerza texto en Excel/Sheets
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = resolveUserId(session);
    if (!userId) {
      return NextResponse.json({ error: 'Sesión inválida. Vuelve a iniciar sesión.' }, { status: 401 });
    }
    const isPro = await checkProStatus(userId);
    if (!isPro) {
      return NextResponse.json({ error: 'Esta función requiere Plan Pro.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ExportBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
    }
    const { roadmap, profile } = parsed.data;

    // Construir CSV del roadmap con sanitización anti-injection
    const headers = ['Fase', 'Tipo', 'Duración', 'Descripción', 'Recursos', 'Criterio de Éxito', 'Estado'];
    const rows = roadmap.map((item, index) => [
      sanitizeCsvCell(`${index + 1}. ${item.title}`),
      sanitizeCsvCell(item.type || 'project'),
      sanitizeCsvCell(item.duration || 'TBD'),
      sanitizeCsvCell(item.description || ''),
      sanitizeCsvCell((item.resources || []).join(' | ')),
      sanitizeCsvCell(item.successCriteria || ''),
      sanitizeCsvCell(item.status || 'todo'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Google Sheets acepta importar CSV via URL con parámetros específicos
    // Usamos el enfoque de encodear el CSV en base64 y crear el link de importación
    const csvBase64 = Buffer.from('\uFEFF' + csvContent, 'utf-8').toString('base64');
    
    // URL de Google Sheets para crear una nueva hoja con el CSV
    const sheetsTitle = encodeURIComponent(`Career OS Roadmap - ${profile?.name || 'Mi Plan'}`);
    const sheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=sharing&title=${sheetsTitle}`;

    // Devolvemos el CSV y la URL al cliente para que maneje la descarga + apertura
    return NextResponse.json({
      csv: csvContent,
      csvBase64,
      sheetsUrl,
      filename: `career-os-roadmap-${Date.now()}.csv`,
    });
  } catch (error) {
    console.error('[Export/Sheets] Error:', error);
    const message = error instanceof Error ? error.message : 'Error al exportar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
