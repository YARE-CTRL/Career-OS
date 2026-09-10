import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { cookies } from "next/headers";

// Redis para almacenar el one-time code del token OAuth de Notion
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  // SEGURIDAD: Validar el parámetro state contra la cookie para prevenir CSRF.
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("notion_oauth_state")?.value;

  if (!expectedState || !returnedState || expectedState !== returnedState) {
    console.error("[NOTION_MANUAL] CSRF: state mismatch o cookie ausente.");
    return NextResponse.redirect(new URL("/?error=CSRFValidationFailed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=NoCode", request.url));
  }


  const cid = (process.env.AUTH_NOTION_ID || process.env.NOTION_CLIENT_ID || '39bd872b-594c-819d-b500-0037842488b7').trim();
  const csec = (process.env.AUTH_NOTION_SECRET || process.env.NOTION_CLIENT_SECRET || '').trim();
  const redirectUri = `https://careeros-yare.vercel.app/api/notion/callback`;

  if (!csec) {
    console.error("[NOTION_MANUAL] Missing Client Secret!");
    return NextResponse.redirect(new URL("/?error=MissingSecret", request.url));
  }

  const credentials = Buffer.from(`${cid}:${csec}`).toString('base64');

  try {
    // 1. Fetch Tokens
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("[NOTION_MANUAL] Token Error:", tokens);
      return NextResponse.redirect(new URL(`/?error=TokenExchangeFailed`, request.url));
    }

    // 2. Fetch User Profile
    const profileResponse = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    const profile = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error("[NOTION_MANUAL] Profile Error:", profile);
      return NextResponse.redirect(new URL(`/?error=ProfileFetchFailed`, request.url));
    }

    // 3. Extract Safe Profile Data (Handling Workspaces)
    const user = profile.bot?.owner?.user;
    const safeId = user?.id || profile.id || "notion-id";
    const safeName = user?.name || profile.name || "Notion User";

    // 4. SEGURIDAD FIX: En lugar de pasar el access_token en la URL (visible en
    //    logs de servidor, historial del browser y header Referer), generamos un
    //    código aleatorio de un solo uso (OTC) y guardamos el token en Redis con
    //    TTL de 5 minutos. El bridge intercambia el código por el token en el servidor.
    if (redis) {
      const otc = crypto.randomBytes(32).toString("hex"); // 256 bits de entropía
      const payload = JSON.stringify({
        access_token: tokens.access_token,
        id: safeId,
        name: safeName,
      });

      // TTL de 300 segundos (5 minutos) — más que suficiente para el redirect
      await redis.set(`notion_otc:${otc}`, payload, { ex: 300 });

      const bridgeUrl = new URL("/notion-bridge", request.url);
      bridgeUrl.searchParams.set("otc", otc);
      return NextResponse.redirect(bridgeUrl);
    }

    // Fallback sin Redis: mantener flujo anterior (degradación segura en dev local)
    // ADVERTENCIA: Solo ocurre si Redis no está configurado (entorno de desarrollo)
    console.warn("[NOTION_MANUAL] Redis no disponible — usando fallback sin OTC (solo dev)");
    const bridgeUrl = new URL("/notion-bridge", request.url);
    bridgeUrl.searchParams.set("access_token", tokens.access_token);
    bridgeUrl.searchParams.set("id", safeId);
    bridgeUrl.searchParams.set("name", safeName);
    return NextResponse.redirect(bridgeUrl);

  } catch (error) {
    console.error("[NOTION_MANUAL] Catch Error:", error);
    return NextResponse.redirect(new URL(`/?error=NetworkFailure`, request.url));
  }
}
