import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";
import { colors } from "@/design-system/tokens";
import { JsonLd, organizationLd, websiteLd } from "@/lib/seo/json-ld";

/** Fonte única (Outfit variável, só latin: cobre o português). Local = sem requisição externa, com preload e fallback ajustado (sem CLS). */
const outfit = localFont({
  src: "./fonts/outfit-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-outfit",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.seo.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.seo.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: { siteName: siteConfig.name, locale: "pt_BR", type: "website", url: "/", title: siteConfig.seo.title, description: siteConfig.seo.description },
  twitter: { card: "summary_large_image", title: siteConfig.seo.title, description: siteConfig.seo.description },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = { themeColor: colors.brandInk, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#conteudo"
          className="sr-only-focusable fixed left-4 top-4 z-50 rounded-button bg-brand-ink px-4 py-3 text-surface"
        >
          Pular para o conteúdo
        </a>
        <JsonLd data={[organizationLd, websiteLd]} />
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
