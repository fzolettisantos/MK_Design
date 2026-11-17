import { addDays, addHours, format, startOfDay } from "date-fns";

/**
 * Regras do protótipo (decididas com o proprietário em nov/2026): atendimento 24h, todos os dias, sem pausa;
 * blocos de 1h; antecedência mínima de 1 dia; até 30 dias à frente. Ocupação = DADOS DE EXEMPLO (determinísticos).
 * No sistema real, a ocupação vem do banco e o deslocamento é calculado pelo endereço dos atendimentos.
 */
export const SLOT_MINUTES = 60;
export const MIN_LEAD_HOURS = 24;
export const MAX_DAYS_AHEAD = 30;
export const HOLD_SECONDS = 10 * 60;

export type SlotState = "livre" | "ocupado" | "deslocamento" | "passado";
export interface Slot {
  hour: number;
  state: SlotState;
}
export interface Day {
  key: string; // yyyy-MM-dd
  date: Date;
  slots: Slot[];
  free: number;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

export const PERIODS = [
  { id: "madrugada", label: "Madrugada", from: 0, to: 6 },
  { id: "manha", label: "Manhã", from: 6, to: 12 },
  { id: "tarde", label: "Tarde", from: 12, to: 18 },
  { id: "noite", label: "Noite", from: 18, to: 24 },
] as const;

export function buildDays(now: Date): Day[] {
  const earliest = addHours(now, MIN_LEAD_HOURS);
  const today = startOfDay(now);
  return Array.from({ length: MAX_DAYS_AHEAD + 1 }, (_, d) => {
    const date = addDays(today, d);
    const key = format(date, "yyyy-MM-dd");
    // Exemplo: mais movimento entre 8h e 20h; deslocamento bloqueia a hora seguinte a um atendimento.
    const busy = Array.from({ length: 24 }, (_, h) => hash(`${key}-${h}`) < (h >= 8 && h < 20 ? 0.32 : 0.06));
    const slots: Slot[] = busy.map((b, hour) => {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
      let state: SlotState = "livre";
      if (start < earliest) state = "passado";
      else if (b) state = "ocupado";
      else if (hour > 0 && busy[hour - 1]) state = "deslocamento";
      return { hour, state };
    });
    return { key, date, slots, free: slots.filter((s) => s.state === "livre").length };
  }).filter((d) => d.slots.some((s) => s.state !== "passado"));
}

export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;
