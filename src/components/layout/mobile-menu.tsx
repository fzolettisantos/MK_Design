"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui";
import { mainNav, routes } from "@/config/routes";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <Button
        ref={buttonRef}
        variant="ghostLight"
        size="icon"
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      {open && (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-surface/10 bg-brand-ink text-surface"
        >
          <ul className="container-mk flex flex-col py-4">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center border-b border-surface/15 font-heading text-xl font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-6">
              <Button asChild className="w-full">
                <Link href={routes.booking} onClick={() => setOpen(false)}>
                  Agendar serviço
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
