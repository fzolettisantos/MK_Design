import Link from "next/link";
import { Button } from "@/components/ui";
import { SectionHeading } from "./section-heading";
import { routes } from "@/config/routes";

/** Página provisória enquanto a rota não é construída. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="container-mk flex min-h-[50dvh] flex-col items-start justify-center gap-6 py-16">
      <SectionHeading as="h1" eyebrow="EM CONSTRUÇÃO" title={title} />
      <p className="max-w-xl text-text-secondary">Esta página será publicada em breve.</p>
      <Button asChild variant="outline">
        <Link href={routes.home}>Voltar ao início</Link>
      </Button>
    </section>
  );
}
