# Guidelines do Design System

Fonte: `docs/brand/style-guide.md` §3 e §11. Tokens em `../tokens/`.

## Cor
- CTA: fundo `brand-primary`, texto `brand-ink`. **Nunca branco sobre amarelo.**
- Amarelo é acento (barras finas, CTAs, selos de seleção) — **nunca** grandes áreas de texto/fundo extenso.
- `neutral-mid` só em ícones/bordas ou texto sobre branco; sobre `surface-muted` reprova AA (4,4:1). Para texto de apoio use `text-secondary`.
- `success`/`error`/`focus` são independentes da marca; estado nunca só por cor (sempre ícone/texto).

## Tipografia
**Uma família só: Outfit** (variável 100–900) em títulos, corpo e UI — títulos 800/700, corpo 400–600. Ênfases em serifa itálica pesada (Playfair Display Itálica, peso 800) via `EmphasizedText`. Decisão de nov/2026 (referência visual); substitui Space Grotesk + Inter do style guide original. Escala fluida em `tokens.css`. Mínimo 14 px para informação essencial.

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
Referência de layout: broworks.net (apenas o design; abas, seções e copy são da MK). **Paleta MK mantida** (lime `#E4F000`, preto `#171717`, branco). Isto sobrepõe os raios do style guide original (§3).
- **Menu:** barra branca flutuante com raio de 1.5rem (logo centralizado no desktop), botão `Agendar serviço` escuro em pílula.
- **Hero:** bloco lime chapado, centralizado; letreiro fino sob o menu; título grande com a frase final em **serifa itálica** (`EmphasizedText`, fonte Playfair Display Itálica); cartões inclinados passando (`HeroMarquee`) com botão de pausa (`MotionToggle`, WCAG 2.2.2).
- **Seções empilhadas:** cada seção sobrepõe a anterior com topo arredondado (`.mk-stack`), alternando `surface` / `surface-muted` / `brand-ink` / lime.
- **Ênfase:** em fundo escuro a serifa itálica vai em lime; em fundo claro ou lime herda `brand-ink`.
- **Lime:** blocos grandes só com texto `brand-ink`; nunca branco sobre lime; lime nunca como cor de texto sobre branco.
- Fundo escuro: texto `surface` ou `surface/75+`; logo `mk-design-logo-trim-on-dark.png`; fundo claro/lime: `mk-design-logo-trim.png`.
- Movimento: só CSS; respeita `prefers-reduced-motion`; conteúdo em movimento é decorativo (`aria-hidden`) e pausável.
- Copy: não replicar promessas de referências (ex.: "garantia") — ver regras de conteúdo.
