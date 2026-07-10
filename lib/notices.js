export const fallbackNotices = [
  { id:'welcome', title:'欢迎使用玉龙VPN', type:'系统通知', status:'已发布', content:'后台已经连接配置中心，插件会读取这里发布的通知。', priority:10 },
  { id:'node-update', title:'节点更新提醒', type:'配置通知', status:'草稿', content:'节点配置更新后，请在插件内点击刷新节点。', priority:20 }
];

const BRANDING_ID = 'app-branding';

function ready(){ return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
function headers(){ return { apikey:process.env.SUPABASE_SERVICE_ROLE_KEY, authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY, 'content-type':'application/json' }; }
function endpoint(path){ return process.env.SUPABASE_URL.replace(/\/$/,'') + '/rest/v1/' + path; }

async function listRows(){
  if(!ready()) return { source:'fallback', editable:false, items:fallbackNotices };
  const res = await fetch(endpoint('yulong_notices?select=*&order=priority.asc'), { headers:headers(), cache:'no-store' });
  if(!res.ok) return { source:'fallback', editable:false, items:fallbackNotices, error:await res.text() };
  const rows = await res.json();
  return { source:'supabase', editable:true, items:rows };
}

export async function listNotices(){
  const result = await listRows();
  return { ...result, items:(result.items||[]).filter(item=>item.id!==BRANDING_ID) };
}

function normalizeLogoUrl(value){
  const url = String(value||'').trim();
  if(!url) return { ok:true, value:'' };
  if(url.length > 2048) return { ok:false, message:'图片 URL 过长' };
  try{
    const parsed = new URL(url);
    if(parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return { ok:false, message:'图片 URL 必须以 https:// 或 http:// 开头' };
    return { ok:true, value:parsed.toString() };
  }catch{
    return { ok:false, message:'请输入正确的图片 URL' };
  }
}

export async function getBranding(){
  const result = await listRows();
  const row = (result.items||[]).find(item=>item.id===BRANDING_ID);
  return {
    source:result.source,
    editable:result.editable,
    logoUrl:String(row?.content||'').trim(),
    updatedAt:row?.updated_at||null,
    error:result.error||null
  };
}

export async function saveBranding(data={}){
  if(!ready()) return { ok:false, message:'Supabase 未配置' };
  const normalized = normalizeLogoUrl(data.logoUrl);
  if(!normalized.ok) return normalized;
  const row = {
    id:BRANDING_ID,
    title:'客户端品牌 Logo',
    type:'品牌设置',
    status:'内部',
    content:normalized.value,
    priority:0
  };
  const res = await fetch(endpoint('yulong_notices?on_conflict=id'), {
    method:'POST',
    headers:{...headers(), prefer:'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify([row])
  });
  const text = await res.text();
  return { ok:res.ok, logoUrl:normalized.value, data:text, message:res.ok?'Logo 已保存':'Logo 保存失败' };
}

export async function createNotice(data){
  if(!ready()) return { ok:false, message:'Supabase 未配置' };
  const row = { id:data.id, title:data.title, type:data.type||'系统通知', status:data.status||'已发布', content:data.content||'', priority:Number(data.priority||99) };
  const res = await fetch(endpoint('yulong_notices'), { method:'POST', headers:{...headers(), prefer:'return=representation'}, body:JSON.stringify(row) });
  return { ok:res.ok, data:await res.text() };
}

export async function updateNotice(id,data){
  if(!ready()) return { ok:false, message:'Supabase 未配置' };
  const row = { title:data.title, type:data.type||'系统通知', status:data.status||'已发布', content:data.content||'', priority:Number(data.priority||99) };
  const res = await fetch(endpoint('yulong_notices?id=eq.'+encodeURIComponent(id)), { method:'PATCH', headers:{...headers(), prefer:'return=representation'}, body:JSON.stringify(row) });
  return { ok:res.ok, data:await res.text() };
}

export async function deleteNotice(id){
  if(!ready()) return { ok:false, message:'Supabase 未配置' };
  const res = await fetch(endpoint('yulong_notices?id=eq.'+encodeURIComponent(id)), { method:'DELETE', headers:headers() });
  return { ok:res.ok, data:await res.text() };
}

export function publicNotices(items){
  return items
    .filter(n=>n.id!==BRANDING_ID && n.status==='已发布')
    .map(n=>({ id:n.id, title:n.title, type:n.type, content:n.content, priority:Number(n.priority||99) }));
}
