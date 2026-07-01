import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'yulong_admin_session';

function sessionSecret(){
  return process.env.ADMIN_SESSION_SECRET || 'local-dev-session';
}

export function adminToken(){
  return crypto.createHash('sha256').update(`${sessionSecret()}:admin`).digest('hex');
}

export function isAdminRequest(request){
  const cookie = request.cookies?.get(ADMIN_COOKIE)?.value || '';
  const bearer = String(request.headers?.get('authorization') || '').replace(/^Bearer\s+/i,'');
  const token = adminToken();
  return cookie === token || bearer === token;
}

export function unauthorized(){
  return NextResponse.json({ok:false,message:'未登录或管理员权限已过期，请重新登录后台。'}, {status:401, headers:{'Cache-Control':'no-store, max-age=0'}});
}

export function adminCookieOptions(){
  return {httpOnly:true,sameSite:'lax',secure:true,path:'/',maxAge:60*60*12};
}
