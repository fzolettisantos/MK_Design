import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface/10 bg-brand-ink text-surface">
      <div className="container-mk relative flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={routes.home} aria-label="MK Design — página inicial" className="flex min-h-11 items-center">
          <Image src={siteConfig.logo.srcOnDark} alt="" width={951} height={862} priority className="h-11 w-auto" />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-button px-5 font-semibold transition-colors duration-150 hover:bg-surface/10"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href={routes.booking}>Agendar serviço</Link>
          </Button>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
