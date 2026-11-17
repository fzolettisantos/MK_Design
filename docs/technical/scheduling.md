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
3. `0003_recusa_retencao_push.sql` — a **recusa** também envia o link de reagendamento; **retenção de dados** (`purge_old`, prazo `retention_months`, padrão 12); tabela das assinaturas de **notificação push**.

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

## Avisos de pedido novo no celular (Web Push)
Quando chega um pedido (reserva, avaliação ou remarcação pelo link) o servidor envia uma notificação ao celular do técnico, depois de responder ao cliente (`after()`), em melhor esforço: se o envio falhar, o pedido do cliente não é afetado. O texto **não leva nome nem telefone**: só o tipo de pedido e o horário. Aparelhos que não existem mais (404/410) são removidos sozinhos.
Configuração (uma vez): em `/admin`, o cartão "Avisos de pedido novo" tem o botão **Gerar chaves** (só aparece enquanto elas não existem e só para quem está logado). Cadastrar na Vercel como **Secret** `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`, publicar de novo, abrir `/admin` no celular e tocar em **Ativar avisos neste aparelho** (depois, **Enviar aviso de teste**). No **iPhone** é preciso antes "Adicionar à Tela de Início" e abrir o painel pelo ícone; no Android, usar o Chrome.
Limite: o plano gratuito da Vercel só permite agendador diário, então não há aviso de "convite expirou" ou "pedido vai expirar" no horário exato; o técnico vê isso no painel (atualiza a cada 30 s).

## Retenção de dados (LGPD)
A política de privacidade (`/privacidade`) promete apagar os dados após **12 meses**. Isso é cumprido por `mk_agendamento.purge_old` (apaga pedidos, convites e histórico além do prazo, e reservas abandonadas), chamada todo dia às 06:00 UTC pela rota `/api/agenda/limpeza` (agendador em `vercel.json`). A rota só responde com `Authorization: Bearer <CRON_SECRET>`: cadastrar **`CRON_SECRET`** (mín. 16 caracteres) na Vercel, que a envia sozinha. Sem ele a limpeza fica desativada.

## Estado atual (nov/2026)
Ligado ao banco real: `/agendamento`, `/agendamento/convite/[token]` (avaliação, cancelamento e recusa), painel do técnico, avisos no celular, limpeza agendada e política de privacidade publicada.
Verificado de ponta a ponta contra um Postgres local e um servidor de push simulado: disputa entre dois clientes, expiração, convites (usado/inventado/malformado), login, cookie falso, ação sem sessão, confirmar/recusar/cancelar com link e remarcação, envio do push e remoção de aparelho morto, limpeza com e sem credencial, service worker exibindo a notificação, acessibilidade.

## Próximas etapas
1. Antirrobô e limite de pedidos pendentes por telefone.
2. Deslocamento por distância (hoje fixo em 30 min).
3. Páginas `/sobre` e `/contato`.
4. Revisão jurídica da política de privacidade e inclusão de razão social/CNPJ.
