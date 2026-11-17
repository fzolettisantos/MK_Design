import { NextResponse } from "next/server";
import { schedulingHealth } from "@/lib/scheduling/service";

export const dynamic = "force-dynamic";

/** GET /api/agenda/status → { configurado, conectado, migracao }. Sem dados de clientes. */
export async function GET() {
  const h = await schedulingHealth();
  return NextResponse.json(h, { status: h.migracao ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
