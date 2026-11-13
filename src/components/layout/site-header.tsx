import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { mainNav, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="container-mk relative flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={routes.home} aria-label="MK Design — página inicial" className="flex min-h-11 items-center">
          <Image
            src={siteConfig.logo.srcTrim}
            alt=""
            width={951}
            height={862}
            priority
            className="h-11 w-auto"
          />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-button px-4 font-semibold transition-colors duration-150 hover:bg-surface-muted"
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
