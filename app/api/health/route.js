import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  return NextResponse.json({ ok:true, product:'玉龙VPN', version:16, status:'running', time:new Date().toISOString() }, { headers: { 'Cache-Control':'no-store, max-age=0' } });
}
