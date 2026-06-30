import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, product: 'Yulong', status: 'running', time: new Date().toISOString() });
}
