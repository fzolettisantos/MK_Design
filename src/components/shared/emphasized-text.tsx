import { cn } from "@/lib/utils";

/**
 * Destaca um trecho do título. Mesma fonte e peso do restante (Outfit); `accent` pinta o trecho em lime,
 * o que só deve ser usado sobre fundo escuro (brand-ink). Em fundos claros/lime o trecho herda a cor.
 */
export function EmphasizedText({
  text,
  emphasis,
  accent = false,
}: {
  text: string;
  emphasis?: string;
  /** Pinta o destaque em lime (somente sobre brand-ink). */
  accent?: boolean;
}) {
  const i = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <em className={cn("not-italic", accent && "text-brand-primary")}>{emphasis}</em>
      {text.slice(i + emphasis.length)}
    </>
  );
}
