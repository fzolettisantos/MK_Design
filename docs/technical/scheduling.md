# Agendamento (Supabase) — decisões e configuração

## Regras de negócio (definidas com o proprietário, nov/2026)
- Um técnico, atendimento **24h, todos os dias, sem pausa**. Blocos de **1h** (instalação de TV e suportes).
- Antecedência mínima **24h**, até **30 dias** à frente.
- Deslocamento: **valor fixo de 30 min** (configurável em `business_settings`). Ele bloqueia o horário anterior e o seguinte a cada atendimento. Trocar por cálculo de distância (serviço de mapas) é evolução futura, sem mudar o resto.
- Reserva temporária de **10 min** enquanto o cliente preenche. Pedido aguardando o técnico expira em **12 h** e libera o horário.
- Conserto/diagnóstico **não abre agenda**: o cliente envia o diagnóstico; o técnico decide e, se for retirar a TV, envia um **convite individual** (token de 256 bits, só o hash no banco, **uso único, 48 h**). O texto da retirada sem diagnóstico depende de confirmação do técnico.
- Toda a comunicação com o cliente é por WhatsApp (cliente → técnico e técnico → cliente). O site é opcional para acompanhar.

## Onde as garantias vivem
Em `supabase/migrations/0001_agendamento.sql`, no banco: restrição de exclusão (`no_overlap`) impede dois atendimentos sobrepostos mesmo com cliques simultâneos; antecedência/janela/grade validadas nas funções; expiração materializada por `expire_stale`; RLS ligado **sem políticas** e `EXECUTE` revogado de `public/anon/authenticated`: o navegador não alcança nada, só o servidor (service_role).
Testes (`tests/scheduling-db.test.ts`, `tests/availability.test.ts`) rodam a migração real num Postgres (PGlite) com relógio controlado e conferem que o motor de horários livres concorda com o banco.

## Como configurar (uma vez)
1. Criar um projeto em supabase.com (região mais próxima, ex. São Paulo).
2. **SQL Editor** → colar `supabase/migrations/0001_agendamento.sql` → Run.
3. **Settings → API**: copiar `Project URL` e a chave `service_role`.
4. Na Vercel → Settings → Environment Variables (Production/Preview): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (e `NEXT_PUBLIC_WHATSAPP_NUMBER`). Fazer redeploy.
Nunca colar a `service_role` em chat, commit ou código.

## Reaproveitar em outros sites
O motor está isolado do visual: `supabase/migrations`, `src/lib/booking/availability.ts` e `src/lib/scheduling/*`. Para um novo site, copiar esses três, criar um projeto Supabase novo e ajustar `business_settings`. Uma API central multi-cliente só vale quando houver vários sites (exigiria `tenant_id` e revisão de LGPD).

## Próximas etapas
1. Ligar o calendário e o formulário do cliente a `getAvailability`/`holdSlot`/`finalizeHold` (hoje o site usa o protótipo e o repositório em memória).
2. Link do convite (`/agendar/convite/[token]`) e página do técnico com login (link no e-mail, `ADMIN_ALLOWED_EMAILS`).
3. Antirrobô e limite de pedidos pendentes por telefone; aviso ao técnico de pedido novo e de convite sem resposta.
