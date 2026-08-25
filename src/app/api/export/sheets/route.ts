import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkProStatus } from '@/lib/subscription';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email || 'unknown';
    const isPro = await checkProStatus(userId);
    if (!isPro) {
      return NextResponse.json({ error: 'Esta función requiere Plan Pro.' }, { status: 403 });
    }

    const { roadmap, profile } = await request.json();
    if (!roadmap || roadmap.length === 0) {
      return NextResponse.json({ error: 'No hay roadmap para exportar.' }, { status: 400 });
    }

    // Construir CSV del roadmap
    const headers = ['Fase', 'Tipo', 'Duración', 'Descripción', 'Recursos', 'Criterio de Éxito', 'Estado'];
    const rows = roadmap.map((item: any, index: number) => [
      `${index + 1}. ${item.title}`,
      item.type || 'project',
      item.duration || 'TBD',
      item.description || '',
      (item.resources || []).join(' | '),
      item.successCriteria || '',
      item.status || 'todo',
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
