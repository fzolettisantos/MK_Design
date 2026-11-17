import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/scheduling/service", () => ({ listPushSubscriptions: vi.fn(), removePushSubscription: vi.fn(), savePushSubscription: vi.fn() }));
const { notifyTechnician } = await import("@/lib/notify/push");

const sub = (n: number) => ({ endpoint: `https://push.example/${n}`, p256dh: "k", auth: "a" });

describe("aviso no celular do técnico", () => {
  it("envia a todos os aparelhos, com o texto e o destino", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const n = await notifyTechnician({ title: "Novo pedido", body: "Quinta às 14:00" }, { list: async () => [sub(1), sub(2)], send, remove: vi.fn() });
    expect(n).toBe(2);
    expect(JSON.parse(send.mock.calls[0]![1])).toEqual({ title: "Novo pedido", body: "Quinta às 14:00", url: "/admin" });
  });
  it("remove aparelhos que não existem mais (404/410) e continua com os outros", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const send = vi.fn(async (s: { endpoint: string }) => { if (s.endpoint.endsWith("/1")) throw Object.assign(new Error("gone"), { statusCode: 410 }); });
    const n = await notifyTechnician({ title: "t", body: "b" }, { list: async () => [sub(1), sub(2)], send, remove });
    expect(n).toBe(1);
    expect(remove).toHaveBeenCalledWith("https://push.example/1");
  });
  it("falha de envio ou do banco nunca lança erro (não derruba o pedido do cliente)", async () => {
    const boom = vi.fn().mockRejectedValue(new Error("rede"));
    await expect(notifyTechnician({ title: "t", body: "b" }, { list: async () => [sub(1)], send: boom, remove: vi.fn() })).resolves.toBe(0);
    await expect(notifyTechnician({ title: "t", body: "b" }, { list: async () => { throw new Error("db"); }, send: boom, remove: vi.fn() })).resolves.toBe(0);
  });
  it("sem VAPID configurado não envia nada", async () => {
    delete process.env.VAPID_PUBLIC_KEY; delete process.env.VAPID_PRIVATE_KEY;
    expect(await notifyTechnician({ title: "t", body: "b" })).toBe(0);
  });
});
