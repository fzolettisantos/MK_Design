import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

/** Roda a migração REAL num Postgres (PGlite) e testa as garantias do banco com relógio controlado. */
const SQL = readFileSync("supabase/migrations/0001_agendamento.sql", "utf8") + "\n" + readFileSync("supabase/migrations/0002_convite_reagendamento.sql", "utf8");
const NOW = "2026-11-17T12:00:00-03:00"; // terça, 12:00 em Brasília
const at = (iso: string) => new Date(iso).toISOString();
// Horários válidos (grade de 1h, >24h de antecedência, <30 dias): dia 19/11 em Brasília.
const T = (h: number, day = 19) => at(`2026-11-${day}T${String(h).padStart(2, "0")}:00:00-03:00`);

let db: PGlite;
beforeEach(async () => {
  db = new PGlite();
  await db.exec(SQL);
  await db.exec("set search_path to mk_agendamento, public");
});

const call = async (fn: string, ...args: (string | number | null | object)[]) => {
  const ph = args.map((_, i) => `$${i + 1}`).join(", ");
  const params = args.map((a) => (a !== null && typeof a === "object" ? JSON.stringify(a) : a));
  const r = await db.query<{ r: Record<string, unknown> }>(`select mk_agendamento.${fn}(${ph}) as r`, params);
  return r.rows[0]!.r as { ok: boolean; reason?: string; id?: string; protocol?: string; status?: string };
};
const hold = (start: string, token = "t1", now = NOW) =>
  call("hold_slot", start, "instalacao-de-tv-na-parede", "instalacao", token, at(now));
const person = { name: "Maria Silva", phone: "13912345678", location: { neighborhood: "Centro", city: "Santos" }, details: { tvSize: '55"' } };

describe("reserva e dupla marcação", () => {
  it("reserva um horário livre e devolve protocolo", async () => {
    const r = await hold(T(14));
    expect(r.ok).toBe(true);
    expect(r.protocol).toMatch(/^MK-261117-[2-9A-HJ-NP-Z]{5}$/);
  });

  it("o mesmo horário não pode ser reservado duas vezes", async () => {
    expect((await hold(T(14), "a")).ok).toBe(true);
    const second = await hold(T(14), "b");
    expect(second).toMatchObject({ ok: false, reason: "slot_taken" });
  });

  it("deslocamento de 30 min bloqueia a hora anterior e a seguinte, mas não a de 2h depois", async () => {
    expect((await hold(T(14))).ok).toBe(true);
    expect((await hold(T(13), "b")).reason).toBe("slot_taken"); // 13:00–14:30 invade o bloco de 14:00
    expect((await hold(T(15), "c")).reason).toBe("slot_taken"); // 15:00 começa antes de 15:30
    expect((await hold(T(16), "d")).ok).toBe(true);
    expect((await hold(T(12), "e")).ok).toBe(true);
  });

  it("a restrição está no banco: inserção direta sobreposta também é recusada", async () => {
    await hold(T(14));
    await expect(
      db.query(`insert into bookings (protocol,service_slug,kind,status,start_at,end_at,duration_minutes)
                values ('X','s','instalacao','confirmado',$1,$2,60)`, [T(14), T(15)]),
    ).rejects.toThrow(/no_overlap|exclusion/);
  });
});

describe("regras de tempo (validadas no servidor de banco)", () => {
  it("antecedência mínima de 24h", async () => {
    expect((await hold(at("2026-11-18T11:00:00-03:00"))).reason).toBe("antecedencia");
    expect((await hold(at("2026-11-18T12:00:00-03:00"))).ok).toBe(true); // exatamente 24h
  });
  it("janela máxima de 30 dias", async () => {
    expect((await hold(at("2026-12-17T12:00:00-03:00"))).ok).toBe(true);
    expect((await hold(at("2026-12-17T13:00:00-03:00"))).reason).toBe("fora_da_janela");
  });
  it("só aceita horários na grade de 1h", async () => {
    expect((await hold(at("2026-11-19T14:30:00-03:00"))).reason).toBe("fora_da_grade");
  });
});

describe("expiração libera o horário", () => {
  it("reserva temporária expira em 10 min e outro cliente consegue o horário", async () => {
    expect((await hold(T(14), "a")).ok).toBe(true);
    expect((await hold(T(14), "b", "2026-11-17T12:09:00-03:00")).reason).toBe("slot_taken");
    expect((await hold(T(14), "b", "2026-11-17T12:10:00-03:00")).ok).toBe(true);
  });
  it("não finaliza reserva vencida", async () => {
    const h = await hold(T(14), "a");
    const r = await call("finalize_hold", h.id!, "a", person, at("2026-11-17T12:11:00-03:00"));
    expect(r).toMatchObject({ ok: false, reason: "reserva_expirada" });
  });
  it("token errado não finaliza a reserva de outro", async () => {
    const h = await hold(T(14), "a");
    expect((await call("finalize_hold", h.id!, "errado", person, at(NOW))).reason).toBe("nao_encontrado");
  });
  it("pedido aguardando técnico expira em 12h sem resposta e libera o horário", async () => {
    const h = await hold(T(14), "a");
    expect((await call("finalize_hold", h.id!, "a", person, at(NOW))).ok).toBe(true);
    expect((await hold(T(14), "b", "2026-11-17T23:59:00-03:00")).reason).toBe("slot_taken");
    expect((await hold(T(14), "b", "2026-11-18T00:00:00-03:00")).ok).toBe(true);
  });
  it("get_busy não mostra reservas vencidas nem dados pessoais", async () => {
    const h = await hold(T(14), "a");
    await call("finalize_hold", h.id!, "a", person, at(NOW));
    const q = (now: string) => db.query(`select * from mk_agendamento.get_busy($1,$2,$3)`, [T(0), T(23, 20), at(now)]);
    const busy = await q(NOW);
    expect(busy.rows).toHaveLength(1);
    expect(Object.keys(busy.rows[0]!).sort()).toEqual(["core_end_at", "end_at", "start_at"]);
    expect((await q("2026-11-18T01:00:00-03:00")).rows).toHaveLength(0);
  });
});

describe("decisão do técnico", () => {
  async function pending() {
    const h = await hold(T(14), "a");
    await call("finalize_hold", h.id!, "a", person, at(NOW));
    return h.id!;
  }
  it("confirmar mantém o horário bloqueado, sem expirar", async () => {
    const id = await pending();
    expect(await call("technician_decide", id, "confirmar", at(NOW))).toMatchObject({ ok: true, status: "confirmado" });
    expect((await hold(T(14), "b", "2026-11-18T13:00:00-03:00")).reason).toBe("slot_taken"); // 25h depois e sem expirar
  });
  it("recusar libera o horário na hora", async () => {
    const id = await pending();
    expect((await call("technician_decide", id, "recusar", at(NOW))).status).toBe("recusado");
    expect((await hold(T(14), "b")).ok).toBe(true);
  });
  it("não decide duas vezes nem depois de expirar", async () => {
    const id = await pending();
    await call("technician_decide", id, "confirmar", at(NOW));
    expect((await call("technician_decide", id, "recusar", at(NOW))).reason).toBe("status_invalido");
    const id2 = (await hold(T(18), "z")).id!;
    await call("finalize_hold", id2, "z", person, at(NOW));
    expect((await call("technician_decide", id2, "confirmar", at("2026-11-18T01:00:00-03:00"))).reason).toBe("status_invalido");
  });
  it("registra o histórico de status", async () => {
    const id = await pending();
    await call("technician_decide", id, "confirmar", at(NOW));
    const h = await db.query<{ to_status: string }>(`select to_status from booking_status_history where booking_id=$1 order by id`, [id]);
    expect(h.rows.map((r) => r.to_status)).toEqual(["reserva_temporaria", "aguardando_confirmacao", "confirmado"]);
  });
});

describe("convite do técnico (conserto com retirada)", () => {
  async function request() {
    const r = await call("create_evaluation_request", "solicitar-conserto-de-tv", { ...person, details: { brand: "Samsung", symptoms: ["Não liga"] } }, at(NOW));
    expect(r.ok).toBe(true);
    return r.id!;
  }
  it("avaliação não ocupa agenda", async () => {
    await request();
    expect((await db.query(`select * from mk_agendamento.get_busy($1,$2,$3)`, [T(0), T(23, 20), at(NOW)])).rows).toHaveLength(0);
  });
  it("convite válido: cliente reserva o horário e o convite é consumido (uso único)", async () => {
    const id = await request();
    expect((await call("create_invite", id, "hash1", at(NOW))).ok).toBe(true);
    expect((await call("get_invite", "hash1", at(NOW))).ok).toBe(true);
    const r = await call("claim_invite_slot", "hash1", T(14), at("2026-11-17T13:00:00-03:00"));
    expect(r.ok).toBe(true);
    expect((await call("claim_invite_slot", "hash1", T(18), at("2026-11-17T13:01:00-03:00"))).reason).toBe("convite_usado");
    const b = await db.query<{ status: string; kind: string; parent_id: string }>(`select status, kind, parent_id from bookings where id=$1`, [r.id]);
    expect(b.rows[0]).toMatchObject({ status: "aguardando_confirmacao", kind: "retirada", parent_id: id });
  });
  it("convite expira em 48h", async () => {
    const id = await request();
    await call("create_invite", id, "hash1", at(NOW));
    expect((await call("claim_invite_slot", "hash1", T(14, 24), at("2026-11-19T11:59:00-03:00"))).ok).toBe(true);
    const id2 = await request();
    await call("create_invite", id2, "hash2", at(NOW));
    expect((await call("claim_invite_slot", "hash2", T(18, 24), at("2026-11-19T12:00:00-03:00"))).reason).toBe("convite_expirado");
  });
  it("horário tomado por outro: convite NÃO é consumido e dá para escolher outro", async () => {
    const id = await request();
    await call("create_invite", id, "hash1", at(NOW));
    await hold(T(14), "outro");
    expect((await call("claim_invite_slot", "hash1", T(14), at(NOW))).reason).toBe("slot_taken");
    expect((await call("claim_invite_slot", "hash1", T(18), at(NOW))).ok).toBe(true);
  });
  it("token desconhecido ou antecedência inválida", async () => {
    expect((await call("claim_invite_slot", "nao-existe", T(14), at(NOW))).reason).toBe("convite_invalido");
    const id = await request();
    await call("create_invite", id, "hash1", at(NOW));
    expect((await call("claim_invite_slot", "hash1", at("2026-11-17T20:00:00-03:00"), at(NOW))).reason).toBe("antecedencia");
  });
  it("novo convite invalida o anterior (só um ativo)", async () => {
    const id = await request();
    await call("create_invite", id, "velho", at(NOW));
    await call("create_invite", id, "novo", at("2026-11-17T13:00:00-03:00"));
    expect((await call("get_invite", "velho", at("2026-11-17T13:00:00-03:00"))).reason).toBe("convite_expirado");
    expect((await call("get_invite", "novo", at("2026-11-17T13:00:00-03:00"))).ok).toBe(true);
  });
  it("get_invite não vaza telefone nem detalhes", async () => {
    const id = await request();
    await call("create_invite", id, "hash1", at(NOW));
    const r = await call("get_invite", "hash1", at(NOW));
    expect(JSON.stringify(r)).not.toContain("13912345678");
    expect((r as { first_name?: string }).first_name).toBe("Maria");
  });
});

describe("convite de reagendamento (depois de cancelar)", () => {
  async function cancelled() {
    const h = await hold(T(14), "a");
    await call("finalize_hold", h.id!, "a", person, at(NOW));
    await call("technician_decide", h.id!, "confirmar", at(NOW));
    await db.query(`update bookings set status = 'cancelado' where id = $1`, [h.id]);
    return h.id!;
  }
  it("atendimento cancelado pode receber convite; o horário antigo fica livre", async () => {
    const id = await cancelled();
    expect((await call("create_invite", id, "re1", at(NOW))).ok).toBe(true);
    expect((await hold(T(14), "outro")).ok).toBe(true); // cancelar liberou o horário
  });
  it("cliente escolhe outro horário: novo atendimento do MESMO tipo, o antigo continua cancelado", async () => {
    const id = await cancelled();
    await call("create_invite", id, "re1", at(NOW));
    expect((await call("get_invite", "re1", at(NOW)) as { kind?: string }).kind).toBe("instalacao");
    const r = await call("claim_invite_slot", "re1", T(18, 22), at("2026-11-17T13:00:00-03:00"));
    expect(r.ok).toBe(true);
    const rows = await db.query<{ id: string; kind: string; status: string; parent_id: string | null }>(`select id, kind, status, parent_id from bookings order by created_at, id`);
    const novo = rows.rows.find((x) => x.id === r.id)!;
    expect(novo).toMatchObject({ kind: "instalacao", status: "aguardando_confirmacao", parent_id: id });
    expect(rows.rows.find((x) => x.id === id)!.status).toBe("cancelado");
    expect((await call("claim_invite_slot", "re1", T(20, 22), at("2026-11-17T13:01:00-03:00"))).reason).toBe("convite_usado");
  });
  it("só atendimentos cancelados ou avaliações pendentes aceitam convite", async () => {
    const h = await hold(T(14), "a");
    await call("finalize_hold", h.id!, "a", person, at(NOW));
    expect((await call("create_invite", h.id!, "x", at(NOW))).reason).toBe("pedido_invalido"); // ainda aguardando confirmação
    await call("technician_decide", h.id!, "confirmar", at(NOW));
    expect((await call("create_invite", h.id!, "x", at(NOW))).reason).toBe("pedido_invalido"); // confirmado
  });
});

describe("isolamento: seguro para um projeto que já tem outros apps", () => {
  it("não cria, altera nem remove nada fora do schema mk_agendamento", async () => {
    const other = new PGlite();
    await other.exec(`create table public.bookings (id int primary key, dado text); insert into public.bookings values (1, 'do outro app');
                      create table public.invites (id int); create function public.hold_slot() returns int language sql as 'select 42';`);
    const before = await other.query(`select table_name from information_schema.tables where table_schema='public' order by 1`);
    await other.exec(SQL);
    const after = await other.query(`select table_name from information_schema.tables where table_schema='public' order by 1`);
    expect(after.rows).toEqual(before.rows);
    expect((await other.query(`select dado from public.bookings`)).rows).toEqual([{ dado: "do outro app" }]);
    expect((await other.query(`select public.hold_slot() as v`)).rows).toEqual([{ v: 42 }]);
    const fns = await other.query<{ n: string }>(`select count(*)::text as n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname <> 'hold_slot'`);
    expect(fns.rows[0]!.n).toBe("0");
  });
});
