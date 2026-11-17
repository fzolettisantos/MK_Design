-- =====================================================================================
-- MK Design — 0003. Rodar depois da 0001 e da 0002 (seguro rodar de novo).
--  1. Convite de reagendamento também para atendimentos RECUSADOS (além dos cancelados).
--  2. Retenção de dados (LGPD): função purge_old apaga o que passou do prazo (padrão 12 meses).
--  3. Assinaturas de notificação push do técnico (aviso de pedido novo no celular).
-- =====================================================================================

-- 1) recusado também aceita convite --------------------------------------------------
create or replace function mk_agendamento.create_invite(p_request_id uuid, p_token_hash text, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s mk_agendamento.business_settings; v_exp timestamptz;
begin
  select * into s from mk_agendamento.business_settings where id = 1;
  if not exists (
    select 1 from mk_agendamento.bookings
     where id = p_request_id
       and ((kind = 'avaliacao' and status = 'aguardando_tecnico')
         or (kind in ('instalacao', 'retirada') and status in ('cancelado', 'recusado')))
  ) then
    return jsonb_build_object('ok', false, 'reason', 'pedido_invalido');
  end if;
  v_exp := p_now + make_interval(hours => s.invite_hours);
  update mk_agendamento.invites set expires_at = p_now
   where request_id = p_request_id and used_at is null and expires_at > p_now; -- só um convite ativo
  insert into mk_agendamento.invites (token_hash, request_id, expires_at, created_at) values (p_token_hash, p_request_id, v_exp, p_now);
  return jsonb_build_object('ok', true, 'expires_at', v_exp);
end $$;

-- 2) retenção ------------------------------------------------------------------------
alter table mk_agendamento.business_settings
  add column if not exists retention_months int not null default 12 check (retention_months between 1 and 60);

-- Apaga pedidos (e convites/histórico) cujo atendimento (ou criação, se sem horário) passou do prazo.
-- Também limpa reservas temporárias abandonadas (sem dados pessoais) com mais de 1 dia.
create or replace function mk_agendamento.purge_old(p_now timestamptz default now()) returns jsonb
language plpgsql as $$
declare s mk_agendamento.business_settings; cutoff timestamptz; n_old int; n_holds int;
begin
  select * into s from mk_agendamento.business_settings where id = 1;
  cutoff := p_now - make_interval(months => s.retention_months);
  create temp table if not exists _old_ids (id uuid primary key) on commit drop;
  delete from _old_ids;
  insert into _old_ids select id from mk_agendamento.bookings where coalesce(end_at, created_at) < cutoff;
  update mk_agendamento.bookings set parent_id = null where parent_id in (select id from _old_ids);
  delete from mk_agendamento.invites where request_id in (select id from _old_ids);
  delete from mk_agendamento.bookings where id in (select id from _old_ids);
  get diagnostics n_old = row_count;
  delete from mk_agendamento.bookings
   where status = 'expirado' and customer_name is null and created_at < p_now - interval '1 day';
  get diagnostics n_holds = row_count;
  return jsonb_build_object('ok', true, 'apagados', n_old, 'reservas_abandonadas', n_holds, 'corte', cutoff);
end $$;

-- 3) assinaturas de push -------------------------------------------------------------
create table if not exists mk_agendamento.push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
alter table mk_agendamento.push_subscriptions enable row level security;
revoke all on mk_agendamento.push_subscriptions from public;
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated', 'service_role'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on mk_agendamento.push_subscriptions from %I', r);
      execute format('revoke all on all functions in schema mk_agendamento from %I', r);
    end if;
  end loop;
end $$;
revoke all on all functions in schema mk_agendamento from public;
