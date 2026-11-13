import Image from "next/image";
import Link from "next/link";
import { isDemoMode } from "@/config/business";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { faq } from "@/content/home";
import { serviceRepository } from "@/lib/repositories";

const linkClass =
  "flex min-h-11 items-center text-[0.95rem] text-brand-ink/80 transition-colors hover:text-brand-ink hover:underline";

function Column({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 text-xl">{title}</p>
      {children}
    </div>
  );
}

/** Cartões de informação — textos literais das respostas do FAQ (guia), sem dados inventados. */
function infoCards(): { title: string; text: string }[] {
  const pick = (needle: string): string => (faq.items.find((i) => i.q.includes(needle))?.a ?? "").replace(/^Sim\.\s*/, "");
  return [
    { title: "Agendamento", text: pick("agendar pelo site") },
    { title: "Orçamento", text: pick("orçamento?") },
    { title: "Pagamento", text: pick("formas de pagamento") },
  ].filter((c) => c.text !== "");
}

/**
 * Rodapé: cartão claro de cantos arredondados emoldurado pelo fundo escuro. Colunas de links
 * (serviços vêm do repositório, só ativos), cartões de informação, divisória e barra legal.
 */
export async function SiteFooter() {
  const services = await serviceRepository.list({ onlyActive: true });
  const nav = [
    { label: "Início", href: routes.home },
    ...mainNav,
    { label: "Agendar serviço", href: routes.booking },
    { label: "Privacidade", href: routes.privacy },
  ];

  return (
    <footer className="relative bg-brand-ink p-2 md:p-5">
      <div className="rounded-[1.5rem] bg-surface text-brand-ink">
        <div className="container-mk pb-10 pt-12 md:pb-14 md:pt-16">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <Column title="Navegação">
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {nav.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className={linkClass}>
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
            <Column title="Serviços">
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link href={routes.service(s.slug)} className={linkClass}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Column>
          </div>

          <div className="mt-14 grid items-start gap-8 md:mt-16 md:grid-cols-[auto_1fr] md:gap-12">
            <div className="flex flex-col gap-3">
              <Image src={siteConfig.logo.srcTrim} alt="MK Design" width={951} height={862} className="h-16 w-auto self-start" />
              <p className="max-w-[14rem] text-[0.95rem] text-brand-ink/80">
                Instalação de TVs, suportes e assistência técnica.
              </p>
            </div>
            <ul className="grid gap-3 md:grid-cols-3">
              {infoCards().map((c) => (
                <li key={c.title} className="flex flex-col gap-3 rounded-[1.25rem] bg-surface-muted p-5">
                  <p className="text-xl">{c.title}</p>
                  <p className="text-[0.95rem] font-medium leading-snug">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <hr className="mt-12 border-brand-ink" />

          <div className="mt-6 flex flex-col gap-4 text-sm md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <p>© {new Date().getFullYear()} MK Design.</p>
              <p className="text-brand-ink/80">Atendimento sujeito à confirmação de disponibilidade.</p>
              {isDemoMode && (
                <p role="status" className="max-w-xl text-brand-ink/80">
                  Modo demonstrativo: agenda e pedidos ainda não estão conectados a um banco de dados e nenhuma
                  disponibilidade real é exibida.
                </p>
              )}
            </div>
            <ul className="flex flex-wrap gap-x-6">
              <li>
                <Link href={routes.privacy} className="flex min-h-11 items-center underline underline-offset-4 hover:text-brand-ink/70">
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
