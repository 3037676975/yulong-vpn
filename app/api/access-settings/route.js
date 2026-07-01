import { NextResponse } from 'next/server';
import { currentAccessCode, getAccessSettings, saveAccessSettings } from '../../../lib/usage';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request){
  if(!isAdminRequest(request)) return unauthorized();
  const [current, settings] = await Promise.all([currentAccessCode(), getAccessSettings()]);
  return NextResponse.json({ok:true,current,settings,updated:new Date().toISOString()},{headers:{'Cache-Control':'no-store, max-age=0'}});
}

export async function POST(request){
  if(!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(()=>({}));
  const result = await saveAccessSettings(body);
  const current = await currentAccessCode();
  return NextResponse.json({...result,current},{status:result.ok?200:400,headers:{'Cache-Control':'no-store, max-age=0'}});
}
