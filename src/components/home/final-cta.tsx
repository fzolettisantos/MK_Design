import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta } from "@/content/home";

/** Fecha a página com o mesmo bloco lime do hero (texto sempre em brand-ink). */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="mk-stack bg-brand-primary py-20 text-brand-ink md:py-28">
      <div className="container-mk flex flex-col items-center gap-6 text-center">
        <SectionHeading
          align="center"
          id="cta-title"
          title={finalCta.title}
          emphasis={finalCta.emphasis}
          className="max-w-3xl [&_h2]:text-[clamp(2rem,1.2rem+3.6vw,4rem)] [&_h2]:leading-[1.05]"
        />
        <p className="max-w-xl text-lg text-brand-ink/85">{finalCta.text}</p>
        <Button asChild variant="dark">
          <Link href={routes.booking}>
            {finalCta.button}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
