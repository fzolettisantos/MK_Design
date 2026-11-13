import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MobileMenu } from "./mobile-menu";

const linkClass =
  "flex min-h-11 items-center rounded-xl px-4 font-semibold transition-colors duration-150 hover:bg-surface-muted";

/**
 * Menu flutuante em pílula (h-0 + posição absoluta: não ocupa espaço, a primeira seção começa no topo).
 * Logo à esquerda; links e botão de agendamento à direita.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-0">
      <div className="container-mk pt-3 md:pt-4">
        <div className="relative mx-auto flex max-w-[60rem] items-center justify-between gap-4 rounded-[1.5rem] bg-surface px-3 py-2 shadow-md ring-1 ring-brand-ink/5 md:px-4">
          <Link href={routes.home} aria-label="MK Design — página inicial" className="flex min-h-11 items-center px-2">
            <Image src={siteConfig.logo.srcTrim} alt="" width={44} height={40} sizes="44px" priority className="h-10 w-auto" />
          </Link>
          <nav aria-label="Principal" className="ml-auto hidden items-center md:flex">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pl-2">
                <Button asChild size="sm" variant="dark" className="rounded-xl!">
                  <Link href={routes.booking}>Agendar serviço</Link>
                </Button>
              </li>
            </ul>
          </nav>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
