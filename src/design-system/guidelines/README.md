# Guidelines do Design System

Fonte: `docs/brand/style-guide.md` §3 e §11. Tokens em `../tokens/`.

## Cor
- CTA: fundo `brand-primary`, texto `brand-ink`. **Nunca branco sobre amarelo.**
- Amarelo é acento (barras finas, CTAs, selos de seleção) — **nunca** grandes áreas de texto/fundo extenso.
- `neutral-mid` só em ícones/bordas ou texto sobre branco; sobre `surface-muted` reprova AA (4,4:1). Para texto de apoio use `text-secondary`.
- `success`/`error`/`focus` são independentes da marca; estado nunca só por cor (sempre ícone/texto).

## Tipografia
Títulos Space Grotesk 600/700; corpo/UI Inter 400/500/600. Escala fluida em `tokens.css`. Mínimo 14 px para informação essencial.

## Forma e espaço
Raios (atualizados na direção visual de nov/2026): input 12 · botão pílula (9999) · card 20 · modal 32. Espaços 4/8/12/16/24/32/48/64/96. Container 1200 px; margens 20 (mobile) / 32 (desktop). Sombra só quando necessário.

## Interação e acessibilidade
- Alvos ≥ 44×44 px; controles 48 px.
- Foco visível global (`--mk-focus`); transições 150–250 ms; respeita `prefers-reduced-motion`.
- Estados obrigatórios: default, hover, focus-visible, selected, disabled, loading, error, empty, success.
- Campos: use `Field` (label real, dica e erro associados). Seletores: use `SelectableCard` (input nativo).
- Ícones Lucide 20–24 px, sem uso decorativo excessivo.

## Estética
Estúdio técnico contemporâneo: preto/branco + detalhes lime, faixas `surface-muted`, geometria inspirada na moldura aberta do logo. Sem 3D, gradientes ou ruído; sem foto genérica de call center.

## Logo
Preservar monograma MK, moldura aberta, lime + preto, DESIGN espaçado. Versões a produzir: horizontal, vertical, monograma/favicon, claro/escuro, SVG fiel.

## Direção visual vigente (nov/2026)
Referência: posts de assistência de TV — fundo escuro dominante, título pesado com palavras-chave na cor de acento, formas curvas grandes, botões em pílula, selo de seta em quadrado arredondado, TV como protagonista. **Mantém a paleta MK** (lime `#E4F000`, preto `#171717`, branco). Isto sobrepõe os raios do style guide original (§3).
- Seções alternam `brand-ink` / `surface` / `surface-muted`, unidas por `CurveDivider`.
- Lime em formas e acentos; **texto sobre lime sempre `brand-ink`**; nada de branco sobre lime. Decorações (arcos, círculos) nunca ficam atrás de texto.
- Fundo escuro: texto `surface` ou `surface/75+`; botões `outlineLight`/`ghostLight`; logo `mk-design-logo-trim-on-dark.png`.
- Copy: não replicar promessas de referências (ex.: "garantia") — ver regras de conteúdo.
