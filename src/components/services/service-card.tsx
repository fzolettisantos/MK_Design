import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card, CardDescription, CardTitle } from "@/components/ui";
import { routes } from "@/config/routes";
import type { Service } from "@/types";
import { CategoryIcon } from "./category-icon";

interface Props {
  service: Service;
  categoryName: string;
  /** Nível do título do card; use o nível logo abaixo do título da seção. */
  headingAs?: "h2" | "h3";
}

export function ServiceCard({ service, categoryName, headingAs = "h2" }: Props) {
  return (
    <Card className="relative flex h-full flex-col gap-4 transition-shadow duration-200 focus-within:shadow-md hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-card bg-brand-ink text-brand-primary">
          <CategoryIcon id={service.categoryId} className="size-6" />
        </span>
        <Badge className="bg-surface-muted text-brand-ink">{categoryName}</Badge>
      </div>
      <CardTitle as={headingAs}>{service.name}</CardTitle>
      <CardDescription className="text-base">{service.summary}</CardDescription>
      <p className="text-sm font-semibold">Sob orçamento</p>
      <Link
        href={routes.service(service.slug)}
        className="mt-auto flex min-h-11 items-center gap-2 font-semibold underline decoration-brand-primary decoration-4 underline-offset-4 after:absolute after:inset-0 hover:decoration-brand-primary-hover"
      >
        Ver detalhes
        <span className="sr-only"> de {service.name}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
