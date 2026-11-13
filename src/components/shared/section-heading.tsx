import { cn } from "@/lib/utils";
import { EmphasizedText } from "./emphasized-text";

interface Props {
  eyebrow?: string;
  title: string;
  /** Trecho de `title` em destaque. */
  emphasis?: string;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
  /** "dark" para fundos brand-ink. */
  tone?: "light" | "dark";
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  emphasis,
  id,
  className,
  as: Tag = "h2",
  tone = "light",
  align = "left",
}: Props) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "text-sm font-semibold uppercase tracking-widest",
            dark ? "text-surface/75" : "text-brand-ink/75",
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag id={id} className={dark ? "text-surface" : undefined}>
        <EmphasizedText text={title} emphasis={emphasis} accent={dark} />
      </Tag>
    </div>
  );
}
