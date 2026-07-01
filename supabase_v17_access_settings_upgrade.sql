-- 玉龙VPN v17 动态验证码自定义设置升级脚本
-- 用途：允许在后台自定义验证码内容和失效时间。
-- Supabase → SQL Editor → New query → 粘贴整段 → Run

create table if not exists public.yulong_access_settings (
  id text primary key default 'main',
  code text not null,
  expires_at timestamptz not null,
  enabled boolean default true,
  note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.yulong_access_settings(id, code, expires_at, enabled, note)
values ('main', '888888', now() + interval '1 day', true, '默认验证码，请在后台用户统计 / 验证码页面修改')
on conflict (id) do nothing;

insert into public.yulong_admin_logs(action, level, detail)
values ('v17 验证码自定义设置升级完成', 'info', '{"table":"yulong_access_settings"}'::jsonb);
