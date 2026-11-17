"use server";

import * as webpush from "web-push";
import { z } from "zod";
import { buildWhatsAppUrlTo } from "@/config/whatsapp";
import { guardAction, login, logout } from "@/lib/admin/session";
import { isPushConfigured, notifyTechnician } from "@/lib/notify/push";
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
    if (input.decision === "confirmar") return notice(before, `Confirmado: avise ${before.name}`, confirmMessage(before, svc));
    // Recusa: convite para o cliente escolher outro horário. Se falhar, a recusa vale e a mensagem segue sem o link.
    const inv = await db.createInvite(parsed.data).catch(() => null);
    return notice(before, `Recusado: avise ${before.name}`, refuseMessage(before, inv?.ok ? inv.token : undefined));
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
    const svc = await serviceName(b.serviceSlug);
    // Convite para o cliente escolher outro dia/hora. Se falhar, o cancelamento vale e a mensagem segue sem o link.
    const inv = await db.createInvite(parsed.data).catch(() => null);
    return notice(b, `Cancelado: avise ${b.name}`, cancelMessage(b, svc, inv?.ok ? inv.token : undefined));
  } catch {
    return fail("indisponivel");
  }
}

// ------------------------------------------------------------------ notificações no celular
const subSchema = z.object({
  endpoint: z.string().url().startsWith("https://").max(1000),
  keys: z.object({ p256dh: z.string().min(10).max(300), auth: z.string().min(10).max(100) }),
});

export async function savePushAction(input: unknown): Promise<{ ok: true } | Fail> {
  if (!(await guardAction())) return denied;
  const p = subSchema.safeParse(input);
  if (!p.success) return fail("dados_invalidos");
  try {
    await db.savePushSubscription({ endpoint: p.data.endpoint, p256dh: p.data.keys.p256dh, auth: p.data.keys.auth });
    return { ok: true };
  } catch {
    return fail("indisponivel");
  }
}

export async function removePushAction(input: { endpoint: string }): Promise<{ ok: true } | Fail> {
  if (!(await guardAction())) return denied;
  try {
    await db.removePushSubscription(String(input.endpoint));
    return { ok: true };
  } catch {
    return fail("indisponivel");
  }
}

export async function testPushAction(): Promise<{ ok: true; sent: number } | Fail> {
  if (!(await guardAction())) return denied;
  if (!isPushConfigured()) return fail("nao_configurado");
  return { ok: true, sent: await notifyTechnician({ title: "Aviso de teste", body: "Os avisos de pedido novo estão funcionando neste celular." }) };
}

/** Gera as chaves UMA vez, só para quem está logado e só enquanto ainda não existem no servidor. */
export async function generateVapidAction(): Promise<{ ok: true; publicKey: string; privateKey: string } | Fail> {
  if (!(await guardAction())) return denied;
  if (isPushConfigured()) return fail("ja_configurado");
  const k = webpush.generateVAPIDKeys();
  return { ok: true, publicKey: k.publicKey, privateKey: k.privateKey };
}
