const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function enabled(){
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

async function supabase(table, query='', options={}){
  if(!enabled()) return {ok:false, skipped:true, error:'missing supabase env'};
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const res = await fetch(url,{
    ...options,
    headers:{
      apikey: SERVICE_KEY,
      authorization: `Bearer ${SERVICE_KEY}`,
      'content-type':'application/json',
      prefer: options.prefer || 'return=representation',
      ...(options.headers||{})
    },
    cache:'no-store'
  });
  const text = await res.text();
  let data = null;
  try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
  return {ok:res.ok,status:res.status,data,error:res.ok?null:data};
}

export async function tableCount(table){
  const r = await supabase(table,'?select=id&limit=1',{headers:{prefer:'count=exact'},prefer:'count=exact'});
  if(!r.ok) return {exists:false,count:0,error:r.error};
  return {exists:true,count:Array.isArray(r.data)?r.data.length:0,error:null};
}

export async function insertAdminLog(action, detail={}, level='info'){
  try{
    await supabase('yulong_admin_logs','',{method:'POST',body:JSON.stringify([{action,level,detail}])});
  }catch(error){
    // 日志表是增强功能，失败不能影响主功能。
  }
}

export async function insertNodeChecks(runId, results=[]){
  try{
    const rows = results.map(x=>({
      run_id: runId,
      node_id: x.id || '',
      node_name: x.name || '',
      region: x.region || '',
      host: x.host || '',
      port: Number(x.port || 443),
      ok: Boolean(x.ok),
      ms: x.ms == null ? null : Number(x.ms),
      status_code: x.status == null ? null : Number(x.status),
      message: x.message || '',
      error: x.error || null
    }));
    if(rows.length) await supabase('yulong_node_checks','',{method:'POST',body:JSON.stringify(rows)});
  }catch(error){
    // 检测历史表是增强功能，失败不能影响检测结果返回。
  }
}

export async function listAdminLogs(limit=30){
  const r = await supabase('yulong_admin_logs',`?select=*&order=created_at.desc&limit=${limit}`,{method:'GET'});
  if(!r.ok) return {items:[],source:'fallback',editable:false,error:r.error};
  return {items:r.data||[],source:'supabase',editable:true,error:null};
}

export async function listNodeChecks(limit=60){
  const r = await supabase('yulong_node_checks',`?select=*&order=created_at.desc&limit=${limit}`,{method:'GET'});
  if(!r.ok) return {items:[],source:'fallback',editable:false,error:r.error};
  return {items:r.data||[],source:'supabase',editable:true,error:null};
}
