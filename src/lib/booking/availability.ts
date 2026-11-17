/**
 * Motor de disponibilidade (puro, sem banco): transforma "intervalos ocupados" em horários livres por dia.
 * Espelha as regras do banco (supabase/migrations/0001_agendamento.sql). O banco é a fonte da verdade: este
 * cálculo só decide o que MOSTRAR; quem impede a reserva dupla é a restrição de exclusão.
 *
 * Fuso: America/Sao_Paulo = UTC-3 fixo (o Brasil não tem horário de verão desde 2019).
 */
export interface SchedulingSettings {
  slotMinutes: number;
  travelBufferMinutes: number;
  leadHours: number;
  horizonDays: number;
  holdMinutes: number;
  confirmHours: number;
  inviteHours: number;
}

export const defaultSettings: SchedulingSettings = {
  slotMinutes: 60,
  travelBufferMinutes: 30, // provisório: valor fixo; trocar por cálculo de distância no futuro
  leadHours: 24,
  horizonDays: 30,
  holdMinutes: 10,
  confirmHours: 12,
  inviteHours: 48,
};

export interface Busy {
  start: Date;
  coreEnd: Date; // fim do atendimento
  end: Date; // fim do bloqueio (atendimento + deslocamento)
}

export type SlotState = "livre" | "ocupado" | "deslocamento";
export interface Slot {
  start: string; // ISO UTC
  hour: number; // hora local (0–23)
  state: SlotState;
}
export interface DayAvailability {
  key: string; // yyyy-MM-dd (Brasília)
  slots: Slot[];
  free: number;
}

const OFFSET_H = 3;
const MIN = 60_000;

/** Data local (Brasília) -> yyyy-MM-dd. */
export const localKey = (d: Date) => new Date(d.getTime() - OFFSET_H * 3_600_000).toISOString().slice(0, 10);

export function generateAvailability(now: Date, busy: Busy[], s: SchedulingSettings = defaultSettings): DayAvailability[] {
  const earliest = now.getTime() + s.leadHours * 3_600_000;
  const latest = now.getTime() + s.horizonDays * 24 * 3_600_000;
  const slotMs = s.slotMinutes * MIN;
  const blockMs = (s.slotMinutes + s.travelBufferMinutes) * MIN;
  const [y, m, d] = localKey(now).split("-").map(Number) as [number, number, number];
  const days: DayAvailability[] = [];

  for (let i = 0; i <= s.horizonDays; i++) {
    const dayStartUtc = Date.UTC(y, m - 1, d + i, OFFSET_H); // 00:00 local
    const slots: Slot[] = [];
    for (let t = dayStartUtc; t < dayStartUtc + 24 * 3_600_000; t += slotMs) {
      if (t < earliest || t > latest) continue;
      const end = t + blockMs;
      let state: SlotState = "livre";
      for (const b of busy) {
        if (end <= b.start.getTime() || t >= b.end.getTime()) continue; // sem sobreposição
        state = t < b.coreEnd.getTime() && t + slotMs > b.start.getTime() ? "ocupado" : state === "ocupado" ? "ocupado" : "deslocamento";
      }
      slots.push({ start: new Date(t).toISOString(), hour: Math.floor((t - dayStartUtc) / 3_600_000), state });
    }
    if (slots.length) days.push({ key: localKey(new Date(dayStartUtc)), slots, free: slots.filter((x) => x.state === "livre").length });
  }
  return days;
}

/** Mesma regra do banco para um horário isolado (usada pelo servidor antes de tentar reservar). */
export function checkSlot(start: Date, now: Date, s: SchedulingSettings = defaultSettings): "fora_da_grade" | "antecedencia" | "fora_da_janela" | null {
  if (Math.floor(start.getTime() / 1000) % (s.slotMinutes * 60) !== 0) return "fora_da_grade";
  if (start.getTime() < now.getTime() + s.leadHours * 3_600_000) return "antecedencia";
  if (start.getTime() > now.getTime() + s.horizonDays * 24 * 3_600_000) return "fora_da_janela";
  return null;
}
