import { absoluteUrl } from "@/config/site";
import { fmtSlotLong } from "@/lib/booking/slot-format";
import type { TechBooking } from "./service";

/** Textos que o técnico envia ao cliente pelo WhatsApp. Sem promessas de preço, garantia ou prazo. */
const first = (b: TechBooking) => b.name.split(" ")[0] || "tudo bem";
const when = (b: TechBooking) => (b.startIso ? fmtSlotLong(b.startIso) : "");

export const confirmMessage = (b: TechBooking, service: string) =>
  `Olá, ${first(b)}! Seu horário está CONFIRMADO: ${service}, ${when(b)}. Qualquer imprevisto, é só avisar por aqui. (Protocolo ${b.protocol})`;

export const refuseMessage = (b: TechBooking) =>
  `Olá, ${first(b)}! Infelizmente não consigo atender ${when(b)}. Posso sugerir outro horário? Responda com o que for melhor para você. (Protocolo ${b.protocol})`;

/** Cancelamento: com `token`, leva o link para o cliente escolher outro dia e horário. */
export const cancelMessage = (b: TechBooking, service: string, token?: string) =>
  `Olá, ${first(b)}! Preciso cancelar o atendimento de ${service} marcado para ${when(b)}. Peço desculpas pelo imprevisto. ` +
  (token
    ? `Escolha outro dia e horário por este link: ${absoluteUrl(`/agendamento/convite/${token}`)} (link individual, válido por 48 horas). `
    : "Posso sugerir outro horário? ") +
  `(Protocolo ${b.protocol})`;

export const inviteMessage = (b: TechBooking, token: string) =>
  `Olá, ${first(b)}! Analisei o que você enviou e preciso retirar a TV para avaliar melhor. Escolha o melhor dia e horário por este link: ${absoluteUrl(`/agendamento/convite/${token}`)} (link individual, válido por 48 horas). (Protocolo ${b.protocol})`;
