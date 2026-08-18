import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET: process.env.AUTH_SECRET ? 'Exists' : 'Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Exists' : 'Missing',
    AUTH_URL: process.env.AUTH_URL || 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing',
    VERCEL_URL: process.env.VERCEL_URL || 'Missing',
    NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID ? 'Exists' : 'Missing',
    NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET ? 'Exists' : 'Missing',
  });
}
