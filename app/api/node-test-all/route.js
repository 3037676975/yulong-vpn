import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';
import { insertAdminLog, insertNodeChecks } from '../../../lib/adminDb';

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
  if(!host) return {id:node.id,name:node.name,ok:false,message:'缺少节点地址',ms:null};
  const entry = await timedFetch(`https://${host}:${port}/`, 6000);
  return {
    id: node.id,
    name: node.name,
    region: node.region,
    host,
    port,
    ok: entry.ok,
    ms: entry.ms,
    status: entry.status,
    message: entry.ok ? '入口正常' : '入口失败',
    error: entry.error || null
  };
}

export async function POST(){
  const startedAt = Date.now();
  const runId = `check-${Date.now()}`;
  const data = await listNodes();
  const items = (data.items||[]).filter(n=>n && (n.server || n.address));
  const outside = await timedFetch('https://www.google.com/generate_204', 6000);
  const results = await Promise.all(items.map(testNode));
  const okCount = results.filter(x=>x.ok).length;
  const payload = {
    ok: true,
    runId,
    source: data.source,
    total: results.length,
    okCount,
    failCount: results.length - okCount,
    outside,
    results,
    costMs: Date.now() - startedAt,
    note: '这是后台服务器到节点入口的真实连通检测；Chrome 真实代理测速仍以插件端检测为准。',
    checkedAt: new Date().toISOString()
  };
  await insertNodeChecks(runId, results);
  await insertAdminLog('一键检测全部节点',{runId,total:payload.total,okCount:payload.okCount,failCount:payload.failCount,costMs:payload.costMs});
  return NextResponse.json(payload,{headers:{'Cache-Control':'no-store, max-age=0'}});
}
