import { z } from "zod";
import { normalizePhone } from "@/lib/booking/schema";

/** Dados do cliente, validados NO SERVIDOR antes de gravar. O consentimento (LGPD) é obrigatório. */
export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(100),
  phone: z.string().trim().refine((v) => /^\d{10,11}$/.test(normalizePhone(v)), "Informe DDD e número."),
  neighborhood: z.string().trim().min(1, "Informe o bairro.").max(80),
  city: z.string().trim().min(1, "Informe a cidade.").max(80),
  cep: z.string().trim().max(9).optional(),
  tvSize: z.string().trim().max(20).optional(),
  brand: z.string().trim().max(30).optional(),
  symptoms: z.array(z.string().trim().max(40)).max(6).default([]),
  notes: z.string().trim().max(500).optional(),
  consent: z.literal(true, { message: "Aceite a política de privacidade para continuar." }),
});
export type Customer = z.infer<typeof customerSchema>;

export const kindSchema = z.enum(["instalacao", "retirada"]);

/** Converte para o formato guardado no banco. */
export function toRecord(c: Customer) {
  return {
    name: c.name,
    phone: normalizePhone(c.phone),
    location: { neighborhood: c.neighborhood, city: c.city, cep: c.cep || undefined },
    details: { tvSize: c.tvSize || undefined, brand: c.brand || undefined, symptoms: c.symptoms, notes: c.notes || undefined },
  };
}

export function detailsLine(c: Customer): string {
  return [c.tvSize && `TV ${c.tvSize}`, c.brand && `marca ${c.brand}`, c.symptoms.length > 0 && `problema: ${c.symptoms.join(", ")}`, c.notes && `obs.: ${c.notes}`]
    .filter(Boolean).join("; ") || "Sem detalhes adicionais";
}
