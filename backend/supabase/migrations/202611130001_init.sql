-- Core chatbot schema for the backend-only service.
-- Browser roles have no table grants; all access goes through the server API.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent_status boolean not null check (consent_status = true),
  created_at timestamptz not null default now(),
  constraint clients_email_normalized check (email = lower(btrim(email)))
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Only a one-way hash is stored. The random raw session token stays in an HttpOnly cookie.
  session_token_hash text not null unique check (session_token_hash ~ '^[a-f0-9]{64}$'),
  dify_conversation_id text
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(btrim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists conversations_client_created_idx
  on public.conversations (client_id, created_at desc);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc, id asc);

create or replace function public.set_conversation_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_conversation_updated_at();

alter table public.clients enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Keep the Data API closed to anonymous and authenticated browser requests.
-- The service role policy is explicit, while the service_role key remains server-only.
revoke all on table public.clients, public.conversations, public.messages
  from anon, authenticated;
grant select, insert, update, delete on table public.clients, public.conversations, public.messages
  to service_role;

drop policy if exists "backend service role access" on public.clients;
create policy "backend service role access" on public.clients
  for all to service_role using (true) with check (true);
drop policy if exists "no direct browser access" on public.clients;
create policy "no direct browser access" on public.clients
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "backend service role access" on public.conversations;
create policy "backend service role access" on public.conversations
  for all to service_role using (true) with check (true);
drop policy if exists "no direct browser access" on public.conversations;
create policy "no direct browser access" on public.conversations
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "backend service role access" on public.messages;
create policy "backend service role access" on public.messages
  for all to service_role using (true) with check (true);
drop policy if exists "no direct browser access" on public.messages;
create policy "no direct browser access" on public.messages
  for all to anon, authenticated using (false) with check (false);

-- Private, atomic fixed-window counters make rate limiting work across serverless instances.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.rate_limit_buckets (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);
create index if not exists rate_limit_buckets_window_idx
  on private.rate_limit_buckets (window_started_at);
revoke all on table private.rate_limit_buckets from public, anon, authenticated, service_role;

create or replace function public.consume_chat_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
begin
  if p_bucket_key !~ '^(session|ip):[a-f0-9]{64}$'
     or p_max_requests < 1 or p_max_requests > 1000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into private.rate_limit_buckets as current_bucket
    (bucket_key, window_started_at, request_count)
  values (p_bucket_key, v_now, 1)
  on conflict (bucket_key) do update set
    window_started_at = case
      when current_bucket.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else current_bucket.window_started_at
    end,
    request_count = case
      when current_bucket.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else current_bucket.request_count + 1
    end
  returning window_started_at, request_count
  into v_window_started_at, v_request_count;

  if random() < 0.01 then
    delete from private.rate_limit_buckets
      where window_started_at < v_now - interval '1 day';
  end if;

  return query select
    v_request_count <= p_max_requests,
    greatest(0, p_max_requests - v_request_count),
    v_window_started_at + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_chat_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(text, integer, integer)
  to service_role;
