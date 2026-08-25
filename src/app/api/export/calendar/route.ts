import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkProStatus } from '@/lib/subscription';

// Formatear fecha para iCalendar (YYYYMMDD)
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Parsear duración textual a días aproximados
function parseDurationToDays(duration: string): number {
  if (!duration) return 14;
  const lower = duration.toLowerCase();
  if (lower.includes('semana')) {
    const match = lower.match(/(\d+)/);
    return match ? parseInt(match[1]) * 7 : 14;
  }
  if (lower.includes('mes')) {
    const match = lower.match(/(\d+)/);
    return match ? parseInt(match[1]) * 30 : 30;
  }
  if (lower.includes('día') || lower.includes('dia')) {
    const match = lower.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7;
  }
  return 14;
}

// Escapar texto para iCalendar
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

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

    const calendarName = escapeICS(`Career OS Roadmap - ${profile?.name || 'Mi Plan'}`);
    const now = new Date();
    let currentDate = new Date(now);

    const events: string[] = [];

    roadmap.forEach((item: any, index: number) => {
      const durationDays = parseDurationToDays(item.duration);
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + durationDays);

      const uid = `career-os-${Date.now()}-${index}@careeros.ai`;
      const summary = escapeICS(`[${(item.type || 'FASE').toUpperCase()}] ${item.title}`);
      const description = escapeICS(
        [
          item.description || '',
          item.successCriteria ? `🎯 Meta: ${item.successCriteria}` : '',
          item.resources?.length ? `📚 Recursos: ${item.resources.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('\\n\\n')
      );

      events.push([
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0].replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${endDate.toISOString().split('T')[0].replace(/-/g, '')}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `CATEGORIES:${escapeICS(item.type || 'project')}`,
        'STATUS:TENTATIVE',
        'END:VEVENT',
      ].join('\r\n'));

      // Avanzar al siguiente bloque de tiempo
      currentDate = new Date(endDate);
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Career OS AI//Roadmap Calendar//ES',
      `X-WR-CALNAME:${calendarName}`,
      'X-WR-TIMEZONE:America/Bogota',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="career-os-roadmap.ics"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[Export/Calendar] Error:', error);
    const message = error instanceof Error ? error.message : 'Error al exportar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
