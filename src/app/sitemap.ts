import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { routes } from "@/config/routes";
import { serviceRepository } from "@/lib/repositories";

/**
 * Só páginas com conteúdo real. `/sobre` e `/contato` entram aqui quando saírem do "em construção"
 * (hoje têm noindex; `/privacidade` já está publicada). Sem `lastModified` inventado.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await serviceRepository.list({ onlyActive: true });
  return [
    { url: absoluteUrl(routes.home), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl(routes.services), changeFrequency: "monthly", priority: 0.9 },
    ...services.map((s) => ({ url: absoluteUrl(routes.service(s.slug)), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: absoluteUrl(routes.booking), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl(routes.privacy), changeFrequency: "yearly", priority: 0.3 },
  ];
}
