import { NextResponse } from 'next/server';

const COOKIE = 'yulong_admin_session';

async function token(){
  const secret = process.env.ADMIN_SESSION_SECRET || 'local-dev-session';
  const data = new TextEncoder().encode(`${secret}:admin`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function middleware(request){
  const path = request.nextUrl.pathname;
  const protectedPage = path === '/users' || path.startsWith('/users/') || path === '/notices' || path.startsWith('/notices/');
  if(!protectedPage) return NextResponse.next();
  const cookie = request.cookies.get(COOKIE)?.value || '';
  if(cookie === await token()) return NextResponse.next();
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ['/users/:path*','/notices/:path*']
};
