"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, Check, Copy, LogOut, MapPin, MessageCircle, Phone, RefreshCw, Send, X } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { buildWhatsAppUrlTo } from "@/config/whatsapp";
import { fmtSlotLong } from "@/lib/booking/slot-format";
import { cancelAction, closeEvaluationAction, decideAction, inviteAction, logoutAction, type Notice } from "@/lib/scheduling/tech-actions";
import type { TechBooking } from "@/lib/scheduling/service";

interface Data { pending: TechBooking[]; evaluations: TechBooking[]; upcoming: TechBooking[] }

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
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  // Atualiza sozinho a cada 30 s com a aba visível (pedidos novos aparecem sem recarregar).
  React.useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 30_000);
    return () => clearInterval(t);
  }, [router]);

  const run = async (key: string, fn: () => Promise<Notice | { ok: true } | { ok: false; reason: string }>) => {
    setBusy(key); setError(null);
    try {
      const r = await fn();
      if (!r.ok) {
        if (r.reason === "nao_autorizado") return router.replace("/admin/entrar");
        setError(REASON[r.reason] ?? "Não foi possível concluir. Tente novamente.");
      } else if ("message" in r) {
        setNotices((n) => [r, ...n.filter((x) => x.id !== r.id)]);
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    }
    setBusy(null);
  };

  const copy = async (n: Notice) => {
    try { await navigator.clipboard.writeText(n.message); setCopied(n.id); } catch { setCopied(null); }
  };
  const svc = (b: TechBooking) => services[b.serviceSlug] ?? "Serviço";
  const total = data.pending.length + data.evaluations.length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="flex items-center gap-2 text-lg font-semibold"><Bell className="size-5" aria-hidden="true" />
          {total === 0 ? "Nenhum pedido aguardando você" : `${total} ${total === 1 ? "pedido aguardando" : "pedidos aguardando"} sua ação`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}><RefreshCw aria-hidden="true" />Atualizar</Button>
          <Button type="button" variant="outline" size="sm" onClick={async () => { await logoutAction(); router.replace("/admin/entrar"); }}><LogOut aria-hidden="true" />Sair</Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {notices.length > 0 && (
        <section aria-labelledby="avisar" className="flex flex-col gap-4">
          <h2 id="avisar" className="text-2xl">Falta avisar o cliente</h2>
          {notices.map((n) => (
            <Card key={n.id} className="flex flex-col gap-3 border-brand-ink bg-brand-primary">
              <p className="font-heading text-lg font-bold">{n.title}</p>
              <pre className="whitespace-pre-wrap rounded-card bg-surface p-3 text-sm">{n.message}</pre>
              <div className="flex flex-wrap gap-2">
                {n.url ? (
                  <Button asChild variant="dark"><a href={n.url} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Abrir WhatsApp<span className="sr-only"> (abre em nova aba)</span></a></Button>
                ) : <Alert variant="error">Telefone do cliente inválido: copie a mensagem.</Alert>}
                <Button type="button" variant="outline" onClick={() => void copy(n)}><Copy aria-hidden="true" />{copied === n.id ? "Copiado" : "Copiar"}</Button>
                <Button type="button" variant="ghost" onClick={() => setNotices((x) => x.filter((y) => y.id !== n.id))}><Check aria-hidden="true" />Pronto, já avisei</Button>
              </div>
            </Card>
          ))}
        </section>
      )}

      <section aria-labelledby="pend" className="flex flex-col gap-4">
        <h2 id="pend" className="text-2xl">Aguardando sua resposta ({data.pending.length})</h2>
        {data.pending.length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhum horário pedido no momento.</p>}
        {data.pending.map((b) => (
          <Card key={b.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-heading text-xl font-bold">{b.startIso ? fmtSlotLong(b.startIso) : "—"}</p>
              <span suppressHydrationWarning className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold">Expira em {left(b.expiresIso)}</span>
            </div>
            <Person b={b} service={svc(b)} />
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="dark" loading={busy === `c${b.id}`} disabled={busy !== null} aria-label={`Confirmar horário de ${b.name}`} onClick={() => void run(`c${b.id}`, () => decideAction({ id: b.id, decision: "confirmar" }))}><Check aria-hidden="true" />Confirmar</Button>
              <Button type="button" variant="outline" loading={busy === `r${b.id}`} disabled={busy !== null} aria-label={`Recusar horário de ${b.name}`} onClick={() => void run(`r${b.id}`, () => decideAction({ id: b.id, decision: "recusar" }))}><X aria-hidden="true" />Recusar</Button>
            </div>
          </Card>
        ))}
      </section>

      <section aria-labelledby="aval" className="flex flex-col gap-4">
        <h2 id="aval" className="text-2xl">Avaliações de conserto ({data.evaluations.length})</h2>
        {data.evaluations.length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhuma avaliação pendente.</p>}
        {data.evaluations.map((b) => {
          const talk = buildWhatsAppUrlTo(b.phone, `Olá, ${b.name.split(" ")[0]}! Aqui é da MK Design, sobre o seu pedido ${b.protocol}. Vamos conversar?`);
          return (
            <Card key={b.id} className="flex flex-col gap-3">
              <p className="font-heading text-xl font-bold">{svc(b)}</p>
              <Person b={b} service={null} />
              <p className="rounded-card bg-surface-muted p-3 text-sm">
                <strong>Diagnóstico:</strong> {[b.brand && `marca ${b.brand}`, b.symptoms.length > 0 && b.symptoms.join(", "), b.notes].filter(Boolean).join(" · ") || "não informado"}
              </p>
              {b.inviteActiveIso && <p suppressHydrationWarning className="text-sm font-semibold">Convite enviado: expira em {left(b.inviteActiveIso)}. O cliente ainda não escolheu o horário.</p>}
              {!b.inviteActiveIso && b.hadInvite && <Alert variant="error" title="O convite expirou sem resposta">O cliente não escolheu um horário. Envie um novo convite ou fale com ele.</Alert>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="dark" loading={busy === `i${b.id}`} disabled={busy !== null} aria-label={`Enviar link de agendamento para ${b.name}`} onClick={() => void run(`i${b.id}`, () => inviteAction({ id: b.id }))}><Send aria-hidden="true" />{b.hadInvite ? "Enviar novo link" : "Enviar link de agendamento"}</Button>
                {talk && <Button asChild variant="outline"><a href={talk} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chamar no WhatsApp<span className="sr-only"> (abre em nova aba)</span></a></Button>}
                <Button type="button" variant="ghost" disabled={busy !== null} aria-label={`Resolver por conversa o pedido de ${b.name}`} onClick={() => { if (window.confirm("Marcar como resolvido por conversa? O pedido sai da lista.")) void run(`x${b.id}`, () => closeEvaluationAction({ id: b.id })); }}>Resolver por conversa</Button>
              </div>
            </Card>
          );
        })}
      </section>

      <section aria-labelledby="prox" className="flex flex-col gap-4">
        <h2 id="prox" className="text-2xl">Próximos atendimentos ({data.upcoming.length})</h2>
        {data.upcoming.length === 0 && <p className="rounded-card bg-surface-muted p-5">Nenhum atendimento confirmado.</p>}
        {data.upcoming.map((b) => {
          const talk = buildWhatsAppUrlTo(b.phone, `Olá, ${b.name.split(" ")[0]}! Aqui é da MK Design, sobre o seu atendimento (${b.protocol}).`);
          return (
            <Card key={b.id} className="flex flex-col gap-3 border-success">
              <p className="flex items-center gap-2 font-heading text-xl font-bold"><CalendarClock className="size-5" aria-hidden="true" />{b.startIso ? fmtSlotLong(b.startIso) : "—"}</p>
              <Person b={b} service={svc(b)} />
              <div className="flex flex-wrap gap-2">
                {talk && <Button asChild variant="outline"><a href={talk} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chamar<span className="sr-only"> {b.name} no WhatsApp (abre em nova aba)</span></a></Button>}
                <Button type="button" variant="ghost" disabled={busy !== null} aria-label={`Cancelar atendimento de ${b.name}`} onClick={() => { if (window.confirm(`Cancelar o atendimento de ${b.name}? O horário volta a ficar livre.`)) void run(`k${b.id}`, () => cancelAction({ id: b.id })); }}>Cancelar atendimento</Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Person({ b, service }: { b: TechBooking; service: string | null }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {service && <p className="font-semibold">{service}{b.tvSize ? ` · TV ${b.tvSize}` : ""}</p>}
      <p><strong>{b.name}</strong> · <Phone className="inline size-4" aria-hidden="true" /> {b.phone}</p>
      <p><MapPin className="inline size-4" aria-hidden="true" /> {b.neighborhood}, {b.city}</p>
      {b.notes && !service?.length ? null : b.notes && <p className="text-text-secondary">Obs.: {b.notes}</p>}
      <p className="text-text-secondary">Protocolo {b.protocol}</p>
    </div>
  );
}
