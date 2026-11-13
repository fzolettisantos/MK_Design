"use server";

import { bookingWhatsAppText } from "@/lib/booking/format";
import { createBookingSchema, normalizeCep, normalizePhone, type BookingInput } from "@/lib/booking/schema";
import { bookingRepository, serviceRepository } from "@/lib/repositories";
import { buildWhatsAppUrl } from "@/config/whatsapp";
import { isDemoMode } from "@/config/business";

export type SubmitResult =
  | { ok: true; protocol: string; message: string; whatsappUrl: string | null; demo: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Valida NO SERVIDOR (fonte da verdade), grava o pedido e só então devolve o link do WhatsApp.
 * Nunca confia no que o cliente validou. Sem logs de dados pessoais.
 */
export async function submitBooking(raw: unknown): Promise<SubmitResult> {
  const services = await serviceRepository.list({ onlyActive: true });
  const parsed = createBookingSchema(services).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false, error: "Revise os campos destacados e tente novamente.", fieldErrors };
  }
  const v: BookingInput = parsed.data;
  const service = services.find((s) => s.slug === v.serviceSlug);
  if (!service) return { ok: false, error: "Este serviço não está disponível no momento." };

  try {
    const booking = await bookingRepository.create({
      serviceId: service.id,
      technicalDetails: {
        tvSize: v.tvSize, tvBrand: v.tvBrand, tvModel: v.tvModel, supportType: v.supportType,
        hasSupport: v.hasSupport, wallType: v.wallType, environment: v.environment,
        repairBrand: v.repairBrand, symptoms: v.symptoms, notes: v.notes, preferredPeriod: v.preferredPeriod,
      },
      customerName: v.name,
      customerPhone: normalizePhone(v.phone),
      location: {
        cep: v.cep ? normalizeCep(v.cep) : undefined,
        neighborhood: v.neighborhood, city: v.city, address: v.address, complement: v.complement,
      },
      // Preferência (não é reserva): início do dia no fuso de Brasília; o horário é combinado na confirmação.
      requestedStartAt: `${v.preferredDate}T00:00:00-03:00`,
      durationMinutes: service.durationMinutes ?? 0,
      privacyConsentAt: new Date().toISOString(),
    });
    const message = bookingWhatsAppText(v, service, booking.protocol);
    return { ok: true, protocol: booking.protocol, message, whatsappUrl: buildWhatsAppUrl(message), demo: isDemoMode };
  } catch {
    return { ok: false, error: "Não conseguimos registrar sua solicitação agora. Tente novamente em instantes." };
  }
}
