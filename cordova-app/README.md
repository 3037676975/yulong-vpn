# 玉龙VPN Cordova Android 版

这是玉龙VPN的 Cordova 打包方案，用于把插件的 HTML/CSS/JS UI 复用到 Android APK。

## 结构

- `www/index.html`：复刻 Chrome 插件黑金 UI。
- `plugins/yulong-vpn-service`：Cordova 原生插件，负责：
  - 调用后台接口，避免 WebView CORS 问题；
  - 启动/停止 Android `VpnService`；
  - 接入 HTTPS Proxy 节点。
- `.github/workflows/cordova-android-apk.yml`：自动打包 APK。

## 已接入接口

- `/api/config`：读取全部节点。
- `/api/access-code`：动态验证码。
- `/api/plugin-node-test-all`：同步后台一键检测结果。
- `/api/client-stats`：匿名统计。

## 打包

GitHub Actions 会自动打包：

`Build Cordova Android APK`

产物名称：

`yulong-vpn-cordova-debug-apk`

下载后解压，里面是：

`app-debug.apk`

## 注意

Cordova 负责复用插件 UI 和打包 APK；VPN 能力通过 Android 原生插件实现。当前版本是 HTTPS Proxy 基础版。后续如果要强制所有 TCP 流量走代理，需要继续接入 tun2socks 核心。
