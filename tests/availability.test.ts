import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { checkSlot, defaultSettings, generateAvailability, localKey, type Busy } from "@/lib/booking/availability";

const NOW = new Date("2026-11-17T12:00:00-03:00");
const iso = (s: string) => new Date(s);

describe("motor de disponibilidade", () => {
  it("sem reservas: respeita antecedência de 24h e janela de 30 dias", () => {
    const days = generateAvailability(NOW, []);
    expect(days[0]!.key).toBe("2026-11-18");
    expect(days[0]!.slots[0]!.hour).toBe(12); // 18/11 12:00 = exatamente 24h
    expect(days[0]!.slots).toHaveLength(12);
    expect(days.at(-1)!.key).toBe("2026-12-17");
    expect(days.at(-1)!.slots.at(-1)!.hour).toBe(12); // 17/12 12:00 = limite de 30 dias
    expect(days.every((d) => d.slots.every((s) => s.state === "livre"))).toBe(true);
    expect(days.slice(1, -1).every((d) => d.slots.length === 24)).toBe(true); // 24h por dia
  });

  it("uma reserva às 14:00 bloqueia 13h, 14h e 15h (deslocamento de 30 min) e libera 12h e 16h", () => {
    const busy: Busy[] = [{ start: iso("2026-11-19T14:00:00-03:00"), coreEnd: iso("2026-11-19T15:00:00-03:00"), end: iso("2026-11-19T15:30:00-03:00") }];
    const day = generateAvailability(NOW, busy).find((d) => d.key === "2026-11-19")!;
    const st = (h: number) => day.slots.find((s) => s.hour === h)!.state;
    expect([st(12), st(13), st(14), st(15), st(16)]).toEqual(["livre", "deslocamento", "ocupado", "deslocamento", "livre"]);
  });

  it("checkSlot espelha as regras do banco", () => {
    expect(checkSlot(iso("2026-11-18T11:00:00-03:00"), NOW)).toBe("antecedencia");
    expect(checkSlot(iso("2026-11-18T12:00:00-03:00"), NOW)).toBeNull();
    expect(checkSlot(iso("2026-12-17T13:00:00-03:00"), NOW)).toBe("fora_da_janela");
    expect(checkSlot(iso("2026-11-19T14:30:00-03:00"), NOW)).toBe("fora_da_grade");
  });

  it("localKey usa o dia de Brasília", () => {
    expect(localKey(iso("2026-11-18T01:30:00Z"))).toBe("2026-11-17");
    expect(defaultSettings.slotMinutes).toBe(60);
  });
});

describe("paridade com o banco: o que o motor mostra como livre o banco aceita, e o resto ele recusa", () => {
  it("amostra de reservas e todos os horários de um dia", async () => {
    const db = new PGlite();
    await db.exec(readFileSync("supabase/migrations/0001_agendamento.sql", "utf8"));
    for (const [h, tok] of [[9, "a"], [14, "b"], [15 + 2, "c"]] as const) {
      const r = await db.query<{ r: { ok: boolean } }>(`select public.hold_slot($1,'s','instalacao',$2,$3) as r`, [
        new Date(`2026-11-19T${String(h).padStart(2, "0")}:00:00-03:00`).toISOString(), tok, NOW.toISOString(),
      ]);
      expect(r.rows[0]!.r.ok).toBe(true);
    }
    const q = await db.query<{ start_at: string; core_end_at: string; end_at: string }>(
      `select * from public.get_busy($1,$2,$3)`, ["2026-11-19T03:00:00Z", "2026-11-20T03:00:00Z", NOW.toISOString()]);
    const busy: Busy[] = q.rows.map((r) => ({ start: new Date(r.start_at), coreEnd: new Date(r.core_end_at), end: new Date(r.end_at) }));
    const day = generateAvailability(NOW, busy).find((d) => d.key === "2026-11-19")!;
    for (const slot of day.slots) {
      const r = await db.query<{ r: { ok: boolean; reason?: string } }>(`select public.hold_slot($1,'s','instalacao','t',$2) as r`, [slot.start, NOW.toISOString()]);
      const accepted = r.rows[0]!.r.ok;
      expect(accepted, `hora ${slot.hour} (${slot.state})`).toBe(slot.state === "livre");
      if (accepted) await db.query(`delete from bookings where hold_token='t'`);
    }
  }, 60_000);
});
