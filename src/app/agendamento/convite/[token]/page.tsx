import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { BookingFlow } from "@/components/booking/booking-flow";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { Alert, Button } from "@/components/ui";
import { routes } from "@/config/routes";
import { serviceRepository } from "@/lib/repositories";
import { getAvailability, getInvite, isSchedulingConfigured } from "@/lib/scheduling/service";

export const metadata: Metadata = { title: "Escolha o horário da retirada", robots: { index: false, follow: false } };

const TEXT: Record<string, string> = {
  convite_usado: "Este convite já foi usado. Se precisar de outro horário, fale com o técnico.",
  convite_expirado: "Este convite expirou. Peça um novo ao técnico.",
  convite_invalido: "Não encontramos este convite. Confira o link ou peça um novo ao técnico.",
};

/** Link individual enviado pelo técnico. O token nunca é guardado em claro: só o hash fica no banco. */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const [services, categories] = await Promise.all([serviceRepository.list({ onlyActive: true }), serviceRepository.listCategories()]);
  let inv: Awaited<ReturnType<typeof getInvite>> | null = null;
  let days: Awaited<ReturnType<typeof getAvailability>> | undefined;
  if (isSchedulingConfigured()) {
    try {
      inv = await getInvite(token);
      if (inv?.ok) days = await getAvailability();
    } catch {
      inv = null;
    }
  }
  return (
    <>
      <PageHero id="convite-title" eyebrow="CONVITE DO TÉCNICO" title="Escolha o horário" />
      <PageBody>
        <div className="container-mk min-h-[40rem] max-w-3xl ml-0 md:mx-auto">
          {inv?.ok ? (
            <BookingFlow
              services={services}
              categories={categories}
              real
              initialDays={days}
              invite={{
                token,
                firstName: String(inv.first_name ?? ""),
                serviceSlug: String(inv.service_slug),
                kind: String(inv.kind ?? "avaliacao"),
                neighborhood: String((inv.location as { neighborhood?: string } | null)?.neighborhood ?? ""),
                city: String((inv.location as { city?: string } | null)?.city ?? ""),
              }}
            />
          ) : (
            <div className="flex flex-col items-start gap-6">
              <Alert variant="error" title="Não foi possível abrir o convite">
                {inv ? (TEXT[String(inv.reason)] ?? TEXT.convite_invalido) : "Não conseguimos verificar o convite agora. Tente novamente em instantes."}
              </Alert>
              <Button asChild variant="outline"><Link href={routes.home}>Voltar ao início</Link></Button>
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}
