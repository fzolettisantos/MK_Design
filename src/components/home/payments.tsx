import { CreditCard, QrCode } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { payments } from "@/content/home";

export function Payments() {
  return (
    <section aria-labelledby="pagamentos-title" className="container-mk grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
      <div className="flex flex-col gap-4">
        <SectionHeading id="pagamentos-title" title={payments.title} />
        <p className="text-lg text-text-secondary">{payments.text}</p>
        <p className="text-sm text-text-secondary">{payments.note}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {payments.methods.map((m, i) => (
          <li key={m} className="flex min-h-14 items-center gap-4 rounded-card border border-border bg-surface px-5 font-semibold">
            {i === 0 ? <QrCode className="size-6" aria-hidden="true" /> : <CreditCard className="size-6" aria-hidden="true" />}
            {m}
          </li>
        ))}
      </ul>
    </section>
  );
}
