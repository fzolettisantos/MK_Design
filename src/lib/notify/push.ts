import "server-only";
import * as webpush from "web-push";
import { absoluteUrl } from "@/config/site";
import { listPushSubscriptions, removePushSubscription, type PushSub } from "@/lib/scheduling/service";

/**
 * Aviso no celular do técnico (Web Push, sem serviço pago). O texto NÃO leva nome nem telefone do cliente:
 * só o tipo de pedido e o horário. Falhas nunca derrubam o pedido do cliente (melhor esforço).
 */
export interface PushPayload { title: string; body: string; url?: string; tag?: string }

export const isPushConfigured = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

function configure() {
  const subject = absoluteUrl("/").startsWith("https://") ? absoluteUrl("/") : "https://localhost";
  webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
}

export interface PushDeps {
  list: () => Promise<PushSub[]>;
  send: (sub: PushSub, body: string) => Promise<void>;
  remove: (endpoint: string) => Promise<void>;
}
const realDeps: PushDeps = {
  list: listPushSubscriptions,
  send: async (s, body) => { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 12, urgency: "high" }); },
  remove: removePushSubscription,
};

/** Envia a todos os aparelhos do técnico; remove assinaturas mortas (404/410). Devolve quantos receberam. */
export async function notifyTechnician(payload: PushPayload, deps: PushDeps = realDeps): Promise<number> {
  if (deps === realDeps) {
    if (!isPushConfigured()) return 0;
    configure();
  }
  let sent = 0;
  try {
    const subs = await deps.list();
    const body = JSON.stringify({ ...payload, url: payload.url ?? "/admin" });
    await Promise.all(subs.map(async (s) => {
      try {
        await deps.send(s, body);
        sent += 1;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await deps.remove(s.endpoint).catch(() => {});
      }
    }));
  } catch {
    /* melhor esforço */
  }
  return sent;
}
