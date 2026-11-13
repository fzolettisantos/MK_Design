import type { ReactNode } from "react";

/**
 * Ilustrações em traço (line art) dos contextos do site, para os cartões do hero.
 * Traço = currentColor; detalhes usam `var(--art-accent)`; `var(--art-bg)` preenche sobreposições.
 * Todas decorativas (aria-hidden no contêiner).
 */
const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 200 160"
    fill="none"
    stroke="currentColor"
    strokeWidth={3.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-auto w-full"
  >
    {children}
  </svg>
);
const A = "var(--art-accent)";
const BG = "var(--art-bg)";

/** TV na parede (painel) com nível */
export const TvWall = () => (
  <Svg>
    <rect x="8" y="8" width="184" height="116" rx="12" strokeDasharray="2 9" />
    <rect x="34" y="24" width="132" height="80" rx="8" />
    <rect x="42" y="32" width="116" height="64" rx="3" />
    <path d="M56 84l22-22 16 14 14-12 22 16" stroke={A} />
    <path d="M34 36h-8M34 92h-8M166 36h8M166 92h8" stroke={A} />
    <rect x="52" y="134" width="96" height="16" rx="8" />
    <circle cx="100" cy="142" r="4.5" stroke={A} />
    <path d="M78 142h8M114 142h8" />
  </Svg>
);

/** Suporte articulado */
export const TvArticulated = () => (
  <Svg>
    <rect x="14" y="34" width="12" height="92" rx="4" />
    <path d="M26 80l42-14" />
    <circle cx="68" cy="66" r="6" stroke={A} />
    <path d="M73 69l30 12" />
    <circle cx="103" cy="81" r="6" stroke={A} />
    <g transform="rotate(-14 142 68)">
      <rect x="96" y="40" width="92" height="56" rx="7" />
      <rect x="103" y="47" width="78" height="42" rx="3" />
    </g>
    <path d="M30 134h30M30 144h18" />
  </Svg>
);

/** Conserto: placa e chave de fenda */
export const TvRepair = () => (
  <Svg>
    <rect x="20" y="24" width="120" height="92" rx="9" />
    <rect x="34" y="38" width="62" height="48" rx="4" />
    <rect x="48" y="50" width="26" height="22" rx="3" stroke={A} />
    <path d="M34 78h-8M96 52h14M96 66h14M52 86v12M66 86v12M80 86v12" />
    <circle cx="110" cy="52" r="2.2" fill="currentColor" />
    <circle cx="110" cy="66" r="2.2" fill="currentColor" />
    <g transform="rotate(40 152 90)">
      <rect x="140" y="52" width="24" height="52" rx="8" />
      <path d="M152 104v34" />
      <path d="M146 70h12M146 80h12" stroke={A} />
    </g>
    <path d="M118 28l6-8M130 32l10-4M124 40l12 2" stroke={A} />
  </Svg>
);

/** Agendamento: calendário e relógio */
export const Calendar = () => (
  <Svg>
    <rect x="22" y="28" width="132" height="112" rx="12" />
    <path d="M22 58h132M56 16v24M120 16v24" />
    <circle cx="52" cy="84" r="3" fill="currentColor" />
    <circle cx="78" cy="84" r="3" fill="currentColor" />
    <circle cx="104" cy="84" r="3" fill="currentColor" />
    <circle cx="52" cy="110" r="3" fill="currentColor" />
    <circle cx="78" cy="110" r="9" stroke={A} />
    <circle cx="150" cy="118" r="30" fill={BG} />
    <path d="M150 100v18l12 8" stroke={A} />
  </Svg>
);

/** Suporte de teto */
export const TvCeiling = () => (
  <Svg>
    <path d="M30 12h140" />
    <rect x="84" y="12" width="32" height="10" rx="3" />
    <path d="M100 22v34" />
    <rect x="78" y="56" width="44" height="10" rx="4" stroke={A} />
    <rect x="30" y="66" width="140" height="82" rx="9" />
    <rect x="39" y="75" width="122" height="64" rx="4" />
    <path d="M52 124l24-24 18 14 16-12 26 18" />
  </Svg>
);

/** WhatsApp / conversa */
export const Chat = () => (
  <Svg>
    <path d="M52 22h96a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22h-58l-30 26v-26h-8a22 22 0 0 1-22-22V44a22 22 0 0 1 22-22Z" />
    <circle cx="76" cy="66" r="4.5" fill={A} stroke="none" />
    <circle cx="100" cy="66" r="4.5" fill={A} stroke="none" />
    <circle cx="124" cy="66" r="4.5" fill={A} stroke="none" />
    <path d="M112 132h40a14 14 0 0 0 14-14" />
    <path d="M126 142h26" />
  </Svg>
);

/** Suporte pedestal */
export const TvPedestal = () => (
  <Svg>
    <rect x="26" y="14" width="148" height="92" rx="9" />
    <rect x="35" y="23" width="130" height="74" rx="4" />
    <path d="M52 82l24-24 18 14 16-12 26 18" stroke={A} />
    <path d="M100 106v22" />
    <path d="M82 128h36l12 18H70Z" />
    <path d="M58 150h84" />
  </Svg>
);

/** Pagamento: cartão e Pix */
export const Payments = () => (
  <Svg>
    <rect x="16" y="24" width="124" height="82" rx="11" />
    <path d="M16 48h124" strokeWidth={9} />
    <rect x="30" y="72" width="26" height="18" rx="4" stroke={A} />
    <path d="M66 82h40" />
    <rect x="104" y="80" width="80" height="68" rx="10" fill={BG} />
    <rect x="116" y="92" width="18" height="18" rx="3" />
    <rect x="154" y="92" width="18" height="18" rx="3" />
    <rect x="116" y="118" width="18" height="18" rx="3" />
    <path d="M154 120h6M166 120v6M154 132h18" stroke={A} />
  </Svg>
);
