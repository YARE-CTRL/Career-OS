import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  
  if (!code) {
    return NextResponse.redirect(new URL("/?error=NoCode", request.url));
  }

  const cid = process.env.AUTH_NOTION_ID || process.env.NOTION_CLIENT_ID || '39bd872b-594c-819d-b500-0037842488b7';
  const csec = process.env.AUTH_NOTION_SECRET || process.env.NOTION_CLIENT_SECRET;
  const redirectUri = `https://careeros-yare.vercel.app/api/notion/callback`;

  if (!csec) {
    console.error("[NOTION_MANUAL] Missing Client Secret!");
    return NextResponse.redirect(new URL("/?error=MissingSecret", request.url));
  }

  const credentials = btoa(`${cid}:${csec}`);

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
    
    // 4. Redirect to client-side bridge to create the NextAuth session
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
