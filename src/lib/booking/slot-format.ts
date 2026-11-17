/** Formatação de dias/horários SEMPRE no fuso de Brasília, independente do fuso do navegador ou do servidor. */
const TZ = "America/Sao_Paulo";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function fmtSlotLong(startIso: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(startIso)).map((x) => [x.type, x.value]),
  );
  return `${cap(p.weekday ?? "")}, ${p.day}/${p.month} às ${p.hour}:${p.minute}`;
}

export function fmtSlotParts(startIso: string) {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, ...o }).format(new Date(startIso));
  return { date: f({ day: "2-digit", month: "2-digit", year: "numeric" }), time: f({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) };
}

/** Chip de dia a partir de "yyyy-MM-dd" (sem depender do fuso local). */
export function fmtDayChip(key: string) {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...o }).format(dt).replace(".", "");
  return { wk: f({ weekday: "short" }), dd: f({ day: "2-digit" }), mon: f({ month: "short" }), long: f({ weekday: "long", day: "numeric", month: "long" }) };
}
