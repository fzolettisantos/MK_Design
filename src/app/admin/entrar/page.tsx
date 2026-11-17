import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { Alert } from "@/components/ui";
import { isAuthConfigured, isTech } from "@/lib/admin/session";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/session-core";

export const metadata: Metadata = { title: "Entrar", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isTech()) redirect("/admin");
  return (
    <>
      <PageHero id="entrar-title" eyebrow="ÁREA DO TÉCNICO" title="Entrar" />
      <PageBody>
        <div className="container-mk min-h-[24rem]">
          {isAuthConfigured() ? (
            <LoginForm />
          ) : (
            <Alert variant="error" title="Acesso não configurado">
              Defina a variável <code>TECH_PASSWORD</code> (mínimo de {MIN_PASSWORD_LENGTH} caracteres) nas configurações do servidor e publique de novo.
            </Alert>
          )}
        </div>
      </PageBody>
    </>
  );
}
