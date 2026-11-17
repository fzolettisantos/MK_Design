"use client";

import * as React from "react";
import { Bell, Check, MapPin, MessageCircle, X } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

type Status = "pendente" | "confirmado" | "recusado" | "link";
interface Req {
  avaliacao?: boolean; id: string; protocolo: string; cliente: string; servico: string; quando: string; local: string; expira: string; status: Status }

/** DADOS DE EXEMPLO (fictícios). Nenhum número real é usado; nada é enviado. */
const initial: Req[] = [
  { id: "1", protocolo: "MK-EXEMPLO-A1", cliente: "Cliente Exemplo 1", servico: "Instalação de TV na parede", quando: "Amanhã, 14:00", local: "Bairro Exemplo, Cidade Exemplo", expira: "11h 20min", status: "pendente" },
  { id: "2", protocolo: "MK-EXEMPLO-B2", cliente: "Cliente Exemplo 2", servico: "Suporte articulado", quando: "Sábado, 09:00", local: "Outro Bairro, Cidade Exemplo", expira: "8h 05min", status: "pendente" },
  { id: "3", protocolo: "MK-EXEMPLO-C3", cliente: "Cliente Exemplo 3", servico: "Conserto de TV (retirada, sem diagnóstico)", quando: "Domingo, 21:00", local: "Bairro Exemplo, Cidade Exemplo", expira: "2h 40min", status: "pendente" },
  { id: "4", avaliacao: true, protocolo: "MK-EXEMPLO-D4", cliente: "Cliente Exemplo 4", servico: "Avaliação de TV (sem horário): Samsung, não liga", quando: "Sem horário", local: "Bairro Exemplo, Cidade Exemplo", expira: "—", status: "pendente" },
];

const INVITE = "/agendamento/prototipo?convite=EXEMPLO";

const reply = (r: Req, ok: boolean) =>
  r.avaliacao
    ? `Olá, ${r.cliente}! Analisei o que você enviou e preciso retirar a TV para avaliar melhor. Escolha o melhor dia e horário por este link: ${INVITE} (link individual, válido por tempo limitado). (Protocolo ${r.protocolo})`
    : ok
    ? `Olá, ${r.cliente}! Seu horário está CONFIRMADO: ${r.servico}, ${r.quando}. Qualquer imprevisto, é só avisar por aqui. (Protocolo ${r.protocolo})`
    : `Olá, ${r.cliente}! Infelizmente não consigo atender ${r.quando}. Posso sugerir outro horário? Responda com o que for melhor para você. (Protocolo ${r.protocolo})`;

export function TechnicianProto() {
  const [list, setList] = React.useState(initial);
  const [open, setOpen] = React.useState<string | null>(null);
  const set = (id: string, status: Status) => { setList((l) => l.map((r) => (r.id === id ? { ...r, status } : r))); setOpen(id); };
  const pend = list.filter((r) => r.status === "pendente").length;

  return (
    <div className="flex flex-col gap-6">
      <Alert title="Protótipo com dados de exemplo">Nada é enviado. Os botões mostram a mensagem que abriria no WhatsApp do cliente.</Alert>
      <p className="flex items-center gap-2 font-semibold"><Bell className="size-5" aria-hidden="true" />{pend} {pend === 1 ? "pedido aguardando" : "pedidos aguardando"} sua resposta</p>
      <ul className="flex flex-col gap-4">
        {list.map((r) => (
          <li key={r.id}>
            <Card className={cn("flex flex-col gap-3", r.status === "confirmado" && "border-success", r.status === "recusado" && "opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-heading text-xl font-bold">{r.quando}</p>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold">
                  {r.status === "pendente" ? (r.avaliacao ? "Aguardando você" : `Expira em ${r.expira}`) : r.status === "confirmado" ? "Confirmado" : r.status === "link" ? "Link enviado" : "Recusado"}
                </span>
              </div>
              <p className="font-semibold">{r.servico}</p>
              <p className="text-sm text-text-secondary">{r.cliente} · <MapPin className="inline size-4" aria-hidden="true" /> {r.local}</p>
              {r.status === "pendente" && r.avaliacao && (
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="dark" onClick={() => set(r.id, "link")}><MessageCircle aria-hidden="true" />Enviar link de agendamento</Button>
                  <Button type="button" variant="outline" onClick={() => set(r.id, "recusado")}><X aria-hidden="true" />Resolver por conversa</Button>
                </div>
              )}
              {r.status === "pendente" && !r.avaliacao && (
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="dark" onClick={() => set(r.id, "confirmado")}><Check aria-hidden="true" />Confirmar</Button>
                  <Button type="button" variant="outline" onClick={() => set(r.id, "recusado")}><X aria-hidden="true" />Recusar</Button>
                </div>
              )}
              {open === r.id && r.status !== "pendente" && !(r.avaliacao && r.status === "recusado") && (
                <div className="flex flex-col gap-2 rounded-card bg-surface-muted p-4 text-sm" role="status">
                  <p className="flex items-center gap-2 font-semibold"><MessageCircle className="size-4" aria-hidden="true" />Abriria o WhatsApp do cliente com:</p>
                  <p>{reply(r, r.status === "confirmado")}</p>
                  {r.status === "link" && <p className="text-text-secondary">O link é individual: já leva o serviço (retirada), o endereço e os dados do cliente, e expira sozinho. Ao reservar, o horário aparece aqui para você confirmar. <a className="underline" href={INVITE}>Abrir o link de exemplo</a></p>}
                  {r.status === "recusado" && <p className="text-text-secondary">O horário volta a ficar livre na hora, e o cliente recebe a sugestão de outros horários.</p>}
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
