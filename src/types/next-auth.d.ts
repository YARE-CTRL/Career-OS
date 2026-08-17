import 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in Session type to include the Notion access_token.
   * This token is needed to make user-scoped Notion API calls after OAuth.
   */
  interface Session {
    accessToken?: string;
  }
}
