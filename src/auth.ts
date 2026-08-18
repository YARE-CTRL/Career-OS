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
