"use server";

import { z } from "zod";
import { buildWhatsAppUrlTo } from "@/config/whatsapp";
import { guardAction, login, logout } from "@/lib/admin/session";
import { serviceRepository } from "@/lib/repositories";
import * as db from "./service";
import { cancelMessage, confirmMessage, inviteMessage, refuseMessage } from "./tech-messages";

/** Todas as ações do técnico exigem a sessão (cookie assinado). Sem ela: "nao_autorizado". */
type Fail = { ok: false; reason: string };
export type Notice = { ok: true; id: string; title: string; message: string; url: string | null; phone: string };

const id = z.string().uuid();
const denied: Fail = { ok: false, reason: "nao_autorizado" };
const fail = (reason: string): Fail => ({ ok: false, reason });

async function serviceName(slug: string) {
  return (await serviceRepository.list()).find((s) => s.slug === slug)?.name ?? "o serviço";
}
const notice = (b: db.TechBooking, title: string, message: string): Notice => ({
  ok: true, id: b.id, title, message, url: buildWhatsAppUrlTo(b.phone, message), phone: b.phone,
});

export async function loginAction(password: string) {
  return login(password);
}
export async function logoutAction() {
  await logout();
}

export async function decideAction(input: { id: string; decision: "confirmar" | "recusar" }): Promise<Notice | Fail> {
  if (!(await guardAction())) return denied;
  const parsed = id.safeParse(input.id);
  if (!parsed.success || (input.decision !== "confirmar" && input.decision !== "recusar")) return fail("dados_invalidos");
  try {
    const before = await db.getTechBooking(parsed.data);
    if (!before) return fail("nao_encontrado");
    const r = await db.technicianDecide(parsed.data, input.decision);
    if (!r.ok) return fail(String(r.reason ?? "erro"));
    const svc = await serviceName(before.serviceSlug);
    return input.decision === "confirmar"
      ? notice(before, `Confirmado: avise ${before.name}`, confirmMessage(before, svc))
      : notice(before, `Recusado: avise ${before.name}`, refuseMessage(before));
  } catch {
    return fail("indisponivel");
  }
}

export async function inviteAction(input: { id: string }): Promise<Notice | Fail> {
  if (!(await guardAction())) return denied;
  const parsed = id.safeParse(input.id);
  if (!parsed.success) return fail("dados_invalidos");
  try {
    const b = await db.getTechBooking(parsed.data);
    if (!b || b.kind !== "avaliacao") return fail("nao_encontrado");
    const r = await db.createInvite(parsed.data);
    if (!r.ok) return fail(String(r.reason ?? "erro"));
    return notice(b, `Link criado: envie para ${b.name}`, inviteMessage(b, r.token));
  } catch {
    return fail("indisponivel");
  }
}

export async function closeEvaluationAction(input: { id: string }): Promise<{ ok: true } | Fail> {
  if (!(await guardAction())) return denied;
  const parsed = id.safeParse(input.id);
  if (!parsed.success) return fail("dados_invalidos");
  try {
    return (await db.closeEvaluation(parsed.data)) ? { ok: true } : fail("nao_encontrado");
  } catch {
    return fail("indisponivel");
  }
}

export async function cancelAction(input: { id: string }): Promise<Notice | Fail> {
  if (!(await guardAction())) return denied;
  const parsed = id.safeParse(input.id);
  if (!parsed.success) return fail("dados_invalidos");
  try {
    const b = await db.getTechBooking(parsed.data);
    if (!b) return fail("nao_encontrado");
    if (!(await db.cancelBooking(parsed.data))) return fail("status_invalido");
    return notice(b, `Cancelado: avise ${b.name}`, cancelMessage(b, await serviceName(b.serviceSlug)));
  } catch {
    return fail("indisponivel");
  }
}
