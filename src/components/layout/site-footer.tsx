import Image from "next/image";
import Link from "next/link";
import { businessConfig, isDemoMode } from "@/config/business";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { serviceRepository } from "@/lib/repositories";

const linkClass = "flex min-h-11 items-center text-brand-ink/80 transition-colors hover:text-brand-ink hover:underline";

function Column({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-3 text-xl font-medium">{title}</p>
      {children}
    </div>
  );
}

/**
 * Rodapé claro e arredondado que sobe sobre a seção anterior (estilo de colunas de links).
 * Serviços vêm do repositório (só ativos).
 */
export async function SiteFooter() {
  const services = await serviceRepository.list({ onlyActive: true });
  const nav = [{ label: "Início", href: routes.home }, ...mainNav, { label: "Agendar serviço", href: routes.booking }, { label: "Privacidade", href: routes.privacy }];

  return (
    <footer className="mk-stack mx-2 bg-surface text-brand-ink shadow-[0_-8px_24px_rgb(0_0_0/0.06)] ring-1 ring-brand-ink/10">
      <div className="container-mk grid grid-cols-2 gap-x-6 gap-y-10 pb-10 pt-14 md:grid-cols-[1.1fr_1fr_1.7fr_1fr] md:pt-16">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <Image src={siteConfig.logo.srcTrim} alt="MK Design" width={951} height={862} className="h-16 w-auto self-start" />
          <p className="max-w-xs text-brand-ink/80">Instalação de TVs, suportes e assistência técnica.</p>
        </div>

        <Column title="Navegação">
          <ul>
            {nav.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className={linkClass}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Serviços" className="col-span-2 md:col-span-1">
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={routes.service(s.slug)} className={linkClass}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Pagamento">
          <ul className="text-brand-ink/80">
            {businessConfig.paymentMethods.map((m) => (
              <li key={m} className="flex min-h-11 items-center">
                {m}
              </li>
            ))}
          </ul>
        </Column>
      </div>

      <div className="border-t border-border">
        <div className="container-mk flex flex-col gap-1 py-6 text-sm text-brand-ink/75">
          <p>© {new Date().getFullYear()} MK Design. Atendimento sujeito à confirmação de disponibilidade.</p>
          {isDemoMode && (
            <p role="status">
              Modo demonstrativo: agenda e pedidos ainda não estão conectados a um banco de dados e nenhuma
              disponibilidade real é exibida.
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
