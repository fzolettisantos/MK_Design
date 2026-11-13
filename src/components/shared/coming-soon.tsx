import Link from "next/link";
import { Button } from "@/components/ui";
import { PageBody, PageHero } from "./page-hero";
import { routes } from "@/config/routes";

/** Página provisória enquanto a rota não é construída. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHero id="pagina-title" eyebrow="EM CONSTRUÇÃO" title={title} />
      <PageBody>
      <div className="container-mk flex flex-col items-start gap-6">
        <p className="max-w-xl text-lg text-text-secondary">Esta página será publicada em breve.</p>
        <Button asChild variant="dark">
          <Link href={routes.home}>Voltar ao início</Link>
        </Button>
      </div>
      </PageBody>
    </>
  );
}
