# 玉龙VPN 2.0

玉龙VPN 2.0 是一个围绕 **Chrome 浏览器插件 + Web 管理后台** 的开源项目。项目用于管理代理节点、发布插件配置、设置动态验证码、检测节点可用性、查看基础使用统计。

> 当前正式母版：`v18-backend-check`。后续插件升级必须基于这个母版继续做，UI 和检测逻辑不要再混用旧 FanVPN 或其他临时版本。

## 项目定位

本项目不是一个完整商业 VPN 平台，而是一个适合学习、二次开发、内部演示和轻量化管理的项目骨架。

核心包含两部分：

1. **管理后台**：Next.js + Supabase，部署在 Vercel 或其他 Node 平台。
2. **Chrome 插件**：Manifest V3 插件，读取后台 `/api/config`，并通过动态验证码控制使用入口。

## 主要功能

- 后台登录保护
- 左侧内嵌账号密码设置面板
- 动态验证码设置
- 节点新增、修改、删除
- 节点连通检测
- 插件配置发布
- 前台通知发布
- 插件使用统计
- 后台检测接口：`/api/plugin-node-test-all`
- 插件端正式母版：`v18-backend-check`

## 技术栈

- Next.js 14
- React 18
- Supabase REST API
- Vercel 部署
- Chrome Extension Manifest V3

## 目录说明

```txt
app/                    Next.js 页面和接口
app/api/                后台接口
app/page.js             管理后台主页面
app/SidebarAccountEntry.js  左侧内嵌账号密码和验证码设置面板
lib/                    后台工具函数
lib/nodes.js            节点读取、创建、更新、删除
lib/usage.js            验证码与使用统计
lib/adminAuth.js        后台登录 Cookie 权限
public/                 公共静态资源，如果后续新增图片可放这里
docs/                   中文项目文档
.env.example            环境变量示例
README.md               项目总说明
```

## 本地启动

```bash
npm install
cp .env.example .env.local
npm run dev
```

浏览器打开：

```txt
http://localhost:3000
```

## Vercel 部署

1. 把项目推送到 GitHub。
2. 打开 Vercel，新建 Project，选择这个仓库。
3. Framework 选择 Next.js。
4. 添加环境变量，参考 `.env.example`。
5. 点击 Deploy。
6. 部署成功后，打开你的后台域名。

如果你绑定了自己的域名，例如：

```txt
https://api2.smilechat.cn
```

插件里后台地址也必须统一改成这个域名。

## Supabase 数据表

请查看：

```txt
docs/SUPABASE_SQL.md
```

先建表，再配置环境变量，否则后台会使用代码里的 fallback 节点，很多功能无法持久保存。

## 后台登录

第一次部署时，后台账号来自环境变量：

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```

登录后台后，可以在左侧菜单点击 **账号密码设置**，在当前后台内嵌面板中修改账号密码和动态验证码。

## 插件说明

插件正式版使用 `v18-backend-check` 母版：

- UI 不动
- 黑金风格不动
- 动态验证码逻辑不动
- 后台检测逻辑不动
- 只允许改后台地址、版本号、图标和必要文案

## 安全提醒

- 不要把 Supabase service_role key 写进插件。
- 不要把真实后台密码写进代码。
- `.env.local` 不能提交到 GitHub。
- 开源前请替换默认节点域名、默认账号和默认密钥。
- 后台账号密码修改必须在后台登录后操作，不要做公开修改页面。

## 文档入口

- `docs/PRD.md`：产品需求文档
- `docs/HANDOFF.md`：项目交接文档
- `docs/DEPLOYMENT.md`：小白部署教程
- `docs/SUPABASE_SQL.md`：数据库建表 SQL
- `docs/LESSONS_LEARNED.md`：这次项目踩坑和经验总结

## 当前整理原则

这次仓库整理后，项目只保留正式主线：

```txt
Chrome 插件 v18-backend-check + Next.js 管理后台 + Supabase 数据库
```

旧 FanVPN 包和临时测试包都不再作为正式交付范围。
