import { CalendarDays, FileText, MessageCircle, MousePointerClick } from "lucide-react";
import { ArcLine } from "@/components/shared/arc-line";
import { CurveDivider } from "@/components/shared/curve-divider";
import { benefits } from "@/content/home";

const icons = { choose: MousePointerClick, calendar: CalendarDays, whatsapp: MessageCircle, info: FileText } as const;

export function Benefits() {
  return (
    <>
      <CurveDivider from="muted" to="ink" flip />
      <section aria-labelledby="diferenciais-title" className="relative overflow-hidden bg-brand-ink pb-16 text-surface md:pb-24">
        <ArcLine className="pointer-events-none absolute -right-16 -top-10 hidden size-[24rem] rotate-180 text-brand-primary/60 md:block" />
        <div className="container-mk relative flex flex-col gap-10">
          <h2 id="diferenciais-title" className="max-w-2xl">
            Atendimento <span className="text-brand-primary">simples</span>, desde o primeiro contato.
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.items.map((b) => {
              const Icon = icons[b.icon];
              return (
                <li key={b.title} className="flex flex-col gap-5 rounded-card border border-surface/20 p-6">
                  <span className="grid size-12 place-items-center rounded-2xl border-2 border-brand-primary text-brand-primary">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <p className="font-heading text-lg font-semibold">{b.title}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <CurveDivider from="ink" to="surface" />
    </>
  );
}
