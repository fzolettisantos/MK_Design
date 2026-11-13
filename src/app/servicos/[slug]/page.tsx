import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PageBody, PageHero } from "@/components/shared/page-hero";
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
      <PageHero
        id="servico-title"
        image={service.heroImage}
        title={service.name}
        eyebrow={category?.name}
        breadcrumbs={
          <Breadcrumbs
            tone="dark"
            items={[
              { label: "Início", href: routes.home },
              { label: "Serviços", href: routes.services },
              { label: service.name },
            ]}
          />
        }
      >
        <p className="max-w-2xl text-lg text-surface/85">{service.description}</p>
      </PageHero>

      <PageBody>
      <div className="container-mk grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
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
          <div className="flex flex-col gap-4 rounded-modal bg-brand-ink p-7 text-surface">
            <p className="font-heading text-2xl font-semibold text-brand-primary">Sob orçamento</p>
            <p className="text-sm text-surface/80">Valores informados na confirmação do serviço.</p>
            <Button asChild>
              <Link href={bookingHref}>
                Solicitar este serviço
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppCTA variant="outlineLight" message={`Olá! Gostaria de saber mais sobre: ${service.name}.`}>
              Tirar dúvidas
            </WhatsAppCTA>
          </div>
        </aside>
      </div>
      </PageBody>

      {related.length > 0 && (
        <section aria-labelledby="rel-title" className="mk-stack bg-surface-muted pb-16 pt-16 md:pb-24">
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
