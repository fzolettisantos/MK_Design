-- =====================================================================================
-- MK Design — convite de REAGENDAMENTO. Rodar no SQL Editor depois da 0001 (seguro rodar de novo).
--
-- Antes: o convite só existia para pedidos de avaliação (conserto).
-- Agora: o técnico também envia um convite quando CANCELA um atendimento, para o cliente escolher outro dia e hora.
--  * Convite de avaliação  -> reserva uma RETIRADA; o pedido de avaliação passa a 'confirmado' (atendido).
--  * Convite de reagendamento -> reserva um novo atendimento do MESMO tipo; o antigo continua 'cancelado'.
-- Continua uso único, validade de invite_hours e só o hash do token no banco.
-- =====================================================================================

create or replace function mk_agendamento.create_invite(p_request_id uuid, p_token_hash text, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s mk_agendamento.business_settings; v_exp timestamptz;
begin
  select * into s from mk_agendamento.business_settings where id = 1;
  if not exists (
    select 1 from mk_agendamento.bookings
     where id = p_request_id
       and ((kind = 'avaliacao' and status = 'aguardando_tecnico')
         or (kind in ('instalacao', 'retirada') and status = 'cancelado'))
  ) then
    return jsonb_build_object('ok', false, 'reason', 'pedido_invalido');
  end if;
  v_exp := p_now + make_interval(hours => s.invite_hours);
  update mk_agendamento.invites set expires_at = p_now
   where request_id = p_request_id and used_at is null and expires_at > p_now; -- só um convite ativo
  insert into mk_agendamento.invites (token_hash, request_id, expires_at, created_at) values (p_token_hash, p_request_id, v_exp, p_now);
  return jsonb_build_object('ok', true, 'expires_at', v_exp);
end $$;

create or replace function mk_agendamento.get_invite(p_token_hash text, p_now timestamptz default now()) returns jsonb
language plpgsql stable as $$
declare i mk_agendamento.invites; r mk_agendamento.bookings;
begin
  select * into i from mk_agendamento.invites where token_hash = p_token_hash;
  if not found then return jsonb_build_object('ok', false, 'reason', 'convite_invalido'); end if;
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'convite_usado'); end if;
  if i.expires_at <= p_now then return jsonb_build_object('ok', false, 'reason', 'convite_expirado'); end if;
  select * into r from mk_agendamento.bookings where id = i.request_id;
  return jsonb_build_object('ok', true, 'expires_at', i.expires_at, 'service_slug', r.service_slug, 'kind', r.kind,
                            'first_name', split_part(r.customer_name, ' ', 1), 'location', r.location);
end $$;

create or replace function mk_agendamento.claim_invite_slot(p_token_hash text, p_start timestamptz, p_now timestamptz default now())
returns jsonb language plpgsql as $$
declare s mk_agendamento.business_settings; i mk_agendamento.invites; r mk_agendamento.bookings; why text;
        v_id uuid; v_protocol text; v_exp timestamptz; v_kind text;
begin
  perform mk_agendamento.expire_stale(p_now);
  select * into i from mk_agendamento.invites where token_hash = p_token_hash for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'convite_invalido'); end if;
  if i.used_at is not null then return jsonb_build_object('ok', false, 'reason', 'convite_usado'); end if;
  if i.expires_at <= p_now then return jsonb_build_object('ok', false, 'reason', 'convite_expirado'); end if;
  why := mk_agendamento.check_slot(p_start, p_now);
  if why is not null then return jsonb_build_object('ok', false, 'reason', why); end if;
  select * into s from mk_agendamento.business_settings where id = 1;
  select * into r from mk_agendamento.bookings where id = i.request_id;
  v_kind := case when r.kind = 'avaliacao' then 'retirada' else r.kind end;
  v_exp := p_now + make_interval(hours => s.confirm_hours);
  loop
    v_protocol := mk_agendamento.gen_protocol(p_now);
    begin
      insert into mk_agendamento.bookings (protocol, parent_id, service_slug, kind, status, start_at, end_at, duration_minutes,
                                           expires_at, customer_name, customer_phone, location, details, consent_at, created_at, updated_at)
      values (v_protocol, r.id, r.service_slug, v_kind, 'aguardando_confirmacao', p_start,
              p_start + make_interval(mins => s.slot_minutes + s.travel_buffer_minutes), s.slot_minutes, v_exp,
              r.customer_name, r.customer_phone, r.location, r.details, r.consent_at, p_now, p_now)
      returning id into v_id;
      update mk_agendamento.invites set used_at = p_now where id = i.id;
      if r.kind = 'avaliacao' then
        update mk_agendamento.bookings set status = 'confirmado', updated_at = p_now where id = r.id; -- avaliação atendida
      end if;
      return jsonb_build_object('ok', true, 'id', v_id, 'protocol', v_protocol, 'expires_at', v_exp);
    exception
      when exclusion_violation then return jsonb_build_object('ok', false, 'reason', 'slot_taken');
      when unique_violation then null;
    end;
  end loop;
end $$;
