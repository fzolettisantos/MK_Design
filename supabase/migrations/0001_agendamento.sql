-- =====================================================================================
-- MK Design — agendamento (um técnico, atendimento 24h). Rodar no SQL Editor do Supabase.
--
-- Garantias (no BANCO, não na tela):
--  * Nunca dois atendimentos sobrepostos: restrição de exclusão sobre o intervalo [início, fim+deslocamento).
--  * Reserva temporária (10 min) e pedido aguardando técnico (12 h) expiram sozinhos e liberam o horário.
--  * Antecedência mínima e janela máxima são validadas aqui, mesmo que alguém chame a API direto.
--  * Convite do técnico: token só guardado como hash, uso único, validade 48 h.
--  * RLS ligado e SEM políticas: o navegador nunca acessa as tabelas. Só o servidor (service_role).
-- Todas as funções recebem p_now (padrão now()) para poderem ser testadas com relógio controlado.
-- =====================================================================================

create table public.business_settings (
  id                    int primary key default 1 check (id = 1),
  timezone              text not null default 'America/Sao_Paulo',
  slot_minutes          int  not null default 60  check (slot_minutes between 15 and 480),
  travel_buffer_minutes int  not null default 30  check (travel_buffer_minutes between 0 and 240),
  lead_hours            int  not null default 24  check (lead_hours >= 0),
  horizon_days          int  not null default 30  check (horizon_days between 1 and 365),
  hold_minutes          int  not null default 10  check (hold_minutes between 1 and 60),
  confirm_hours         int  not null default 12  check (confirm_hours between 1 and 168),
  invite_hours          int  not null default 48  check (invite_hours between 1 and 336),
  updated_at            timestamptz not null default now()
);
insert into public.business_settings default values;

create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  protocol         text not null unique,
  parent_id        uuid references public.bookings(id),
  service_slug     text not null,
  kind             text not null check (kind in ('instalacao', 'retirada', 'avaliacao')),
  status           text not null check (status in (
                     'reserva_temporaria', 'aguardando_confirmacao', 'confirmado', 'em_atendimento',
                     'concluido', 'cancelado', 'recusado', 'expirado', 'aguardando_tecnico')),
  start_at         timestamptz,
  end_at           timestamptz,               -- fim do bloco, JÁ com o tempo de deslocamento
  duration_minutes int,
  hold_token       text,
  expires_at       timestamptz,
  customer_name    text,
  customer_phone   text,
  location         jsonb,
  details          jsonb,
  consent_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint slot_complete check ((start_at is null) = (end_at is null)),
  constraint slot_valid    check (start_at is null or end_at > start_at),
  constraint no_overlap exclude using gist (tstzrange(start_at, end_at, '[)') with &&)
    where (start_at is not null
           and status in ('reserva_temporaria', 'aguardando_confirmacao', 'confirmado', 'em_atendimento'))
);
create index bookings_status_idx on public.bookings (status, expires_at);

create table public.booking_status_history (
  id          bigint generated always as identity primary key,
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status   text not null,
  at          timestamptz not null default now()
);

create table public.invites (
  id         uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  request_id uuid not null references public.bookings(id),
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create function public.log_status_change() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.booking_status_history (booking_id, from_status, to_status)
    values (new.id, case when tg_op = 'UPDATE' then old.status end, new.status);
  end if;
  return new;
end $$;
create trigger bookings_status_log after insert or update of status on public.bookings
  for each row execute function public.log_status_change();

-- ------------------------------------------------------------------ utilitários
create function public.gen_protocol(p_now timestamptz default now()) returns text language plpgsql as $$
declare alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; code text := ''; i int;
begin
  for i in 1..5 loop code := code || substr(alphabet, 1 + floor(random() * 32)::int, 1); end loop;
  return 'MK-' || to_char(p_now at time zone 'America/Sao_Paulo', 'YYMMDD') || '-' || code;
end $$;

-- Libera o que expirou (a restrição de exclusão não enxerga o relógio, então a expiração é materializada).
create function public.expire_stale(p_now timestamptz default now()) returns int language plpgsql as $$
declare n int;
begin
  update public.bookings set status = 'expirado', updated_at = p_now
   where status in ('reserva_temporaria', 'aguardando_confirmacao') and expires_at is not null and expires_at <= p_now;
  get diagnostics n = row_count;
  return n;
end $$;

-- Valida grade, antecedência e janela. Devolve null se ok, ou o motivo.
create function public.check_slot(p_start timestamptz, p_now timestamptz) returns text language plpgsql stable as $$
declare s public.business_settings;
begin
  select * into s from public.business_settings where id = 1;
  if mod(extract(epoch from p_start)::bigint, s.slot_minutes * 60) <> 0 then return 'fora_da_grade'; end if;
  if p_start < p_now + make_interval(hours => s.lead_hours) then return 'antecedencia'; end if;
  if p_start > p_now + make_interval(days => s.horizon_days) then return 'fora_da_janela'; end if;
  return null;
end $$;

-- Intervalos ocupados (SEM dados pessoais) para o servidor calcular os horários livres.
create function public.get_busy(p_from timestamptz, p_to timestamptz, p_now timestamptz default now())
returns table (start_at timestamptz, core_end_at timestamptz, end_at timestamptz) language sql stable as $$
  select b.start_at, b.start_at + make_interval(mins => b.duration_minutes), b.end_at
    from public.bookings b
   where b.start_at is not null and b.end_at > p_from and b.start_at < p_to
     and b.status in ('reserva_temporaria', 'aguardando_confirmacao', 'confirmado', 'em_atendimento')
     and (b.status in ('confirmado', 'em_atendimento') or b.expires_at > p_now)
$$;

-- ------------------------------------------------------------------ reserva temporária
create function public.hold_slot(p_start timestamptz, p_service_slug text, p_kind text, p_token text,
                                 p_now timestamptz default now()) returns jsonb language plpgsql as $$
declare s public.business_settings; why text; v_id uuid; v_protocol text; v_exp timestamptz;
begin
  perform public.expire_stale(p_now);
  why := public.check_slot(p_start, p_now);
  if why is not null then return jsonb_build_object('ok', false, 'reason', why); end if;
  select * into s from public.business_settings where id = 1;
  v_exp := p_now + make_interval(mins => s.hold_minutes);
  loop
    v_protocol := public.gen_protocol(p_now);
    begin
      insert into public.bookings (protocol, service_slug, kind, status, start_at, end_at, duration_minutes,
                                   hold_token, expires_at, created_at, updated_at)
      values (v_protocol, p_service_slug, p_kind, 'reserva_temporaria', p_start,
              p_start + make_interval(mins => s.slot_minutes + s.travel_buffer_minutes), s.slot_minutes,
              p_token, v_exp, p_now, p_now)
      returning id into v_id;
      return jsonb_build_object('ok', true, 'id', v_id, 'protocol', v_protocol, 'expires_at', v_exp);
    exception
      when exclusion_violation then return jsonb_build_object('ok', false, 'reason', 'slot_taken');
      when unique_violation then null; -- protocolo repetido: tenta outro
    end;
  end loop;
end $$;

create function public.release_hold(p_id uuid, p_token text, p_now timestamptz default now()) returns jsonb
language plpgsql as $$
begin
  update public.bookings set status = 'cancelado', updated_at = p_now
   where id = p_id and hold_token = p_token and status = 'reserva_temporaria';
  return jsonb_build_object('ok', found);
end $$;

-- Transforma a reserva temporária em pedido aguardando o técnico (prazo de confirmação: 12 h).
create function public.finalize_hold(p_id uuid, p_token text, p_data jsonb, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s public.business_settings; b public.bookings;
begin
  select * into s from public.business_settings where id = 1;
  select * into b from public.bookings where id = p_id and hold_token = p_token for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'nao_encontrado'); end if;
  if b.status <> 'reserva_temporaria' or b.expires_at <= p_now then
    return jsonb_build_object('ok', false, 'reason', 'reserva_expirada');
  end if;
  update public.bookings set
      status = 'aguardando_confirmacao', expires_at = p_now + make_interval(hours => s.confirm_hours),
      customer_name = p_data->>'name', customer_phone = p_data->>'phone', location = p_data->'location',
      details = p_data->'details', consent_at = p_now, updated_at = p_now
   where id = p_id;
  return jsonb_build_object('ok', true, 'protocol', b.protocol, 'expires_at', p_now + make_interval(hours => s.confirm_hours));
end $$;

-- ------------------------------------------------------------------ avaliação + convite
create function public.create_evaluation_request(p_service_slug text, p_data jsonb, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare v_id uuid; v_protocol text;
begin
  loop
    v_protocol := public.gen_protocol(p_now);
    begin
      insert into public.bookings (protocol, service_slug, kind, status, customer_name, customer_phone, location,
                                   details, consent_at, created_at, updated_at)
      values (v_protocol, p_service_slug, 'avaliacao', 'aguardando_tecnico', p_data->>'name', p_data->>'phone',
              p_data->'location', p_data->'details', p_now, p_now, p_now)
      returning id into v_id;
      return jsonb_build_object('ok', true, 'id', v_id, 'protocol', v_protocol);
    exception when unique_violation then null;
    end;
  end loop;
end $$;

create function public.create_invite(p_request_id uuid, p_token_hash text, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s public.business_settings; v_exp timestamptz;
begin
  select * into s from public.business_settings where id = 1;
  if not exists (select 1 from public.bookings where id = p_request_id and kind = 'avaliacao'
                   and status = 'aguardando_tecnico') then
    return jsonb_build_object('ok', false, 'reason', 'pedido_invalido');
  end if;
  v_exp := p_now + make_interval(hours => s.invite_hours);
  update public.invites set expires_at = p_now where request_id = p_request_id and used_at is null and expires_at > p_now; -- só um convite ativo
  insert into public.invites (token_hash, request_id, expires_at, created_at) values (p_token_hash, p_request_id, v_exp, p_now);
  return jsonb_build_object('ok', true, 'expires_at', v_exp);
end $$;

-- Dados mínimos do convite para a tela do cliente (sem expor mais do que o necessário).
create function public.get_invite(p_token_hash text, p_now timestamptz default now()) returns jsonb
language plpgsql stable as $$
declare i public.invites; r public.bookings;
begin
  select * into i from public.invites where token_hash = p_token_hash;
  if not found then return jsonb_build_object('ok', false, 'reason', 'convite_invalido'); end if;
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'convite_usado'); end if;
  if i.expires_at <= p_now then return jsonb_build_object('ok', false, 'reason', 'convite_expirado'); end if;
  select * into r from public.bookings where id = i.request_id;
  return jsonb_build_object('ok', true, 'expires_at', i.expires_at, 'service_slug', r.service_slug,
                            'first_name', split_part(r.customer_name, ' ', 1), 'location', r.location);
end $$;

-- Cliente escolheu o horário pelo convite: reserva + consome o convite, tudo ou nada.
create function public.claim_invite_slot(p_token_hash text, p_start timestamptz, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s public.business_settings; i public.invites; r public.bookings; why text; v_id uuid; v_protocol text; v_exp timestamptz;
begin
  perform public.expire_stale(p_now);
  select * into i from public.invites where token_hash = p_token_hash for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'convite_invalido'); end if;
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'convite_usado'); end if;
  if i.expires_at <= p_now then return jsonb_build_object('ok', false, 'reason', 'convite_expirado'); end if;
  why := public.check_slot(p_start, p_now);
  if why is not null then return jsonb_build_object('ok', false, 'reason', why); end if;
  select * into s from public.business_settings where id = 1;
  select * into r from public.bookings where id = i.request_id;
  v_exp := p_now + make_interval(hours => s.confirm_hours);
  loop
    v_protocol := public.gen_protocol(p_now);
    begin
      insert into public.bookings (protocol, parent_id, service_slug, kind, status, start_at, end_at, duration_minutes,
                                   expires_at, customer_name, customer_phone, location, details, consent_at, created_at, updated_at)
      values (v_protocol, r.id, r.service_slug, 'retirada', 'aguardando_confirmacao', p_start,
              p_start + make_interval(mins => s.slot_minutes + s.travel_buffer_minutes), s.slot_minutes, v_exp,
              r.customer_name, r.customer_phone, r.location, r.details, r.consent_at, p_now, p_now)
      returning id into v_id;
      update public.invites set used_at = p_now where id = i.id;
      update public.bookings set status = 'confirmado', updated_at = p_now where id = r.id; -- pedido de avaliação atendido
      return jsonb_build_object('ok', true, 'id', v_id, 'protocol', v_protocol, 'expires_at', v_exp);
    exception
      when exclusion_violation then return jsonb_build_object('ok', false, 'reason', 'slot_taken');
      when unique_violation then null;
    end;
  end loop;
end $$;

-- Convites vencidos sem resposta: o painel do técnico mostra e/ou dispara alerta.
create view public.invites_unanswered as
  select i.id, i.request_id, i.expires_at, b.protocol, b.customer_name, b.customer_phone
    from public.invites i join public.bookings b on b.id = i.request_id
   where i.used_at is null and i.expires_at <= now();

-- ------------------------------------------------------------------ decisão do técnico
create function public.technician_decide(p_id uuid, p_decision text, p_now timestamptz default now()) returns jsonb
language plpgsql as $$
declare b public.bookings; to_status text;
begin
  perform public.expire_stale(p_now);
  select * into b from public.bookings where id = p_id for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'nao_encontrado'); end if;
  if b.status <> 'aguardando_confirmacao' then return jsonb_build_object('ok', false, 'reason', 'status_invalido', 'status', b.status); end if;
  to_status := case p_decision when 'confirmar' then 'confirmado' when 'recusar' then 'recusado' end;
  if to_status is null then return jsonb_build_object('ok', false, 'reason', 'decisao_invalida'); end if;
  update public.bookings set status = to_status, expires_at = null, updated_at = p_now where id = p_id;
  return jsonb_build_object('ok', true, 'status', to_status, 'customer_name', b.customer_name, 'customer_phone', b.customer_phone, 'protocol', b.protocol);
end $$;

-- ------------------------------------------------------------------ segurança
alter table public.business_settings     enable row level security;
alter table public.bookings              enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.invites               enable row level security;
-- Sem políticas = nenhum acesso pelo navegador (anon/authenticated). O servidor usa a service_role.
-- Funções novas são executáveis por PUBLIC por padrão (e anon/authenticated herdam): fecha para todos.
revoke all on all functions in schema public from public;
alter default privileges in schema public revoke execute on functions from public;
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on all tables in schema public from %I', r);
      execute format('revoke all on all functions in schema public from %I', r);
      execute format('alter default privileges in schema public revoke execute on functions from %I', r);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on all functions in schema public to service_role;
    grant all on all tables in schema public to service_role;
  end if;
end $$;
