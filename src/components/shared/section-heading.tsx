import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
  /** "dark" para fundos brand-ink. */
  tone?: "light" | "dark";
}

export function SectionHeading({ eyebrow, title, id, className, as: Tag = "h2", tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-sm font-semibold uppercase tracking-widest",
            dark ? "text-surface/75" : "text-text-secondary",
          )}
        >
          <span aria-hidden="true" className="h-1 w-8 rounded-full bg-brand-primary" />
          {eyebrow}
        </p>
      )}
      <Tag id={id} className={dark ? "text-surface" : undefined}>
        {title}
      </Tag>
    </div>
  );
}
