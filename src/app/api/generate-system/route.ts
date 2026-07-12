import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Client } from '@notionhq/client';

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
}

interface NotionPageResponse {
  url: string;
}

// ─── POST /api/generate-system ────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Validar variables de entorno
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const notionToken = process.env.NOTION_TOKEN;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;

    if (!geminiApiKey || !notionToken || !notionDatabaseId) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta. Contacta al administrador.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const notion = new Client({ auth: notionToken });

    // 2. Extraer datos del usuario
    const formData = await request.json();

    // 3. Generar Roadmap con Gemini usando structured output
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id:          { type: SchemaType.STRING },
              title:       { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              type:        { type: SchemaType.STRING },
              status:      { type: SchemaType.STRING },
            },
            required: ['id', 'title', 'description', 'type', 'status'],
          },
        },
      },
    });

    const prompt = `Actúa como un mentor tech experto. Crea un roadmap de aprendizaje de 3 a 5 pasos para este usuario:
    Nombre: ${formData.name}
    Rol deseado: ${formData.role}
    Nivel actual: ${formData.level}
    Objetivo (6 meses): ${formData.goal}
    Sector: ${formData.sector}
    Horas semanales: ${formData.hoursPerWeek}
    Tecnologías: ${formData.technologies.join(', ')}
    Cursos: ${formData.courses.join(', ')}
    Proyectos: ${formData.projects.join(', ')}`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiError: unknown) {
      console.error('[generate-system] Gemini error:', geminiError);
      const errMsg = geminiError instanceof Error ? geminiError.message : '';
      // 429 – cuota excedida
      if (
        errMsg.includes('429') ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('resource_exhausted')
      ) {
        return NextResponse.json(
          { error: 'Hemos alcanzado el límite de uso gratuito temporalmente. Por favor, espera un minuto e inténtalo de nuevo.' },
          { status: 429 }
        );
      }
      throw geminiError;
    }

    const text = result.response.text();

    let roadmap: RoadmapItem[];
    try {
      roadmap = JSON.parse(text) as RoadmapItem[];
    } catch {
      throw new Error('La IA devolvió un formato inesperado. Por favor, inténtalo de nuevo.');
    }

    // 4. Crear página en Notion
    const notionResponse = await notion.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: {
        Name: {
          title: [{ text: { content: `Career OS: ${formData.name}` } }],
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: 'Tu Roadmap Generado' } }],
          },
        },
        ...roadmap.map((item: RoadmapItem) => ({
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [
              {
                type: 'text' as const,
                text: { content: `[${item.type.toUpperCase()}] ${item.title}: ` },
                annotations: { bold: true },
              },
              {
                type: 'text' as const,
                text: { content: item.description },
              },
            ],
          },
        })),
      ],
    });

    const notionUrl = (notionResponse as unknown as NotionPageResponse).url;

    // 5. Retornar al frontend — nunca se filtran keys ni tokens
    return NextResponse.json({ roadmap, notionUrl });

  } catch (error: unknown) {
    console.error('[generate-system] Unhandled error:', error);
    const message = error instanceof Error
      ? error.message
      : 'Ocurrió un error inesperado al generar tu sistema.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
