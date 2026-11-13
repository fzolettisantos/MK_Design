import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo quadrado arredondado com seta — marca gráfica de apoio ao subtítulo. */
export function ChevronBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-current", className)}
    >
      <ChevronRight className="size-6" strokeWidth={2.5} />
    </span>
  );
}
