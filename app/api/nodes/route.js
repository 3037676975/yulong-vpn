import { NextResponse } from 'next/server';
import { listNodes, createNode, updateNode, deleteNode, toAdmin } from '@/lib/nodes';

export async function GET() {
  const result = await listNodes();
  const items = toAdmin(result.items);
  return NextResponse.json({ ok:true,total:items.length,items,source:result.source,editable:result.editable,error:result.error||null,updated:new Date().toISOString() });
}
export async function POST(request) {
  const body = await request.json().catch(()=>({}));
  const result = body._method === 'update' ? await updateNode(body.id, body) : body._method === 'remove' ? await deleteNode(body.id) : await createNode(body);
  return NextResponse.json(result,{status:result.ok?200:503});
}
