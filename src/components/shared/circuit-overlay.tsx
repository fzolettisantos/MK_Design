/**
 * Composição gráfica de circuito eletrônico para os cabeçalhos internos: grade fina, trilhas ortogonais
 * com curvas de 45°, chips, pontos de solda e pulsos de luz lime percorrendo as trilhas.
 * Fica sobre a foto (e sua camada preta) e sob o texto; esmaecida à esquerda para não atrapalhar a leitura.
 * Decorativa (aria-hidden). Anima via CSS (`mk-pulse`) e pausa com `[data-paused]` / prefers-reduced-motion.
 */
const traces = [
  "M1600 90H1330L1280 140V250L1230 300H960",
  "M1600 210H1500L1460 250H1330",
  "M1600 360H1390L1350 400H1090V500",
  "M1010 0V70L1050 110H1150",
  "M1460 0V60L1420 100H1290L1250 140",
  "M1600 465H1280L1240 425",
  "M820 500V440L860 400H960",
];
const pads: [number, number][] = [
  [960, 300], [1330, 250], [1150, 110], [1250, 140], [1240, 425], [960, 400], [1090, 395], [1280, 140],
];
const pulses: { d: number; dur: number; delay: number }[] = [
  { d: 0, dur: 6, delay: 0 },
  { d: 1, dur: 5, delay: 1.2 },
  { d: 2, dur: 7, delay: 0.5 },
  { d: 3, dur: 4.5, delay: 2 },
  { d: 4, dur: 6.5, delay: 3 },
  { d: 5, dur: 5.5, delay: 0.8 },
  { d: 6, dur: 5, delay: 2.4 },
];

export function CircuitOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,rgb(0_0_0/0.35),#000_55%)] md:[mask-image:linear-gradient(to_right,transparent_15%,#000_60%)]"
    >
      <div
        className="absolute inset-0 [background-size:48px_48px]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
        }}
      />
      <svg viewBox="0 0 1600 500" preserveAspectRatio="xMaxYMid slice" fill="none" className="absolute inset-0 size-full">
        {/* Trilhas base */}
        <g stroke="#fff" strokeOpacity="0.28" strokeWidth="2" strokeLinejoin="round">
          {traces.map((t) => (
            <path key={t} d={t} />
          ))}
        </g>
        {/* Chip */}
        <g stroke="#fff" strokeOpacity="0.4" strokeWidth="2">
          <rect x="1080" y="170" width="130" height="90" rx="8" fill="rgb(23 23 23 / 0.35)" />
          <rect x="1105" y="192" width="80" height="46" rx="4" strokeOpacity="0.25" />
          <path d="M1100 170v-14M1120 170v-14M1140 170v-14M1160 170v-14M1180 170v-14M1100 260v14M1120 260v14M1140 260v14M1160 260v14M1180 260v14M1080 190h-14M1080 215h-14M1080 240h-14M1210 190h14M1210 215h14M1210 240h14" />
        </g>
        <circle cx="1145" cy="215" r="6" fill="#E4F000" fillOpacity="0.9" className="mk-blink" />
        {/* Pontos de solda */}
        <g stroke="#fff" strokeOpacity="0.5" strokeWidth="2" fill="rgb(23 23 23 / 0.6)">
          {pads.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="7" />
          ))}
        </g>
        {/* Pulsos de luz percorrendo as trilhas */}
        <g stroke="#E4F000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {pulses.map((p) => (
            <path
              key={p.d}
              d={traces[p.d]}
              pathLength={100}
              strokeDasharray="5 95"
              className="mk-pulse"
              style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
