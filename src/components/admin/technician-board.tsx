"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarClock, Check, CheckCircle2, Copy, LogOut, MapPin, MessageCircle, Phone, RefreshCw, Send, XCircle } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { buildWhatsAppUrlTo } from "@/config/whatsapp";
import { fmtSlotLong } from "@/lib/booking/slot-format";
import { cancelAction, closeEvaluationAction, decideAction, inviteAction, logoutAction, type Notice } from "@/lib/scheduling/tech-actions";
import type { TechBooking } from "@/lib/scheduling/service";
import { cn } from "@/lib/utils";

interface Data { pending: TechBooking[]; evaluations: TechBooking[]; upcoming: TechBooking[] }
type Tab = "aguardando" | "avaliacoes" | "proximos";
type State = "confirmado" | "recusado" | "cancelado" | "convite";
interface Handled { id: string; tab: Tab; state: State; booking: TechBooking; notice: Notice }

/** Cor + ícone + texto (nunca só cor): verde = confirmado, vermelho = recusado, amarelo = cancelado. */
const LOOK: Record<State, { card: string; badge: string; label: string; Icon: typeof Check }> = {
  confirmado: { card: "border-success bg-success/10", badge: "bg-success text-surface", label: "Confirmado", Icon: CheckCircle2 },
  recusado: { card: "border-error bg-error/10", badge: "bg-error text-surface", label: "Recusado", Icon: XCircle },
  cancelado: { card: "border-brand-ink bg-brand-primary", badge: "bg-brand-ink text-surface", label: "Cancelado", Icon: Ban },
  convite: { card: "border-brand-ink bg-surface-muted", badge: "bg-brand-ink text-surface", label: "Link criado", Icon: Send },
};

const TABS: { id: Tab; label: string }[] = [
  { id: "aguardando", label: "Aguardando sua resposta" },
  { id: "avaliacoes", label: "Avaliações de conserto" },
  { id: "proximos", label: "Próximos atendimentos" },
];

function left(iso: string | null) {
  if (!iso) return "";
  const m = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}min` : `${m} min`;
}
const REASON: Record<string, string> = {
  status_invalido: "Este pedido já foi atendido ou expirou. A lista foi atualizada.",
  nao_encontrado: "Pedido não encontrado.",
  indisponivel: "Não foi possível falar com o banco de dados agora. Tente de novo.",
};

export function TechnicianBoard({ data, services }: { data: Data; services: Record<string, string> }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("aguardando");
  const [handled, setHandled] = React.useState<Handled[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({ aguardando: null, avaliacoes: null, proximos: null });

  // Atualiza sozinho a cada 30 s com a aba do navegador visível.
  React.useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 30_000);
    return () => clearInterval(t);
  }, [router]);

  const svc = (b: TechBooking) => services[b.serviceSlug] ?? "Serviço";

  const run = async (
    key: string,
    fn: () => Promise<Notice | { ok: true } | { ok: false; reason: string }>,
    ctx?: { tab: Tab; state: State; booking: TechBooking },
  ) => {
    setBusy(key); setError(null);
    try {
      const r = await fn();
      if (!r.ok) {
        if (r.reason === "nao_autorizado") return router.replace("/admin/entrar");
        setError(REASON[r.reason] ?? "Não foi possível concluir. Tente novamente.");
      } else if ("message" in r && ctx) {
        setHandled((h) => [{ id: ctx.booking.id, ...ctx, notice: r }, ...h.filter((x) => x.id !== ctx.booking.id)]);
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    }
    setBusy(null);
  };

  const dismiss = (id: string) => setHandled((h) => h.filter((x) => x.id !== id));
  const copy = async (n: Notice) => { try { await navigator.clipboard.writeText(n.message); setCopied(n.id); } catch { setCopied(null); } };

  const handledIds = new Set(handled.map((h) => h.id));
  const counts: Record<Tab, number> = {
    aguardando: data.pending.filter((b) => !handledIds.has(b.id)).length,
    avaliacoes: data.evaluations.filter((b) => !handledIds.has(b.id)).length,
    proximos: data.upcoming.filter((b) => !handledIds.has(b.id)).length,
  };
  const todo = counts.aguardando + counts.avaliacoes;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const to = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i + TABS.length - 1) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    const id = TABS[to]!.id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  const handledFor = (t: Tab) => handled.filter((h) => h.tab === t);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-lg font-semibold">
          {todo === 0 ? "Nenhum pedido aguardando você" : `${todo} ${todo === 1 ? "pedido aguardando" : "pedidos aguardando"} sua ação`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}><RefreshCw aria-hidden="true" />Atualizar</Button>
          <Button type="button" variant="outline" size="sm" onClick={async () => { await logoutAction(); router.replace("/admin/entrar"); }}><LogOut aria-hidden="true" />Sair</Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div role="tablist" aria-label="Seções do painel" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
        {TABS.map((t, i) => (
          <button
            key={t.id} ref={(el) => { tabRefs.current[t.id] = el; }}
            id={`tab-${t.id}`} type="button" role="tab" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={cn("relative flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-5 font-semibold transition-colors",
              tab === t.id ? "border-brand-ink bg-brand-ink text-surface" : "border-brand-ink bg-surface hover:bg-surface-muted")}
          >
            {t.label}
            <span className={cn("grid min-w-6 place-items-center rounded-full px-2 text-sm", tab === t.id ? "bg-brand-primary text-brand-ink" : "bg-brand-ink text-surface")}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------- Aguardando */}
      <div id="panel-aguardando" role="tabpanel" aria-labelledby="tab-aguardando" hidden={tab !== "aguardando"} className="flex flex-col gap-4">
        {handledFor("aguardando").map((h) => <HandledCard key={h.id} h={h} service={svc(h.booking)} copied={copied} onCopy={copy} onDismiss={dismiss} />)}
        {counts.aguardando === 0 && handledFor("aguardando").length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhum horário pedido no momento.</p>}
        {data.pending.filter((b) => !handledIds.has(b.id)).map((b) => (
          <Card key={b.id} data-state="pendente" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-heading text-xl font-bold">{b.startIso ? fmtSlotLong(b.startIso) : "—"}</p>
              <span suppressHydrationWarning className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold">Expira em {left(b.expiresIso)}</span>
            </div>
            <Person b={b} service={svc(b)} />
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="dark" loading={busy === `c${b.id}`} disabled={busy !== null} aria-label={`Confirmar horário de ${b.name}`}
                onClick={() => void run(`c${b.id}`, () => decideAction({ id: b.id, decision: "confirmar" }), { tab: "aguardando", state: "confirmado", booking: b })}><Check aria-hidden="true" />Confirmar</Button>
              <Button type="button" variant="outline" loading={busy === `r${b.id}`} disabled={busy !== null} aria-label={`Recusar horário de ${b.name}`}
                onClick={() => void run(`r${b.id}`, () => decideAction({ id: b.id, decision: "recusar" }), { tab: "aguardando", state: "recusado", booking: b })}><XCircle aria-hidden="true" />Recusar</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ---------------------------------------------------------------- Avaliações */}
      <div id="panel-avaliacoes" role="tabpanel" aria-labelledby="tab-avaliacoes" hidden={tab !== "avaliacoes"} className="flex flex-col gap-4">
        {handledFor("avaliacoes").map((h) => <HandledCard key={h.id} h={h} service={svc(h.booking)} copied={copied} onCopy={copy} onDismiss={dismiss} />)}
        {counts.avaliacoes === 0 && handledFor("avaliacoes").length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhuma avaliação pendente.</p>}
        {data.evaluations.filter((b) => !handledIds.has(b.id)).map((b) => {
          const talk = buildWhatsAppUrlTo(b.phone, `Olá, ${b.name.split(" ")[0]}! Aqui é da MK Design, sobre o seu pedido ${b.protocol}. Vamos conversar?`);
          return (
            <Card key={b.id} data-state="avaliacao" className="flex flex-col gap-3">
              <p className="font-heading text-xl font-bold">{svc(b)}</p>
              <Person b={b} service={null} />
              <p className="rounded-card bg-surface-muted p-3 text-sm">
                <strong>Diagnóstico:</strong> {[b.brand && `marca ${b.brand}`, b.symptoms.length > 0 && b.symptoms.join(", "), b.notes].filter(Boolean).join(" · ") || "não informado"}
              </p>
              {b.inviteActiveIso && <p suppressHydrationWarning className="text-sm font-semibold">Convite enviado: expira em {left(b.inviteActiveIso)}. O cliente ainda não escolheu o horário.</p>}
              {!b.inviteActiveIso && b.hadInvite && <Alert variant="error" title="O convite expirou sem resposta">O cliente não escolheu um horário. Envie um novo convite ou fale com ele.</Alert>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="dark" loading={busy === `i${b.id}`} disabled={busy !== null} aria-label={`Enviar link de agendamento para ${b.name}`}
                  onClick={() => void run(`i${b.id}`, () => inviteAction({ id: b.id }), { tab: "avaliacoes", state: "convite", booking: b })}><Send aria-hidden="true" />{b.hadInvite ? "Enviar novo link" : "Enviar link de agendamento"}</Button>
                {talk && <Button asChild variant="outline"><a href={talk} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chamar no WhatsApp<span className="sr-only"> (abre em nova aba)</span></a></Button>}
                <Button type="button" variant="ghost" disabled={busy !== null} aria-label={`Resolver por conversa o pedido de ${b.name}`}
                  onClick={() => { if (window.confirm("Marcar como resolvido por conversa? O pedido sai da lista.")) void run(`x${b.id}`, () => closeEvaluationAction({ id: b.id })); }}>Resolver por conversa</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------- Próximos */}
      <div id="panel-proximos" role="tabpanel" aria-labelledby="tab-proximos" hidden={tab !== "proximos"} className="flex flex-col gap-4">
        {handledFor("proximos").map((h) => <HandledCard key={h.id} h={h} service={svc(h.booking)} copied={copied} onCopy={copy} onDismiss={dismiss} />)}
        {counts.proximos === 0 && handledFor("proximos").length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhum atendimento confirmado.</p>}
        {data.upcoming.filter((b) => !handledIds.has(b.id)).map((b) => {
          const talk = buildWhatsAppUrlTo(b.phone, `Olá, ${b.name.split(" ")[0]}! Aqui é da MK Design, sobre o seu atendimento (${b.protocol}).`);
          return (
            <Card key={b.id} data-state="confirmado-lista" className="flex flex-col gap-3 border-success">
              <p className="flex items-center gap-2 font-heading text-xl font-bold"><CalendarClock className="size-5" aria-hidden="true" />{b.startIso ? fmtSlotLong(b.startIso) : "—"}</p>
              <Person b={b} service={svc(b)} />
              <div className="flex flex-wrap gap-2">
                {talk && <Button asChild variant="outline"><a href={talk} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chamar<span className="sr-only"> {b.name} no WhatsApp (abre em nova aba)</span></a></Button>}
                <Button type="button" variant="ghost" loading={busy === `k${b.id}`} disabled={busy !== null} aria-label={`Cancelar atendimento de ${b.name}`}
                  onClick={() => { if (window.confirm(`Cancelar o atendimento de ${b.name}? O horário volta a ficar livre e o cliente recebe um link para escolher outro.`)) void run(`k${b.id}`, () => cancelAction({ id: b.id }), { tab: "proximos", state: "cancelado", booking: b }); }}>Cancelar atendimento</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function HandledCard({ h, service, copied, onCopy, onDismiss }: {
  h: Handled; service: string; copied: string | null; onCopy: (n: Notice) => void; onDismiss: (id: string) => void;
}) {
  const look = LOOK[h.state];
  const hasLink = h.notice.message.includes("/agendamento/convite/");
  return (
    <Card data-state={h.state} className={cn("flex flex-col gap-3 border-2", look.card)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-heading text-xl font-bold">{h.booking.startIso ? fmtSlotLong(h.booking.startIso) : service}</p>
        <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", look.badge)}><look.Icon className="size-4" aria-hidden="true" />{look.label}</span>
      </div>
      <Person b={h.booking} service={service} />
      <p className="font-semibold">Falta avisar {h.booking.name}:</p>
      <pre className="whitespace-pre-wrap break-words rounded-card bg-surface p-3 text-sm text-brand-ink [overflow-wrap:anywhere]">{h.notice.message}</pre>
      {h.state === "cancelado" && !hasLink && <Alert variant="error">Não foi possível gerar o link de reagendamento. A mensagem pede para combinar outro horário.</Alert>}
      {h.state === "cancelado" && hasLink && <p className="text-sm font-semibold">A mensagem leva um link individual (48 h) para o cliente escolher outro dia e horário.</p>}
      <div className="flex flex-wrap gap-2">
        {h.notice.url ? (
          <Button asChild variant="dark"><a href={h.notice.url} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Abrir WhatsApp<span className="sr-only"> (abre em nova aba)</span></a></Button>
        ) : <Alert variant="error">Telefone do cliente inválido: copie a mensagem.</Alert>}
        <Button type="button" variant="outline" onClick={() => onCopy(h.notice)}><Copy aria-hidden="true" />{copied === h.notice.id ? "Copiado" : "Copiar"}</Button>
        <Button type="button" variant="ghost" onClick={() => onDismiss(h.id)}><Check aria-hidden="true" />Pronto, já avisei</Button>
      </div>
    </Card>
  );
}

function Person({ b, service }: { b: TechBooking; service: string | null }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {service && <p className="font-semibold">{service}{b.tvSize ? ` · TV ${b.tvSize}` : ""}</p>}
      <p><strong>{b.name}</strong> · <Phone className="inline size-4" aria-hidden="true" /> {b.phone}</p>
      <p><MapPin className="inline size-4" aria-hidden="true" /> {b.neighborhood}, {b.city}</p>
      {service && b.notes && <p className="text-text-secondary">Obs.: {b.notes}</p>}
      <p className="text-text-secondary">Protocolo {b.protocol}</p>
    </div>
  );
}
