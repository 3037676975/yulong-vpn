import { NextResponse } from 'next/server';
import { currentAccessCode, verifyAccessCode, recordUsage } from '../../../lib/usage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(){
  const data = currentAccessCode();
  return NextResponse.json({ok:true, product:'玉龙VPN', required:true, ...data, updated:new Date().toISOString()}, {headers:{'Cache-Control':'no-store, max-age=0'}});
}

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const ok = verifyAccessCode(body.code);
  const codeInfo = currentAccessCode();
  await recordUsage({clientId:body.clientId||'unknown', pluginVersion:body.pluginVersion||'', event:ok?'verify_success':'verify_failed', meta:{source:'access-code'}});
  return NextResponse.json({ok, verified:ok, expiresAt:codeInfo.expiresAt, message:ok?'验证成功':'验证码错误或已过期'}, {status:ok?200:401, headers:{'Cache-Control':'no-store, max-age=0'}});
}
