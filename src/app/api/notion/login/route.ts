import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cid = (process.env.AUTH_NOTION_ID || process.env.NOTION_CLIENT_ID || '39bd872b-594c-819d-b500-0037842488b7').trim();
  const redirectUri = `https://careeros-yare.vercel.app/api/notion/callback`;

  const notionAuthUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  notionAuthUrl.searchParams.set("owner", "user");
  notionAuthUrl.searchParams.set("client_id", cid);
  notionAuthUrl.searchParams.set("redirect_uri", redirectUri);
  notionAuthUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(notionAuthUrl.toString());
}
