import { absoluteUrl, siteConfig } from "@/config/site";

/** Serializa JSON-LD escapando `<` (evita fechar a tag <script> por dados). */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/**
 * Só dados confirmados (nome, site, logo). Sem telefone, endereço, área atendida, avaliações ou preços:
 * `LocalBusiness` só após o proprietário confirmar esses dados (style guide §10).
 */
export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: siteConfig.name,
  url: absoluteUrl("/"),
  logo: absoluteUrl(siteConfig.logo.src),
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: siteConfig.name,
  url: absoluteUrl("/"),
  inLanguage: "pt-BR",
  publisher: { "@id": absoluteUrl("/#organization") },
};

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});

export const faqLd = (items: readonly { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

export const serviceLd = (s: { name: string; description: string; category: string; path: string }) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: s.name,
  description: s.description,
  serviceType: s.category,
  url: absoluteUrl(s.path),
  provider: { "@id": absoluteUrl("/#organization") },
});
