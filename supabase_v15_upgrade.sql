-- 玉龙VPN v15 数据库升级脚本
-- 用途：增加后台检测历史表和后台操作日志表。
-- 运行方式：Supabase → SQL Editor → New query → 粘贴整段 → Run

create table if not exists public.yulong_node_checks (
  id bigserial primary key,
  run_id text not null,
  node_id text default '',
  node_name text default '',
  region text default '',
  host text default '',
  port integer default 443,
  ok boolean default false,
  ms integer,
  status_code integer,
  message text default '',
  error text,
  created_at timestamptz default now()
);

create index if not exists idx_yulong_node_checks_created_at
on public.yulong_node_checks(created_at desc);

create index if not exists idx_yulong_node_checks_run_id
on public.yulong_node_checks(run_id);

create index if not exists idx_yulong_node_checks_node_id
on public.yulong_node_checks(node_id);

create table if not exists public.yulong_admin_logs (
  id bigserial primary key,
  action text not null,
  level text default 'info',
  detail jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_yulong_admin_logs_created_at
on public.yulong_admin_logs(created_at desc);

insert into public.yulong_admin_logs(action, level, detail)
values ('v15 数据库升级完成', 'info', '{"source":"supabase_sql_editor"}'::jsonb);
