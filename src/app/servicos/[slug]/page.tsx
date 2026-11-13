import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { CategoryIcon } from "@/components/services/category-icon";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { WhatsAppCTA } from "@/components/shared/whatsapp-cta";
import { Alert, Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { serviceRepository } from "@/lib/repositories";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const services = await serviceRepository.list({ onlyActive: true });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = await serviceRepository.getBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.summary} Solicite seu atendimento com a MK Design.`,
    alternates: { canonical: routes.service(service.slug) },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const service = await serviceRepository.getBySlug(slug);
  if (!service) notFound();

  const [categories, all] = await Promise.all([
    serviceRepository.listCategories(),
    serviceRepository.list({ onlyActive: true }),
  ]);
  const category = categories.find((c) => c.id === service.categoryId);
  const related = all.filter((s) => s.categoryId === service.categoryId && s.id !== service.id);
  const bookingHref = `${routes.booking}?servico=${service.slug}`;

  return (
    <>
      <article className="container-mk grid gap-10 py-10 md:py-16 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <Breadcrumbs
            items={[
              { label: "Início", href: routes.home },
              { label: "Serviços", href: routes.services },
              { label: service.name },
            ]}
          />
          <header className="flex flex-col gap-4">
            <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-text-secondary">
              <CategoryIcon id={service.categoryId} className="size-5" />
              {category?.name}
            </span>
            <h1>{service.name}</h1>
            <p className="text-lg text-text-secondary">{service.description}</p>
          </header>

          <section aria-labelledby="info-title" className="flex flex-col gap-4">
            <h2 id="info-title">Tenha à mão ao solicitar</h2>
            <ul className="flex flex-col gap-3">
              {service.infoNeeded.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-primary text-brand-ink">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <Alert title="Orçamento e confirmação">
            Ao enviar sua solicitação, a equipe avalia as informações e orienta sobre o orçamento. A solicitação fica
            registrada e depende de confirmação pela MK Design.
          </Alert>
        </div>

        <aside aria-label="Solicitar este serviço" className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 rounded-modal border border-border bg-surface-muted p-6">
            <p className="font-heading text-xl font-semibold">Sob orçamento</p>
            <p className="text-sm text-text-secondary">Valores informados na confirmação do serviço.</p>
            <Button asChild>
              <Link href={bookingHref}>
                Solicitar este serviço
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppCTA message={`Olá! Gostaria de saber mais sobre: ${service.name}.`}>Tirar dúvidas</WhatsAppCTA>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="rel-title" className="bg-surface-muted py-12 md:py-16">
          <div className="container-mk flex flex-col gap-8">
            <h2 id="rel-title">Outros serviços em {category?.name}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((s) => (
                <li key={s.id}>
                  <ServiceCard service={s} categoryName={category?.name ?? ""} headingAs="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
