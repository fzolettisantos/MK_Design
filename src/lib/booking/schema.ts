import { addDays, format, isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";
import type { Service } from "@/types";
import { periods } from "./options";

/** Antecedência mínima e janela máxima (dias). Provisórios: confirmar com o proprietário (requirements §7). */
export const MIN_LEAD_DAYS = 1;
export const MAX_AHEAD_DAYS = 90;

export const normalizePhone = (v: string) => v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
export const normalizeCep = (v: string) => v.replace(/\D/g, "");

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 120) => text(max).min(1, `Informe ${label}.`);

/** Datas válidas para solicitar: de amanhã até 90 dias. Fuso do cliente/servidor não altera "YYYY-MM-DD". */
export function dateBounds(now = new Date()) {
  const today = startOfDay(now);
  return {
    min: format(addDays(today, MIN_LEAD_DAYS), "yyyy-MM-dd"),
    max: format(addDays(today, MAX_AHEAD_DAYS), "yyyy-MM-dd"),
  };
}

type Conditional = {
  serviceSlug?: string; tvSize?: string; supportType?: string; hasSupport?: string; repairBrand?: string; symptoms?: string[];
};

/**
 * Campos obrigatórios que dependem do serviço escolhido. Função própria para rodar por etapa
 * (o wizard valida os "detalhes" antes de os campos das etapas seguintes estarem preenchidos).
 */
export function conditionalIssues(
  v: Conditional,
  services: Pick<Service, "slug" | "categoryId">[],
): { path: "serviceSlug" | "tvSize" | "supportType" | "hasSupport" | "repairBrand" | "symptoms"; message: string }[] {
  const service = services.find((s) => s.slug === v.serviceSlug);
  if (!service) return [{ path: "serviceSlug", message: "Serviço indisponível." }];
  const out: ReturnType<typeof conditionalIssues> = [];
  if (service.categoryId === "assistencia-tecnica") {
    if (!v.repairBrand) out.push({ path: "repairBrand", message: "Escolha a marca da TV." });
    if (!v.symptoms || v.symptoms.length === 0) out.push({ path: "symptoms", message: "Marque ao menos um problema." });
  } else {
    if (!v.tvSize) out.push({ path: "tvSize", message: "Escolha o tamanho da TV." });
    if (service.categoryId === "instalacao-suporte") {
      if (!v.supportType) out.push({ path: "supportType", message: "Escolha o tipo de suporte." });
    } else if (!v.hasSupport) out.push({ path: "hasSupport", message: "Informe se já possui o suporte." });
  }
  return out;
}

/** Schema único usado no cliente (react-hook-form) e no servidor (action). `services` define o que é obrigatório. */
export function createBookingSchema(services: Pick<Service, "slug" | "categoryId">[], now = new Date()) {
  const { min, max } = dateBounds(now);
  return z
    .object({
      serviceSlug: z.string().min(1, "Escolha um serviço."),
      // Detalhes técnicos
      tvSize: text(20).optional(),
      tvBrand: text(60).optional(),
      tvModel: text(60).optional(),
      supportType: text(30).optional(),
      hasSupport: text(40).optional(),
      wallType: text(40).optional(),
      environment: text(80).optional(),
      repairBrand: text(30).optional(),
      symptoms: z.array(text(40)).max(6).default([]),
      notes: text(500).optional(),
      // Localização
      cep: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || normalizeCep(v).length === 8, "CEP deve ter 8 números."),
      neighborhood: required("o bairro", 80),
      city: required("a cidade", 80),
      address: text(160).optional(),
      complement: text(80).optional(),
      // Data
      preferredDate: z
        .string()
        .min(1, "Escolha a data desejada.")
        .refine((v) => isValid(parseISO(v)), "Data inválida.")
        .refine((v) => v >= min, "Escolha uma data a partir de amanhã.")
        .refine((v) => v <= max, `Escolha uma data até ${MAX_AHEAD_DAYS} dias à frente.`),
      preferredPeriod: z.enum(periods.map((p) => p.value) as [string, ...string[]], {
        message: "Escolha o período.",
      }),
      // Contato
      name: required("seu nome", 100).min(2, "Informe seu nome."),
      phone: z
        .string()
        .trim()
        .min(1, "Informe seu WhatsApp.")
        .refine((v) => /^\d{10,11}$/.test(normalizePhone(v)), "Informe DDD e número, ex.: (11) 91234-5678."),
      consent: z.literal(true, { message: "Para continuar, aceite a política de privacidade." }),
    })
    .superRefine((v, ctx) => {
      for (const i of conditionalIssues(v, services)) ctx.addIssue({ code: "custom", path: [i.path], message: i.message });
    });
}

export type BookingInput = z.infer<ReturnType<typeof createBookingSchema>>;

/** Campos validados em cada etapa (índice = etapa do wizard, 0 = serviço). */
export const stepFields: (keyof BookingInput)[][] = [
  ["serviceSlug"],
  ["tvSize", "tvBrand", "tvModel", "supportType", "hasSupport", "wallType", "environment", "repairBrand", "symptoms", "notes"],
  ["cep", "neighborhood", "city", "address", "complement"],
  ["preferredDate", "preferredPeriod"],
  ["name", "phone", "consent"],
];
