import NextAuth from 'next-auth';
import Notion from 'next-auth/providers/notion';

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  basePath: '/api/auth',
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Notion({
      clientId: process.env.NOTION_CLIENT_ID!,
      clientSecret: process.env.NOTION_CLIENT_SECRET!,
      redirectUri: `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/callback/notion`,
      checks: ["state"],
      token: {
        url: "https://api.notion.com/v1/oauth/token",
        async request(context: any) {
          const { provider, params: { code }, client } = context;
          const credentials = Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString('base64');
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
          if (!response.ok) throw new Error(`Notion Token Error: ${JSON.stringify(tokens)}`);
          return { tokens };
        }
      }
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
