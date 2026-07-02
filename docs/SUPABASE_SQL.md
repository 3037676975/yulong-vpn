# Supabase 建表 SQL

把下面 SQL 复制到 Supabase 的 SQL Editor 里运行。

## 1. 节点表

```sql
create table if not exists yulong_nodes (
  id text primary key,
  name text not null,
  region text default '',
  server text not null,
  address text default '',
  port integer default 443,
  scheme text default 'https',
  priority integer default 99,
  status text default '正常',
  delay text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 2. 动态验证码表

```sql
create table if not exists yulong_access_settings (
  id text primary key default 'main',
  code text not null,
  expires_at timestamptz not null,
  enabled boolean default true,
  note text default '',
  updated_at timestamptz default now()
);
```

## 3. 插件用户表

```sql
create table if not exists yulong_clients (
  client_id text primary key,
  plugin_version text default '',
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);
```

## 4. 使用事件表

```sql
create table if not exists yulong_usage_events (
  id bigserial primary key,
  client_id text default '',
  event text default '',
  plugin_version text default '',
  node_id text default '',
  node_name text default '',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
```

## 5. 前台通知表

```sql
create table if not exists yulong_notices (
  id bigserial primary key,
  title text not null,
  content text default '',
  enabled boolean default true,
  priority integer default 99,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 6. 后台账号设置表

```sql
create table if not exists yulong_admin_settings (
  id text primary key default 'main',
  email text not null,
  password_hash text not null,
  updated_at timestamptz default now()
);
```

## 7. 可选：插入一个测试节点

```sql
insert into yulong_nodes (id, name, region, server, port, scheme, priority, status)
values ('demo01', '演示节点01', '演示地区', 'example.com', 443, 'https', 10, '正常')
on conflict (id) do update set
  name = excluded.name,
  region = excluded.region,
  server = excluded.server,
  port = excluded.port,
  scheme = excluded.scheme,
  priority = excluded.priority,
  status = excluded.status,
  updated_at = now();
```

## 8. 安全说明

当前项目通过服务端使用 Supabase REST API，依赖 `SUPABASE_SERVICE_ROLE_KEY`。这个 key 权限很高，只能放在 Vercel 环境变量里，不能写进插件、前端页面、README 示例真实值或截图里。
