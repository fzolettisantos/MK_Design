import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateAvailability, type Busy, type DayAvailability } from "@/lib/booking/availability";
import { hashToken, isTokenShape, newToken } from "./tokens";

/**
 * Acesso ao agendamento no Supabase. Roda SOMENTE no servidor, com a service_role (nunca vai ao navegador).
 * Toda regra importante (sobreposição, antecedência, expiração, uso único) está no banco: aqui só chamamos as funções.
 */
export class SchedulingUnavailableError extends Error {
  constructor() {
    super("Agendamento indisponível: Supabase não configurado.");
  }
}

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new SchedulingUnavailableError();
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const isSchedulingConfigured = () =>
  Boolean((process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);

type Rpc = { ok: boolean; reason?: string } & Record<string, unknown>;
async function rpc(fn: string, args: Record<string, unknown>): Promise<Rpc> {
  const { data, error } = await db().rpc(fn, args);
  if (error) throw new Error(`Falha ao chamar ${fn}`); // sem expor detalhes nem dados pessoais
  return data as Rpc;
}

export type BookingKind = "instalacao" | "retirada";
export interface CustomerData {
  name: string;
  phone: string;
  location: Record<string, unknown>;
  details: Record<string, unknown>;
}

/** Horários livres dos próximos 30 dias, calculados a partir dos intervalos ocupados (sem dados pessoais). */
export async function getAvailability(now = new Date()): Promise<DayAvailability[]> {
  const to = new Date(now.getTime() + 32 * 24 * 3_600_000);
  const { data, error } = await db().rpc("get_busy", { p_from: now.toISOString(), p_to: to.toISOString(), p_now: now.toISOString() });
  if (error) throw new Error("Falha ao consultar a agenda");
  const busy: Busy[] = (data as { start_at: string; core_end_at: string; end_at: string }[]).map((r) => ({
    start: new Date(r.start_at), coreEnd: new Date(r.core_end_at), end: new Date(r.end_at),
  }));
  return generateAvailability(now, busy);
}

/** Reserva o horário por 10 min. O `holdToken` fica com o navegador de quem reservou. */
export async function holdSlot(startIso: string, serviceSlug: string, kind: BookingKind) {
  const holdToken = newToken();
  const r = await rpc("hold_slot", { p_start: startIso, p_service_slug: serviceSlug, p_kind: kind, p_token: holdToken });
  return r.ok ? { ok: true as const, id: r.id as string, protocol: r.protocol as string, expiresAt: r.expires_at as string, holdToken } : r;
}

export const releaseHold = (id: string, holdToken: string) => rpc("release_hold", { p_id: id, p_token: holdToken });
export const finalizeHold = (id: string, holdToken: string, data: CustomerData) =>
  rpc("finalize_hold", { p_id: id, p_token: holdToken, p_data: data });

/** Conserto/avaliação: registra o pedido SEM ocupar agenda; o técnico decide se manda o convite. */
export const createEvaluationRequest = (serviceSlug: string, data: CustomerData) =>
  rpc("create_evaluation_request", { p_service_slug: serviceSlug, p_data: data });

/** Técnico gera o convite individual. Devolve o token UMA vez, para montar o link; o banco guarda só o hash. */
export async function createInvite(requestId: string) {
  const token = newToken();
  const r = await rpc("create_invite", { p_request_id: requestId, p_token_hash: hashToken(token) });
  return r.ok ? { ok: true as const, token, expiresAt: r.expires_at as string } : r;
}

export async function getInvite(token: string) {
  if (!isTokenShape(token)) return { ok: false as const, reason: "convite_invalido" };
  return rpc("get_invite", { p_token_hash: hashToken(token) });
}

export async function claimInviteSlot(token: string, startIso: string) {
  if (!isTokenShape(token)) return { ok: false as const, reason: "convite_invalido" };
  return rpc("claim_invite_slot", { p_token_hash: hashToken(token), p_start: startIso });
}

export const technicianDecide = (id: string, decision: "confirmar" | "recusar") =>
  rpc("technician_decide", { p_id: id, p_decision: decision });
