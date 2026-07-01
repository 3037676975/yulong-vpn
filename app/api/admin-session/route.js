import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, adminToken } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const origin = new URL(request.url).origin;
  const checked = await fetch(`${origin}/api/login`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(body),
    cache:'no-store'
  });
  const data = await checked.json().catch(()=>({}));
  if(!checked.ok){
    return NextResponse.json({ok:false,message:data.message||'邮箱或密码错误'}, {status:checked.status});
  }
  const response = NextResponse.json({ok:true,user:data.user||{role:'超级管理员'}});
  response.cookies.set(ADMIN_COOKIE, adminToken(), adminCookieOptions());
  return response;
}
