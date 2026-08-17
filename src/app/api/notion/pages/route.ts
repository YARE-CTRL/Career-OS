import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { auth } from '@/auth';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { NotionPageDTO } from '@/types/notion';

export type { NotionPageDTO };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrae el título de texto plano de una página de Notion.
 * Las páginas de Notion almacenan el título como un array de rich_text
 * dentro de la propiedad "title". Si no existe, retorna "Sin título".
 */
function extractTitle(page: PageObjectResponse): string {
  const props = page.properties;

  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop.type === 'title') {
      return prop.title.map((t) => t.plain_text).join('').trim() || 'Sin título';
    }
  }

  return 'Sin título';
}

/**
 * Convierte un PageObjectResponse de Notion al contrato público NotionPageDTO.
 */
function toDTO(page: PageObjectResponse): NotionPageDTO {
  return {
    id: page.id,
    title: extractTitle(page),
    url: page.url,
    lastEdited: page.last_edited_time,
  };
}

// ─── GET /api/notion/pages ────────────────────────────────────────────────────

/**
 * Retorna la lista de páginas de Notion a las que el usuario autorizó acceso
 * durante el flujo OAuth. Usado por el Onboarding para que el usuario
 * seleccione el workspace donde se inyectará su Roadmap.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 1. Verificar sesión activa
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión con Notion primero.' },
        { status: 401 }
      );
    }

    // 2. Inicializar cliente con el token del usuario
    const notion = new Client({ auth: session.accessToken });

    // 3. Buscar páginas autorizadas (máximo 20 para el selector)
    const searchResponse = await notion.search({
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      page_size: 20,
    });

    // 4. Filtrar solo PageObjectResponse (excluir databases parciales)
    const pages = searchResponse.results
      .filter((r): r is PageObjectResponse => r.object === 'page')
      .map(toDTO);

    return NextResponse.json({ pages });
  } catch (error: unknown) {
    console.error('[notion/pages] Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado al obtener páginas de Notion.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
