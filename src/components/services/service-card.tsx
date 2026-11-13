import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Button, Card, CardDescription, CardTitle } from "@/components/ui";
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
    <Card className="relative flex h-full flex-col gap-4 border-brand-ink bg-brand-ink p-7 text-surface transition-transform duration-200 focus-within:-translate-y-0.5 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-primary text-brand-ink">
          <CategoryIcon id={service.categoryId} className="size-7" />
        </span>
        <Badge className="bg-surface/10 text-surface">{categoryName}</Badge>
      </div>
      <CardTitle as={headingAs} className="text-2xl">
        {service.name}
      </CardTitle>
      <CardDescription className="text-base text-surface/80">{service.summary}</CardDescription>
      <p className="font-semibold text-brand-primary">Sob orçamento</p>
      <Button asChild size="sm" className="mt-auto self-start">
        <Link href={routes.service(service.slug)} className="after:absolute after:inset-0">
          Ver detalhes
          <span className="sr-only"> de {service.name}</span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  );
}
