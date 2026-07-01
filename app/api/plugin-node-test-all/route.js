import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';

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

async function testNode(node){
  const host = cleanHost(node.server || node.address);
  const port = Number(node.port || 443);
  if(!host) return {id:node.id,name:node.name,host:'',port,ok:false,realOk:false,entryOk:false,message:'缺少节点地址',ms:null};
  const entry = await timedFetch(`https://${host}:${port}/`, 6000);
  return {
    id: node.id,
    name: node.name,
    region: node.region,
    host,
    port,
    ok: entry.ok,
    realOk: entry.ok,
    entryOk: entry.ok,
    ms: entry.ms,
    status: entry.status,
    message: entry.ok ? '入口正常' : '入口失败',
    error: entry.error || null
  };
}

export async function POST(){
  const startedAt = Date.now();
  const data = await listNodes();
  const items = (data.items||[]).filter(n=>n && (n.server || n.address));
  const results = await Promise.all(items.map(testNode));
  const okCount = results.filter(x=>x.ok).length;
  return NextResponse.json({
    ok:true,
    source:data.source,
    rule:'backend_entry_check',
    total:results.length,
    okCount,
    failCount:results.length-okCount,
    results,
    note:'插件专用检测接口：结果与后台一键检测节点入口逻辑保持一致，插件只显示可用或不可用。',
    costMs:Date.now()-startedAt,
    checkedAt:new Date().toISOString()
  },{headers:{'Cache-Control':'no-store, max-age=0'}});
}

export async function GET(){
  return NextResponse.json({ok:true,message:'请使用 POST 触发插件节点检测。'},{headers:{'Cache-Control':'no-store, max-age=0'}});
}
