import { memoryBookingRepository } from "./memory/bookings";
import { staticServiceRepository } from "./static/services";

/** Ponto único de acesso. Trocar a implementação aqui (ex.: Supabase) não afeta páginas/componentes. */
export const serviceRepository = staticServiceRepository;

/** Modo demonstrativo: em memória. Trocar por implementação com banco sem alterar actions/páginas. */
export const bookingRepository = memoryBookingRepository;
