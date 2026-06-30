import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';

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
      message: ok ? '数据库连接成功' : '数据库未连接，当前使用内置兜底节点',
      hint: ok ? '后台已经可以读取 Supabase 节点表' : '请检查 Vercel 环境变量是否配置到 Production，并重新部署',
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      connected: false,
      source: 'error',
      nodeCount: 0,
      message: '数据库检查失败',
      error: String(error?.message || error),
      checkedAt: new Date().toISOString()
    }, { status: 500 });
  }
}
