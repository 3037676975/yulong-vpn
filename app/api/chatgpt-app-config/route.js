import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function authorized(request) {
  const expected = String(process.env.CHATGPT_APP_KEY || '').trim();
  if (!expected) return { ok: true, key: '' };
  const url = new URL(request.url);
  const supplied = String(
    url.searchParams.get('key') || request.headers.get('x-app-key') || ''
  ).trim();
  return { ok: supplied === expected, key: supplied };
}

export async function GET(request) {
  const auth = authorized(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: 'invalid app key' }, {
      status: 401,
      headers: { 'cache-control': 'no-store' }
    });
  }

  const requestUrl = new URL(request.url);
  const baseUrl = String(process.env.PUBLIC_API_BASE_URL || requestUrl.origin).replace(/\/$/, '');
  const enabled = String(process.env.CHATGPT_APP_ENABLED || 'true').toLowerCase() !== 'false';
  const keyQuery = auth.key ? `?key=${encodeURIComponent(auth.key)}` : '';

  return NextResponse.json({
    ok: true,
    enabled,
    message: enabled
      ? String(process.env.CHATGPT_APP_MESSAGE || '')
      : String(process.env.CHATGPT_APP_MESSAGE || '专用线路正在维护，请稍后再试。'),
    homeUrl: String(process.env.CHATGPT_HOME_URL || 'https://chatgpt.com/'),
    healthCheckUrl: String(process.env.CHATGPT_HEALTH_URL || 'https://chatgpt.com/'),
    profileUrl: `${baseUrl}/api/chatgpt-clash-config${keyQuery}`,
    updateIntervalMinutes: 30,
    mode: 'per-app-vpn',
    nodeStrategy: 'url-test'
  }, {
    headers: { 'cache-control': 'no-store, max-age=0' }
  });
}
