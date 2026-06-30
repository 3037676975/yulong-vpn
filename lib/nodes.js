export const fallbackNodes = [
  {id:'us01',name:'美国01',region:'美国',server:'fan.365747.xyz',port:443,scheme:'https',priority:10,status:'正常'},
  {id:'us-la01',name:'美国洛杉矶01',region:'美国',server:'fan.891058.xyz',port:443,scheme:'https',priority:11,status:'正常'},
  {id:'us-la02',name:'美国洛杉矶02',region:'美国',server:'fan.596189.xyz',port:443,scheme:'https',priority:12,status:'观察'},
  {id:'us-sj01',name:'美国圣何塞',region:'美国',server:'fan.226278.xyz',port:443,scheme:'https',priority:13,status:'正常'},
  {id:'jp01',name:'日本01',region:'日本',server:'fan.587475.xyz',port:443,scheme:'https',priority:20,status:'正常'},
  {id:'jp02',name:'日本02',region:'日本',server:'fan.571589.xyz',port:443,scheme:'https',priority:21,status:'正常'},
  {id:'hk01',name:'香港01',region:'香港',server:'fan.240104.xyz',port:443,scheme:'https',priority:30,status:'延迟升高'},
  {id:'hk02',name:'香港02',region:'香港',server:'hk30.240104.xyz',port:443,scheme:'https',priority:31,status:'正常'},
  {id:'hk03',name:'香港03',region:'香港',server:'fan2.240104.xyz',port:443,scheme:'https',priority:32,status:'正常'},
  {id:'de01',name:'德国01',region:'德国',server:'fan.973511.xyz',port:443,scheme:'https',priority:40,status:'正常'},
  {id:'fr01',name:'法国01',region:'法国',server:'fan.132031.xyz',port:443,scheme:'https',priority:50,status:'观察'}
];

function supabaseReady(){return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)}
function headers(){return {'apikey':process.env.SUPABASE_SERVICE_ROLE_KEY,'authorization':'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json'}}
function endpoint(path){return process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+path}

export async function listNodes(){
  if(!supabaseReady()) return {source:'fallback',editable:false,items:fallbackNodes};
  const res = await fetch(endpoint('yulong_nodes?select=*&order=priority.asc'),{headers:headers(),cache:'no-store'});
  if(!res.ok) return {source:'fallback',editable:false,items:fallbackNodes,error:await res.text()};
  const rows = await res.json();
  return {source:'supabase',editable:true,items:rows};
}
export async function createNode(data){
  if(!supabaseReady()) return {ok:false,message:'Supabase 未配置'};
  const row={id:data.id,name:data.name,region:data.region,server:data.server,address:data.server,port:Number(data.port||443),scheme:data.scheme||'https',priority:Number(data.priority||99),status:data.status||'正常'};
  const res=await fetch(endpoint('yulong_nodes'),{method:'POST',headers:{...headers(),prefer:'return=representation'},body:JSON.stringify(row)});
  return {ok:res.ok,data:await res.text()};
}
export async function updateNode(id,data){
  if(!supabaseReady()) return {ok:false,message:'Supabase 未配置'};
  const row={name:data.name,region:data.region,server:data.server,address:data.server,port:Number(data.port||443),scheme:data.scheme||'https',priority:Number(data.priority||99),status:data.status||'正常'};
  const res=await fetch(endpoint('yulong_nodes?id=eq.'+encodeURIComponent(id)),{method:'PATCH',headers:{...headers(),prefer:'return=representation'},body:JSON.stringify(row)});
  return {ok:res.ok,data:await res.text()};
}
export async function deleteNode(id){
  if(!supabaseReady()) return {ok:false,message:'Supabase 未配置'};
  const res=await fetch(endpoint('yulong_nodes?id=eq.'+encodeURIComponent(id)),{method:'DELETE',headers:headers()});
  return {ok:res.ok,data:await res.text()};
}
export function toConfig(nodes){return nodes.map(n=>({id:n.id,name:n.name,server:n.server||n.address,port:Number(n.port||443),scheme:n.scheme||'https',priority:Number(n.priority||99)}))}
export function toAdmin(nodes){return nodes.map(n=>({id:n.id,name:n.name,region:n.region||'',address:n.server||n.address,server:n.server||n.address,port:Number(n.port||443),delay:n.delay||'-',status:n.status||'正常',priority:Number(n.priority||99)}))}
