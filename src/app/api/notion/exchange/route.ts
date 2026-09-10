import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// SEGURIDAD: Este endpoint canjea un OTC (One-Time Code) por las credenciales
// OAuth de Notion. El código es de un solo uso y expira en 5 minutos.
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function POST(request: Request) {
  if (!redis) {
    return NextResponse.json(
      { error: "Servicio no disponible." },
      { status: 503 }
    );
  }

  try {
    const { otc } = await request.json();

    if (!otc || typeof otc !== "string" || !/^[a-f0-9]{64}$/.test(otc)) {
      return NextResponse.json(
        { error: "Código inválido." },
        { status: 400 }
      );
    }

    const key = `notion_otc:${otc}`;
    const raw = await redis.get<string>(key);

    if (!raw) {
      return NextResponse.json(
        { error: "Código expirado o inválido." },
        { status: 404 }
      );
    }

    // Invalidar inmediatamente el código (one-time use)
    await redis.del(key);

    const credentials = JSON.parse(raw) as {
      access_token: string;
      id: string;
      name: string;
    };

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("[notion/exchange] Error:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el código." },
      { status: 500 }
    );
  }
}
