import { NextResponse } from 'next/server';
import { getBranding, saveBranding } from '../../../lib/notices';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(){
  const branding = await getBranding();
  return NextResponse.json({
    ok:true,
    product:'玉龙VPN',
    logoUrl:branding.logoUrl||'',
    source:branding.source,
    editable:branding.editable,
    updatedAt:branding.updatedAt||null,
    error:branding.error||null,
    updated:new Date().toISOString()
  }, { headers:{ 'Cache-Control':'no-store, max-age=0' } });
}

export async function POST(request){
  if(!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(()=>({}));
  const result = await saveBranding(body);
  return NextResponse.json(result, {
    status:result.ok?200:400,
    headers:{ 'Cache-Control':'no-store, max-age=0' }
  });
}
