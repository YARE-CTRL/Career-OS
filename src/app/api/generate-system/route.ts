import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { Client } from '@notionhq/client';
import { auth } from '@/auth';

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  duration: string;
  resources: string[];
  successCriteria: string;
}

// ─── POST /api/generate-system ────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Autenticación y configuración
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión con Notion primero.' },
        { status: 401 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta (Gemini).' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Inicializamos el cliente de Notion con el token OAuth del usuario
    const notion = new Client({ auth: session.accessToken });

    // 2. Extraer datos del usuario
    const formData = await request.json();

    // Validar que el frontend envió un parent_id seleccionado por el usuario
    const parentPageId: string | undefined = formData.parent_id;
    if (!parentPageId) {
      return NextResponse.json(
        { error: 'parent_id requerido. Selecciona una página de Notion antes de generar.' },
        { status: 400 }
      );
    }

    // ─── CHAOS MODE (STRESS TESTING) ──────────────────────────────────────────────
    if (process.env.TEST_CHAOS_MODE === 'true') {
      console.log('🌪️ CHAOS MODE ACTIVO: Simulando respuesta de API externa...');
      const chance = Math.random();
      
      await new Promise(r => setTimeout(r, 1500)); // Simulamos latencia de red

      // 30% probabilidad de 503 (Caída de Gemini)
      if (chance < 0.3) {
        console.log('🌪️ Chaos: Lanzando 503 Service Unavailable');
        return NextResponse.json(
          { error: 'El modelo de IA está temporalmente saturado. Por favor, espera un minuto e inténtalo de nuevo.' },
          { status: 503 }
        );
      }
      // 20% probabilidad de 429 (Cuota de IA excedida)
      if (chance < 0.5) {
        console.log('🌪️ Chaos: Lanzando 429 Too Many Requests');
        return NextResponse.json(
          { error: 'El modelo de IA está temporalmente saturado. Por favor, espera un minuto e inténtalo de nuevo.' },
          { status: 429 }
        );
      }
      // 10% probabilidad de error catastrófico (JSON roto)
      if (chance < 0.6) {
        console.log('🌪️ Chaos: Lanzando error catastrófico interno');
        throw new Error('Chaos Mode: Unexpected broken text from LLM o Notion se cayó.');
      }
      
      // 40% Éxito
      console.log('🌪️ Chaos: Devolviendo payload mock exitoso');
      return NextResponse.json({
        roadmap: [
          {
            id: 'chaos-1',
            title: 'Sobrevivir a Ingeniería del Caos',
            description: 'Esta es una respuesta simulada por el Chaos Mode. Trampa común: pensar que el código real funcionará a la primera sin pruebas de estrés.',
            type: 'project',
            status: 'todo',
            duration: '1 semana',
            resources: ['https://netflixtechblog.com/chaos-engineering-upgraded-878d341f15af'],
            successCriteria: 'El servidor no colapsó con 150 requests.'
          }
        ],
        notionUrl: 'https://notion.so/chaos-test-url-1234'
      });
    }

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
              id:              { type: SchemaType.STRING },
              title:           { type: SchemaType.STRING },
              description:     { type: SchemaType.STRING },
              type:            { type: SchemaType.STRING },
              status:          { type: SchemaType.STRING },
              duration:        { type: SchemaType.STRING },
              resources:       { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              successCriteria: { type: SchemaType.STRING },
            },
            required: ['id', 'title', 'description', 'type', 'status', 'duration', 'resources', 'successCriteria'],
          },
        },
      },
    });

    const prompt = `Eres un 'Principal Engineer' y Mentor de Élite en la industria tecnológica. Tu objetivo es transformar la carrera del usuario creando un Roadmap de 6 meses altamente estratégico, personalizado y libre de "fluff" (contenido de relleno). 
No eres un bot de tutoriales; eres un estratega de carreras. Piensa desde la perspectiva del estudiante: ¿Qué necesita saber que la universidad o los cursos básicos no le dicen?

PERFIL DEL ESTUDIANTE:
- Nombre: ${formData.name}
- Rol deseado: ${formData.role}
- Nivel actual: ${formData.level}
- Meta a 6 meses: ${formData.goal}
- Sector/Industria: ${formData.sector}
- Dedicación semanal: ${formData.hoursPerWeek}h (Usa este límite matemático para no sobrecargar las fases)
- Stack actual: ${formData.technologies.join(', ')}
- Cursos previos: ${formData.courses.join(', ')}
- Proyectos previos: ${formData.projects.join(', ')}

DIRECTRICES DE INGENIERÍA DEL ROADMAP (CUMPLE AL 100%):
Crea de 4 a 6 fases cronológicas. Por cada fase, genera un objeto JSON con:
1. "title": Orientado a resultados técnicos (Ej: 'Dominio de Estado Asíncrono', no 'Aprender React').
2. "description": El 'QUÉ' y el 'POR QUÉ'. OBLIGATORIO: Incluye al final una "Trampa Común" (Common Pitfall) en la que caen los estudiantes en este tema y cómo evitarla. Adapta tu lenguaje a su nivel (no expliques obviedades a alguien que ya sabe).
3. "type": Usa estrictamente "course", "project" o "practice". Si es un proyecto, diseña uno que resuelva un problema real de negocio (digno de portafolio), no una calculadora o un To-Do list.
4. "status": Usa "todo".
5. "duration": Calcula el tiempo exacto basado en sus ${formData.hoursPerWeek}h semanales (Ej: "Semanas 1-3 (Aprox 30h)").
6. "resources": Enumera 2 a 3 recursos de oro absolutos (Libros de O'Reilly, documentación oficial específica, canales de YT de referentes). PROHIBIDO inventar nombres o ser genérico ("busca en google").
7. "successCriteria": Un entregable implacable y medible. Nada de "entender X". Debe ser "Desplegar Y en Vercel con un Lighthouse score de 90+" o "Escribir un script que procese Z en menos de 1s".`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiError: unknown) {
      console.error('[generate-system] Gemini error:', geminiError);
      const errMsg = geminiError instanceof Error ? geminiError.message : '';
      // 429 – cuota excedida / 503 – modelo saturado
      if (
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.toLowerCase().includes('quota') ||
        errMsg.toLowerCase().includes('resource_exhausted') ||
        errMsg.toLowerCase().includes('high demand') ||
        errMsg.toLowerCase().includes('service unavailable')
      ) {
        return NextResponse.json(
          { error: 'El modelo de IA está temporalmente saturado. Por favor, espera un minuto e inténtalo de nuevo.' },
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

    // 4. Crear página de Roadmap en el Notion personal del usuario
    //    Estrategia: intentar como hijo de la página seleccionada.
    //    Si Notion rechaza (ej. perfil de persona), fallback a nivel workspace.
    const pageTitle = `Career OS Roadmap: ${formData.name}`;
    const pageChildren = [
      {
        object: 'block' as const,
        type: 'heading_2' as const,
        heading_2: {
          rich_text: [{ type: 'text' as const, text: { content: 'Tu Roadmap Generado' } }],
        },
      },
      ...roadmap.flatMap((item: RoadmapItem) => [
        {
          object: 'block' as const,
          type: 'heading_3' as const,
          heading_3: {
            rich_text: [{ type: 'text' as const, text: { content: `[${item.type.toUpperCase()}] ${item.title}` } }],
          },
        },
        {
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [
              { type: 'text' as const, text: { content: '⏱️ Duración: ' }, annotations: { bold: true } },
              { type: 'text' as const, text: { content: item.duration } },
            ],
          },
        },
        {
          object: 'block' as const,
          type: 'paragraph' as const,
          paragraph: {
            rich_text: [{ type: 'text' as const, text: { content: item.description } }],
          },
        },
        {
          object: 'block' as const,
          type: 'bulleted_list_item' as const,
          bulleted_list_item: {
            rich_text: [
              { type: 'text' as const, text: { content: '📚 Recursos: ' }, annotations: { bold: true } },
              { type: 'text' as const, text: { content: item.resources.join(' • ') } },
            ],
          },
        },
        {
          object: 'block' as const,
          type: 'quote' as const,
          quote: {
            rich_text: [
              { type: 'text' as const, text: { content: '🎯 Criterio de Éxito: ' }, annotations: { bold: true } },
              { type: 'text' as const, text: { content: item.successCriteria } },
            ],
          },
        },
        {
          object: 'block' as const,
          type: 'divider' as const,
          divider: {},
        }
      ]),
    ];

    let notionResponse;
    try {
      // Intento 1: crear como hijo de la página seleccionada
      notionResponse = await notion.pages.create({
        parent: { page_id: parentPageId },
        properties: {
          title: { title: [{ text: { content: pageTitle } }] },
        },
        children: pageChildren,
      });
    } catch (notionError: unknown) {
      const apiErr = notionError as { code?: string };
      if (apiErr.code === 'validation_error') {
        // Fallback: la página no acepta hijos (perfil de persona, etc.)
        // Crear a nivel workspace (raíz del Notion del usuario)
        notionResponse = await notion.pages.create({
          parent: { workspace: true },
          properties: {
            title: { title: [{ text: { content: pageTitle } }] },
          },
          children: pageChildren,
        });
      } else {
        throw notionError;
      }
    }

    const notionUrl = (notionResponse as { url: string }).url;

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
