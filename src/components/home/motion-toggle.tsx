"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

/** Pausa/retoma as animações dentro do ancestral `[data-motion-root]` (WCAG 2.2.2). */
export function MotionToggle() {
  const [paused, setPaused] = React.useState(false);
  const ref = React.useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    const root = ref.current?.closest<HTMLElement>("[data-motion-root]");
    if (root) root.dataset.paused = String(next);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold underline-offset-4 hover:underline"
    >
      {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      {paused ? "Retomar animação" : "Pausar animação"}
    </button>
  );
}
