import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanHost(value){
  return String(value||'').trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
}

async function timedFetch(url, timeoutMs){
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try{
    const res = await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal});
    clearTimeout(timer);
    return {ok:true,status:res.status,ms:Date.now()-start};
  }catch(error){
    clearTimeout(timer);
    return {ok:false,status:0,ms:Date.now()-start,error:String(error?.message||error)};
  }
}

export async function POST(request){
  const body = await request.json().catch(()=>({}));
  const host = cleanHost(body.server || body.address);
  const port = Number(body.port || 443);
  if(!host) return NextResponse.json({ok:false,message:'缺少节点地址'},{status:400});

  const entryUrl = `https://${host}:${port}/`;
  const entry = await timedFetch(entryUrl, 6000);

  const outside = await timedFetch('https://www.google.com/generate_204', 6000);

  return NextResponse.json({
    ok: entry.ok,
    host,
    port,
    entry,
    outside,
    message: entry.ok ? '入口检测成功' : '入口检测失败',
    note: '后台只能检测节点入口和服务器外网基准；真实通过该节点访问外网请用 Chrome 插件里的真实检测。',
    checkedAt: new Date().toISOString()
  },{headers:{'Cache-Control':'no-store, max-age=0'}});
}
