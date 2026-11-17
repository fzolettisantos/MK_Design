"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, MessageCircle, Truck } from "lucide-react";
import { CategoryIcon } from "@/components/services/category-icon";
import { Alert, Button, Card, Field, Input, SelectableCard } from "@/components/ui";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/config/whatsapp";
import {
  buildDays, hourLabel, HOLD_SECONDS, MAX_DAYS_AHEAD, MIN_LEAD_HOURS, PERIODS, SLOT_MINUTES, type Day,
} from "@/lib/booking/proto-slots";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types";

type Mode = "agenda" | "avaliacao" | "retirada";
type Step = "servico" | "modo" | "local" | "horario" | "dados" | "pronto";

const nowMs = () => Date.now();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function ProtoBooking({ services, categories, nowIso, invite = false }: { services: Service[]; categories: ServiceCategory[]; nowIso: string; invite?: boolean }) {
  // Convite do técnico: serviço (retirada), endereço e contato já vêm do pedido; o cliente só escolhe o horário.
  const [step, setStep] = React.useState<Step>(invite ? "horario" : "servico");
  const [service, setService] = React.useState<Service | null>(invite ? (services.find((s) => s.slug === "solicitar-conserto-de-tv") ?? null) : null);
  const [mode, setMode] = React.useState<Mode>(invite ? "retirada" : "agenda");
  const [place, setPlace] = React.useState(invite ? { cep: "", bairro: "Bairro Exemplo", cidade: "Cidade Exemplo" } : { cep: "", bairro: "", cidade: "" });
  const [diag, setDiag] = React.useState<{ brand: string; symptoms: string[] }>({ brand: "", symptoms: [] });
  const [days] = React.useState<Day[]>(() => buildDays(new Date(nowIso)));
  const deadline = React.useRef(0);
  const [dayKey, setDayKey] = React.useState<string | null>(null);
  const [slot, setSlot] = React.useState<{ key: string; hour: number } | null>(null);
  const [left, setLeft] = React.useState(HOLD_SECONDS);
  const [expired, setExpired] = React.useState(false);
  const [contact, setContact] = React.useState(invite ? { name: "Cliente Exemplo", phone: "(13) 00000-0000", notes: "" } : { name: "", phone: "", notes: "" });
  const [error, setError] = React.useState<string | null>(null);
  const headRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => headRef.current?.focus(), [step]);

  // Contador da reserva temporária: prazo absoluto (não deriva se a aba ficar em segundo plano).
  React.useEffect(() => {
    if (!slot || step === "pronto") return;
    const id = setInterval(() => {
      const r = Math.ceil((deadline.current - nowMs()) / 1000);
      if (r <= 0) {
        clearInterval(id);
        setSlot(null);
        setExpired(true);
        setStep("horario");
      } else setLeft(r);
    }, 1000);
    return () => clearInterval(id);
  }, [slot, step]);

  const day = days.find((d) => d.key === dayKey);
  const repair = service?.categoryId === "assistencia-tecnica";
  const goBack: Record<Step, Step | null> = {
    servico: null, modo: "servico", local: repair ? "modo" : "servico",
    horario: "local", dados: mode === "avaliacao" ? "local" : "horario", pronto: null,
  };

  const pickService = (s: Service) => {
    setService(s);
    setSlot(null);
    if (s.categoryId === "assistencia-tecnica") {
      setMode("avaliacao");
      setStep("modo");
    } else {
      setMode("agenda");
      setStep("local");
    }
  };

  const pickSlot = (key: string, hour: number) => {
    setSlot({ key, hour });
    deadline.current = nowMs() + HOLD_SECONDS * 1000;
    setLeft(HOLD_SECONDS);
    setExpired(false);
  };

  const submitPlace = () => {
    if (!place.bairro.trim() || !place.cidade.trim()) return setError("Informe o bairro e a cidade.");
    setError(null);
    setStep(mode === "avaliacao" ? "dados" : "horario");
  };

  const submitContact = () => {
    if (contact.name.trim().length < 2) return setError("Informe seu nome.");
    if (mode === "avaliacao" && (!diag.brand || diag.symptoms.length === 0)) return setError("Escolha a marca e marque ao menos um problema.");
    if (!/^\d{10,11}$/.test(contact.phone.replace(/\D/g, ""))) return setError("Informe DDD e número, ex.: (13) 91234-5678.");
    setError(null);
    setStep("pronto");
  };

  const when = slot && days.find((d) => d.key === slot.key);
  const whenText = when && slot ? `${cap(format(when.date, "EEEE, dd/MM", { locale: ptBR }))} às ${hourLabel(slot.hour)}` : "";
  const message = buildWhatsAppMessage({
    protocolo: "MK-PROTOTIPO",
    servico: `${service?.name ?? ""}${mode === "retirada" ? " (retirada da TV para conserto, sem diagnóstico prévio)" : ""}`,
    detalhes: mode === "avaliacao" ? [`marca ${diag.brand}`, `problema: ${diag.symptoms.join(", ")}`, contact.notes && `obs.: ${contact.notes}`].filter(Boolean).join("; ") : mode === "retirada" && invite ? "Retirada agendada pelo link enviado pelo técnico" : contact.notes || "—",
    localidade: `${place.bairro}/${place.cidade}`,
    data: when ? format(when.date, "dd/MM/yyyy") : "A combinar (sem agenda)",
    hora: slot ? hourLabel(slot.hour) : "A combinar",
    nome: contact.name,
  });
  const waUrl = buildWhatsAppUrl(message);

  return (
    <div className="flex flex-col gap-8">
      <Alert title="Protótipo clicável">
        Os horários ocupados e o deslocamento são <strong>exemplos</strong>. Nada é gravado nem enviado. Serve para
        validar o fluxo antes de ligar o banco de dados.
      </Alert>

      {invite && (
        <Alert title="Convite do técnico: retirada da TV">
          O técnico pediu para retirar sua TV. Escolha abaixo o dia e a hora que ficam melhores para você. Seu endereço e seus dados já estão no pedido.
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <h2 ref={headRef} tabIndex={-1} className="text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] outline-none">
          {{
            servico: "Qual serviço você precisa?",
            modo: "Como você quer seguir?",
            local: "Onde será o atendimento?",
            horario: "Escolha o dia e a hora",
            dados: "Quase lá: seus dados",
            pronto: mode === "avaliacao" ? "Pedido pronto para enviar" : "Horário reservado para você",
          }[step]}
        </h2>

        {step === "servico" && (
          <div className="flex flex-col gap-6">
            {categories.map((c) => (
              <div key={c.id} className="flex flex-col gap-3">
                <p className="text-lg font-semibold">{c.name}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.filter((s) => s.categoryId === c.id).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickService(s)}
                      className="flex min-h-16 items-center gap-3 rounded-card border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-muted"
                    >
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
            <p className="text-text-secondary">
              Para conserto e diagnóstico, a agenda só abre se você quiser que o técnico <strong>retire a TV</strong>.
            </p>
            <fieldset className="grid gap-3">
              <legend className="sr-only">Como seguir</legend>
              <SelectableCard type="radio" name="modo" checked={mode === "avaliacao"} onChange={() => setMode("avaliacao")}
                title="Quero uma avaliação primeiro" description="Sem agendar agora. Você descreve o problema e envia ao técnico pelo WhatsApp. Se ele precisar retirar a TV, te envia um link para você escolher o horário." />
              <SelectableCard type="radio" name="modo" checked={mode === "retirada"} onChange={() => setMode("retirada")}
                title="Quero que o técnico retire a TV para o conserto" description="Escolha o dia e a hora para a retirada, mesmo sem diagnóstico." />
            </fieldset>
            {mode === "retirada" && (
              <Alert variant="error" title="Atenção: retirada sem diagnóstico prévio">
                <span className="text-brand-ink">
                  O técnico levará a TV mesmo sem saber o defeito. O orçamento é informado pela equipe depois da
                  avaliação, e você poderá decidir como seguir. <em>(Texto a confirmar com o técnico.)</em>
                </span>
              </Alert>
            )}
            <Button type="button" variant="dark" className="self-start" onClick={() => setStep("local")}>
              Continuar <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        )}

        {step === "local" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <p className="text-text-secondary sm:col-span-2">
              Usamos o endereço para calcular o deslocamento do técnico e mostrar só os horários em que ele consegue chegar.
            </p>
            <Field label="CEP (opcional)">{(a) => <Input {...a} inputMode="numeric" value={place.cep} onChange={(e) => setPlace({ ...place, cep: e.target.value })} />}</Field>
            <Field label="Bairro" required>{(a) => <Input {...a} value={place.bairro} onChange={(e) => setPlace({ ...place, bairro: e.target.value })} />}</Field>
            <Field label="Cidade" required>{(a) => <Input {...a} value={place.cidade} onChange={(e) => setPlace({ ...place, cidade: e.target.value })} />}</Field>
            <div className="sm:col-span-2">
              <Button type="button" variant="dark" onClick={submitPlace}>
                {mode === "avaliacao" ? "Continuar" : "Ver horários"} <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {step === "horario" && (
          <div className="flex flex-col gap-6">
            {expired && (
              <Alert variant="error" title="Sua reserva temporária expirou">
                O horário voltou a ficar disponível para outros clientes. Escolha novamente.
              </Alert>
            )}
            <p className="text-text-secondary">
              Atendimento todos os dias, a qualquer hora, em blocos de {SLOT_MINUTES} minutos. Agendamentos com pelo
              menos {MIN_LEAD_HOURS}h de antecedência, até {MAX_DAYS_AHEAD} dias à frente.
            </p>

            <div role="group" aria-label="Escolha o dia" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
              {days.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  disabled={d.free === 0}
                  aria-pressed={dayKey === d.key}
                  onClick={() => setDayKey(d.key)}
                  className={cn(
                    "relative flex min-h-16 w-16 shrink-0 flex-col items-center justify-center rounded-card border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    dayKey === d.key ? "border-brand-ink bg-brand-primary" : "border-border bg-surface hover:bg-surface-muted",
                  )}
                >
                  <span className="text-xs font-semibold uppercase">{format(d.date, "EEE", { locale: ptBR }).replace(".", "")}</span>
                  <span className="font-heading text-xl font-bold">{format(d.date, "dd")}</span>
                  <span className="text-[0.7rem]">{format(d.date, "MMM", { locale: ptBR }).replace(".", "")}</span>
                  <span className="sr-only">{d.free === 0 ? ", sem horários" : `, ${d.free} horários livres`}</span>
                </button>
              ))}
            </div>

            {!day ? (
              <p className="rounded-card bg-surface-muted p-5">Toque em um dia para ver os horários livres.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {PERIODS.map((p) => {
                  const list = day.slots.filter((s) => s.hour >= p.from && s.hour < p.to && s.state !== "passado");
                  if (list.length === 0) return null;
                  return (
                    <div key={p.id} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{p.label}</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {list.map((s) => {
                          const sel = slot?.key === day.key && slot.hour === s.hour;
                          const free = s.state === "livre";
                          return (
                            <button
                              key={s.hour}
                              type="button"
                              disabled={!free}
                              aria-pressed={sel}
                              onClick={() => pickSlot(day.key, s.hour)}
                              className={cn(
                                "relative flex min-h-12 items-center justify-center gap-1 rounded-button border-2 px-2 font-semibold transition-colors",
                                sel ? "border-brand-ink bg-brand-primary" : free ? "border-brand-ink bg-surface hover:bg-surface-muted" : "cursor-not-allowed border-border bg-surface-muted text-text-secondary line-through",
                              )}
                            >
                              {s.state === "deslocamento" && <Truck className="size-4 no-underline" aria-hidden="true" />}
                              {hourLabel(s.hour)}
                              {!free && <span className="sr-only"> (indisponível)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                  <li>Riscado: ocupado (exemplo)</li>
                  <li className="flex items-center gap-1"><Truck className="size-4" aria-hidden="true" /> Riscado com caminhão: deslocamento do técnico (exemplo)</li>
                </ul>
              </div>
            )}

            {slot && when && (
              <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-card bg-brand-ink p-4 text-surface shadow-md sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2">
                  <CalendarCheck className="size-5 shrink-0 text-brand-primary" aria-hidden="true" />
                  <span><strong>{whenText}</strong> · {SLOT_MINUTES} min</span>
                </p>
                <Button type="button" onClick={() => setStep(invite ? "pronto" : "dados")}>
                  Reservar este horário <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === "dados" && (
          <div className="flex flex-col gap-6">
            {slot && when && (
              <div role="timer" aria-label="Tempo restante da reserva temporária" className="flex items-center gap-3 rounded-card bg-brand-primary p-4 font-semibold">
                <Clock className="size-5 shrink-0" aria-hidden="true" />
                <span>{whenText}: reservado para você por <span className="font-heading text-xl">{fmtTime(left)}</span> enquanto você preenche.</span>
              </div>
            )}
            {mode === "avaliacao" && (
              <Alert>Sem horário reservado. O técnico analisa o que você descrever e responde pelo WhatsApp. Se for preciso retirar a TV, ele envia um link para você escolher o horário.</Alert>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" required>{(a) => <Input {...a} autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />}</Field>
              <Field label="WhatsApp" required hint="Com DDD.">{(a) => <Input {...a} type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />}</Field>
              {mode === "avaliacao" && (
                <>
                  <Field label="Marca da TV" required>
                    {(a) => (
                      <select {...a} value={diag.brand} onChange={(e) => setDiag({ ...diag, brand: e.target.value })} className="h-12 w-full rounded-input border border-neutral-mid bg-surface px-4">
                        <option value="">Selecione</option>
                        {["Samsung", "Sony", "TCL", "LG", "Philips", "Outra marca"].map((b) => <option key={b}>{b}</option>)}
                      </select>
                    )}
                  </Field>
                  <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-semibold">O que está acontecendo? <span aria-hidden="true">*</span></legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Não liga", "Sem imagem", "Sem som", "Imagem com falhas", "Entradas/conexões", "Outro"].map((sy) => (
                        <SelectableCard key={sy} type="checkbox" title={sy} checked={diag.symptoms.includes(sy)}
                          onChange={(e) => setDiag({ ...diag, symptoms: e.target.checked ? [...diag.symptoms, sy] : diag.symptoms.filter((x) => x !== sy) })} />
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
              <Field label="Detalhes (opcional)" className="sm:col-span-2" hint="Tamanho da TV, tipo de parede, o que está acontecendo…">
                {(a) => <Input {...a} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} />}
              </Field>
            </div>
          </div>
        )}

        {step === "pronto" && (
          <div className="flex flex-col gap-6">
            <span className="grid size-14 place-items-center rounded-full bg-brand-primary"><Check className="size-7" aria-hidden="true" /></span>
            {mode !== "avaliacao" ? (
              <Alert title={`${whenText} reservado para você`}>
                <span className="text-brand-ink">
                  Este horário já está bloqueado para outros clientes, mas <strong>só será confirmado após a confirmação do técnico</strong>.
                  Você recebe a resposta pelo WhatsApp em até 12 horas. Se não houver resposta, o horário volta a ficar livre.
                </span>
              </Alert>
            ) : (
              <Alert title="Falta enviar a mensagem">
                Nenhum horário foi reservado. Envie a mensagem com o diagnóstico: o técnico avalia e, se precisar retirar a TV, te envia um link para você escolher o horário.
              </Alert>
            )}
            <p className="font-semibold">Último passo: toque em enviar no WhatsApp.</p>
            {waUrl ? (
              <Button asChild className="self-start">
                <a href={waUrl} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Enviar pelo WhatsApp<span className="sr-only"> (abre em nova aba)</span></a>
              </Button>
            ) : (
              <Alert variant="error" title="WhatsApp não configurado">Defina NEXT_PUBLIC_WHATSAPP_NUMBER para ativar o botão.</Alert>
            )}
            <pre className="whitespace-pre-wrap rounded-card border border-border bg-surface p-4 text-sm">{message}</pre>
            <p className="flex items-start gap-2 text-sm text-text-secondary">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Mesmo que você feche o WhatsApp sem enviar, a solicitação continua registrada e aparece para o técnico.
            </p>
            <Button type="button" variant="outline" className="self-start" onClick={() => { setStep("servico"); setSlot(null); setDayKey(null); }}>
              Recomeçar o protótipo
            </Button>
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        {step !== "servico" && step !== "pronto" && !(invite && step === "horario") && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={() => { setError(null); const b = goBack[step]; if (b) setStep(b); }}>
              <ArrowLeft aria-hidden="true" /> Voltar
            </Button>
            {step === "dados" && (
              <Button type="button" variant="dark" onClick={submitContact}>
                {mode === "avaliacao" ? "Preparar mensagem" : "Concluir reserva"} <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
      <Card className="bg-surface-muted text-sm text-text-secondary">
        Fluxo: serviço → (conserto: avaliação ou retirada) → local → dia e hora → dados → WhatsApp. O técnico confirma pelo WhatsApp ou no painel.
      </Card>
    </div>
  );
}
