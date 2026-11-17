import { describe, expect, it } from "vitest";
import { hashToken, isTokenShape, newToken } from "@/lib/scheduling/tokens";

describe("tokens de convite", () => {
  it("são longos, únicos e no formato esperado", () => {
    const a = newToken(), b = newToken();
    expect(a).not.toBe(b);
    expect(a).toHaveLength(43); // 256 bits em base64url
    expect(isTokenShape(a)).toBe(true);
  });
  it("hash é estável e não revela o token", () => {
    const t = newToken();
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t)).not.toContain(t);
  });
  it("rejeita formatos inválidos antes de consultar o banco", () => {
    for (const bad of ["", "abc", "x".repeat(44), "../etc/passwd", 123, null, "a b".padEnd(43, "a")]) expect(isTokenShape(bad)).toBe(false);
  });
});
