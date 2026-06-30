export const fallbackNotices = [
  { id:'welcome', title:'欢迎使用玉龙VPN', type:'系统通知', status:'已发布', content:'后台已经连接配置中心，插件会读取这里发布的通知。', priority:10 },
  { id:'node-update', title:'节点更新提醒', type:'配置通知', status:'草稿', content:'节点配置更新后，请在插件内点击刷新节点。', priority:20 }
];

function ready(){ return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
function headers(){ return { apikey:process.env.SUPABASE_SERVICE_ROLE_KEY, authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY, 'content-type':'application/json' }; }
function endpoint(path){ return process.env.SUPABASE_URL.replace(/\/$/,'') + '/rest/v1/' + path; }

export async function listNotices(){
  if(!ready()) return { source:'fallback', editable:false, items:fallbackNotices };
  const res = await fetch(endpoint('yulong_notices?select=*&order=priority.asc'), { headers:headers(), cache:'no-store' });
  if(!res.ok) return { source:'fallback', editable:false, items:fallbackNotices, error:await res.text() };
  const rows = await res.json();
  return { source:'supabase', editable:true, items:rows };
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
export function publicNotices(items){ return items.filter(n=>n.status==='已发布').map(n=>({ id:n.id, title:n.title, type:n.type, content:n.content, priority:Number(n.priority||99) })); }
