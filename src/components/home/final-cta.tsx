import Link from "next/link";
import { Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { finalCta } from "@/content/home";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="container-mk py-16 md:py-24">
      <div className="flex flex-col items-start gap-6 rounded-modal border-l-[14px] border-brand-primary bg-brand-ink p-8 text-surface md:p-12">
        <h2 id="cta-title">{finalCta.title}</h2>
        <p className="max-w-xl text-surface/85">{finalCta.text}</p>
        <Button asChild>
          <Link href={routes.booking}>{finalCta.button}</Link>
        </Button>
      </div>
    </section>
  );
}
