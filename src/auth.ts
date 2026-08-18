import NextAuth from 'next-auth';
import Notion from 'next-auth/providers/notion';

const env = process.env as any;
console.log("=== NEXTAUTH INIT ===");
console.log("Auth URL:", env.AUTH_URL);
console.log("Client ID fallback used?", !env.AUTH_NOTION_ID && !env.NOTION_CLIENT_ID);

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  logger: {
    error(code, ...message) {
      console.error(`[AUTH_ERROR] ${code.name}:`, message, code);
    },
    warn(code, ...message) {
      console.warn(`[AUTH_WARN] ${code}:`, message);
    },
    debug(code, ...message) {
      console.log(`[AUTH_DEBUG] ${code}:`, JSON.stringify(message, null, 2));
    },
  },
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    Notion({
      clientId: env.AUTH_NOTION_ID || env.NOTION_CLIENT_ID || '39bd872b-594c-819d-b500-0037842488b7',
      clientSecret: env.AUTH_NOTION_SECRET || env.NOTION_CLIENT_SECRET,
      redirectUri: `https://careeros-yare.vercel.app/api/auth/callback/notion`,
      checks: ["state"],
      token: {
        url: "https://api.notion.com/v1/oauth/token",
        async request(context: any) {
          const { provider, params: { code } } = context;
          const credentials = Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString('base64');
          
          try {
            const response = await fetch(provider.token?.url as string, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
              },
              body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: provider.redirectUri,
              }),
            });
            
            const tokens = await response.json();
            if (!response.ok) {
              console.error("NOTION TOKEN ERROR DETAILS:", tokens);
              throw new Error("NotionTokenExchangeError");
            }
            return { tokens };
          } catch (e) {
            console.error("Custom Token Exchange Failed:", e);
            throw e;
          }
        }
      },
      userinfo: {
        url: "https://api.notion.com/v1/users/me",
        async request(context: any) {
          try {
            const profile = await fetch("https://api.notion.com/v1/users/me", {
              headers: {
                Authorization: `Bearer ${context.tokens.access_token}`,
                "Notion-Version": "2022-06-28",
              },
            }).then((res) => res.json());
            return profile;
          } catch (e) {
            console.error("Custom Userinfo Failed:", e);
            throw e;
          }
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("=== SIGNIN CALLBACK TRIGGERED ===");
      console.log("Account:", account);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("=== REDIRECT CALLBACK ===");
      console.log("URL:", url);
      console.log("Base URL:", baseUrl);
      return url;
    },
    async session({ session, token }) {
      // Exponer el access_token de Notion en la sesión del cliente
      // para que la app pueda llamar a la Notion API en nombre del usuario
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      // Persistir el access_token de Notion en el JWT
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    // Redirigir al onboarding tras un login exitoso
    newUser: '/onboarding',
  },
});
