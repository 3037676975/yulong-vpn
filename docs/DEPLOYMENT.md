# 玉龙VPN 2.0 小白部署教程

这份教程尽量按小白能看懂的方式写。你可以理解为：

```txt
GitHub 放代码
Vercel 跑后台网站
Supabase 放数据库
Chrome 插件读取后台配置
```

## 1. 你需要准备什么

需要三个账号：

1. GitHub：放代码。
2. Vercel：部署后台。
3. Supabase：保存节点、验证码、统计数据。

## 2. 第一步：准备 Supabase

打开 Supabase，新建一个 Project。

然后进入：

```txt
SQL Editor
```

复制 `docs/SUPABASE_SQL.md` 里的 SQL，运行一次。

运行成功后，会创建这些表：

```txt
yulong_nodes              节点表
yulong_access_settings    动态验证码设置
yulong_clients            插件用户表
yulong_usage_events       使用事件表
yulong_notices            前台通知表
yulong_admin_settings     后台账号设置表
```

## 3. 第二步：拿 Supabase 环境变量

在 Supabase 项目中找到：

```txt
Project Settings -> API
```

复制：

```txt
Project URL
service_role key
```

注意：

```txt
service_role key 很重要，不能发给别人，不能写进插件。
```

## 4. 第三步：部署到 Vercel

打开 Vercel：

```txt
Add New Project -> Import Git Repository
```

选择你的 GitHub 仓库。

Framework Preset 选择：

```txt
Next.js
```

Build Command 默认即可：

```txt
npm run build
```

Output Directory 不用填。

## 5. 第四步：填写 Vercel 环境变量

进入 Vercel 项目：

```txt
Settings -> Environment Variables
```

填写：

```txt
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
ADMIN_EMAIL=你的后台邮箱
ADMIN_PASSWORD=你的后台密码
ADMIN_SESSION_SECRET=随机字符串
YULONG_ACCESS_CODE_SECRET=随机字符串
```

建议随机字符串可以随便写一串很长的内容，例如：

```txt
yulong_2026_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 6. 第五步：重新部署

环境变量保存后，必须重新部署：

```txt
Deployments -> 最新部署 -> Redeploy
```

等部署完成。

## 7. 第六步：打开后台

打开你的 Vercel 域名，或者你的自定义域名，例如：

```txt
https://api2.smilechat.cn
```

输入后台账号密码登录。

## 8. 第七步：绑定自己的域名

如果你有自己的域名，例如：

```txt
api2.smilechat.cn
```

在 Vercel 项目里：

```txt
Settings -> Domains -> Add Domain
```

添加：

```txt
api2.smilechat.cn
```

然后去腾讯云 DNSPod 添加 CNAME：

```txt
主机记录：api2
记录类型：CNAME
记录值：Vercel 给你的 CNAME
```

不要填 IP，不要用 A 记录。

## 9. 第八步：配置插件后台地址

Chrome 插件正式母版是：

```txt
v18-backend-check
```

插件里的后台地址要统一为：

```txt
https://api2.smilechat.cn
```

相关接口：

```txt
/api/config
/api/access-code
/api/notices?public=1
/api/client-stats
/api/plugin-node-test-all
```

## 10. 第九步：安装 Chrome 插件

打开 Chrome：

```txt
chrome://extensions
```

右上角打开：

```txt
开发者模式
```

点击：

```txt
加载已解压的扩展程序
```

选择插件文件夹。

## 11. 常见问题

### 11.1 后台打不开

检查：

- Vercel 是否部署成功
- 域名是否解析成功
- 浏览器是否能访问 Vercel 域名

### 11.2 后台登录失败

检查：

- Vercel 环境变量是否填写
- 是否重新部署
- 后台账号是否已经被后台设置面板改过

### 11.3 节点保存失败

检查：

- Supabase 表是否建好
- `SUPABASE_URL` 是否正确
- `SUPABASE_SERVICE_ROLE_KEY` 是否正确

### 11.4 插件刷新节点失败

检查：

- 插件后台地址是否是你的正式域名
- `/api/config` 是否能打开
- 后台是否有节点

### 11.5 验证码错误

检查：

- 后台当前验证码是多少
- 验证码是否过期
- 插件是否连接到了正确后台

## 12. 部署完成后的检查清单

部署后按这个顺序检查：

```txt
1. 打开 /api/health
2. 打开 /api/config
3. 登录后台
4. 左侧打开账号密码设置
5. 设置动态验证码
6. 新增一个节点
7. 插件刷新节点
8. 插件输入验证码
9. 插件真实测速
10. 后台查看使用统计
```
