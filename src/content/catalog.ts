import type { Service, ServiceCategory } from "@/types";

/**
 * Catálogo inicial (style guide §5). Dados editáveis — futuramente em banco/painel admin.
 * Regras: sem preço (sempre "sob orçamento"), sem duração (definida no painel), sem promessas
 * de garantia/prazo/assistência autorizada. Itens a confirmar com o proprietário ficam `active: false`.
 */
export const categories: ServiceCategory[] = [
  { id: "instalacao-tv", name: "Instalação de TVs", order: 1, heroImage: "/images/banners/servico-parede-bg.webp" },
  { id: "instalacao-suporte", name: "Instalação de suportes", order: 2 },
  { id: "assistencia-tecnica", name: "Assistência técnica", order: 3 },
];

const installInfo = [
  "Tamanho da TV e, se souber, marca e modelo",
  "Local onde a TV será instalada",
  "Se você já possui o suporte ou precisa de orientação",
  "Fotos do local (opcional)",
];

const supportInfo = [
  "Tamanho e modelo da TV",
  "Tipo de suporte desejado",
  "Tipo de parede ou superfície, quando souber",
  "Se você já possui o suporte",
];

const repairInfo = [
  "Marca, modelo e tamanho da TV",
  "O que está acontecendo (não liga, sem imagem, sem som, imagem com falhas, entradas/conexões ou outro)",
  "Observações e uma foto do problema (opcional)",
];

export const services: Service[] = [
  {
    id: "tv-parede", slug: "instalacao-de-tv-na-parede", categoryId: "instalacao-tv",
    name: "Instalação de TV na parede",
    summary: "Instalação da TV na parede, conforme as características do ambiente.",
    description: "Instalação da sua TV na parede. A equipe avalia o local, o tipo de suporte e o tamanho da TV para orientar a melhor forma de instalar.",
    infoNeeded: installInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 1,
  },
  {
    id: "tv-painel", slug: "instalacao-de-tv-em-painel", categoryId: "instalacao-tv",
    name: "Instalação de TV em painel",
    summary: "Instalação da TV em painéis, conforme o modelo e o ambiente.",
    description: "Instalação da TV em painel. Informe o tipo de painel e o tamanho da TV para que a equipe avalie a instalação.",
    infoNeeded: installInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 2,
  },
  {
    id: "tv-movel-rack", slug: "instalacao-de-tv-em-movel-ou-rack", categoryId: "instalacao-tv",
    name: "Instalação de TV em móvel ou rack",
    summary: "Instalação e posicionamento da TV em móvel ou rack.",
    description: "Instalação da TV em móvel ou rack, com atenção ao posicionamento e às conexões. Conte como é o móvel e o espaço disponível.",
    infoNeeded: installInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 3,
  },
  {
    id: "tv-ajuste", slug: "ajuste-e-reinstalacao-de-tv", categoryId: "instalacao-tv",
    name: "Ajuste, posicionamento e reinstalação de TV",
    summary: "Ajuste de posição ou reinstalação de uma TV já instalada.",
    description: "Ajuste, posicionamento e reinstalação de TV. Serviço a confirmar com o proprietário antes de ser exibido.",
    infoNeeded: installInfo, durationMinutes: null, priceMode: "sob_orcamento",
    active: false, // CONFIRMAR com o dono (guia §5)
    order: 4,
  },
  {
    id: "suporte-fixo", slug: "instalacao-de-suporte-fixo", categoryId: "instalacao-suporte",
    name: "Suporte fixo",
    summary: "Instalação de suporte fixo, com a TV rente à parede.",
    description: "Instalação de suporte fixo. Informe o modelo da TV para avaliarmos a instalação.",
    infoNeeded: supportInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 5,
    heroImage: "/images/banners/servico-suporte-fixo-bg.webp",
  },
  {
    id: "suporte-articulado", slug: "instalacao-de-suporte-articulado", categoryId: "instalacao-suporte",
    name: "Suporte articulado",
    summary: "Instalação de suporte articulado, que permite ajustar a posição da TV.",
    description: "Instalação de suporte articulado. Informe o modelo da TV para avaliarmos a instalação.",
    infoNeeded: supportInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 6,
  },
  {
    id: "suporte-teto", slug: "instalacao-de-suporte-de-teto", categoryId: "instalacao-suporte",
    name: "Suporte de teto",
    summary: "Instalação de suporte de teto, conforme o local.",
    description: "Instalação de suporte de teto. Informe o modelo da TV e o tipo de teto, se souber, para avaliarmos a instalação.",
    infoNeeded: supportInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 7,
  },
  {
    id: "suporte-pedestal", slug: "instalacao-de-suporte-pedestal", categoryId: "instalacao-suporte",
    name: "Suporte pedestal",
    summary: "Montagem e instalação de suporte pedestal.",
    description: "Montagem e instalação de suporte pedestal. Informe o modelo da TV para avaliarmos a instalação.",
    infoNeeded: supportInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 8,
  },
  {
    id: "diagnostico-tv", slug: "avaliacao-de-tv", categoryId: "assistencia-tecnica",
    name: "Avaliação e diagnóstico de TV",
    summary: "Conte o problema da sua TV e solicite uma avaliação técnica.",
    description: "Conte qual é o problema da sua TV e solicite uma avaliação técnica. A equipe analisa as informações e orienta sobre os próximos passos e o orçamento.",
    infoNeeded: repairInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 9,
  },
  {
    id: "conserto-tv", slug: "solicitar-conserto-de-tv", categoryId: "assistencia-tecnica",
    name: "Solicitação de conserto de TV",
    summary: "Solicite o conserto da sua TV. Recebemos pedidos para Samsung, Sony, TCL, LG e Philips, e outras marcas mediante consulta.",
    description: "Solicite o conserto da sua TV. Recebemos solicitações para Samsung, Sony, TCL, LG e Philips, além de outras marcas mediante consulta. A equipe avalia as informações e orienta sobre o orçamento.",
    infoNeeded: repairInfo, durationMinutes: null, priceMode: "sob_orcamento", active: true, order: 10,
    heroImage: "/images/banners/servico-conserto-bg.webp",
  },
];
