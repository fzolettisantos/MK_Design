/** Copy da Home — vem literalmente do style guide (docs/brand/style-guide.md §6). */
import { routes } from "@/config/routes";

export const hero = {
  eyebrow: "INSTALAÇÃO E ASSISTÊNCIA TÉCNICA",
  title: "Sua TV no lugar certo. Sem complicação.",
  text: "Instalação de TVs, suportes, painéis e assistência técnica em um só lugar. Escolha o serviço, selecione o melhor horário disponível e fale diretamente com a MK Design.",
  primaryCta: "Escolher um serviço",
  secondaryCta: "Falar pelo WhatsApp",
  microcopy: "Atendimento sujeito à confirmação de disponibilidade.",
} as const;

export const services = {
  eyebrow: "O QUE FAZEMOS",
  title: "Da instalação ao reparo, conte com a MK Design.",
  cards: [
    {
      icon: "tv",
      title: "Instalação de TVs",
      text: "Na parede, em painéis ou móveis, conforme as características do ambiente.",
      cta: "Ver opções",
      href: routes.services,
    },
    {
      icon: "support",
      title: "Suportes para TV",
      text: "Fixos, articulados, de teto e pedestais. Escolha a solução para seu espaço.",
      cta: "Selecionar suporte",
      href: routes.services,
    },
    {
      icon: "repair",
      title: "Conserto de TVs",
      text: "Conte qual é o problema da sua TV e solicite uma avaliação técnica.",
      cta: "Solicitar avaliação",
      href: routes.services,
    },
  ],
} as const;

export const howItWorks = {
  title: "Resolva tudo em poucos passos.",
  steps: [
    { title: "Escolha o serviço", text: "Selecione o tipo de instalação ou reparo que você precisa." },
    { title: "Informe os detalhes", text: "Conte onde será feito o serviço e, se necessário, o modelo da TV." },
    { title: "Selecione a data", text: "Confira os horários disponíveis para solicitar seu atendimento." },
    { title: "Confirme pelo WhatsApp", text: "Enviamos um resumo pronto para você concluir o contato com a equipe." },
  ],
} as const;

export const benefits = {
  title: "Atendimento simples, desde o primeiro contato.",
  items: [
    { icon: "choose", title: "Escolha fácil do serviço" },
    { icon: "calendar", title: "Agendamento organizado" },
    { icon: "whatsapp", title: "Contato direto pelo WhatsApp" },
    { icon: "info", title: "Informações claras antes do atendimento" },
  ],
} as const;

export const payments = {
  title: "Pague do jeito que preferir.",
  text: "Aceitamos Pix, cartão de débito e cartão de crédito das bandeiras Visa, Mastercard e Elo.",
  note: "Condições de pagamento e valores informados na confirmação do serviço.",
  methods: ["Pix", "Cartão de débito", "Crédito Visa, Mastercard e Elo"],
} as const;

export const faq = {
  title: "Perguntas frequentes",
  items: [
    {
      q: "Posso agendar pelo site?",
      a: "Sim. Você escolhe o serviço, a data e um horário disponível. A equipe confirma os detalhes do atendimento.",
    },
    {
      q: "Vocês instalam qualquer tipo de suporte?",
      a: "Trabalhamos com opções fixas, articuladas, de teto e pedestal. Informe o modelo da TV para avaliarmos a instalação.",
    },
    {
      q: "Vocês consertam TVs de quais marcas?",
      a: "Recebemos solicitações para Samsung, Sony, TCL, LG e Philips, além de outras marcas mediante consulta.",
    },
    {
      q: "Como funciona o orçamento?",
      a: "Ao enviar sua solicitação, a equipe avalia as informações e orienta sobre o orçamento.",
    },
    { q: "Quais formas de pagamento são aceitas?", a: "Pix, débito e crédito Visa, Mastercard e Elo." },
    {
      q: "O agendamento está confirmado ao escolher um horário?",
      a: "A solicitação fica registrada e depende de confirmação pela MK Design.",
    },
  ],
} as const;

export const finalCta = {
  title: "Vamos resolver o que você precisa?",
  text: "Escolha um serviço e encontre um horário para seu atendimento.",
  button: "Agendar atendimento",
} as const;
