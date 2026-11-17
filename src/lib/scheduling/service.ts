import "server-only";
import postgres from "postgres";
import { generateAvailability, type Busy, type DayAvailability } from "@/lib/booking/availability";
import { hashToken, isTokenShape, newToken } from "./tokens";

/**
 * Acesso ao agendamento por conexão DIRETA ao Postgres (Supabase, Neon ou qualquer outro), SOMENTE no servidor.
 * Sem APIs públicas no meio: o navegador não tem como alcançar o banco. Toda regra importante (sobreposição,
 * antecedência, expiração, uso único) está nas funções do schema `mk_agendamento`; aqui só as chamamos.
 */
export class SchedulingUnavailableError extends Error {
  constructor() {
    super("Agendamento indisponível: DATABASE_URL não configurada.");
  }
}

let conn: postgres.Sql | null = null;
function sql(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new SchedulingUnavailableError();
  // max 1 + prepare:false = compatível com o pooler em modo transação (serverless/Vercel).
  conn ??= postgres(url, { max: 1, prepare: false, ssl: "require", idle_timeout: 20, connect_timeout: 10 });
  return conn;
}

export const isSchedulingConfigured = () => Boolean(process.env.DATABASE_URL);

type Rpc = { ok: boolean; reason?: string } & Record<string, unknown>;
async function rpc(query: Promise<postgres.RowList<postgres.Row[]>>): Promise<Rpc> {
  try {
    const rows = await query;
    return rows[0]?.r as Rpc;
  } catch {
    throw new Error("Falha ao acessar a agenda"); // sem expor detalhes nem dados pessoais
  }
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
  let rows: postgres.RowList<postgres.Row[]>;
  try {
    rows = await sql()`select start_at, core_end_at, end_at from mk_agendamento.get_busy(${now}, ${to}, ${now})`;
  } catch {
    throw new Error("Falha ao consultar a agenda");
  }
  const busy: Busy[] = rows.map((r) => ({ start: new Date(r.start_at), coreEnd: new Date(r.core_end_at), end: new Date(r.end_at) }));
  return generateAvailability(now, busy);
}

/** Reserva o horário por 10 min. O `holdToken` fica com o navegador de quem reservou. */
export async function holdSlot(start: Date, serviceSlug: string, kind: BookingKind) {
  const holdToken = newToken();
  const r = await rpc(sql()`select mk_agendamento.hold_slot(${start}, ${serviceSlug}, ${kind}, ${holdToken}) as r`);
  return r.ok ? { ok: true as const, id: r.id as string, protocol: r.protocol as string, expiresAt: r.expires_at as string, holdToken } : r;
}

export const releaseHold = (id: string, holdToken: string) =>
  rpc(sql()`select mk_agendamento.release_hold(${id}::uuid, ${holdToken}) as r`);

export const finalizeHold = (id: string, holdToken: string, data: CustomerData) =>
  rpc(sql()`select mk_agendamento.finalize_hold(${id}::uuid, ${holdToken}, ${sql().json(data as never)}) as r`);

/** Conserto/avaliação: registra o pedido SEM ocupar agenda; o técnico decide se manda o convite. */
export const createEvaluationRequest = (serviceSlug: string, data: CustomerData) =>
  rpc(sql()`select mk_agendamento.create_evaluation_request(${serviceSlug}, ${sql().json(data as never)}) as r`);

/** Técnico gera o convite individual. Devolve o token UMA vez, para montar o link; o banco guarda só o hash. */
export async function createInvite(requestId: string) {
  const token = newToken();
  const r = await rpc(sql()`select mk_agendamento.create_invite(${requestId}::uuid, ${hashToken(token)}) as r`);
  return r.ok ? { ok: true as const, token, expiresAt: r.expires_at as string } : r;
}

export async function getInvite(token: string) {
  if (!isTokenShape(token)) return { ok: false as const, reason: "convite_invalido" };
  return rpc(sql()`select mk_agendamento.get_invite(${hashToken(token)}) as r`);
}

export async function claimInviteSlot(token: string, start: Date) {
  if (!isTokenShape(token)) return { ok: false as const, reason: "convite_invalido" };
  return rpc(sql()`select mk_agendamento.claim_invite_slot(${hashToken(token)}, ${start}) as r`);
}

export const technicianDecide = (id: string, decision: "confirmar" | "recusar") =>
  rpc(sql()`select mk_agendamento.technician_decide(${id}::uuid, ${decision}) as r`);

/** Verificação para o dono confirmar a configuração. Não devolve dados, só o estado. */
export async function schedulingHealth(): Promise<{ configurado: boolean; conectado: boolean; migracao: boolean }> {
  if (!isSchedulingConfigured()) return { configurado: false, conectado: false, migracao: false };
  try {
    await sql()`select 1`;
  } catch {
    return { configurado: true, conectado: false, migracao: false };
  }
  try {
    const r = await sql()`select count(*)::int as n from mk_agendamento.business_settings`;
    return { configurado: true, conectado: true, migracao: (r[0]?.n ?? 0) === 1 };
  } catch {
    return { configurado: true, conectado: true, migracao: false };
  }
}
