import { CreditCard, QrCode } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { payments } from "@/content/home";

export function Payments() {
  return (
    <section aria-labelledby="pagamentos-title" className="mk-stack bg-surface py-16 md:py-24">
      <div className="container-mk grid items-center gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <SectionHeading id="pagamentos-title" title={payments.title} emphasis={payments.emphasis} />
        <p className="text-lg text-text-secondary">{payments.text}</p>
        <p className="text-sm text-text-secondary">{payments.note}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {payments.methods.map((m, i) => (
          <li key={m} className="flex min-h-16 items-center gap-4 rounded-full border-2 border-brand-ink bg-surface px-6 font-semibold">
            <span className="grid size-10 place-items-center rounded-full bg-brand-primary">
              {i === 0 ? <QrCode className="size-5" aria-hidden="true" /> : <CreditCard className="size-5" aria-hidden="true" />}
            </span>
            {m}
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
