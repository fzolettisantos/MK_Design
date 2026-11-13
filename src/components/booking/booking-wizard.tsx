"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Copy, MessageCircle, Send } from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Alert, Button, Card } from "@/components/ui";
import { detailsSummary, formatDateBR, periodLabel } from "@/lib/booking/format";
import { conditionalIssues, createBookingSchema, stepFields, type BookingInput } from "@/lib/booking/schema";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types";
import { submitBooking, type SubmitResult } from "@/app/agendamento/actions";
import { StepContact, StepDate, StepDetails, StepLocation, StepService } from "./steps";

const STEPS = [
  { title: "Escolha o serviço", short: "Serviço" },
  { title: "Detalhes do serviço", short: "Detalhes" },
  { title: "Onde será feito", short: "Local" },
  { title: "Data e período desejados", short: "Data" },
  { title: "Seus dados e revisão", short: "Revisão" },
] as const;

type Done = Extract<SubmitResult, { ok: true }>;

export function BookingWizard({
  services,
  categories,
  initialSlug,
  demo,
}: {
  services: Service[];
  categories: ServiceCategory[];
  initialSlug?: string;
  demo: boolean;
}) {
  const schema = React.useMemo(() => createBookingSchema(services), [services]);
  const form = useForm<BookingInput>({
    resolver: zodResolver(schema) as never,
    mode: "onTouched",
    defaultValues: {
      serviceSlug: services.some((s) => s.slug === initialSlug) ? initialSlug : "",
      symptoms: [],
      preferredPeriod: undefined,
      consent: false as unknown as true,
    },
  });
  const [step, setStep] = React.useState(initialSlug && services.some((s) => s.slug === initialSlug) ? 1 : 0);
  const [done, setDone] = React.useState<Done | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const slug = useWatch({ control: form.control, name: "serviceSlug" });
  const service = services.find((s) => s.slug === slug);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  /**
   * Valida só os campos da etapa, direto com o schema Zod (mesma regra do servidor). Evita a corrida do
   * `trigger` do react-hook-form com a revalidação por blur ao clicar em "Continuar".
   */
  const validateStep = (i: number) => {
    const fields = stepFields[i] as string[];
    const values = form.getValues();
    const res = schema.safeParse(values);
    const issues = [
      ...(res.success ? [] : res.error.issues.filter((x) => fields.includes(String(x.path[0]))).map((x) => ({ path: String(x.path[0]), message: x.message }))),
      // `superRefine` só roda com o formulário todo válido; os obrigatórios por serviço são checados à parte.
      ...(i === 1 ? conditionalIssues(values, services) : []),
    ];
    form.clearErrors(fields as (keyof BookingInput)[]);
    const seen = new Set<string>();
    issues.forEach((it) => {
      if (seen.has(it.path)) return;
      seen.add(it.path);
      form.setError(it.path as keyof BookingInput, { message: it.message }, { shouldFocus: seen.size === 1 });
    });
    return issues.length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!validateStep(1)) return setStep(1);
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await submitBooking(values);
      if (res.ok) return setDone(res);
      setServerError(res.error);
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) form.setError(k as keyof BookingInput, { message: m });
    } catch {
      setServerError("Não foi possível enviar agora. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  });

  if (done) return <Result done={done} headingRef={headingRef} />;

  const v = form.getValues();
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        {demo && (
          <Alert title="Modo demonstrativo">
            A agenda ainda não está conectada a um banco de dados. Você informa a data e o período que prefere; a equipe
            confirma a disponibilidade. Nenhum horário é reservado automaticamente.
          </Alert>
        )}

        <nav aria-label="Progresso do agendamento">
          <p className="mb-3 text-sm font-semibold" aria-live="polite">
            Etapa {step + 1} de {STEPS.length}: {STEPS[step]?.short}
          </p>
          <ol className="grid grid-cols-5 gap-2">
            {STEPS.map((s, i) => (
              <li key={s.short} aria-current={i === step ? "step" : undefined}>
                <span className={cn("block h-2 rounded-full", i <= step ? "bg-brand-ink" : "bg-border")} />
                <span className="sr-only">
                  {s.short}
                  {i < step ? " (concluída)" : i === step ? " (atual)" : ""}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] outline-none">
            {STEPS[step]?.title}
          </h2>
          {step > 0 && service && (
            <p className="text-sm text-text-secondary">
              Serviço: <strong className="text-brand-ink">{service.name}</strong>
            </p>
          )}
          {step === 0 && <StepService services={services} categories={categories} />}
          {step === 1 && <StepDetails category={service?.categoryId} />}
          {step === 2 && <StepLocation />}
          {step === 3 && <StepDate />}
          {step === 4 && (
            <>
              <Card className="flex flex-col gap-2 bg-surface-muted text-sm">
                <p className="font-heading text-lg font-bold">Resumo da solicitação</p>
                <Row k="Serviço" v={service?.name} />
                <Row k="Detalhes" v={detailsSummary(v)} />
                <Row k="Local" v={[v.address, v.neighborhood, v.city].filter(Boolean).join(", ")} />
                <Row k="Data desejada" v={v.preferredDate ? `${formatDateBR(v.preferredDate)} · ${periodLabel(v.preferredPeriod)}` : ""} />
                <Row k="Valor" v="Sob orçamento" />
                <p className="mt-1 text-text-secondary">A solicitação depende de confirmação pela MK Design.</p>
              </Card>
              <StepContact />
            </>
          )}
        </div>

        {serverError && <Alert variant="error" title="Não foi possível enviar">{serverError}</Alert>}
        {step === 4 && Object.keys(form.formState.errors).length > 0 && !serverError && (
          <Alert variant="error">Revise os campos destacados.</Alert>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden="true" />
            Voltar
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="dark" onClick={next}>
              Continuar
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" variant="dark" loading={submitting}>
              <Send aria-hidden="true" />
              Solicitar agendamento
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <p className="flex flex-col sm:flex-row sm:gap-3">
      <span className="min-w-32 font-semibold">{k}</span>
      <span>{v || "—"}</span>
    </p>
  );
}

function Result({ done, headingRef }: { done: Done; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(done.message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <span className="grid size-14 place-items-center rounded-full bg-brand-primary">
        <Check className="size-7" aria-hidden="true" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="outline-none">
        Solicitação recebida.
      </h2>
      <p className="text-lg">O atendimento será confirmado pela equipe.</p>
      <p className="rounded-card bg-surface-muted p-4">
        Protocolo{done.demo ? " (demonstração)" : ""}: <strong className="font-heading text-xl">{done.protocol}</strong>
      </p>

      {done.demo && (
        <Alert title="Modo demonstrativo">
          Este pedido não foi gravado em um banco de dados e não aparece em nenhuma agenda. Para concluir de verdade,
          envie a mensagem abaixo à MK Design.
        </Alert>
      )}

      {done.whatsappUrl ? (
        <>
          <Button asChild className="self-start">
            <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden="true" />
              Enviar pelo WhatsApp
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </Button>
          <Alert>
            Se a janela do WhatsApp não abrir, sua solicitação continua registrada com o protocolo acima, mas ainda
            depende da confirmação da equipe. Você também pode copiar a mensagem.
          </Alert>
        </>
      ) : (
        <Alert title="WhatsApp ainda não configurado">
          O número de WhatsApp da MK Design ainda não foi cadastrado, então não há link para enviar. Copie a mensagem
          abaixo e envie assim que o contato estiver disponível.
        </Alert>
      )}

      <pre className="whitespace-pre-wrap rounded-card border border-border bg-surface p-4 text-sm">{done.message}</pre>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={copy}>
          <Copy aria-hidden="true" />
          Copiar mensagem
        </Button>
        <p role="status" className="text-sm font-semibold">{copied ? "Mensagem copiada." : ""}</p>
      </div>
    </div>
  );
}
