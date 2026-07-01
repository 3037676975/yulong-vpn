import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, adminToken } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yulongvpn.local';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if(!adminPassword){
    return NextResponse.json({ok:false,message:'请先在 Vercel 环境变量配置 ADMIN_PASSWORD'}, {status:503});
  }
  if(String(body.email||'').trim() !== adminEmail || String(body.password||'') !== adminPassword){
    return NextResponse.json({ok:false,message:'邮箱或密码错误'}, {status:401});
  }
  const response = NextResponse.json({ok:true,user:{email:adminEmail,role:'超级管理员'}});
  response.cookies.set(ADMIN_COOKIE, adminToken(), adminCookieOptions());
  return response;
}
