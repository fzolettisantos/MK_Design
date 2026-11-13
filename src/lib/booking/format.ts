import { format, parseISO } from "date-fns";
import { buildWhatsAppMessage } from "@/config/whatsapp";
import type { Service } from "@/types";
import { periods } from "./options";
import type { BookingInput } from "./schema";

export const periodLabel = (v: string) => periods.find((p) => p.value === v)?.label ?? v;
export const formatDateBR = (iso: string) => format(parseISO(iso), "dd/MM/yyyy");

export function formatPhoneBR(digits: string) {
  const d = digits.replace(/\D/g, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : digits;
}

/** Resumo curto dos detalhes técnicos, para a revisão e para a mensagem do WhatsApp. */
export function detailsSummary(v: BookingInput): string {
  const parts = [
    v.tvSize && `TV ${v.tvSize}`,
    v.tvBrand && `marca ${v.tvBrand}`,
    v.tvModel && `modelo ${v.tvModel}`,
    v.supportType && `suporte ${v.supportType.toLowerCase()}`,
    v.hasSupport,
    v.wallType && `parede: ${v.wallType}`,
    v.environment && `ambiente: ${v.environment}`,
    v.repairBrand && `marca ${v.repairBrand}`,
    v.symptoms.length > 0 && `problema: ${v.symptoms.join(", ")}`,
    v.notes && `obs.: ${v.notes}`,
  ].filter(Boolean);
  return parts.join("; ") || "Sem detalhes adicionais";
}

export function bookingWhatsAppText(v: BookingInput, service: Pick<Service, "name">, protocol: string) {
  return buildWhatsAppMessage({
    protocolo: protocol,
    servico: service.name,
    detalhes: detailsSummary(v),
    localidade: `${v.neighborhood}/${v.city}`,
    data: formatDateBR(v.preferredDate),
    hora: periodLabel(v.preferredPeriod),
    nome: v.name,
  });
}
