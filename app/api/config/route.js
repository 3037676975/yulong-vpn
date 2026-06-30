import { NextResponse } from 'next/server';
import { listNodes, toConfig } from '../../../lib/nodes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(){
  const result = await listNodes();
  return NextResponse.json({product:'玉龙VPN',version:7,updated:new Date().toISOString(),mode:'chrome-proxy',source:result.source,editable:result.editable,nodes:toConfig(result.items)}, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
