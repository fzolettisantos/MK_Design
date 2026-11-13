import type { Booking, BookingRepository, BookingStatus } from "@/types";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // sem 0/O/1/I

export function generateProtocol(now = new Date(), rand: () => number = Math.random) {
  const ymd = now.toISOString().slice(2, 10).replaceAll("-", "");
  const code = Array.from({ length: 5 }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join("");
  return `MK-${ymd}-${code}`;
}

const store = new Map<string, Booking>();

/**
 * Repositório em memória — SOMENTE modo demonstrativo. Não é durável (some ao reiniciar/escalar o servidor)
 * e não impede dupla reserva entre instâncias. Substituir por Postgres/Supabase (docs/technical/architecture.md).
 */
export const memoryBookingRepository: BookingRepository = {
  async create(input) {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: crypto.randomUUID(),
      protocol: generateProtocol(),
      status: "aguardando_confirmacao",
      createdAt: now,
      updatedAt: now,
    };
    store.set(booking.protocol, booking);
    return booking;
  },
  async getByProtocol(protocol) {
    return store.get(protocol) ?? null;
  },
  async list(filter) {
    return [...store.values()].filter((b) => !filter?.status || b.status === filter.status);
  },
  async updateStatus(id, to: BookingStatus) {
    const b = [...store.values()].find((x) => x.id === id);
    if (!b) throw new Error("Pedido não encontrado");
    const next = { ...b, status: to, updatedAt: new Date().toISOString() };
    store.set(b.protocol, next);
    return next;
  },
};
