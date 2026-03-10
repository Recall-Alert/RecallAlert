-- ═══════════════════════════════════════════════════════
-- RecallAlert — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── 1. RECALLS ──────────────────────────────────────────
create table if not exists recalls (
  id                      bigserial primary key,
  recall_number           text unique not null,
  slug                    text unique,
  category                text not null check (category in ('food', 'drug', 'device')),
  recalling_firm          text,
  classification          text,
  reason_for_recall       text,
  product_description     text,
  code_info               text,
  distribution_pattern    text,
  product_quantity        text,
  status                  text,
  voluntary_mandated      text,
  city                    text,
  state                   text,
  country                 text,
  recall_initiation_date  text,
  report_date             text,
  termination_date        text,
  ai_summary              text,
  synced_at               timestamptz default now(),
  created_at              timestamptz default now()
);

-- Full-text search column (auto-updated)
alter table recalls add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(recalling_firm, '') || ' ' ||
      coalesce(reason_for_recall, '') || ' ' ||
      coalesce(product_description, '') || ' ' ||
      coalesce(code_info, '')
    )
  ) stored;

-- Indexes
create index if not exists recalls_fts_idx      on recalls using gin(fts);
create index if not exists recalls_date_idx     on recalls (recall_initiation_date desc);
create index if not exists recalls_category_idx on recalls (category);
create index if not exists recalls_class_idx    on recalls (classification);
create index if not exists recalls_firm_idx     on recalls (recalling_firm);
create index if not exists recalls_synced_idx   on recalls (synced_at desc);

-- ── 2. SUBSCRIBERS ──────────────────────────────────────
create table if not exists subscribers (
  id          bigserial primary key,
  email       text unique not null,
  category    text not null default 'all' check (category in ('all', 'food', 'drug', 'device')),
  frequency   text not null default 'weekly' check (frequency in ('instant', 'daily', 'weekly')),
  confirmed   boolean not null default false,
  token       text unique default gen_random_uuid()::text,
  created_at  timestamptz default now(),
  last_sent   timestamptz
);

create index if not exists subscribers_confirmed_idx on subscribers (confirmed);
create index if not exists subscribers_token_idx     on subscribers (token);

-- ── 3. ALERT LOG ────────────────────────────────────────
create table if not exists alert_log (
  id            bigserial primary key,
  subscriber_id bigint not null references subscribers(id) on delete cascade,
  recall_id     bigint not null references recalls(id) on delete cascade,
  sent_at       timestamptz default now(),
  unique(subscriber_id, recall_id)
);

create index if not exists alert_log_sub_idx on alert_log (subscriber_id);

-- ── 4. PAGE ANALYTICS ───────────────────────────────────
create table if not exists page_views (
  id         bigserial primary key,
  path       text,
  referrer   text,
  query      text,
  country    text,
  viewed_at  timestamptz default now()
);

create index if not exists page_views_path_idx on page_views (path);
create index if not exists page_views_date_idx on page_views (viewed_at desc);

-- ── 5. ROW LEVEL SECURITY ───────────────────────────────
alter table recalls      enable row level security;
alter table subscribers  enable row level security;
alter table alert_log    enable row level security;

-- Public can read recalls
create policy "Public read recalls" on recalls
  for select using (true);

-- Service role only can write recalls
create policy "Service write recalls" on recalls
  for insert with check (auth.role() = 'service_role');

create policy "Service update recalls" on recalls
  for update using (auth.role() = 'service_role');

-- ── 6. HELPER VIEWS ─────────────────────────────────────

-- Most recent 100 recalls across all categories
create or replace view recent_recalls as
  select * from recalls
  order by recall_initiation_date desc
  limit 100;

-- Active Class I recalls only (highest risk, not terminated)
create or replace view class1_active as
  select * from recalls
  where classification = 'Class I'
    and (termination_date is null or termination_date = '')
  order by recall_initiation_date desc;

-- Subscriber stats (for admin dashboard)
create or replace view subscriber_stats as
  select
    count(*) as total,
    count(*) filter (where confirmed = true) as confirmed,
    count(*) filter (where category = 'all') as all_cats,
    count(*) filter (where category = 'food') as food,
    count(*) filter (where category = 'drug') as drug,
    count(*) filter (where category = 'device') as device
  from subscribers;

-- ── 7. SEED: verify connection ───────────────────────────
-- Run this to confirm setup is working:
-- select count(*) from recalls;
-- select * from subscriber_stats;
