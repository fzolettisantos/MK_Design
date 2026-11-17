import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sessão do técnico (senha única). Sem estado no servidor: o cookie leva `v1.<expira>.<assinatura>`, assinado com
 * HMAC-SHA256 por uma chave derivada da própria senha. Trocar a senha invalida todas as sessões.
 */
export const MIN_PASSWORD_LENGTH = 14;
export const SESSION_DAYS = 14;
export const COOKIE_NAME = "mk_tech";

const key = (password: string) => createHash("sha256").update(`mk-tech-session:${password}`).digest();
const b64 = (b: Buffer) => b.toString("base64url");
const sign = (password: string, payload: string) => b64(createHmac("sha256", key(password)).update(payload).digest());

export const isPasswordUsable = (p: string | undefined): p is string => typeof p === "string" && p.length >= MIN_PASSWORD_LENGTH;

/** Comparação em tempo constante (não vaza o tamanho nem onde a senha diverge). */
export function checkPassword(input: string, password: string): boolean {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}

export function createSessionValue(password: string, nowMs: number): string {
  const exp = Math.floor(nowMs / 1000) + SESSION_DAYS * 86400;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(password, payload)}`;
}

export function verifySessionValue(value: string | undefined, password: string | undefined, nowMs: number): boolean {
  if (!value || !isPasswordUsable(password)) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const [v, expStr, sig] = parts as [string, string, string];
  const exp = Number(expStr);
  if (!Number.isInteger(exp) || exp * 1000 <= nowMs) return false;
  const want = Buffer.from(sign(password, `${v}.${expStr}`));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got);
}

/** Limitador simples de tentativas de login (por instância do servidor; a força da senha é a defesa principal). */
export function createLimiter(max = 5, windowMs = 15 * 60_000) {
  const hits = new Map<string, { n: number; first: number }>();
  return {
    blocked(id: string, nowMs: number) {
      const h = hits.get(id);
      if (!h) return false;
      if (nowMs - h.first > windowMs) { hits.delete(id); return false; }
      return h.n >= max;
    },
    fail(id: string, nowMs: number) {
      const h = hits.get(id);
      if (!h || nowMs - h.first > windowMs) hits.set(id, { n: 1, first: nowMs });
      else h.n += 1;
    },
    reset(id: string) { hits.delete(id); },
  };
}
