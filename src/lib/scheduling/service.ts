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
  const local = /(localhost|127\.0\.0\.1)/.test(url); // testes locais sem TLS
  conn ??= postgres(url, { max: 1, prepare: false, ssl: local ? false : "require", idle_timeout: 20, connect_timeout: 10 });
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
  return r.ok ? { ok: true as const, id: r.id as string, protocol: r.protocol as string, expiresAt: r.expires_at as string, holdToken } : { ok: false as const, reason: String(r.reason ?? "erro") };
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
  return r.ok ? { ok: true as const, token, expiresAt: r.expires_at as string } : { ok: false as const, reason: String(r.reason ?? "erro") };
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

/** Início do atendimento de um pedido (para montar a mensagem do WhatsApp). */
export async function getBookingStart(id: string): Promise<string | null> {
  try {
    const r = await sql()`select start_at from mk_agendamento.bookings where id = ${id}::uuid`;
    return r[0]?.start_at ? new Date(r[0].start_at).toISOString() : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ painel do técnico (dados com identificação)
export interface TechBooking {
  id: string; protocol: string; serviceSlug: string; kind: string; status: string;
  startIso: string | null; expiresIso: string | null; createdIso: string;
  name: string; phone: string; neighborhood: string; city: string;
  tvSize?: string; brand?: string; symptoms: string[]; notes?: string;
  inviteActiveIso: string | null; hadInvite: boolean;
}
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
const toTech = (r: postgres.Row): TechBooking => ({
  id: r.id, protocol: r.protocol, serviceSlug: r.service_slug, kind: r.kind, status: r.status,
  startIso: iso(r.start_at), expiresIso: iso(r.expires_at), createdIso: iso(r.created_at)!,
  name: r.customer_name ?? "", phone: r.customer_phone ?? "",
  neighborhood: r.location?.neighborhood ?? "", city: r.location?.city ?? "",
  tvSize: r.details?.tvSize, brand: r.details?.brand, symptoms: r.details?.symptoms ?? [], notes: r.details?.notes,
  inviteActiveIso: iso(r.invite_active), hadInvite: Boolean(r.had_invite),
});
const COLS = "b.id, b.protocol, b.service_slug, b.kind, b.status, b.start_at, b.expires_at, b.created_at, b.customer_name, b.customer_phone, b.location, b.details";

export async function listForTechnician() {
  const q = sql();
  await q`select mk_agendamento.expire_stale(now())`;
  const [pending, evaluations, upcoming] = await Promise.all([
    q.unsafe(`select ${COLS}, null::timestamptz as invite_active, false as had_invite from mk_agendamento.bookings b
              where b.status = 'aguardando_confirmacao' and b.expires_at > now() order by b.start_at`),
    q.unsafe(`select ${COLS},
                (select max(i.expires_at) from mk_agendamento.invites i where i.request_id = b.id and i.used_at is null and i.expires_at > now()) as invite_active,
                exists(select 1 from mk_agendamento.invites i where i.request_id = b.id) as had_invite
              from mk_agendamento.bookings b where b.kind = 'avaliacao' and b.status = 'aguardando_tecnico' order by b.created_at`),
    q.unsafe(`select ${COLS}, null::timestamptz as invite_active, false as had_invite from mk_agendamento.bookings b
              where b.status in ('confirmado', 'em_atendimento') and b.end_at > now() order by b.start_at limit 50`),
  ]);
  return { pending: pending.map(toTech), evaluations: evaluations.map(toTech), upcoming: upcoming.map(toTech) };
}

export async function getTechBooking(id: string): Promise<TechBooking | null> {
  const r = await sql().unsafe(`select ${COLS}, null::timestamptz as invite_active, false as had_invite from mk_agendamento.bookings b where b.id = $1::uuid`, [id]);
  return r[0] ? toTech(r[0]) : null;
}

/** Cancela um atendimento (libera o horário na hora). */
export async function cancelBooking(id: string): Promise<boolean> {
  const r = await sql()`update mk_agendamento.bookings set status = 'cancelado', expires_at = null, updated_at = now()
                         where id = ${id}::uuid and status in ('confirmado', 'aguardando_confirmacao') returning id`;
  return r.length === 1;
}

/** Avaliação resolvida por conversa, sem retirada. */
export async function closeEvaluation(id: string): Promise<boolean> {
  const r = await sql()`update mk_agendamento.bookings set status = 'concluido', updated_at = now()
                         where id = ${id}::uuid and kind = 'avaliacao' and status = 'aguardando_tecnico' returning id`;
  return r.length === 1;
}
