import type { NextConfig } from "next";
import path from "node:path";

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // O repositório pai contém outro projeto com seu próprio lockfile; fixa a raiz aqui.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ["image/avif", "image/webp"],
    // Imagens do site são versionadas por nome; uma semana de cache na otimização.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  experimental: { optimizePackageImports: ["lucide-react", "date-fns"] },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
