/**
 * Linha curva fina decorativa (referência visual: arco em contorno). Use com `text-*` para a cor.
 * `animate` desenha o traço ao carregar (respeita prefers-reduced-motion).
 */
export function ArcLine({ className, animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 600" fill="none" className={className}>
      <path
        d="M20 590C20 290 290 20 590 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        className={animate ? "mk-draw" : undefined}
      />
    </svg>
  );
}
