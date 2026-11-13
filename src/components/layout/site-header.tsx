import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MobileMenu } from "./mobile-menu";

const linkClass =
  "flex min-h-11 items-center rounded-full px-4 font-semibold transition-colors duration-150 hover:bg-surface-muted";

/**
 * Menu flutuante em pílula (h-0 + posição absoluta: não ocupa espaço, a primeira seção começa no topo).
 * Logo centralizado no desktop; links dos dois lados.
 */
export function SiteHeader() {
  const left = mainNav.slice(0, 2);
  const right = mainNav.slice(2);
  return (
    <header className="sticky top-0 z-50 h-0">
      <div className="container-mk pt-3 md:pt-4">
        <div className="relative mx-auto flex max-w-[60rem] items-center justify-between rounded-full bg-surface px-3 py-2 shadow-md ring-1 ring-brand-ink/5 md:px-4">
          <Link
            href={routes.home}
            aria-label="MK Design — página inicial"
            className="flex min-h-11 items-center px-2 md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Image src={siteConfig.logo.srcTrim} alt="" width={951} height={862} priority className="h-10 w-auto" />
          </Link>
          <nav aria-label="Principal" className="hidden w-full items-center justify-between md:flex">
            <ul className="flex items-center gap-1">
              {left.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex items-center gap-1">
              {right.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Button asChild size="sm" variant="dark">
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
