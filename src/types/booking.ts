/** Modelo de domínio (guia §9). Independente de banco: repositórios implementam estes tipos. */

export type BookingStatus =
  | "novo"
  | "aguardando_confirmacao"
  | "confirmado"
  | "em_atendimento"
  | "concluido"
  | "cancelado";

export type ServiceCategoryId = "instalacao-tv" | "instalacao-suporte" | "assistencia-tecnica";

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  order: number;
  /** Foto de fundo do cabeçalho; os serviços da categoria herdam (a menos que tenham a própria). */
  heroImage?: string;
}

export interface Service {
  id: string;
  slug: string;
  categoryId: ServiceCategoryId;
  name: string;
  summary: string;
  /** Texto da página de detalhe. Sem promessas de prazo, garantia ou preço. */
  description: string;
  /** Informações que o cliente deve ter à mão ao solicitar (espelham as etapas do wizard). */
  infoNeeded: string[];
  /** Foto opcional de fundo do cabeçalho da página de detalhe. */
  heroImage?: string;
  durationMinutes: number | null; // definido no painel; null = ainda não configurado
  priceMode: "sob_orcamento"; // não inventar preços
  active: boolean;
  order: number;
}

export interface BusinessHours {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  opensAt: string; // "HH:mm"
  closesAt: string;
  capacity: number;
}

export interface BlockedSlot {
  id: string;
  startAt: string; // ISO 8601 com fuso
  endAt: string;
  reason?: string;
}

export interface Booking {
  id: string;
  protocol: string;
  serviceId: string;
  variant?: string;
  technicalDetails: Record<string, unknown>; // validado por Zod no cliente e no servidor
  customerName: string;
  customerPhone: string;
  location: { cep?: string; neighborhood: string; city: string; address?: string; complement?: string };
  requestedStartAt: string; // ISO 8601 com fuso (America/Sao_Paulo)
  durationMinutes: number;
  status: BookingStatus;
  privacyConsentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  from: BookingStatus | null;
  to: BookingStatus;
  changedBy: string | null;
  changedAt: string;
}
