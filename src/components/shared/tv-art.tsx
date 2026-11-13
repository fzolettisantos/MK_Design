/**
 * Ilustração decorativa de TV (SVG). PROVISÓRIA: substituir por fotografia real de TV sendo
 * instalada quando disponível (style guide §11). Usa apenas as cores da marca.
 */
export function TvArt({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 640 440" className={className} fill="none">
      <rect x="10" y="10" width="620" height="360" rx="14" fill="#0b0b0b" />
      <rect x="26" y="26" width="588" height="328" rx="6" fill="#171717" />
      <clipPath id="tv-screen">
        <rect x="26" y="26" width="588" height="328" rx="6" />
      </clipPath>
      <g clipPath="url(#tv-screen)">
        <path d="M330 26h130L300 354H170Z" fill="#E4F000" />
        <path d="M470 26h60L370 354h-60Z" fill="#FFFFFF" opacity=".92" />
        <path d="M540 26h74v328h-74L480 354Z" fill="#E4F000" opacity=".35" />
        <rect x="26" y="300" width="588" height="6" fill="#E4F000" opacity=".5" />
        <rect x="60" y="70" width="120" height="10" rx="5" fill="#FFFFFF" opacity=".85" />
        <rect x="60" y="94" width="76" height="10" rx="5" fill="#FFFFFF" opacity=".45" />
      </g>
      <path d="M250 370h140l34 52H216Z" fill="#0b0b0b" />
      <rect x="170" y="420" width="300" height="10" rx="5" fill="#0b0b0b" />
    </svg>
  );
}
