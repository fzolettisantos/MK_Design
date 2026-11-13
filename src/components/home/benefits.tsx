import { CalendarDays, FileText, MessageCircle, MousePointerClick } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { benefits } from "@/content/home";

const icons = { choose: MousePointerClick, calendar: CalendarDays, whatsapp: MessageCircle, info: FileText } as const;

export function Benefits() {
  return (
    <section aria-labelledby="diferenciais-title" className="mk-stack bg-brand-ink py-16 text-surface md:py-24">
      <div className="container-mk flex flex-col gap-10">
        <SectionHeading
          tone="dark"
          id="diferenciais-title"
          title={benefits.title}
          emphasis={benefits.emphasis}
          className="max-w-2xl"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.items.map((b) => {
            const Icon = icons[b.icon];
            return (
              <li key={b.title} className="flex flex-col gap-5 rounded-card border border-surface/20 p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-primary text-brand-ink">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <p className="font-heading text-lg font-semibold">{b.title}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
