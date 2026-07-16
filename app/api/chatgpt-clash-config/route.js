import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_HOSTS = [
  '137.175.77.37',
  '107.149.108.66',
  '198.2.210.178'
];

function appKeyAllowed(request) {
  const expected = String(process.env.CHATGPT_APP_KEY || '').trim();
  if (!expected) return true;
  const url = new URL(request.url);
  const supplied = String(
    url.searchParams.get('key') || request.headers.get('x-app-key') || ''
  ).trim();
  return supplied === expected;
}

function yamlQuote(value) {
  return `"${String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function readEnvNodes() {
  const raw = String(process.env.CHATGPT_PROXY_NODES_JSON || '').trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('CHATGPT_PROXY_NODES_JSON parse failed:', error);
    return null;
  }
}

function allowedHosts() {
  const raw = String(process.env.CHATGPT_NODE_HOSTS || '').trim();
  if (!raw) return DEFAULT_HOSTS;
  return raw.split(',').map(v => v.trim()).filter(Boolean);
}

function isEnabled(node) {
  if (!node || node.enabled === false) return false;
  const status = String(node.status || '').toLowerCase();
  return !['停用', '禁用', '不可用', 'disabled', 'offline'].some(v => status.includes(v));
}

function normalizeNodes(nodes) {
  const hosts = new Set(allowedHosts());
  const normalized = (nodes || [])
    .filter(isEnabled)
    .map((node, index) => {
      const server = String(node.server || node.address || '').trim();
      const port = Number(node.port || 0);
      const scheme = String(node.scheme || node.protocol || 'https').trim().toLowerCase();
      return {
        ...node,
        name: String(node.name || `ChatGPT线路${index + 1}`).trim(),
        server,
        port,
        scheme,
        priority: Number(node.priority || index + 1)
      };
    })
    .filter(node => hosts.has(node.server))
    .filter(node => node.server && Number.isInteger(node.port) && node.port > 0 && node.port <= 65535)
    .sort((a, b) => a.priority - b.priority);

  const seen = new Set();
  return normalized.filter(node => {
    const key = `${node.scheme}|${node.server}|${node.port}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function nodeToYaml(node, index) {
  const name = node.name || `ChatGPT线路${index + 1}`;
  const auth = [];
  if (node.username) auth.push(`  username: ${yamlQuote(node.username)}`);
  if (node.password) auth.push(`  password: ${yamlQuote(node.password)}`);

  if (node.scheme === 'socks5' || node.scheme === 'socks') {
    return [
      `- name: ${yamlQuote(name)}`,
      '  type: socks5',
      `  server: ${yamlQuote(node.server)}`,
      `  port: ${node.port}`,
      ...auth,
      '  udp: true'
    ].join('\n');
  }

  if (node.scheme === 'http' || node.scheme === 'https') {
    return [
      `- name: ${yamlQuote(name)}`,
      '  type: http',
      `  server: ${yamlQuote(node.server)}`,
      `  port: ${node.port}`,
      ...auth,
      ...(node.scheme === 'https' ? ['  tls: true'] : []),
      ...(node.skipCertVerify ? ['  skip-cert-verify: true'] : [])
    ].join('\n');
  }

  throw new Error(`unsupported proxy scheme: ${node.scheme}`);
}

function createYaml(nodes) {
  const names = nodes.map(node => `      - ${yamlQuote(node.name)}`).join('\n');
  const proxies = nodes.map(nodeToYaml).join('\n');

  return `# ChatGPT 专用版 Clash/Mihomo 配置
# 由玉龙VPN后台动态生成；客户端只代理自身应用。

mixed-port: 7890
allow-lan: false
mode: rule
log-level: warning
ipv6: false
unified-delay: true
tcp-concurrent: true

profile:
  store-selected: true
  store-fake-ip: true

dns:
  enable: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 1.1.1.1
    - 8.8.8.8
  fallback-filter:
    geoip: true
    geoip-code: CN

proxies:
${proxies}

proxy-groups:
  - name: "ChatGPT-AUTO"
    type: url-test
    url: "https://chatgpt.com/"
    interval: 90
    tolerance: 80
    lazy: false
    proxies:
${names}

rules:
  - MATCH,ChatGPT-AUTO
`;
}

export async function GET(request) {
  if (!appKeyAllowed(request)) {
    return new NextResponse('invalid app key', {
      status: 401,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }

  const envNodes = readEnvNodes();
  const source = envNodes ? { source: 'env', items: envNodes } : await listNodes();
  const nodes = normalizeNodes(source.items || []);

  if (!nodes.length) {
    return NextResponse.json({
      ok: false,
      error: 'NO_CHATGPT_NODES',
      message: '后台没有找到三个专用 IP 的完整节点配置，请补充协议和端口。',
      expectedHosts: allowedHosts(),
      source: source.source || 'unknown'
    }, {
      status: 503,
      headers: { 'cache-control': 'no-store' }
    });
  }

  try {
    return new NextResponse(createYaml(nodes), {
      status: 200,
      headers: {
        'content-type': 'text/yaml; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'profile-update-interval': '1',
        'subscription-userinfo': 'upload=0; download=0; total=107374182400; expire=4102444800',
        'x-chatgpt-node-count': String(nodes.length),
        'x-chatgpt-node-source': source.source || 'unknown'
      }
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'UNSUPPORTED_NODE',
      message: error?.message || '节点协议不受支持'
    }, {
      status: 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
