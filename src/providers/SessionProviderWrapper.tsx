'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Client-side wrapper for NextAuth SessionProvider.
 * Required in App Router since SessionProvider uses React Context,
 * which cannot be used directly in Server Components.
 *
 * Usage: Wrap {children} in the root layout.tsx with this component.
 */
export default function SessionProviderWrapper({
  children,
  session,
}: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
