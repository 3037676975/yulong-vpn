import { NextResponse } from 'next/server';
import { recordUsage, usageStats } from '../../../lib/usage';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(request){
  if(!isAdminRequest(request)) return unauthorized();
  const data = await usageStats();
  return NextResponse.json(data,{headers:{'Cache-Control':'no-store, max-age=0'}});
}
export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const result = await recordUsage({
    clientId: body.clientId || 'anon',
    event: body.event || 'open',
    pluginVersion: body.pluginVersion || '',
    nodeId: body.nodeId || '',
    nodeName: body.nodeName || '',
    meta: body.meta || {}
  });
  return NextResponse.json(result,{status:result.ok?200:400,headers:{'Cache-Control':'no-store, max-age=0'}});
}
