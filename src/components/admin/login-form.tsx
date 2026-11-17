"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { loginAction } from "@/lib/scheduling/tech-actions";

const MSG: Record<string, string> = {
  invalida: "Senha incorreta.",
  bloqueado: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  nao_configurado: "O acesso ainda não foi configurado no servidor.",
};

export function LoginForm() {
  const router = useRouter();
  const [pw, setPw] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await loginAction(pw);
      if (r.ok) { router.replace("/admin"); router.refresh(); return; }
      setError(MSG[r.reason ?? "invalida"] ?? MSG.invalida!);
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
      <Field label="Senha do técnico" required>
        {(a) => <Input {...a} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />}
      </Field>
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" variant="dark" loading={busy} className="self-start"><LogIn aria-hidden="true" />Entrar</Button>
    </form>
  );
}
