import { Hammer, Tv, Wrench } from "lucide-react";
import type { ServiceCategoryId } from "@/types";

const icons = { "instalacao-tv": Tv, "instalacao-suporte": Hammer, "assistencia-tecnica": Wrench } as const;

export function CategoryIcon({ id, className }: { id: ServiceCategoryId; className?: string }) {
  const Icon = icons[id];
  return <Icon className={className} aria-hidden="true" />;
}
