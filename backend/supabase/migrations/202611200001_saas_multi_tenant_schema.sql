
-- ============================================================================
-- AI Website Support Chatbot SaaS - Multi-Tenant Schema Migration
-- ============================================================================
-- Designed for complete multi-tenancy, website crawling, Gemini RAG retrieval,
-- custom widget configurations, visitor conversations, and analytics.
-- Browser roles (anon/authenticated) have no direct table access; all operations
-- are strictly validated and managed via the backend service role.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. SaaS Users (Admins / Website Owners)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  email text not null unique,
  name text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now()
);

-- 2. Websites / Tenants
create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  url text not null,
  domain text not null,
  description text,
  crawl_status text not null default 'idle' check (crawl_status in ('idle', 'in_progress', 'completed', 'failed')),
  last_crawled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_websites_user_id on public.websites(user_id);
create index if not exists idx_websites_domain on public.websites(domain);

-- 3. Crawled Web Pages
create table if not exists public.crawled_pages (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  url text not null,
  path text not null,
  title text,
  description text,
  clean_text text not null,
  status text not null default 'crawled' check (status in ('crawled', 'indexed', 'failed')),
  created_at timestamptz not null default now(),
  constraint uq_website_page_url unique (website_id, url)
);

create index if not exists idx_crawled_pages_website on public.crawled_pages(website_id);

-- 4. Knowledge Base Documents (Crawled & Manually Added FAQs/Docs)
create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  title text not null,
  source_type text not null default 'crawled_page' check (source_type in ('crawled_page', 'manual_doc', 'faq')),
  source_url text,
  content text not null,
  fts tsvector generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_docs_website on public.knowledge_documents(website_id);
create index if not exists idx_knowledge_docs_fts on public.knowledge_documents using gin(fts);

-- 5. Chatbot Configurations (Brand Colors, Public ID, Customization)
create table if not exists public.chatbot_configs (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null unique references public.websites(id) on delete cascade,
  public_chatbot_id text not null unique default 'bot_' || lower(substr(encode(gen_random_bytes(12), 'hex'), 1, 16)),
  chatbot_name text not null default 'AI Support Assistant',
  welcome_message text not null default 'Hi there! How can I help you today?',
  placeholder_text text not null default 'Ask a question...',
  primary_color text not null default '#0F172A',
  secondary_color text not null default '#3B82F6',
  background_color text not null default '#FFFFFF',
  text_color text not null default '#1E293B',
  font_family text not null default 'Inter, system-ui, sans-serif',
  logo_url text,
  position text not null default 'bottom-right' check (position in ('bottom-right', 'bottom-left')),
  allowed_origins text[] not null default array['*']::text[],
  is_published boolean not null default true,
  system_prompt_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chatbot_configs_public_id on public.chatbot_configs(public_chatbot_id);

-- 6. Suggested Questions per Website
create table if not exists public.suggested_questions (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  question_text text not null check (length(btrim(question_text)) > 0),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_suggested_questions_website on public.suggested_questions(website_id, display_order asc);

-- 7. Widget Visitor Conversations (End-User Website Visitors)
create table if not exists public.widget_conversations (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  public_chatbot_id text not null references public.chatbot_configs(public_chatbot_id) on delete cascade,
  visitor_id text not null,
  session_token_hash text not null unique,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_widget_conversations_website on public.widget_conversations(website_id, created_at desc);
create index if not exists idx_widget_conversations_public_id on public.widget_conversations(public_chatbot_id);

-- 8. Widget Visitor Messages
create table if not exists public.widget_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.widget_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (length(btrim(content)) > 0),
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_widget_messages_convo on public.widget_messages(conversation_id, created_at asc);

-- 9. Analytics Events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_website on public.analytics_events(website_id, created_at desc);

-- 10. Automatic Updated_At Trigger Function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists websites_set_updated_at on public.websites;
create trigger websites_set_updated_at
before update on public.websites
for each row execute function public.handle_updated_at();

drop trigger if exists chatbot_configs_set_updated_at on public.chatbot_configs;
create trigger chatbot_configs_set_updated_at
before update on public.chatbot_configs
for each row execute function public.handle_updated_at();

drop trigger if exists widget_conversations_set_updated_at on public.widget_conversations;
create trigger widget_conversations_set_updated_at
before update on public.widget_conversations
for each row execute function public.handle_updated_at();

-- 11. Stored Function: Full-Text Knowledge Match for Website
create or replace function public.match_website_knowledge(
  p_website_id uuid,
  p_query text,
  p_limit integer default 5
)
returns table (
  id uuid,
  title text,
  source_type text,
  source_url text,
  content text,
  rank real
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  ts_q tsquery;
begin
  ts_q := plainto_tsquery('english', p_query);
  return query
  select
    kd.id,
    kd.title,
    kd.source_type,
    kd.source_url,
    kd.content,
    ts_rank(kd.fts, ts_q) as rank
  from public.knowledge_documents kd
  where kd.website_id = p_website_id
    and (ts_q = ''::tsquery or kd.fts @@ ts_q)
  order by rank desc, kd.created_at desc
  limit coalesce(p_limit, 5);
end;
$$;

-- 12. Security & Row-Level Security (RLS) Configuration
alter table public.users enable row level security;
alter table public.websites enable row level security;
alter table public.crawled_pages enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.chatbot_configs enable row level security;
alter table public.suggested_questions enable row level security;
alter table public.widget_conversations enable row level security;
alter table public.widget_messages enable row level security;
alter table public.analytics_events enable row level security;

-- Revoke direct anon & authenticated browser table access (all access via Express backend)
revoke all on table
  public.users,
  public.websites,
  public.crawled_pages,
  public.knowledge_documents,
  public.chatbot_configs,
  public.suggested_questions,
  public.widget_conversations,
  public.widget_messages,
  public.analytics_events
from anon, authenticated;

-- Grant full access to service_role
grant all on table
  public.users,
  public.websites,
  public.crawled_pages,
  public.knowledge_documents,
  public.chatbot_configs,
  public.suggested_questions,
  public.widget_conversations,
  public.widget_messages,
  public.analytics_events
to service_role;

-- Service role policies
create policy "service_role_all_users" on public.users for all to service_role using (true) with check (true);
create policy "service_role_all_websites" on public.websites for all to service_role using (true) with check (true);
create policy "service_role_all_crawled_pages" on public.crawled_pages for all to service_role using (true) with check (true);
create policy "service_role_all_knowledge_documents" on public.knowledge_documents for all to service_role using (true) with check (true);
create policy "service_role_all_chatbot_configs" on public.chatbot_configs for all to service_role using (true) with check (true);
create policy "service_role_all_suggested_questions" on public.suggested_questions for all to service_role using (true) with check (true);
create policy "service_role_all_widget_conversations" on public.widget_conversations for all to service_role using (true) with check (true);
create policy "service_role_all_widget_messages" on public.widget_messages for all to service_role using (true) with check (true);
create policy "service_role_all_analytics_events" on public.analytics_events for all to service_role using (true) with check (true);

-- 13. Default Seed User for Development/Local Testing
insert into public.users (email, name, role)
values ('dev@supportai.local', 'Default Workspace Owner', 'owner')
on conflict (email) do nothing;
