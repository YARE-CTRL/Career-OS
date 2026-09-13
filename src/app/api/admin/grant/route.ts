import { NextResponse } from "next/server";
import { grantProAccess, PlanType } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId, secret, planId } = await req.json();

    if (!userId || !secret) {
      return NextResponse.json({ error: "Faltan parámetros (userId o secret)" }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;
    
    // Si no hay un ADMIN_SECRET configurado, no permitimos activar por seguridad
    if (!adminSecret) {
      return NextResponse.json(
        { error: "ADMIN_SECRET no está configurado en el servidor" },
        { status: 500 }
      );
    }

    if (secret !== adminSecret) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // Default plan to 'monthly' if not provided or invalid
    const validPlans: PlanType[] = ['monthly', 'annual', 'lifetime'];
    const planToGrant = validPlans.includes(planId as PlanType) ? (planId as PlanType) : 'monthly';

    await grantProAccess(userId, planToGrant);

    return NextResponse.json({ 
      success: true, 
      message: `Plan ${planToGrant} otorgado exitosamente al usuario ${userId}` 
    });

  } catch (error: any) {
    console.error("[Admin Grant API] Error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
