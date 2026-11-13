# SEO e performance

Medido com Lighthouse (mobile, throttling padrão), build de produção local, antes → depois:

| Página | Desempenho | SEO | Acessib. | Boas práticas | LCP |
| ------ | ---------- | --- | -------- | ------------- | --- |
| Home | 81 → 99 | 100 | 100 | 96 → 100 | 3,7 s → 0,9 s |
| Serviço (detalhe) | 96 → 94–97 | 92 → 100 | 100 | 96 → 100 | 2,6 s → 2,5–3,2 s |
| Serviços (lista) | — → 100 | 100 | 100 | 100 | 0,8 s |
| Agendamento | — → 100 | 100 | 100 | 100 | 0,8 s |

O LCP das páginas de serviço é a foto de fundo do cabeçalho (sob camada preta); a variação vem da simulação de rede lenta.

## O que está implementado
- **Metadados:** título com template, descrição, canonical por página, Open Graph e Twitter Card, `metadataBase` (`NEXT_PUBLIC_SITE_URL` > domínio da Vercel > localhost).
- **Indexação:** `sitemap.xml` (home, serviços, detalhes, agendamento), `robots.txt` (bloqueia `/admin` e `/api`). `/sobre`, `/contato` e `/privacidade` estão com `noindex` e fora do sitemap até terem conteúdo real; ao publicá-las, remover o `robots` do `metadata` e incluí-las em `src/app/sitemap.ts`.
- **Dados estruturados (JSON-LD):** `Organization` + `WebSite` (todas as páginas), `FAQPage` (home), `Service` + `BreadcrumbList` (cada serviço). Só dados confirmados: sem telefone, endereço, avaliações ou preços. `LocalBusiness` só após o proprietário confirmar nome comercial, telefone, endereço e região atendida.
- **Ícones e compartilhamento:** favicon, `icon.png`, `apple-icon.png`, `manifest.webmanifest`, `opengraph-image` (1200×630) gerada no build.
- **Performance:** todas as páginas estáticas (inclusive `/agendamento`, que lê `?servico=` no navegador); fonte Outfit local (só latin) com preload e fallback ajustado; imagens AVIF/WebP via `next/image` com `sizes` e dimensões reais (sem CLS); sem animação de entrada no conteúdo acima da dobra; headers de segurança e cache; `optimizePackageImports`.
- **Acessibilidade:** pontuação 100 no Lighthouse em todas as páginas medidas.

## Para o lançamento
- Definir `NEXT_PUBLIC_SITE_URL` com o domínio final (afeta canonical, sitemap, OG e JSON-LD) e cadastrar o sitemap no Google Search Console.
- Substituir as fotos geradas por fotos reais de trabalhos (melhor para o usuário e para o Google).
- Escrever `/sobre`, `/contato` e `/privacidade` e então indexá-las.
- Acompanhar Core Web Vitals reais (Search Console / Vercel Speed Insights).
