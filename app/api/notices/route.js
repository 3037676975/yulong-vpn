import { NextResponse } from 'next/server';
import { listNotices, createNotice, updateNotice, deleteNotice, publicNotices } from '../../../lib/notices';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request){
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('public');
  if(mode !== '1' && !isAdminRequest(request)) return unauthorized();
  const result = await listNotices();
  const items = mode === '1' ? publicNotices(result.items) : result.items;
  return NextResponse.json({ ok:true, items, source:result.source, editable:result.editable, error:result.error||null, updated:new Date().toISOString() }, { headers:{ 'Cache-Control':'no-store, max-age=0' } });
}

export async function POST(request){
  if(!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(()=>({}));
  const result = body._method === 'update' ? await updateNotice(body.id, body) : body._method === 'remove' ? await deleteNotice(body.id) : await createNotice(body);
  return NextResponse.json(result, { status:result.ok?200:503, headers:{ 'Cache-Control':'no-store, max-age=0' } });
}
