import { ArcLine } from "./arc-line";
import { CurveDivider } from "./curve-divider";
import { SectionHeading } from "./section-heading";

interface Props {
  id: string;
  title: string;
  eyebrow?: string;
  /** Migalhas de pão (tom escuro) exibidas acima do título. */
  breadcrumbs?: React.ReactNode;
  children?: React.ReactNode;
}

/** Cabeçalho escuro das páginas internas, com arco decorativo e base curva. */
export function PageHero({ id, title, eyebrow, breadcrumbs, children }: Props) {
  return (
    <>
      <section aria-labelledby={id} className="relative overflow-hidden bg-brand-ink text-surface">
        <ArcLine className="pointer-events-none absolute -right-10 -top-10 hidden size-[18rem] rotate-180 text-brand-primary/70 md:block" />
        <div className="container-mk relative flex flex-col gap-6 pb-12 pt-6 md:pb-16 md:pt-10">
          {breadcrumbs}
          <SectionHeading as="h1" tone="dark" id={id} eyebrow={eyebrow} title={title} />
          {children}
        </div>
      </section>
      <CurveDivider from="ink" to="surface" />
    </>
  );
}
