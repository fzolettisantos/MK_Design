import { describe, expect, it } from "vitest";
import { categories, services } from "@/content/catalog";
import { serviceRepository } from "@/lib/repositories";

describe("catálogo", () => {
  it("slugs e ids são únicos", () => {
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length);
    expect(new Set(services.map((s) => s.id)).size).toBe(services.length);
  });
  it("toda categoria referenciada existe", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const s of services) expect(ids.has(s.categoryId)).toBe(true);
  });
  it("nenhum preço ou duração inventados", () => {
    for (const s of services) {
      expect(s.priceMode).toBe("sob_orcamento");
      expect(s.durationMinutes).toBeNull();
      expect(`${s.summary} ${s.description}`).not.toMatch(/R\$|grátis|gratuit|garantia|autorizad/i);
    }
  });
  it("serviço a confirmar com o dono não é exibido", async () => {
    const active = await serviceRepository.list({ onlyActive: true });
    expect(active.some((s) => s.id === "tv-ajuste")).toBe(false);
    expect(await serviceRepository.getBySlug("ajuste-e-reinstalacao-de-tv")).toBeNull();
  });
  it("busca por slug ativo", async () => {
    expect((await serviceRepository.getBySlug("instalacao-de-suporte-fixo"))?.name).toBe("Suporte fixo");
  });
});
