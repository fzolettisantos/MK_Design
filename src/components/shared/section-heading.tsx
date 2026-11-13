import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, id, className, as: Tag = "h2" }: Props) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {eyebrow && (
        <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-text-secondary">
          <span aria-hidden="true" className="h-1 w-8 bg-brand-primary" />
          {eyebrow}
        </p>
      )}
      <Tag id={id}>{title}</Tag>
    </div>
  );
}
