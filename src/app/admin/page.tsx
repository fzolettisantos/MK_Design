import type { Metadata } from "next";
import { NotificationsPanel } from "@/components/admin/notifications-panel";
import { TechnicianBoard } from "@/components/admin/technician-board";
import { PageBody, PageHero } from "@/components/shared/page-hero";
import { Alert } from "@/components/ui";
import { requireTech } from "@/lib/admin/session";
import { isPushConfigured } from "@/lib/notify/push";
import { serviceRepository } from "@/lib/repositories";
import { isSchedulingConfigured, listForTechnician } from "@/lib/scheduling/service";

export const metadata: Metadata = { title: "Painel do técnico", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireTech();
  const services = Object.fromEntries((await serviceRepository.list()).map((s) => [s.slug, s.name]));
  let data: Awaited<ReturnType<typeof listForTechnician>> | null = null;
  if (isSchedulingConfigured()) {
    try { data = await listForTechnician(); } catch { data = null; }
  }
  return (
    <>
      <PageHero id="painel-title" eyebrow="ÁREA DO TÉCNICO" title="Painel do técnico" />
      <PageBody>
        <div className="container-mk flex min-h-[30rem] flex-col gap-6">
          {data && <NotificationsPanel configured={isPushConfigured()} publicKey={process.env.VAPID_PUBLIC_KEY ?? null} />}
          {data ? (
            <TechnicianBoard data={data} services={services} />
          ) : (
            <Alert variant="error" title="Agenda indisponível">
              {isSchedulingConfigured() ? "Não foi possível consultar o banco de dados agora. Atualize a página em instantes." : "O banco de dados ainda não está configurado (DATABASE_URL)."}
            </Alert>
          )}
        </div>
      </PageBody>
    </>
  );
}
