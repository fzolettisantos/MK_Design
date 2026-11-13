import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Contato" };

export default function Page() {
  return <ComingSoon title="Contato" />;
}
