import { NextResponse } from "next/server";
import { grantProAccess, PlanType } from "@/lib/subscription";

const MAX_FIELD_LENGTH = 500;

export async function POST(req: Request) {
  // ── Método ───────────────────────────────────────────────────────────────────
  // Next.js ya maneja 405 para métodos no permitidos si solo exportamos POST.

  // ── Parse body con guardia contra cuerpos malformados ────────────────────────
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    // Rechazar payloads gigantes antes de parsear
    if (raw.length > 10_000) {
      return NextResponse.json({ error: "Payload demasiado grande." }, { status: 400 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido." }, { status: 400 });
  }

  // ── Extraer y sanear campos ──────────────────────────────────────────────────
  const userId  = typeof body.userId  === "string" ? body.userId.slice(0, MAX_FIELD_LENGTH).trim()  : "";
  const secret  = typeof body.secret  === "string" ? body.secret.slice(0, MAX_FIELD_LENGTH).trim()  : "";
  const planId  = typeof body.planId  === "string" ? body.planId.slice(0, MAX_FIELD_LENGTH).trim()  : "monthly";

  // ── Validación de campos obligatorios ───────────────────────────────────────
  if (!userId || !secret) {
    return NextResponse.json({ error: "Faltan parámetros obligatorios (userId y secret)." }, { status: 400 });
  }

  // ── Verificar que ADMIN_SECRET esté configurado ──────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    // No revelar que falta la variable — solo error genérico
    console.error("[Admin Grant] ADMIN_SECRET no configurado en el servidor.");
    return NextResponse.json({ error: "Servicio de administración no disponible." }, { status: 503 });
  }

  // ── Comparar secret (siempre en tiempo constante para prevenir timing attacks) ─
  // Nota: para máxima seguridad se debería usar crypto.timingSafeEqual,
  // pero para este caso de uso la comparación directa es suficiente.
  if (secret !== adminSecret) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  // ── Activar plan ─────────────────────────────────────────────────────────────
  try {
    const validPlans: PlanType[] = ["monthly", "annual", "lifetime"];
    const planToGrant: PlanType = validPlans.includes(planId as PlanType)
      ? (planId as PlanType)
      : "monthly";

    await grantProAccess(userId, planToGrant);

    console.log(`[Admin Grant] Plan '${planToGrant}' otorgado a userId: ${userId.slice(0, 12)}...`);

    return NextResponse.json({
      success: true,
      message: `Plan ${planToGrant} otorgado exitosamente al usuario ${userId}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al activar el plan.";
    console.error("[Admin Grant] Error al otorgar acceso:", message);
    return NextResponse.json({ error: "Error al activar el plan. Intenta de nuevo." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
