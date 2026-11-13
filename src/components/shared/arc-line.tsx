/** Linha curva fina decorativa (referência visual: arco em contorno). Use com `text-*` para a cor. */
export function ArcLine({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 600" fill="none" className={className}>
      <path d="M20 590C20 290 290 20 590 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
