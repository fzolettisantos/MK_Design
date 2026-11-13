import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

/** Provisória: fora do índice e do sitemap até ter conteúdo real. */
export const metadata: Metadata = { title: "Sobre a MK Design", robots: { index: false, follow: true } };

export default function Page() {
  return <ComingSoon title="Sobre a MK Design" />;
}
