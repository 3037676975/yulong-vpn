import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const hasSupabase = Boolean(supabaseUrl && supabaseServiceKey);

export function getSupabase() {
  if (!hasSupabase) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export function nowIso() {
  return new Date().toISOString();
}

export function publicNode(row) {
  return {
    id: row.id,
    name: row.name,
    region: row.region || '',
    flag: row.flag || guessFlag(row.region),
    server: row.server || row.address,
    address: row.server || row.address,
    port: Number(row.port || 443),
    scheme: row.scheme || 'https',
    priority: Number(row.priority || 999),
    status: row.status || '未知',
    enabled: row.enabled !== false,
    last_latency_ms: row.last_latency_ms ?? null,
    last_checked_at: row.last_checked_at || null,
    speed_mbps: row.speed_mbps ?? null,
    updated_at: row.updated_at || null
  };
}

export function normalizeNode(input = {}) {
  const server = String(input.server || input.address || '').trim();
  const id = String(input.id || server.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || `node-${Date.now()}`).slice(0, 80);
  return {
    id,
    name: String(input.name || id).trim(),
    region: String(input.region || '').trim(),
    flag: String(input.flag || guessFlag(input.region)).trim().toUpperCase().slice(0, 8),
    server,
    port: Number(input.port || 443),
    scheme: String(input.scheme || 'https').trim().toLowerCase(),
    priority: Number(input.priority || 999),
    status: String(input.status || '正常').trim(),
    enabled: input.enabled === false ? false : true,
    last_latency_ms: input.last_latency_ms === '' || input.last_latency_ms == null ? null : Number(input.last_latency_ms),
    speed_mbps: input.speed_mbps === '' || input.speed_mbps == null ? null : Number(input.speed_mbps)
  };
}

export function normalizeNotice(input = {}) {
  const id = String(input.id || `notice-${Date.now()}`).slice(0, 80);
  return {
    id,
    title: String(input.title || '未命名公告').trim(),
    type: String(input.type || '系统通知').trim(),
    status: String(input.status || '草稿').trim(),
    content: String(input.content || '').trim(),
    expire_at: input.expire_at || input.expire || null
  };
}

function guessFlag(region = '') {
  const text = String(region).toLowerCase();
  if (text.includes('日本') || text.includes('jp')) return 'JP';
  if (text.includes('香港') || text.includes('hk')) return 'HK';
  if (text.includes('德国') || text.includes('de')) return 'DE';
  if (text.includes('法国') || text.includes('fr')) return 'FR';
  if (text.includes('美国') || text.includes('us')) return 'US';
  return 'US';
}
