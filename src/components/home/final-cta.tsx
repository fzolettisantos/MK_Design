import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArcLine } from "@/components/shared/arc-line";
import { CurveDivider } from "@/components/shared/curve-divider";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta } from "@/content/home";

export function FinalCta() {
  return (
    <>
      <CurveDivider from="muted" to="ink" flip />
      <section aria-labelledby="cta-title" className="relative overflow-hidden bg-brand-ink pb-16 text-surface md:pb-24">
        <div aria-hidden="true" className="absolute -bottom-40 -right-32 hidden size-[34rem] rounded-full bg-brand-primary lg:block" />
        <ArcLine className="pointer-events-none absolute -right-16 -top-10 hidden size-[24rem] rotate-180 text-brand-primary/60 md:block" />
        <div className="container-mk relative flex flex-col items-start gap-6">
          <h2 id="cta-title" className="max-w-xl">
            Vamos resolver o que <span className="text-brand-primary">você precisa</span>?
          </h2>
          <p className="max-w-xl text-lg text-surface/85">{finalCta.text}</p>
          <Button asChild>
            <Link href={routes.booking}>
              {finalCta.button}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
