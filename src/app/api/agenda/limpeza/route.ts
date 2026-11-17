import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { purgeOld } from "@/lib/scheduling/service";

export const dynamic = "force-dynamic";

/**
 * Retenção de dados (LGPD): apaga pedidos além do prazo (padrão 12 meses). Chamada todo dia pelo agendador da Vercel
 * (vercel.json), que envia `Authorization: Bearer <CRON_SECRET>`. Sem CRON_SECRET a rota fica desativada.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return NextResponse.json({ ok: false, reason: "nao_configurado" }, { status: 503 });
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await purgeOld()) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, reason: "indisponivel" }, { status: 500 });
  }
}
