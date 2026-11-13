import { CalendarDays, FileText, MessageCircle, MousePointerClick } from "lucide-react";
import { benefits } from "@/content/home";

const icons = { choose: MousePointerClick, calendar: CalendarDays, whatsapp: MessageCircle, info: FileText } as const;

export function Benefits() {
  return (
    <section aria-labelledby="diferenciais-title" className="bg-brand-ink py-16 text-surface md:py-24">
      <div className="container-mk flex flex-col gap-10">
        <h2 id="diferenciais-title" className="max-w-2xl">
          {benefits.title}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.items.map((b) => {
            const Icon = icons[b.icon];
            return (
              <li key={b.title} className="flex flex-col gap-4 rounded-card border border-surface/20 p-6">
                <Icon className="size-7 text-brand-primary" aria-hidden="true" />
                <p className="font-heading text-lg font-semibold">{b.title}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
