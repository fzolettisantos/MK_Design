"use client";

import * as React from "react";
import { Bell, BellOff, Copy, Send } from "lucide-react";
import { Alert, Button, Card } from "@/components/ui";
import { generateVapidAction, removePushAction, savePushAction, testPushAction } from "@/lib/scheduling/tech-actions";

const b64ToBytes = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

type Status = "carregando" | "sem_suporte" | "ativo" | "inativo" | "bloqueado";

/** Ativa/desativa o aviso de pedido novo neste aparelho (Web Push). */
export function NotificationsPanel({ configured, publicKey }: { configured: boolean; publicKey: string | null }) {
  const [status, setStatus] = React.useState<Status>("carregando");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [keys, setKeys] = React.useState<{ publicKey: string; privateKey: string } | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return alive && setStatus("sem_suporte");
      if (Notification.permission === "denied") return alive && setStatus("bloqueado");
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/admin" });
        const sub = await reg.pushManager.getSubscription();
        if (alive) setStatus(sub ? "ativo" : "inativo");
      } catch {
        if (alive) setStatus("sem_suporte");
      }
    })();
    return () => { alive = false; };
  }, []);

  const enable = async () => {
    if (!publicKey) return;
    setBusy(true); setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setStatus(perm === "denied" ? "bloqueado" : "inativo"); setBusy(false); return; }
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/admin" });
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) }));
      const r = await savePushAction(sub.toJSON());
      if (r.ok) { setStatus("ativo"); setMsg("Avisos ativados neste aparelho."); } else setMsg("Não foi possível salvar. Tente de novo.");
    } catch {
      setMsg("Não foi possível ativar os avisos neste aparelho.");
    }
    setBusy(false);
  };

  const disable = async () => {
    setBusy(true); setMsg(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { await removePushAction({ endpoint: sub.endpoint }); await sub.unsubscribe(); }
      setStatus("inativo"); setMsg("Avisos desativados neste aparelho.");
    } catch {
      setMsg("Não foi possível desativar agora.");
    }
    setBusy(false);
  };

  const test = async () => {
    setBusy(true); setMsg(null);
    const r = await testPushAction();
    setMsg(r.ok ? (r.sent > 0 ? `Aviso de teste enviado para ${r.sent} aparelho(s).` : "Nenhum aparelho ativo recebeu. Ative os avisos primeiro.") : "Não foi possível enviar o teste.");
    setBusy(false);
  };

  const generate = async () => {
    setBusy(true);
    const r = await generateVapidAction();
    if (r.ok) setKeys({ publicKey: r.publicKey, privateKey: r.privateKey });
    else setMsg("As chaves já estão configuradas.");
    setBusy(false);
  };

  if (!configured) {
    return (
      <Card className="flex flex-col gap-3 bg-surface-muted">
        <p className="flex items-center gap-2 font-heading text-lg font-bold"><Bell className="size-5" aria-hidden="true" />Avisos de pedido novo no celular</p>
        <p className="text-sm">Falta uma configuração única no servidor. Gere as chaves abaixo, cadastre na Vercel e publique de novo.</p>
        {!keys ? (
          <Button type="button" variant="dark" className="self-start" loading={busy} onClick={() => void generate()}>Gerar chaves</Button>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Alert title="Guarde a chave privada só na Vercel">Ela aparece uma vez. Não envie a ninguém nem salve em arquivos.</Alert>
            {[["VAPID_PUBLIC_KEY", keys.publicKey], ["VAPID_PRIVATE_KEY", keys.privateKey]].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor={k}>{k}</label>
                <div className="flex gap-2">
                  <input id={k} readOnly value={v} className="h-11 min-w-0 flex-1 rounded-input border border-neutral-mid bg-surface px-3 font-mono text-xs" />
                  <Button type="button" variant="outline" size="sm" aria-label={`Copiar ${k}`} onClick={() => void navigator.clipboard.writeText(v ?? "")}><Copy aria-hidden="true" /></Button>
                </div>
              </div>
            ))}
            <p>Na Vercel: Settings → Environment Variables → crie as duas (tipo Secret) → Redeploy. Depois volte aqui para ativar neste celular.</p>
          </div>
        )}
        {msg && <p role="status" className="text-sm font-semibold">{msg}</p>}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 bg-surface-muted">
      <p className="flex items-center gap-2 font-heading text-lg font-bold">
        {status === "ativo" ? <Bell className="size-5" aria-hidden="true" /> : <BellOff className="size-5" aria-hidden="true" />}
        Avisos de pedido novo neste aparelho: {status === "ativo" ? "ativados" : status === "carregando" ? "verificando…" : "desativados"}
      </p>
      {status === "sem_suporte" && (
        <p className="text-sm">Este navegador não permite avisos. <strong>No iPhone:</strong> toque em Compartilhar → <em>Adicionar à Tela de Início</em>, abra o painel pelo ícone criado e ative aqui. No Android, use o Chrome.</p>
      )}
      {status === "bloqueado" && <p className="text-sm">As notificações estão bloqueadas para este site. Libere nas configurações do navegador e atualize a página.</p>}
      <div className="flex flex-wrap gap-2">
        {status === "inativo" && <Button type="button" variant="dark" loading={busy} onClick={() => void enable()}><Bell aria-hidden="true" />Ativar avisos neste aparelho</Button>}
        {status === "ativo" && (
          <>
            <Button type="button" variant="outline" loading={busy} onClick={() => void test()}><Send aria-hidden="true" />Enviar aviso de teste</Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => void disable()}>Desativar</Button>
          </>
        )}
      </div>
      {msg && <p role="status" className="text-sm font-semibold">{msg}</p>}
    </Card>
  );
}
