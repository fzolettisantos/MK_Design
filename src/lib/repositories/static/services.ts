import { categories, services } from "@/content/catalog";
import type { Service, ServiceCategory, ServiceRepository } from "@/types";

/** Implementação estática (conteúdo versionado). Será substituída por banco sem mudar quem consome. */
export const staticServiceRepository: ServiceRepository & { listCategories(): Promise<ServiceCategory[]> } = {
  async list(opts) {
    const all = [...services].sort((a, b) => a.order - b.order);
    return opts?.onlyActive ? all.filter((s) => s.active) : all;
  },
  async getBySlug(slug): Promise<Service | null> {
    return services.find((s) => s.slug === slug && s.active) ?? null;
  },
  async listCategories() {
    return [...categories].sort((a, b) => a.order - b.order);
  },
};
