import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkProStatus } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ isPro: false });
    }

    // Usar el mismo identificador que el webhook: id o email como fallback
    const userId = session.user.id || session.user.email || 'unknown';
    const isPro = await checkProStatus(userId);

    return NextResponse.json({ isPro, userId });
  } catch (error) {
    console.error('[/api/me/pro-status] Error:', error);
    return NextResponse.json({ isPro: false });
  }
}
