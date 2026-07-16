import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FALLBACK_PROXIES = [
  { scheme: 'https', host: '137.175.77.37', port: 443, priority: 10 },
  { scheme: 'https', host: '107.149.108.66', port: 443, priority: 20 },
  { scheme: 'https', host: '198.2.210.178', port: 443, priority: 30 }
];

function readConfiguredProxies() {
  const raw = String(process.env.CHATGPT_WEBVIEW_PROXIES_JSON || '').trim();
  if (!raw) return FALLBACK_PROXIES;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return FALLBACK_PROXIES;
    const valid = parsed
      .map((item, index) => ({
        scheme: String(item?.scheme || 'https').toLowerCase(),
        host: String(item?.host || item?.server || '').trim(),
        port: Number(item?.port || 0),
        priority: Number(item?.priority || index + 1)
      }))
      .filter(item => ['http', 'https', 'socks'].includes(item.scheme))
      .filter(item => item.host && Number.isInteger(item.port) && item.port > 0 && item.port <= 65535)
      .sort((a, b) => a.priority - b.priority);
    return valid.length ? valid : FALLBACK_PROXIES;
  } catch (error) {
    console.error('CHATGPT_WEBVIEW_PROXIES_JSON parse failed:', error);
    return FALLBACK_PROXIES;
  }
}

export async function GET() {
  return NextResponse.json({
    enabled: String(process.env.CHATGPT_WEBVIEW_ENABLED || 'true') !== 'false',
    homeUrl: String(process.env.CHATGPT_WEBVIEW_HOME_URL || 'https://chatgpt.com/'),
    proxies: readConfiguredProxies(),
    retryOnMainFrameError: true,
    updatedAt: new Date().toISOString()
  }, {
    headers: {
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex'
    }
  });
}
