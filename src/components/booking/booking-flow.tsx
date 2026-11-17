"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Loader2, MessageCircle, Truck } from "lucide-react";
import { CategoryIcon } from "@/components/services/category-icon";
import { Alert, Button, Field, Input, SelectableCard, Textarea } from "@/components/ui";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/config/whatsapp";
import { routes } from "@/config/routes";
import { generateAvailability, type DayAvailability } from "@/lib/booking/availability";
import { demoBusy } from "@/lib/booking/demo";
import { fmtDayChip, fmtSlotLong, fmtSlotParts } from "@/lib/booking/slot-format";
import { symptoms as SYMPTOMS, repairBrands, tvSizes } from "@/lib/booking/options";
import {
  claimInviteAction, createEvaluationAction, finalizeBookingAction, holdSlotAction, loadAvailabilityAction, releaseHoldAction,
} from "@/lib/scheduling/actions";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types";

type Mode = "agenda" | "avaliacao" | "retirada";
type Step = "servico" | "modo" | "local" | "horario" | "dados" | "pronto";
type Done = { protocol: string; message: string; whatsappUrl: string | null; startIso: string | null; demo: boolean };
export interface InviteInfo { token: string; firstName: string; serviceSlug: string; neighborhood: string; city: string }

const HOLD_SECONDS = 10 * 60;
const PERIODS = [
  { id: "madrugada", label: "Madrugada", from: 0, to: 6 },
  { id: "manha", label: "Manhã", from: 6, to: 12 },
  { id: "tarde", label: "Tarde", from: 12, to: 18 },
  { id: "noite", label: "Noite", from: 18, to: 24 },
] as const;
const nowMs = () => Date.now();
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

const REASONS: Record<string, string> = {
  slot_taken: "Esse horário acabou de ser reservado por outra pessoa. Escolha outro.",
  antecedencia: "Esse horário não está mais disponível. Escolha outro.",
  fora_da_janela: "Esse horário não está mais disponível. Escolha outro.",
  fora_da_grade: "Esse horário não está mais disponível. Escolha outro.",
  reserva_expirada: "Sua reserva expirou e o horário voltou a ficar livre. Escolha novamente.",
  convite_usado: "Este convite já foi usado. Se precisar de outro horário, fale com o técnico.",
  convite_expirado: "Este convite expirou. Peça um novo ao técnico.",
  convite_invalido: "Convite inválido. Peça um novo ao técnico.",
  indisponivel: "Não conseguimos falar com a agenda agora. Tente de novo em instantes ou fale pelo WhatsApp.",
};
const reasonText = (r?: string) => REASONS[r ?? ""] ?? REASONS.indisponivel!;

export function BookingFlow({
  services, categories, real, invite, initialDays,
}: { services: Service[]; categories: ServiceCategory[]; real: boolean; invite?: InviteInfo; initialDays?: DayAvailability[] }) {
  const inviteService = invite ? services.find((s) => s.slug === invite.serviceSlug) ?? null : null;
  const [step, setStep] = React.useState<Step>(invite ? "horario" : "servico");
  const [service, setService] = React.useState<Service | null>(inviteService);
  const [mode, setMode] = React.useState<Mode>(invite ? "retirada" : "agenda");
  const [place, setPlace] = React.useState({ cep: "", bairro: invite?.neighborhood ?? "", cidade: invite?.city ?? "" });
  const [days, setDays] = React.useState<DayAvailability[]>(initialDays ?? []);
  const [loadingDays, setLoadingDays] = React.useState(false);
  const [dayKey, setDayKey] = React.useState<string | null>(() => initialDays?.find((d) => d.free > 0)?.key ?? null);
  const [slot, setSlot] = React.useState<string | null>(null); // início ISO do horário escolhido
  const [hold, setHold] = React.useState<{ id: string; holdToken: string } | null>(null);
  const [busySlot, setBusySlot] = React.useState<string | null>(null);
  const [left, setLeft] = React.useState(HOLD_SECONDS);
  const [expired, setExpired] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", tvSize: "", brand: "", notes: "", consent: false });
  const [syms, setSyms] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<Done | null>(null);
  const deadline = React.useRef(0);
  const headRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => headRef.current?.focus(), [step, done]);

  const refreshDays = React.useCallback(async () => {
    let list: DayAvailability[];
    if (real) {
      const r = await loadAvailabilityAction();
      if (!r.ok) { setError(reasonText("indisponivel")); setLoadingDays(false); return; }
      list = r.days;
    } else {
      list = generateAvailability(new Date(), demoBusy(new Date()));
    }
    setDays(list);
    setDayKey((k) => (k && list.some((d) => d.key === k && d.free > 0) ? k : (list.find((d) => d.free > 0)?.key ?? null)));
    setLoadingDays(false);
  }, [real]);

  // Contador da reserva temporária (prazo absoluto vindo do servidor).
  React.useEffect(() => {
    if (!slot || !hold && real || step === "pronto" || invite) return;
    const id = setInterval(() => {
      const r = Math.ceil((deadline.current - nowMs()) / 1000);
      if (r <= 0) {
        clearInterval(id);
        setSlot(null); setHold(null); setExpired(true); setStep("horario");
        void refreshDays();
      } else setLeft(r);
    }, 1000);
    return () => clearInterval(id);
  }, [slot, hold, real, step, invite, refreshDays]);

  const repair = service?.categoryId === "assistencia-tecnica";
  const day = days.find((d) => d.key === dayKey);

  const goBack = (): Step | null =>
    ({ servico: null, modo: "servico", local: repair ? "modo" : "servico", horario: "local", dados: mode === "avaliacao" ? "local" : "horario", pronto: null } as Record<Step, Step | null>)[step];

  const pickService = (s: Service) => {
    setService(s); setSlot(null); setError(null);
    if (s.categoryId === "assistencia-tecnica") { setMode("avaliacao"); setStep("modo"); }
    else { setMode("agenda"); setStep("local"); }
  };

  const submitPlace = () => {
    if (!place.bairro.trim() || !place.cidade.trim()) return setError("Informe o bairro e a cidade.");
    setError(null);
    if (mode === "avaliacao") return setStep("dados");
    setLoadingDays(true);
    setStep("horario");
    void refreshDays();
  };

  const pickSlot = async (start: string) => {
    setError(null); setExpired(false);
    if (invite) return setSlot(start); // convite: sem reserva temporária; reserva no clique final
    if (!real) { deadline.current = nowMs() + HOLD_SECONDS * 1000; setLeft(HOLD_SECONDS); return setSlot(start); }
    if (!service) return;
    setBusySlot(start);
    if (hold) await releaseHoldAction({ id: hold.id, holdToken: hold.holdToken });
    setHold(null); setSlot(null);
    const r = await holdSlotAction({ start, serviceSlug: service.slug, kind: mode === "retirada" ? "retirada" : "instalacao" });
    if (r.ok) {
      deadline.current = nowMs() + r.secondsLeft * 1000;
      setLeft(r.secondsLeft); setHold({ id: r.id, holdToken: r.holdToken }); setSlot(start);
    } else {
      setError(reasonText(r.reason));
      await refreshDays();
    }
    setBusySlot(null);
  };

  const confirmInvite = async () => {
    if (!invite || !slot) return;
    setSubmitting(true); setError(null);
    const r = await claimInviteAction({ token: invite.token, start: slot });
    setSubmitting(false);
    if (r.ok) return setDone({ protocol: r.protocol, message: r.message, whatsappUrl: r.whatsappUrl, startIso: r.startIso, demo: false });
    setError(reasonText(r.reason));
    setSlot(null);
    if (r.reason === "slot_taken") void refreshDays();
  };

  const submitDados = async () => {
    if (form.name.trim().length < 2) return setError("Informe seu nome.");
    if (!/^\d{10,11}$/.test(form.phone.replace(/\D/g, ""))) return setError("Informe DDD e número, ex.: (13) 91234-5678.");
    if (mode === "avaliacao" && (!form.brand || syms.length === 0)) return setError("Escolha a marca e marque ao menos um problema.");
    if (!form.consent) return setError("Aceite a política de privacidade para continuar.");
    setError(null); setSubmitting(true);
    const customer = {
      name: form.name, phone: form.phone, neighborhood: place.bairro, city: place.cidade, cep: place.cep || undefined,
      tvSize: form.tvSize || undefined, brand: form.brand || undefined, symptoms: syms, notes: form.notes || undefined, consent: true as const,
    };
    if (!real) {
      const when = slot ? fmtSlotParts(slot) : null;
      const message = buildWhatsAppMessage({
        protocolo: "MK-DEMO", servico: service?.name ?? "", detalhes: form.notes || "—", localidade: `${place.bairro}/${place.cidade}`,
        data: when?.date ?? "A combinar (sem agenda)", hora: when?.time ?? "A combinar", nome: form.name,
      });
      setSubmitting(false);
      return setDone({ protocol: "MK-DEMO", message, whatsappUrl: buildWhatsAppUrl(message), startIso: slot, demo: true });
    }
    const r = mode === "avaliacao"
      ? await createEvaluationAction({ serviceSlug: service!.slug, customer })
      : await finalizeBookingAction({ id: hold?.id ?? "", holdToken: hold?.holdToken ?? "", serviceSlug: service!.slug, customer });
    setSubmitting(false);
    if (r.ok) return setDone({ protocol: r.protocol, message: r.message, whatsappUrl: r.whatsappUrl, startIso: r.startIso, demo: false });
    if (r.reason === "reserva_expirada") { setSlot(null); setHold(null); setStep("horario"); void refreshDays(); }
    setError(("message" in r && typeof r.message === "string" && r.message) || reasonText(r.reason));
  };

  const heading = {
    servico: "Qual serviço você precisa?", modo: "Como você quer seguir?", local: "Onde será o atendimento?",
    horario: invite ? `Olá, ${invite.firstName}! Escolha o dia e a hora` : "Escolha o dia e a hora",
    dados: "Quase lá: seus dados", pronto: mode === "avaliacao" ? "Pedido pronto para enviar" : "Horário reservado para você",
  }[step];

  if (done) return <Result done={done} mode={mode} headRef={headRef} />;

  return (
    <div className="flex flex-col gap-8">
      {!real && (
        <Alert title="Modo demonstrativo">
          A agenda ainda não está conectada ao banco de dados. Os horários ocupados são exemplos e nada é gravado.
        </Alert>
      )}
      {invite && (
        <Alert title="Convite do técnico: retirada da TV">
          O técnico pediu para retirar sua TV. Escolha o dia e a hora que ficam melhores para você. Seu endereço e seus dados já estão no pedido.
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <h2 ref={headRef} tabIndex={-1} className="text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] outline-none">{heading}</h2>

        {step === "servico" && (
          <div className="flex flex-col gap-6">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-col gap-3">
                <p className="text-lg font-semibold">{c.name}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.filter((s) => s.categoryId === c.id).map((s) => (
                    <button key={s.id} type="button" onClick={() => pickService(s)}
                      className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-muted">
                      <CategoryIcon id={s.categoryId} className="size-6 shrink-0" />
                      <span className="flex-1 font-semibold">{s.name}</span>
                      <ArrowRight className="size-5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "modo" && service && (
          <div className="flex flex-col gap-4">
            <p className="text-text-secondary">Para conserto e diagnóstico, a agenda só abre se você quiser que o técnico <strong>retire a TV</strong>.</p>
            <fieldset className="grid gap-3">
              <legend className="sr-only">Como seguir</legend>
              <SelectableCard type="radio" name="modo" checked={mode === "avaliacao"} onChange={() => setMode("avaliacao")}
                title="Quero uma avaliação primeiro" description="Sem agendar agora. Você descreve o problema e envia ao técnico pelo WhatsApp. Se ele precisar retirar a TV, te envia um link para você escolher o horário." />
              <SelectableCard type="radio" name="modo" checked={mode === "retirada"} onChange={() => setMode("retirada")}
                title="Quero que o técnico retire a TV para o conserto" description="Escolha o dia e a hora para a retirada, mesmo sem diagnóstico." />
            </fieldset>
            {mode === "retirada" && (
              <Alert variant="error" title="Atenção: retirada sem diagnóstico prévio">
                <span className="text-brand-ink">O técnico levará a TV mesmo sem saber o defeito. O orçamento é informado pela equipe depois da avaliação, e você poderá decidir como seguir. <em>(Texto a confirmar com o técnico.)</em></span>
              </Alert>
            )}
            <Button type="button" variant="dark" className="self-start" onClick={() => setStep("local")}>Continuar <ArrowRight aria-hidden="true" /></Button>
          </div>
        )}

        {step === "local" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <p className="text-text-secondary sm:col-span-2">Usamos o endereço para calcular o deslocamento do técnico e mostrar só os horários em que ele consegue chegar.</p>
            <Field label="CEP (opcional)">{(a) => <Input {...a} inputMode="numeric" value={place.cep} onChange={(e) => setPlace({ ...place, cep: e.target.value })} />}</Field>
            <Field label="Bairro" required>{(a) => <Input {...a} value={place.bairro} onChange={(e) => setPlace({ ...place, bairro: e.target.value })} />}</Field>
            <Field label="Cidade" required>{(a) => <Input {...a} value={place.cidade} onChange={(e) => setPlace({ ...place, cidade: e.target.value })} />}</Field>
            <div className="sm:col-span-2">
              <Button type="button" variant="dark" onClick={submitPlace}>{mode === "avaliacao" ? "Continuar" : "Ver horários"} <ArrowRight aria-hidden="true" /></Button>
            </div>
          </div>
        )}

        {step === "horario" && (
          <div className="flex flex-col gap-6">
            {expired && <Alert variant="error" title="Sua reserva temporária expirou">O horário voltou a ficar disponível. Escolha novamente.</Alert>}
            <p className="text-text-secondary">Atendimento todos os dias, a qualquer hora, em blocos de 60 minutos. Agendamentos com pelo menos 24h de antecedência, até 30 dias à frente.</p>

            {loadingDays ? (
              <p role="status" aria-busy="true" className="flex items-center gap-2 rounded-card bg-surface-muted p-5"><Loader2 className="size-5 animate-spin" aria-hidden="true" />Carregando horários…</p>
            ) : days.length === 0 ? (
              <Alert variant="error" title="Horários indisponíveis">Não conseguimos carregar a agenda. <button type="button" className="underline" onClick={() => { setLoadingDays(true); void refreshDays(); }}>Tentar novamente</button></Alert>
            ) : (
              <>
                <div role="group" aria-label="Escolha o dia" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
                  {days.map((d) => {
                    const c = fmtDayChip(d.key);
                    return (
                      <button key={d.key} type="button" disabled={d.free === 0} aria-pressed={dayKey === d.key} onClick={() => setDayKey(d.key)}
                        className={cn("relative flex min-h-16 w-16 shrink-0 flex-col items-center justify-center rounded-card border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          dayKey === d.key ? "border-brand-ink bg-brand-primary" : "border-border bg-surface hover:bg-surface-muted")}>
                        <span className="text-xs font-semibold uppercase">{c.wk}</span>
                        <span className="font-heading text-xl font-bold">{c.dd}</span>
                        <span className="text-[0.7rem]">{c.mon}</span>
                        <span className="sr-only">{`, ${c.long}${d.free === 0 ? ", sem horários" : `, ${d.free} horários livres`}`}</span>
                      </button>
                    );
                  })}
                </div>

                {day && (
                  <div className="flex flex-col gap-5">
                    {PERIODS.map((p) => {
                      const list = day.slots.filter((s) => s.hour >= p.from && s.hour < p.to);
                      if (list.length === 0) return null;
                      return (
                        <div key={p.id} className="flex flex-col gap-2">
                          <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{p.label}</p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {list.map((s) => {
                              const sel = slot === s.start; const free = s.state === "livre";
                              return (
                                <button key={s.start} type="button" disabled={!free || busySlot !== null} aria-pressed={sel} onClick={() => void pickSlot(s.start)}
                                  className={cn("relative flex min-h-12 items-center justify-center gap-1 rounded-button border-2 px-2 font-semibold transition-colors",
                                    sel ? "border-brand-ink bg-brand-primary" : free ? "border-brand-ink bg-surface hover:bg-surface-muted" : "cursor-not-allowed border-border bg-surface-muted text-text-secondary line-through")}>
                                  {busySlot === s.start ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : s.state === "deslocamento" && <Truck className="size-4" aria-hidden="true" />}
                                  {hh(s.hour)}
                                  {!free && <span className="sr-only"> (indisponível)</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                      <li>Riscado: ocupado</li>
                      <li className="flex items-center gap-1"><Truck className="size-4" aria-hidden="true" /> Riscado com caminhão: deslocamento do técnico</li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {slot && (
              <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-card bg-brand-ink p-4 text-surface shadow-md sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2"><CalendarCheck className="size-5 shrink-0 text-brand-primary" aria-hidden="true" /><span><strong>{fmtSlotLong(slot)}</strong> · 60 min</span></p>
                {invite ? (
                  <Button type="button" loading={submitting} onClick={() => void confirmInvite()}>Reservar este horário <ArrowRight aria-hidden="true" /></Button>
                ) : (
                  <Button type="button" onClick={() => setStep("dados")}>Continuar <ArrowRight aria-hidden="true" /></Button>
                )}
              </div>
            )}
          </div>
        )}

        {step === "dados" && (
          <div className="flex flex-col gap-6">
            {slot && mode !== "avaliacao" && (
              <div role="timer" aria-label="Tempo restante da reserva temporária" className="flex items-center gap-3 rounded-card bg-brand-primary p-4 font-semibold">
                <Clock className="size-5 shrink-0" aria-hidden="true" />
                <span>{fmtSlotLong(slot)}: reservado para você por <span className="font-heading text-xl">{mmss(left)}</span> enquanto você preenche.</span>
              </div>
            )}
            {mode === "avaliacao" && <Alert>Sem horário reservado. O técnico analisa o que você descrever e responde pelo WhatsApp. Se for preciso retirar a TV, ele envia um link para você escolher o horário.</Alert>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" required>{(a) => <Input {...a} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
              <Field label="WhatsApp" required hint="Com DDD.">{(a) => <Input {...a} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}</Field>
              {mode === "avaliacao" ? (
                <>
                  <Field label="Marca da TV" required>
                    {(a) => (
                      <select {...a} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="h-12 w-full rounded-input border border-neutral-mid bg-surface px-4">
                        <option value="">Selecione</option>
                        {repairBrands.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    )}
                  </Field>
                  <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-semibold">O que está acontecendo? <span aria-hidden="true">*</span></legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {SYMPTOMS.map((sy) => (
                        <SelectableCard key={sy} type="checkbox" title={sy} checked={syms.includes(sy)}
                          onChange={(e) => setSyms(e.target.checked ? [...syms, sy] : syms.filter((x) => x !== sy))} />
                      ))}
                    </div>
                  </fieldset>
                </>
              ) : (
                <Field label="Tamanho da TV (opcional)">
                  {(a) => (
                    <select {...a} value={form.tvSize} onChange={(e) => setForm({ ...form, tvSize: e.target.value })} className="h-12 w-full rounded-input border border-neutral-mid bg-surface px-4">
                      <option value="">Não informar</option>
                      {tvSizes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  )}
                </Field>
              )}
              <Field label="Detalhes (opcional)" className="sm:col-span-2" hint="Tipo de parede, marca e modelo, o que está acontecendo… (até 500 caracteres)">
                {(a) => <Textarea {...a} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />}
              </Field>
              <label className="flex min-h-11 items-start gap-3 sm:col-span-2">
                <input type="checkbox" className="mt-1 size-5 accent-brand-ink" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
                <span className="text-sm">Li e aceito a <a className="underline" href={routes.privacy} target="_blank" rel="noopener noreferrer">política de privacidade</a> e autorizo o contato da MK Design pelo WhatsApp sobre esta solicitação.</span>
              </label>
            </div>
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        {step !== "servico" && !(invite && step === "horario") && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" disabled={submitting} onClick={() => { setError(null); const b = goBack(); if (b) setStep(b); }}><ArrowLeft aria-hidden="true" /> Voltar</Button>
            {step === "dados" && (
              <Button type="button" variant="dark" loading={submitting} onClick={() => void submitDados()}>
                {mode === "avaliacao" ? "Preparar mensagem" : "Concluir reserva"} <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Result({ done, mode, headRef }: { done: Done; mode: Mode; headRef: React.RefObject<HTMLHeadingElement | null> }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(done.message); setCopied(true); } catch { setCopied(false); } };
  const scheduled = Boolean(done.startIso);
  return (
    <div className="flex flex-col gap-6">
      <span className="grid size-14 place-items-center rounded-full bg-brand-primary"><Check className="size-7" aria-hidden="true" /></span>
      <h2 ref={headRef} tabIndex={-1} className="outline-none">{scheduled ? "Horário reservado para você" : "Pedido pronto para enviar"}</h2>
      <p className="rounded-card bg-surface-muted p-4">Protocolo{done.demo ? " (demonstração)" : ""}: <strong className="font-heading text-xl">{done.protocol}</strong></p>
      {scheduled ? (
        <Alert title={`${fmtSlotLong(done.startIso!)} reservado para você`}>
          <span className="text-brand-ink">Este horário já está bloqueado para outros clientes, mas <strong>só será confirmado após a confirmação do técnico</strong>. Você recebe a resposta pelo WhatsApp em até 12 horas. Se não houver resposta, o horário volta a ficar livre.</span>
        </Alert>
      ) : (
        <Alert title="Falta enviar a mensagem">Nenhum horário foi reservado. Envie a mensagem com o diagnóstico: o técnico avalia e, se precisar retirar a TV, te envia um link para você escolher o horário.</Alert>
      )}
      {done.demo && <Alert title="Modo demonstrativo">Este pedido não foi gravado em nenhum banco de dados.</Alert>}
      <p className="font-semibold">Último passo: toque em enviar no WhatsApp.</p>
      {done.whatsappUrl ? (
        <Button asChild className="self-start"><a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Enviar pelo WhatsApp<span className="sr-only"> (abre em nova aba)</span></a></Button>
      ) : (
        <Alert variant="error" title="WhatsApp ainda não configurado">Copie a mensagem abaixo e envie ao técnico.</Alert>
      )}
      <pre className="whitespace-pre-wrap rounded-card border border-border bg-surface p-4 text-sm">{done.message}</pre>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={copy}>Copiar mensagem</Button>
        <p role="status" className="text-sm font-semibold">{copied ? "Mensagem copiada." : ""}</p>
      </div>
      <p className="flex items-start gap-2 text-sm text-text-secondary"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Mesmo que você feche o WhatsApp sem enviar, {mode === "avaliacao" ? "o pedido continua registrado" : "a reserva continua registrada"} e aparece para o técnico.</p>
    </div>
  );
}
