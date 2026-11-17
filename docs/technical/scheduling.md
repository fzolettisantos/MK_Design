# Agendamento (Supabase) — decisões e configuração

## Regras de negócio (definidas com o proprietário, nov/2026)
- Um técnico, atendimento **24h, todos os dias, sem pausa**. Blocos de **1h** (instalação de TV e suportes).
- Antecedência mínima **24h**, até **30 dias** à frente.
- Deslocamento: **valor fixo de 30 min** (configurável em `business_settings`). Ele bloqueia o horário anterior e o seguinte a cada atendimento. Trocar por cálculo de distância (serviço de mapas) é evolução futura, sem mudar o resto.
- Reserva temporária de **10 min** enquanto o cliente preenche. Pedido aguardando o técnico expira em **12 h** e libera o horário.
- Conserto/diagnóstico **não abre agenda**: o cliente envia o diagnóstico; o técnico decide e, se for retirar a TV, envia um **convite individual** (token de 256 bits, só o hash no banco, **uso único, 48 h**). O texto da retirada sem diagnóstico depende de confirmação do técnico.
- Toda a comunicação com o cliente é por WhatsApp (cliente → técnico e técnico → cliente). O site é opcional para acompanhar.

## Onde as garantias vivem
Em `supabase/migrations/0001_agendamento.sql`, no banco: restrição de exclusão (`no_overlap`) impede dois atendimentos sobrepostos mesmo com cliques simultâneos; antecedência/janela/grade validadas nas funções; expiração materializada por `expire_stale`; RLS ligado **sem políticas** e permissões revogadas de `public/anon/authenticated/service_role` no schema: nenhuma API do Supabase alcança os dados, só o servidor pela conexão direta.
Testes (`tests/scheduling-db.test.ts`, `tests/availability.test.ts`) rodam a migração real num Postgres (PGlite) com relógio controlado e conferem que o motor de horários livres concorda com o banco.

## Migrações (rodar nesta ordem no SQL Editor; ambas são seguras de repetir)
1. `0001_agendamento.sql` — tabelas, regras e funções.
2. `0002_convite_reagendamento.sql` — convite também para **reagendar depois de cancelar** (o cancelamento envia ao cliente um link individual de 48 h para escolher outro dia e hora).

## Como configurar (uma vez)
O agendamento vive no schema próprio `mk_agendamento` e é acessado por conexão direta ao Postgres (`DATABASE_URL`). Por isso:
- serve para **qualquer Postgres**: um projeto Supabase que você já tenha (sem criar outro), Neon (plano gratuito) etc.;
- é seguro rodar num projeto existente: não toca no schema `public` nem em permissões de outros apps (há teste para isso). Para remover: `drop schema mk_agendamento cascade;`
- não depende de APIs públicas do Supabase: o navegador não tem caminho até os dados.

Passos:
1. Escolher o projeto/banco. No Supabase: **SQL Editor** → colar `supabase/migrations/0001_agendamento.sql` → Run.
2. Copiar a string de conexão (Supabase: Project Settings → Database → Connection string → **Transaction pooler**, porta 6543).
3. Na Vercel → Settings → Environment Variables: `DATABASE_URL` (e `NEXT_PUBLIC_WHATSAPP_NUMBER`). Redeploy.
Nunca colar a string de conexão (tem a senha) em chat, commit ou código.

### Atenção ao plano gratuito do Supabase
Projetos gratuitos **pausam após ~7 dias sem atividade**. Num sistema de agendamento isso significaria o site sem agenda. Mitigações: um ping diário (Vercel Cron) que faça uma consulta simples, ou plano pago quando o negócio justificar. Neon gratuito não pausa permanentemente (acorda sozinho na primeira consulta, com ~1 s de atraso).

## Reaproveitar em outros sites
O motor está isolado do visual: `supabase/migrations`, `src/lib/booking/availability.ts` e `src/lib/scheduling/*`. Para um novo site, copiar esses três, rodar a migração em qualquer Postgres e ajustar `business_settings`. Uma API central multi-cliente só vale quando houver vários sites (exigiria `tenant_id` e revisão de LGPD).

## Painel do técnico (senha única)
`/admin` (login em `/admin/entrar`). Configuração: variável **`TECH_PASSWORD`** na Vercel (mínimo de 14 caracteres; sem ela o acesso fica desativado). Sessão: cookie `httpOnly`, `sameSite=lax`, restrito a `/admin`, assinado com HMAC e válido por 14 dias; trocar a senha encerra todas as sessões. Tentativas erradas: atraso de 1,2 s e bloqueio de 15 min após 5 falhas (por instância do servidor; a força da senha é a defesa principal). Toda página e ação do painel confere a sessão (`requireTech`/`guardAction`).
O painel tem 3 abas: **Aguardando sua resposta** (Confirmar/Recusar), **Avaliações de conserto** (enviar link de agendamento, chamar no WhatsApp, resolver por conversa) e **Próximos atendimentos** (cancelar). Depois de cada ação o cartão muda de cor, com ícone e texto: verde = confirmado, vermelho = recusado, amarelo = cancelado. A mensagem pronta para o WhatsApp do cliente fica dentro do cartão até o técnico marcar "Pronto, já avisei"; a de cancelamento leva o link de reagendamento. A lista atualiza sozinha a cada 30 s.

## Estado atual (nov/2026)
Ligado ao banco real: `/agendamento` (instalação com calendário, reserva de 10 min, pedido aguardando técnico; conserto com avaliação ou retirada), `/agendamento/convite/[token]` (convite individual, uso único, 48 h) e o painel do técnico. Sem `DATABASE_URL` o site cai para o modo demonstrativo; `/api/agenda/status` confirma a configuração.
Verificado de ponta a ponta contra um Postgres local: disputa entre dois clientes pelo mesmo horário, expiração, convite usado/inventado/malformado, consentimento, login, cookie falso, ação sem sessão (negada e sem alterar o pedido), confirmar/recusar/cancelar, acessibilidade.

## Próximas etapas
1. Aviso ao técnico quando chega pedido novo (hoje ele vê ao abrir o painel; a lista se atualiza a cada 30 s). Opções: notificação no celular (PWA) ou e-mail.
2. Antirrobô e limite de pedidos pendentes por telefone.
3. Deslocamento por distância (hoje fixo em 30 min).
4. Páginas `/sobre`, `/contato`, `/privacidade` (o aceite já aponta para a privacidade).
