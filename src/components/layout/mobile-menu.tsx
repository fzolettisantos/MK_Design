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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="md:hidden">
      <Button
        ref={buttonRef}
        variant="ghost"
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
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-[2rem] bg-surface p-4 shadow-md ring-1 ring-brand-ink/5"
        >
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center border-b border-border px-3 font-heading text-xl font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Button asChild variant="dark" className="w-full">
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
