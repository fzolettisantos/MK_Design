import type { Busy } from "@/lib/booking/availability";

/** Ocupação de EXEMPLO (determinística) para o modo demonstrativo, quando não há banco de dados. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

export function demoBusy(now: Date, days = 33): Busy[] {
  const out: Busy[] = [];
  const base = new Date(now.getTime() - 3 * 3_600_000);
  const [y, m, d] = [base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()];
  for (let i = 0; i < days; i++) {
    for (let h = 0; h < 24; h++) {
      const key = `${y}-${m}-${d + i}-${h}`;
      if (hash(key) < (h >= 8 && h < 20 ? 0.18 : 0.04)) {
        const start = new Date(Date.UTC(y, m, d + i, h + 3));
        out.push({ start, coreEnd: new Date(start.getTime() + 3_600_000), end: new Date(start.getTime() + 5_400_000) });
      }
    }
  }
  return out;
}
