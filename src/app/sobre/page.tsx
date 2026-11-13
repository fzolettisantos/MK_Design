import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Sobre a MK Design" };

export default function Page() {
  return <ComingSoon title="Sobre a MK Design" />;
}
