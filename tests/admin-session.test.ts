import { describe, expect, it } from "vitest";
import { checkPassword, createLimiter, createSessionValue, isPasswordUsable, verifySessionValue } from "@/lib/admin/session-core";

const PW = "uma-senha-bem-longa-123";
const NOW = Date.UTC(2026, 10, 17, 12);

describe("sessão do técnico", () => {
  it("cria e valida a sessão", () => {
    expect(verifySessionValue(createSessionValue(PW, NOW), PW, NOW + 1000)).toBe(true);
  });
  it("expira em 14 dias", () => {
    const v = createSessionValue(PW, NOW);
    expect(verifySessionValue(v, PW, NOW + 13 * 86_400_000)).toBe(true);
    expect(verifySessionValue(v, PW, NOW + 14 * 86_400_000 + 1000)).toBe(false);
  });
  it("recusa cookie adulterado, de outra senha ou malformado", () => {
    const v = createSessionValue(PW, NOW);
    const [a, , s] = v.split(".");
    expect(verifySessionValue(`${a}.${Math.floor(NOW / 1000) + 99_999_999}.${s}`, PW, NOW)).toBe(false); // estendeu o prazo
    expect(verifySessionValue(v, "outra-senha-bem-longa-999", NOW)).toBe(false);
    for (const bad of ["", "abc", "v1.1.2", "v2.9999999999.x", undefined]) expect(verifySessionValue(bad, PW, NOW)).toBe(false);
  });
  it("trocar a senha invalida as sessões; senha curta desativa o login", () => {
    expect(verifySessionValue(createSessionValue(PW, NOW), PW + "x", NOW)).toBe(false);
    expect(isPasswordUsable("curta")).toBe(false);
    expect(isPasswordUsable(undefined)).toBe(false);
    expect(isPasswordUsable(PW)).toBe(true);
    expect(verifySessionValue(createSessionValue("curta", NOW), "curta", NOW)).toBe(false);
  });
  it("compara a senha digitada", () => {
    expect(checkPassword(PW, PW)).toBe(true);
    expect(checkPassword(PW + " ", PW)).toBe(false);
    expect(checkPassword("", PW)).toBe(false);
  });
  it("limitador bloqueia após 5 falhas e libera depois da janela", () => {
    const l = createLimiter(5, 60_000);
    for (let i = 0; i < 4; i++) l.fail("ip", NOW);
    expect(l.blocked("ip", NOW)).toBe(false);
    l.fail("ip", NOW);
    expect(l.blocked("ip", NOW)).toBe(true);
    expect(l.blocked("outro", NOW)).toBe(false);
    expect(l.blocked("ip", NOW + 61_000)).toBe(false);
  });
});
