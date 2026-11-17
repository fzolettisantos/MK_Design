"use server";

import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/config/whatsapp";
import { fmtSlotParts } from "@/lib/booking/slot-format";
import { serviceRepository } from "@/lib/repositories";
import { customerSchema, detailsLine, kindSchema, toRecord, type Customer } from "./customer";
import * as db from "./service";

/**
 * Ações chamadas pelo navegador. Cada uma VALIDA tudo no servidor (nunca confia no cliente) e devolve só o necessário.
 * Erros do banco viram mensagens neutras: nenhum detalhe técnico nem dado pessoal sai daqui.
 */
type Fail = { ok: false; reason: string };
const UNAVAILABLE: Fail = { ok: false, reason: "indisponivel" };
const safe = async <T>(fn: () => Promise<T>): Promise<T | Fail> => {
  try {
    return await fn();
  } catch {
    return UNAVAILABLE;
  }
};

export async function loadAvailabilityAction() {
  return safe(async () => ({ ok: true as const, days: await db.getAvailability() }));
}

async function serviceFor(slug: string) {
  return (await serviceRepository.getBySlug(slug)) ?? null;
}

export async function holdSlotAction(input: { start: string; serviceSlug: string; kind: string }) {
  const kind = kindSchema.safeParse(input.kind);
  const start = new Date(input.start);
  if (!kind.success || Number.isNaN(start.getTime())) return { ok: false as const, reason: "dados_invalidos" };
  const service = await serviceFor(input.serviceSlug);
  if (!service) return { ok: false as const, reason: "servico_invalido" };
  // instalação só para serviços de instalação; retirada só para assistência técnica
  if ((kind.data === "retirada") !== (service.categoryId === "assistencia-tecnica")) return { ok: false as const, reason: "servico_invalido" };
  return safe(async () => {
    const r = await db.holdSlot(start, service.slug, kind.data);
    if (!r.ok) return { ok: false as const, reason: String(r.reason ?? "erro") };
    const secondsLeft = Math.max(0, Math.round((new Date(r.expiresAt).getTime() - Date.now()) / 1000));
    return { ok: true as const, id: r.id, holdToken: r.holdToken, secondsLeft };
  });
}

export async function releaseHoldAction(input: { id: string; holdToken: string }) {
  return safe(async () => {
    await db.releaseHold(String(input.id), String(input.holdToken));
    return { ok: true as const };
  });
}

function whatsapp(c: Customer, serviceName: string, protocol: string, startIso: string | null, extra = "") {
  const when = startIso ? fmtSlotParts(startIso) : null;
  const message = buildWhatsAppMessage({
    protocolo: protocol,
    servico: `${serviceName}${extra}`,
    detalhes: detailsLine(c),
    localidade: `${c.neighborhood}/${c.city}`,
    data: when?.date ?? "A combinar (sem agenda)",
    hora: when?.time ?? "A combinar",
    nome: c.name,
  });
  return { message, whatsappUrl: buildWhatsAppUrl(message) };
}

export async function finalizeBookingAction(input: { id: string; holdToken: string; serviceSlug: string; customer: unknown }) {
  const c = customerSchema.safeParse(input.customer);
  if (!c.success) return { ok: false as const, reason: "dados_invalidos", message: c.error.issues[0]?.message };
  const service = await serviceFor(input.serviceSlug);
  if (!service) return { ok: false as const, reason: "servico_invalido" };
  return safe(async () => {
    const r = await db.finalizeHold(String(input.id), String(input.holdToken), toRecord(c.data));
    if (!r.ok) return { ok: false as const, reason: String(r.reason ?? "erro") };
    const start = await db.getBookingStart(String(input.id));
    const extra = service.categoryId === "assistencia-tecnica" ? " (retirada da TV para conserto, sem diagnóstico prévio)" : "";
    return { ok: true as const, protocol: String(r.protocol), startIso: start, ...whatsapp(c.data, service.name, String(r.protocol), start, extra) };
  });
}

export async function createEvaluationAction(input: { serviceSlug: string; customer: unknown }) {
  const c = customerSchema.safeParse(input.customer);
  if (!c.success) return { ok: false as const, reason: "dados_invalidos", message: c.error.issues[0]?.message };
  const service = await serviceFor(input.serviceSlug);
  if (!service || service.categoryId !== "assistencia-tecnica") return { ok: false as const, reason: "servico_invalido" };
  return safe(async () => {
    const r = await db.createEvaluationRequest(service.slug, toRecord(c.data));
    if (!r.ok) return { ok: false as const, reason: String(r.reason ?? "erro") };
    return { ok: true as const, protocol: String(r.protocol), startIso: null, ...whatsapp(c.data, service.name, String(r.protocol), null) };
  });
}

export async function claimInviteAction(input: { token: string; start: string }) {
  const start = new Date(input.start);
  if (Number.isNaN(start.getTime())) return { ok: false as const, reason: "dados_invalidos" };
  return safe(async () => {
    const r = await db.claimInviteSlot(String(input.token), start);
    if (!r.ok) return { ok: false as const, reason: String(r.reason ?? "erro") };
    const startIso = await db.getBookingStart(String(r.id));
    const when = startIso ? fmtSlotParts(startIso) : null;
    const message = buildWhatsAppMessage({
      protocolo: String(r.protocol), servico: "Retirada da TV para conserto (convite do técnico)", detalhes: "Horário escolhido pelo link enviado pelo técnico",
      localidade: "(já no pedido)", data: when?.date ?? "", hora: when?.time ?? "", nome: "(já no pedido)",
    });
    return { ok: true as const, protocol: String(r.protocol), startIso, message, whatsappUrl: buildWhatsAppUrl(message) };
  });
}
