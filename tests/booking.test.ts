import { describe, expect, it } from "vitest";
import { services } from "@/content/catalog";
import { bookingWhatsAppText, detailsSummary } from "@/lib/booking/format";
import { conditionalIssues, createBookingSchema, dateBounds, normalizePhone } from "@/lib/booking/schema";
import { generateProtocol, memoryBookingRepository } from "@/lib/repositories/memory/bookings";
import { buildWhatsAppUrl } from "@/config/whatsapp";

const NOW = new Date("2026-11-13T12:00:00-03:00");
const schema = createBookingSchema(services.filter((s) => s.active), NOW);
const { min } = dateBounds(NOW);
const base = {
  serviceSlug: "instalacao-de-tv-na-parede",
  tvSize: '55"',
  hasSupport: "Já tenho o suporte",
  symptoms: [],
  neighborhood: "Centro",
  city: "São Paulo",
  preferredDate: min,
  preferredPeriod: "manha",
  name: "Maria Silva",
  phone: "(11) 91234-5678",
  consent: true as const,
};

describe("validação do agendamento", () => {
  it("aceita pedido de instalação válido", () => {
    expect(schema.safeParse(base).success).toBe(true);
  });
  it("antecedência: hoje e passado são recusados; amanhã passa", () => {
    expect(min).toBe("2026-11-14");
    expect(schema.safeParse({ ...base, preferredDate: "2026-11-13" }).success).toBe(false);
    expect(schema.safeParse({ ...base, preferredDate: "2026-01-01" }).success).toBe(false);
    expect(schema.safeParse({ ...base, preferredDate: "2027-12-01" }).success).toBe(false);
  });
  it("assistência exige marca e ao menos um problema", () => {
    const r = schema.safeParse({ ...base, serviceSlug: "solicitar-conserto-de-tv", tvSize: undefined, hasSupport: undefined });
    expect(r.success).toBe(false);
    const ok = schema.safeParse({ ...base, serviceSlug: "solicitar-conserto-de-tv", repairBrand: "LG", symptoms: ["Não liga"] });
    expect(ok.success).toBe(true);
  });
  it("suporte exige o tipo de suporte", () => {
    expect(schema.safeParse({ ...base, serviceSlug: "instalacao-de-suporte-fixo" }).success).toBe(false);
    expect(schema.safeParse({ ...base, serviceSlug: "instalacao-de-suporte-fixo", supportType: "Fixo" }).success).toBe(true);
  });
  it("recusa serviço inativo/inexistente, telefone inválido e falta de consentimento", () => {
    expect(schema.safeParse({ ...base, serviceSlug: "ajuste-e-reinstalacao-de-tv" }).success).toBe(false);
    expect(schema.safeParse({ ...base, phone: "123" }).success).toBe(false);
    expect(schema.safeParse({ ...base, consent: false }).success).toBe(false);
  });
  it("normaliza telefone", () => {
    expect(normalizePhone("+55 (11) 91234-5678")).toBe("11912345678");
  });
});

describe("validação por etapa", () => {
  const active = services.filter((s) => s.active);
  it("detalhes obrigatórios são checados mesmo com contato e data vazios", () => {
    expect(conditionalIssues({ serviceSlug: "solicitar-conserto-de-tv", symptoms: [] }, active).map((i) => i.path)).toEqual(["repairBrand", "symptoms"]);
    expect(conditionalIssues({ serviceSlug: "instalacao-de-tv-na-parede" }, active).map((i) => i.path)).toEqual(["tvSize", "hasSupport"]);
    expect(conditionalIssues({ serviceSlug: "instalacao-de-suporte-fixo", tvSize: '55"' }, active).map((i) => i.path)).toEqual(["supportType"]);
    expect(conditionalIssues({ serviceSlug: "x" }, active)[0]?.path).toBe("serviceSlug");
  });
});

describe("protocolo, repositório e WhatsApp", () => {
  it("protocolo tem formato MK-AAMMDD-XXXXX", () => {
    expect(generateProtocol(NOW)).toMatch(/^MK-261113-[2-9A-HJ-NP-Z]{5}$/);
  });
  it("cria pedido aguardando confirmação e busca por protocolo", async () => {
    const b = await memoryBookingRepository.create({
      serviceId: "tv-parede", technicalDetails: {}, customerName: "Maria", customerPhone: "11912345678",
      location: { neighborhood: "Centro", city: "SP" }, requestedStartAt: "2026-11-14T00:00:00-03:00",
      durationMinutes: 0, privacyConsentAt: new Date().toISOString(),
    });
    expect(b.status).toBe("aguardando_confirmacao");
    expect((await memoryBookingRepository.getByProtocol(b.protocol))?.id).toBe(b.id);
  });
  it("mensagem segue o modelo do guia e URL só existe com número real", () => {
    const parsed = schema.parse(base);
    const msg = bookingWhatsAppText(parsed, { name: "Instalação de TV na parede" }, "MK-261113-ABCDE");
    expect(msg).toContain("Protocolo: MK-261113-ABCDE");
    expect(msg).toContain("Data desejada: 14/11/2026");
    expect(msg).toContain("Podem confirmar a disponibilidade e orientar sobre o orçamento?");
    expect(detailsSummary(parsed)).toContain('TV 55"');
    expect(buildWhatsAppUrl(msg, null)).toBeNull();
    expect(buildWhatsAppUrl(msg, "5511912345678")).toMatch(/^https:\/\/wa\.me\/5511912345678\?text=/);
  });
});
