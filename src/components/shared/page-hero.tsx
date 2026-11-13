import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { StickyUnder } from "./sticky-under";

interface Props {
  id: string;
  title: string;
  eyebrow?: string;
  emphasis?: string;
  /** Foto de fundo opcional (recebe camada preta semitransparente). */
  image?: string;
  /** Migalhas de pão (tom escuro) exibidas acima do título. */
  breadcrumbs?: React.ReactNode;
  children?: React.ReactNode;
}

/** Cabeçalho escuro das páginas internas; a próxima seção (`PageBody`) a sobrepõe com topo arredondado. */
export function PageHero({ id, title, eyebrow, emphasis, image, breadcrumbs, children }: Props) {
  return (
    <StickyUnder>
    <section aria-labelledby={id} className="relative overflow-hidden bg-brand-ink pb-16 pt-[6.5rem] text-surface md:pb-24 md:pt-32">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" aria-hidden="true" className="object-cover object-[50%_40%]" />
          <div aria-hidden="true" className="absolute inset-0 bg-brand-ink/70" />
        </>
      )}
      <div className="container-mk relative flex flex-col gap-6">
        {breadcrumbs}
        <SectionHeading as="h1" tone="dark" id={id} eyebrow={eyebrow} title={title} emphasis={emphasis} />
        {children}
      </div>
    </section>
    </StickyUnder>
  );
}

/** Corpo claro que sobe sobre o PageHero. */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mk-stack bg-surface pb-16 pt-12 md:pb-24 md:pt-16 ${className ?? ""}`}>{children}</div>;
}
