import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  const cid = (process.env.AUTH_NOTION_ID || process.env.NOTION_CLIENT_ID || '39bd872b-594c-819d-b500-0037842488b7').trim();
  const redirectUri = `https://careeros-yare.vercel.app/api/notion/callback`;

  // SEGURIDAD: Generar parámetro 'state' aleatorio para prevenir CSRF en OAuth.
  // El state se almacena en una cookie HttpOnly y se valida en el callback.
  const state = crypto.randomBytes(16).toString("hex");

  const notionAuthUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  notionAuthUrl.searchParams.set("owner", "user");
  notionAuthUrl.searchParams.set("client_id", cid);
  notionAuthUrl.searchParams.set("redirect_uri", redirectUri);
  notionAuthUrl.searchParams.set("response_type", "code");
  notionAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(notionAuthUrl.toString());

  // Cookie HttpOnly + SameSite=Lax: no accesible desde JS, solo enviada en
  // navegaciones de primer nivel (el redirect de vuelta desde Notion).
  response.cookies.set("notion_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutos
    path: "/",
  });

  return response;
}
