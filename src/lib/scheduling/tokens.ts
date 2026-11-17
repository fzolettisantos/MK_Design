import { createHash, randomBytes } from "node:crypto";

/** Token longo e não adivinhável (256 bits). Só o HASH vai para o banco; o token em si só existe no link. */
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
/** Aceita só o formato que `newToken` gera, antes de consultar o banco. */
export const isTokenShape = (t: unknown): t is string => typeof t === "string" && /^[A-Za-z0-9_-]{43}$/.test(t);
