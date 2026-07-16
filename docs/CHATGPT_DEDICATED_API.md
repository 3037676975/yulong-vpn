# ChatGPT 专用版后台接口

本补丁为 ChatGPT 专用 Android 客户端提供两个接口：

```text
GET /api/chatgpt-app-config
GET /api/chatgpt-clash-config
```

部署后先访问：

```text
https://api2.smilechat.cn/api/chatgpt-app-config
```

正常应返回 JSON。节点参数完整时，下面地址应返回 Mihomo YAML：

```text
https://api2.smilechat.cn/api/chatgpt-clash-config
```

默认只选择三个目标 IP：

```text
137.175.77.37
107.149.108.66
198.2.210.178
```

每个节点仍然必须有真实的 `port` 和 `scheme`。支持 `http`、`https` 和 `socks5`，也支持可选的 `username`、`password`。

可以直接使用 Supabase 的 `yulong_nodes` 表，也可以在 Vercel 设置：

```text
CHATGPT_PROXY_NODES_JSON=[{"name":"线路1","server":"137.175.77.37","port":真实端口,"scheme":"真实协议"},{"name":"线路2","server":"107.149.108.66","port":真实端口,"scheme":"真实协议"},{"name":"线路3","server":"198.2.210.178","port":真实端口,"scheme":"真实协议"}]
```

可选变量：

```text
PUBLIC_API_BASE_URL=https://api2.smilechat.cn
CHATGPT_APP_ENABLED=true
CHATGPT_APP_MESSAGE=
CHATGPT_HOME_URL=https://chatgpt.com/
CHATGPT_HEALTH_URL=https://chatgpt.com/
CHATGPT_NODE_HOSTS=137.175.77.37,107.149.108.66,198.2.210.178
CHATGPT_APP_KEY=可选保护密钥
```

如果 `/api/chatgpt-clash-config` 返回：

```text
NO_CHATGPT_NODES
```

表示后台尚未找到目标 IP 的完整代理配置。只有服务器 IP 不能建立代理，必须补齐真实协议、端口和可能存在的认证信息。

生成的配置使用 `ChatGPT-AUTO` 的 `url-test` 组，内核自动选择当前可访问 ChatGPT 且延迟较低的节点，并在故障后切换备用线路。
