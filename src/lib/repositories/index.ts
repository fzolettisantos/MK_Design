import { staticServiceRepository } from "./static/services";

/** Ponto único de acesso. Trocar a implementação aqui (ex.: Supabase) não afeta páginas/componentes. */
export const serviceRepository = staticServiceRepository;
