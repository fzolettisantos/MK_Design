import { ImageResponse } from "next/og";
import { colors } from "@/design-system/tokens";

export const alt = "MK Design — instalação de TVs, suportes e assistência técnica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento (1200×630) gerada no build, só com a identidade da marca (sem fatos comerciais). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: colors.brandPrimary, color: colors.brandInk, padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800, letterSpacing: 6 }}>
          <div style={{ display: "flex", width: 64, height: 64, border: `8px solid ${colors.brandInk}`, borderRightColor: "transparent", alignItems: "center", justifyContent: "center", fontSize: 30 }}>MK</div>
          DESIGN
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>Sua TV no lugar certo.</span>
          <span>Sem complicação.</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>Instalação de TVs, suportes e assistência técnica</div>
      </div>
    ),
    size,
  );
}
