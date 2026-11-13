"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  text: string;
}

/**
 * Linha do tempo vertical: o número de cada passo "acende" (preenche) conforme a rolagem chega nele,
 * e o traço vertical escurece até o passo alcançado. Sem JS ou com prefers-reduced-motion, tudo fica preenchido.
 */
export function ProcessTimeline({ steps }: { steps: readonly Step[] }) {
  const refs = React.useRef<(HTMLLIElement | null)[]>([]);
  const [reached, setReached] = React.useState(steps.length); // quantos passos estão "acesos"

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    const update = () => {
      const line = window.innerHeight * 0.65;
      let n = 0;
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < line) n = i + 1;
      });
      setReached(Math.max(n, 1));
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
    <ol className="flex flex-col">
      {steps.map((s, i) => {
        const on = i < reached;
        const last = i === steps.length - 1;
        return (
          <li
            key={s.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cn("relative flex gap-5 md:gap-8", !last && "pb-12 md:pb-16")}
          >
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-6 top-14 bottom-1 w-px -translate-x-1/2 transition-colors duration-500",
                  i + 1 < reached ? "bg-brand-ink" : "bg-border",
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative grid size-12 shrink-0 place-items-center rounded-[0.9rem] border border-brand-ink font-body text-lg transition-colors duration-500",
                on ? "bg-brand-ink text-surface" : "bg-surface-muted text-brand-ink",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-2 pt-1">
              <h3 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-tight tracking-[-0.02em]">
                <span className="sr-only">Passo {i + 1}: </span>
                {s.title}
              </h3>
              <p className="max-w-md text-brand-ink/85">{s.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
