import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

/** Provisória: fora do índice e do sitemap até ter conteúdo real. */
export const metadata: Metadata = { title: "Política de privacidade", robots: { index: false, follow: true } };

export default function Page() {
  return <ComingSoon title="Política de privacidade" />;
}
