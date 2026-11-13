import Link from "next/link";
import { businessConfig } from "@/config/business";
import { mainNav, routes } from "@/config/routes";

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-surface">
      <div className="h-1 bg-brand-primary" aria-hidden="true" />
      <div className="container-mk grid gap-10 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-2xl font-bold">
            MK <span className="text-brand-primary">DESIGN</span>
          </p>
          <p className="max-w-xs text-sm text-surface/80">
            Instalação de TVs, suportes e assistência técnica.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-surface/70">Navegação</p>
          <ul className="flex flex-col">
            {[...mainNav, { label: "Agendar serviço", href: routes.booking }, { label: "Privacidade", href: routes.privacy }].map(
              (i) => (
                <li key={i.href}>
                  <Link href={i.href} className="flex min-h-11 items-center hover:underline">
                    {i.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-surface/70">Pagamento</p>
          <ul className="flex flex-col gap-1 text-sm text-surface/80">
            {businessConfig.paymentMethods.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-surface/15">
        <p className="container-mk py-5 text-sm text-surface/70">
          © {new Date().getFullYear()} MK Design. Atendimento sujeito à confirmação de disponibilidade.
        </p>
      </div>
    </footer>
  );
}
