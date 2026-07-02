# 玉龙VPN 2.0 项目交接文档

## 1. 一句话交接

玉龙VPN 2.0 是一个 **Chrome 插件配置后台 + 节点管理系统**。后台负责节点、验证码、通知、检测和统计；插件负责读取后台配置并在浏览器里执行代理连接。

## 2. 当前正式范围

正式范围只保留：

```txt
Chrome 插件 v18-backend-check
Next.js 管理后台
Supabase 数据库
Vercel 部署
```

不再把以下内容作为正式交付：

```txt
旧 FanVPN 包
临时金色验证码插件包
v18 google-check 旧检测版
其他测试包
```

## 3. 核心目录

```txt
app/page.js                  后台主页面
app/SidebarAccountEntry.js   左侧账号与验证码设置弹窗
app/api/config/route.js      插件配置接口
app/api/access-code/route.js 动态验证码验证接口
app/api/access-settings/route.js 后台验证码设置接口
app/api/admin-session/route.js 后台登录接口
app/api/admin-account/route.js 后台账号设置接口
app/api/nodes/route.js       节点管理接口
lib/nodes.js                 节点数据逻辑
lib/usage.js                 验证码和统计逻辑
lib/adminAuth.js             后台 Cookie 鉴权
```

## 4. 关键接口

```txt
GET  /api/config
GET  /api/access-code
POST /api/access-code
GET  /api/access-settings
POST /api/access-settings
GET  /api/admin-account
POST /api/admin-account
GET  /api/nodes
POST /api/nodes
POST /api/node-test
POST /api/node-test-all
POST /api/plugin-node-test-all
```

## 5. 后台使用流程

1. 打开后台域名。
2. 输入后台账号信息登录。
3. 左侧进入“节点管理”，新增节点。
4. 左侧进入“账号密码设置”，设置动态验证码。
5. 插件输入验证码。
6. 插件点击刷新节点。
7. 插件点击真实测速。
8. 后台查看统计。

## 6. 插件版本规则

以后插件只认这个母版：

```txt
v18-backend-check
```

允许修改：

```txt
后台域名
版本号
图标
少量文案
```

不建议修改：

```txt
主 UI 布局
连接逻辑
后台检测逻辑
验证码逻辑
节点列表页面结构
```

## 7. 部署关键点

Vercel 必须配置：

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
YULONG_ACCESS_CODE_SECRET
```

Supabase 必须建表，SQL 见：

```txt
docs/SUPABASE_SQL.md
```

## 8. 维护建议

- 先改后台，再改插件。
- 不要直接改插件 UI 母版。
- 不要把真实 key 放进代码。
- 每次发版前检查后台地址是否正确。
- 每次发版前检查 manifest 版本号。
- 每次发版前本地安装插件测试一次。

## 9. 当前遗留问题

1. 插件正式母版建议后续统一放入 `extension/` 目录，避免继续用压缩包散落管理。
2. 后台代码目前集中在单文件内，后续可以拆分组件，提高可维护性。
3. 默认 fallback 节点建议开源前替换为演示节点，避免误解为可直接商用节点。

## 10. 接手开发的人应该先做什么

```txt
1. 读 README.md
2. 读 docs/PRD.md
3. 读 docs/DEPLOYMENT.md
4. 跑 Supabase SQL
5. 配置 Vercel 环境变量
6. 本地 npm run dev
7. 检查 /api/health 和 /api/config
8. 安装插件测试
```
