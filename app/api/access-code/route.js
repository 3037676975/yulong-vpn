import { NextResponse } from 'next/server';
import { currentAccessCode, verifyAccessCode, recordUsage } from '../../../lib/usage';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request){
  if(!isAdminRequest(request)) return unauthorized();
  const data = await currentAccessCode();
  return NextResponse.json({ok:true, product:'玉龙VPN', required:true, ...data, updated:new Date().toISOString()}, {headers:{'Cache-Control':'no-store, max-age=0'}});
}

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const result = await verifyAccessCode(body.code);
  await recordUsage({clientId:body.clientId||'unknown', pluginVersion:body.pluginVersion||'', event:result.ok?'verify_success':'verify_failed', meta:{source:'access-code',mode:result.current?.mode}});
  return NextResponse.json({ok:result.ok, verified:result.ok, expiresAt:result.current?.expiresAt, mode:result.current?.mode, message:result.ok?'验证成功':'验证码错误或已过期'}, {status:result.ok?200:401, headers:{'Cache-Control':'no-store, max-age=0'}});
}
