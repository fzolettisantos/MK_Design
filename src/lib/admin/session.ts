import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, COOKIE_NAME, createLimiter, createSessionValue, isPasswordUsable, SESSION_DAYS, verifySessionValue } from "./session-core";

const limiter = createLimiter();

export const isAuthConfigured = () => isPasswordUsable(process.env.TECH_PASSWORD);

export async function isTech(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(COOKIE_NAME)?.value, process.env.TECH_PASSWORD, Date.now());
}

/** Use em TODA página e ação do painel: layouts não rodam de novo a cada navegação, então a checagem fica junto do dado. */
export async function requireTech(): Promise<void> {
  if (!(await isTech())) redirect("/admin/entrar");
}

export async function guardAction(): Promise<boolean> {
  return isTech();
}

export async function login(password: string): Promise<{ ok: boolean; reason?: "bloqueado" | "invalida" | "nao_configurado" }> {
  const secret = process.env.TECH_PASSWORD;
  if (!isPasswordUsable(secret)) return { ok: false, reason: "nao_configurado" };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "desconhecido";
  if (limiter.blocked(ip, Date.now())) return { ok: false, reason: "bloqueado" };
  if (!checkPassword(String(password ?? "").slice(0, 200), secret)) {
    limiter.fail(ip, Date.now());
    await new Promise((r) => setTimeout(r, 1200)); // atrasa tentativas em série
    return { ok: false, reason: "invalida" };
  }
  limiter.reset(ip);
  (await cookies()).set(COOKIE_NAME, createSessionValue(secret, Date.now()), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: SESSION_DAYS * 86400,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE_NAME, path: "/admin" });
}
