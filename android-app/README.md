# 玉龙VPN Android v1

这是玉龙VPN Android 真机版工程，UI 复用了 Chrome 插件的黑金风格和页面逻辑。

## 已接入

- `/api/config`：读取后台全部节点
- `/api/access-code`：动态验证码验证
- `/api/plugin-node-test-all`：调用后台检测结果，显示“可用 / 不可用”
- `/api/client-stats`：匿名使用统计
- Android `VpnService`：HTTPS Proxy 基础连接服务

## 重要说明

Android 原生全机 HTTPS Proxy 与 Chrome 扩展不同。当前版本使用 `VpnService.Builder.setHttpProxy()` 实现 HTTPS Proxy 基础连接，适合第一版真机验证。部分 App 是否完全走代理取决于 Android 系统版本和应用是否遵循 VPN 网络代理。

若后续要强制全部 TCP 流量走代理，需要接入 tun2socks/packet tunnel 核心。

## 自动打包

GitHub Actions 已配置：

`.github/workflows/android-apk.yml`

推送 `android-app/**` 后会自动构建 Debug APK，产物名称：

`yulong-vpn-android-debug-apk`
