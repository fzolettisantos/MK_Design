import { cn } from "@/lib/utils";

type Tone = "ink" | "surface" | "muted";
const fill: Record<Tone, string> = { ink: "text-brand-ink", surface: "text-surface", muted: "text-surface-muted" };
const bg: Record<Tone, string> = { ink: "bg-brand-ink", surface: "bg-surface", muted: "bg-surface-muted" };

/**
 * Transição curva entre duas seções: `from` = cor da seção de cima, `to` = cor da de baixo.
 * Puramente decorativa (aria-hidden).
 */
export function CurveDivider({ from, to, flip = false }: { from: Tone; to: Tone; flip?: boolean }) {
  return (
    <div aria-hidden="true" className={cn("-mb-px leading-[0]", bg[to], fill[from])}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="currentColor"
        className={cn("block h-10 w-full md:h-20", flip && "-scale-x-100")}
      >
        <path d="M0 0H1440V30C1130 118 470 128 0 24Z" />
      </svg>
    </div>
  );
}
