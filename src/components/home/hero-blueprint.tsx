/**
 * Fundo técnico (estilo planta/blueprint) do hero: grade fina, círculos grandes em contorno e
 * diagonais tracejadas com um trecho de destaque. Traços em brand-ink com baixa opacidade sobre o lime.
 * Decorativo (aria-hidden); o tracejado e o círculo giram devagar e pausam com o botão "Pausar animação"
 * (ancestral `[data-motion-root]`) e com prefers-reduced-motion.
 */
export function HeroBlueprint() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_50%_40%,#000_35%,transparent_92%)]"
    >
      {/* Grade */}
      <div
        className="absolute inset-0 opacity-100 [background-size:56px_56px] md:[background-size:72px_72px]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(23 23 23 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, rgb(23 23 23 / 0.09) 1px, transparent 1px)",
        }}
      />
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <g stroke="#171717" strokeWidth="1.5">
          {/* Círculos */}
          <circle cx="800" cy="430" r="440" strokeOpacity="0.2" />
          <circle cx="1310" cy="70" r="160" strokeOpacity="0.2" />
          <circle cx="250" cy="770" r="340" strokeOpacity="0.2" />
          <circle cx="1480" cy="840" r="380" strokeOpacity="0.16" />
          {/* Círculo girando devagar (tracejado fino) */}
          <circle
            cx="800"
            cy="430"
            r="300"
            strokeOpacity="0.28"
            strokeDasharray="3 14"
            className="mk-spin"
            style={{ transformOrigin: "800px 430px" }}
          />
          {/* Diagonais tracejadas */}
          <path d="M540 900L1060 0" strokeOpacity="0.32" strokeDasharray="9 11" className="mk-dash" />
          <path d="M930 0L1560 720" strokeOpacity="0.32" strokeDasharray="9 11" className="mk-dash" />
          {/* Trecho de destaque */}
          <path d="M870 190L1010 0" strokeOpacity="0.9" strokeWidth="2.5" strokeDasharray="16 10" className="mk-dash" />
        </g>
        {/* Pontos nas interseções */}
        <g fill="#171717" fillOpacity="0.55">
          <circle cx="1060" cy="0" r="4" />
          <circle cx="870" cy="190" r="4.5" />
          <circle cx="930" cy="0" r="4" />
          <circle cx="1240" cy="430" r="4" />
          <circle cx="360" cy="430" r="4" />
        </g>
      </svg>
    </div>
  );
}
