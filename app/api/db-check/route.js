import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await listNodes();
    const ok = result.source === 'supabase';
    return NextResponse.json({
      ok,
      connected: ok,
      source: result.source,
      editable: result.editable,
      nodeCount: Array.isArray(result.items) ? result.items.length : 0,
      env: {
        hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        urlLooksRight: String(process.env.SUPABASE_URL || '').startsWith('https://') && String(process.env.SUPABASE_URL || '').includes('.supabase.co'),
        keyLooksRight: String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').startsWith('sb_secret_') || String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').startsWith('ey')
      },
      message: ok ? '数据库连接成功' : '数据库未连接，当前使用内置兜底节点',
      error: result.error || null,
      hint: ok ? '后台已经可以读取 Supabase 节点表' : '先看 env 两个值是否都是 true；如果是 true 但仍失败，再看 error 字段',
      checkedAt: new Date().toISOString()
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      connected: false,
      source: 'error',
      nodeCount: 0,
      env: {
        hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
      },
      message: '数据库检查失败',
      error: String(error?.message || error),
      checkedAt: new Date().toISOString()
    }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}
