import NextAuth from 'next-auth';
import Notion from 'next-auth/providers/notion';

const env = process.env as any;

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
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
