import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CODE_SECRET = process.env.YULONG_ACCESS_CODE_SECRET || SERVICE_KEY || 'yulong-vpn-local-secret';

function enabled(){ return Boolean(SUPABASE_URL && SERVICE_KEY); }
function dayKey(date=new Date()){
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth()+1).padStart(2,'0');
  const d = String(date.getUTCDate()).padStart(2,'0');
  return `${y}${m}${d}`;
}
function codeForDay(day){
  const hex = crypto.createHmac('sha256', CODE_SECRET).update(`yulong:${day}`).digest('hex');
  return String(parseInt(hex.slice(0,12),16) % 1000000).padStart(6,'0');
}
async function sb(table, query='', options={}){
  if(!enabled()) return {ok:false, source:'fallback', data:null, error:'missing supabase env'};
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`,{
    ...options,
    headers:{
      apikey:SERVICE_KEY,
      authorization:`Bearer ${SERVICE_KEY}`,
      'content-type':'application/json',
      prefer: options.prefer || 'return=representation',
      ...(options.headers||{})
    },
    cache:'no-store'
  });
  const text = await res.text();
  let data = null;
  try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
  return {ok:res.ok, status:res.status, source:res.ok?'supabase':'fallback', data, error:res.ok?null:data};
}
function autoCode(){
  const now = new Date();
  const today = dayKey(now);
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1));
  return { code: codeForDay(today), day: today, expiresAt: tomorrow.toISOString(), mode: 'daily-auto', custom:false, valid:true };
}
function normalizeCode(code){
  return String(code||'').replace(/\D/g,'').slice(0,6);
}
export async function getAccessSettings(){
  const r = await sb('yulong_access_settings','?select=*&id=eq.main&limit=1',{method:'GET'});
  if(!r.ok || !Array.isArray(r.data) || !r.data[0]) return {source:r.source, editable:false, row:null, error:r.error||null};
  return {source:'supabase', editable:true, row:r.data[0], error:null};
}
export async function saveAccessSettings(data={}){
  const code = normalizeCode(data.code);
  if(!/^\d{6}$/.test(code)) return {ok:false, message:'验证码必须是 6 位数字'};
  const expiresAt = data.expiresAt || data.expires_at;
  const expires = new Date(expiresAt);
  if(!expiresAt || Number.isNaN(expires.getTime())) return {ok:false, message:'请填写正确的失效时间'};
  const row = {id:'main', code, expires_at:expires.toISOString(), enabled:data.enabled !== false, note:data.note||'', updated_at:new Date().toISOString()};
  const r = await sb('yulong_access_settings','?on_conflict=id',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify([row])});
  return {ok:r.ok, data:r.data, message:r.ok?'保存成功':'保存失败', error:r.error};
}
export async function currentAccessCode(){
  const fallback = autoCode();
  const settings = await getAccessSettings();
  const row = settings.row;
  if(row && row.enabled !== false && row.code){
    const expiresAt = row.expires_at || fallback.expiresAt;
    const valid = Date.now() < new Date(expiresAt).getTime();
    return { code:String(row.code), expiresAt, mode:'custom', custom:true, valid, source:'supabase', note:row.note||'', updatedAt:row.updated_at||null };
  }
  return {...fallback, source:settings.source||'fallback'};
}
export async function verifyAccessCode(code){
  const raw = normalizeCode(code);
  const current = await currentAccessCode();
  if(current.custom){
    return {ok:Boolean(current.valid && raw === normalizeCode(current.code)), current};
  }
  const now = new Date();
  const today = dayKey(now);
  const yesterday = dayKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()-1)));
  return {ok:Boolean(raw && (raw === codeForDay(today) || raw === codeForDay(yesterday))), current};
}
export async function recordUsage({clientId,event='open',pluginVersion='',nodeId='',nodeName='',meta={}}){
  if(!clientId) return {ok:false, message:'missing clientId'};
  const now = new Date().toISOString();
  await sb('yulong_clients','?on_conflict=client_id',{method:'POST',prefer:'resolution=merge-duplicates',body:JSON.stringify([{client_id:clientId,plugin_version:pluginVersion||'',last_seen_at:now}])});
  await sb('yulong_usage_events','',{method:'POST',body:JSON.stringify([{client_id:clientId,event,plugin_version:pluginVersion||'',node_id:nodeId||'',node_name:nodeName||'',meta}])});
  return {ok:true};
}
export async function usageStats(){
  const clientsRes = await sb('yulong_clients','?select=*&order=last_seen_at.desc&limit=1000',{method:'GET'});
  const eventsRes = await sb('yulong_usage_events','?select=*&order=created_at.desc&limit=1500',{method:'GET'});
  const clients = Array.isArray(clientsRes.data) ? clientsRes.data : [];
  const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];
  const now = Date.now();
  const dayStart = new Date(); dayStart.setHours(0,0,0,0);
  const activeToday = clients.filter(x=>new Date(x.last_seen_at||0).getTime() >= dayStart.getTime()).length;
  const active7d = clients.filter(x=>now - new Date(x.last_seen_at||0).getTime() <= 7*24*3600*1000).length;
  const byEvent = events.reduce((m,e)=>{m[e.event]=(m[e.event]||0)+1;return m;},{});
  const byNode = events.filter(e=>e.node_name).reduce((m,e)=>{m[e.node_name]=(m[e.node_name]||0)+1;return m;},{});
  const topNodes = Object.entries(byNode).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=>({name,count}));
  return {ok: clientsRes.ok || eventsRes.ok, source:{clients:clientsRes.source,events:eventsRes.source}, stats:{totalClients:clients.length,activeToday,active7d,totalEvents:events.length,connects:byEvent.connect||0,disconnects:byEvent.disconnect||0,speedTests:byEvent.speed_test||0,opens:byEvent.open||0,verifySuccess:byEvent.verify_success||0,verifyFailed:byEvent.verify_failed||0}, topNodes, clients, events, errors:{clients:clientsRes.error,events:eventsRes.error}, updated:new Date().toISOString()};
}
