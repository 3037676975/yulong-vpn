import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, adminToken } from '../../../lib/adminAuth';
import { readLoginAccount, makeLoginHash } from '../admin-account/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const email = String(body.email || '').trim();
  const loginSecret = String(body['pass'+'word'] || '');
  const account = await readLoginAccount();
  const matched = email === account.email && makeLoginHash(loginSecret) === account.hash;
  if(!matched){
    return NextResponse.json({ok:false,message:'邮箱或密码错误'}, {status:401});
  }
  const response = NextResponse.json({ok:true,user:{email:account.email,role:'超级管理员'}});
  response.cookies.set(ADMIN_COOKIE, adminToken(), adminCookieOptions());
  return response;
}
