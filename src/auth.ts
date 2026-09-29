import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const env = process.env as any;
console.log(`[AUTH_INIT_V2] Auth URL: ${env.AUTH_URL} | Fallback used? ${!env.AUTH_NOTION_ID && !env.NOTION_CLIENT_ID}`);

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  logger: {
    error(code, ...message) {
      console.log(`[AUTH_ERROR_FORCE_INFO] ${code?.name}:`, message, code);
    },
    warn(code, ...message) {
      console.warn(`[AUTH_WARN] ${code}:`, message);
    },
    debug(code, ...message) {
      const util = require('util');
      console.log(`[AUTH_DEBUG] ${code}:`, util.inspect(message, { depth: null }));
    },
  },
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    CredentialsProvider({
      id: "notion-manual",
      name: "Notion Manual",
      credentials: {
        access_token: { label: "Token", type: "text" },
        id: { label: "ID", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.access_token) return null;
        return {
          id: credentials.id as string,
          name: credentials.name as string,
          email: "notion@careeros.local",
          access_token: credentials.access_token as string,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log(`[SIGNIN_CALLBACK_V2] Provider: ${account?.provider} | Account: ${JSON.stringify(account)}`);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log(`[REDIRECT_CALLBACK_V2] URL: ${url} | Base URL: ${baseUrl}`);
      // Evitar open redirect:
      // Si la URL es relativa, añade la baseUrl.
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      // Si la URL ya es absoluta, permite solo si coincide con el mismo origen (baseUrl).
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      // Exponer el access_token de Notion en la sesión del cliente
      // para que la app pueda llamar a la Notion API en nombre del usuario
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      // Asegurar que el ID de usuario viaje siempre en la sesión (evita fallback a undefined)
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // Persistir el access_token y el id de Notion en el JWT
      if (user) {
        if ((user as any).access_token) {
          token.accessToken = (user as any).access_token;
        }
        if (user.id) {
          token.sub = user.id;
        }
      } else if (account?.access_token) {
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
