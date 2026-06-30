import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yulongvpn.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yulongvpn2026';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  const password = String(body.password || '');

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok:false, message:'邮箱或密码错误' }, { status:401 });
  }

  return NextResponse.json({
    ok:true,
    token:'yulong-admin-demo-session',
    user:{ email:ADMIN_EMAIL, role:'超级管理员' }
  });
}
