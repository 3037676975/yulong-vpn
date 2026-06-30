import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ ok:true, product:'玉龙VPN', status:'running', time:new Date().toISOString() });
}
