import { cn } from "@/lib/utils";

/**
 * Destaca um trecho do título em serifa itálica (referência visual). `tone="dark"` usa lime,
 * que só aparece sobre fundo escuro; em fundos claros/lime a ênfase herda a cor do texto.
 */
export function EmphasizedText({
  text,
  emphasis,
  accent = false,
}: {
  text: string;
  emphasis?: string;
  /** Pinta a ênfase em lime (somente sobre brand-ink). */
  accent?: boolean;
}) {
  const i = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <em className={cn("font-accent text-[1.02em] font-extrabold italic tracking-normal", accent && "text-brand-primary")}>
        {emphasis}
      </em>
      {text.slice(i + emphasis.length)}
    </>
  );
}
