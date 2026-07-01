-- 玉龙VPN v16 用户统计与动态验证码升级脚本
-- 不含收费和用户等级，只做匿名统计与简单准入。
-- Supabase → SQL Editor → New query → 粘贴整段 → Run

create table if not exists public.yulong_clients (
  id bigserial primary key,
  client_id text not null unique,
  plugin_version text default '',
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  status text default 'active'
);

create index if not exists idx_yulong_clients_last_seen_at
on public.yulong_clients(last_seen_at desc);

create table if not exists public.yulong_usage_events (
  id bigserial primary key,
  client_id text not null,
  event text not null,
  plugin_version text default '',
  node_id text default '',
  node_name text default '',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_yulong_usage_events_created_at
on public.yulong_usage_events(created_at desc);

create index if not exists idx_yulong_usage_events_client_id
on public.yulong_usage_events(client_id);

create index if not exists idx_yulong_usage_events_event
on public.yulong_usage_events(event);

insert into public.yulong_admin_logs(action, level, detail)
values ('v16 用户统计数据库升级完成', 'info', '{"tables":["yulong_clients","yulong_usage_events"]}'::jsonb);
