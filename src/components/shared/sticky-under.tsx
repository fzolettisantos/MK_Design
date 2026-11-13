"use client";

import * as React from "react";

/**
 * Mantém a seção fixa enquanto as seguintes (`.mk-stack`) sobem e a cobrem.
 * Se a seção for mais alta que a tela, ela rola até a base alinhar com o rodapé da janela e só então fixa
 * (top = altura da janela − altura da seção), para o conteúdo inferior nunca ficar inacessível.
 * Desativado com prefers-reduced-motion.
 */
export function StickyUnder({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (mq.matches) {
        el.style.position = "static";
        el.style.top = "";
        return;
      }
      el.style.position = "sticky";
      el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    mq.addEventListener("change", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={ref} className="sticky top-0">
      {children}
    </div>
  );
}
