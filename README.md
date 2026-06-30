# 玉龙VPN / Yulong VPN

这是一个基于旧 FanVPN Chrome 代理插件思路复刻的管理后台 + 插件项目。

## 后台登录

- 后台邮箱：`admin@yulongvpn.local`
- 后台密码：`yulongvpn2026`

## 已连接前后端

前端页面通过真实 Next.js API 路由读取数据：

- `POST /api/login` 后台登录
- `GET /api/nodes` 节点列表
- `GET /api/config` 插件配置源
- `GET /api/notices` 公告配置源
- `GET /api/health` 健康检查

当前版本的数据源来自仓库里的 `lib/data.ts`，里面放的是从旧 FanVPN 配置结构复原出的节点域名，不包含旧 RSA 私钥。

## Vercel 部署

Framework 选择 Next.js，默认即可：

- Build Command: `npm run build`
- Output: `.next`

部署后后台地址即 Vercel 域名。

## Chrome 插件安装

1. 解压 `extension` 文件夹
2. 打开 `chrome://extensions`
3. 开启“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择 `extension` 文件夹

## 安全说明

这是安全复刻版：不包含旧项目里的私钥、真实用户数据库或支付系统。