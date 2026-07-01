import { NextResponse } from 'next/server';
import { listAdminLogs, listNodeChecks } from '../../../lib/adminDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(){
  const [logs, checks] = await Promise.all([listAdminLogs(30), listNodeChecks(80)]);
  return NextResponse.json({
    ok: logs.source === 'supabase' || checks.source === 'supabase',
    logs: logs.items,
    checks: checks.items,
    source: {logs: logs.source, checks: checks.source},
    editable: logs.editable || checks.editable,
    errors: {logs: logs.error || null, checks: checks.error || null},
    updated: new Date().toISOString()
  },{headers:{'Cache-Control':'no-store, max-age=0'}});
}
