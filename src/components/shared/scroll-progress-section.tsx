"use client";

import * as React from "react";

/**
 * <section> que expõe o progresso de entrada na tela como a variável CSS `--p` (0 → 1).
 * 0 = topo da seção na base da janela; 1 = topo da seção a 25% da altura da janela.
 * Os filhos usam `var(--p)` em transform/opacity. O valor padrão é 1 (estado final), então sem JS
 * ou com prefers-reduced-motion nada se move. Atualiza via style direto (sem re-render).
 */
export function ScrollProgressSection({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const p = (vh - el.getBoundingClientRect().top) / (vh * 0.75);
      el.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
}
