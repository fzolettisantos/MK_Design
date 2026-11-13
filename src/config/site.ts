/**
 * Identidade e SEO do site. Nada aqui deve ser inventado: valores desconhecidos ficam `null`
 * até o proprietário confirmar (ver docs/product/requirements.md §Pendências).
 */
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

/** URL canônica do site: variável explícita > domínio da Vercel > localhost (dev). Sem barra final. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const siteConfig = {
  name: "MK Design",
  url: siteUrl,
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",
  seo: {
    title: "MK Design | Instalação de TVs, suportes e assistência técnica",
    description:
      "Instalação de TVs em paredes, painéis e móveis, instalação de suportes e solicitação de reparos. Escolha o serviço e agende seu atendimento com a MK Design.",
  },
  logo: {
    src: "/images/logo/mk-design-logo.png",
    alt: "MK Design",
    width: 1254,
    height: 1254,
    srcTrim: "/images/logo/mk-design-logo-trim.png",
    srcOnDark: "/images/logo/mk-design-logo-trim-on-dark.png", // versão para fundos escuros
  },
} as const;
