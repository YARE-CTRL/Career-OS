import { NextResponse } from 'next/server';

// SEGURIDAD: Este endpoint solo está disponible en entorno de desarrollo local.
// En producción devuelve 404 para no exponer inventario de variables de entorno.
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(null, { status: 404 });
  }

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
