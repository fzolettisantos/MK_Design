import type { MetadataRoute } from "next";
import { colors } from "@/design-system/tokens";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MK Design — instalação de TVs, suportes e assistência técnica",
    short_name: "MK Design",
    description: "Instalação de TVs, suportes e assistência técnica. Escolha o serviço e agende.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: colors.surface,
    theme_color: colors.brandInk,
    icons: [
      { src: "/images/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
