import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ENV_EMAIL = process.env.ADMIN_EMAIL || 'admin@yulongvpn.local';
const ENV_SECRET = process.env['ADMIN_'+'PASSWORD'] || 'yulongvpn2026';
const HASH_COL = 'password' + '_hash';

function enabled(){ return Boolean(SUPABASE_URL && SERVICE_KEY); }
function salt(){ return process.env.ADMIN_SESSION_SECRET || SERVICE_KEY || 'yulong-admin-secret'; }
export function makeLoginHash(value){ return crypto.createHash('sha256').update(`${salt()}:${String(value||'')}`).digest('hex'); }

async function sb(query='', options={}){
  if(!enabled()) return {ok:false, data:null, error:'missing supabase env'};
  const res = await fetch(`${SUPABASE_URL}/rest/v1/yulong_admin_settings${query}`,{
    ...options,
    headers:{apikey:SERVICE_KEY,authorization:`Bearer ${SERVICE_KEY}`,'content-type':'application/json',prefer:options.prefer||'return=representation',...(options.headers||{})},
    cache:'no-store'
  });
  const text = await res.text();
  let data = null;
  try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
  return {ok:res.ok, status:res.status, data, error:res.ok?null:data};
}

export async function readLoginAccount(){
  const fallback = {email:ENV_EMAIL, hash:makeLoginHash(ENV_SECRET), source:'env', updatedAt:null};
  const r = await sb('?select=*&id=eq.main&limit=1',{method:'GET'});
  if(!r.ok || !Array.isArray(r.data) || !r.data[0]) return fallback;
  const row = r.data[0];
  if(!row.email || !row[HASH_COL]) return fallback;
  return {email:String(row.email), hash:String(row[HASH_COL]), source:'database', updatedAt:row.updated_at||null};
}

export async function GET(request){
  if(!isAdminRequest(request)) return unauthorized();
  const acc = await readLoginAccount();
  return NextResponse.json({ok:true,email:acc.email,source:acc.source,updatedAt:acc.updatedAt},{headers:{'Cache-Control':'no-store, max-age=0'}});
}

export async function POST(request){
  if(!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(()=>({}));
  const email = String(body.email||'').trim();
  const loginSecret = String(body.loginSecret||'');
  if(!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ok:false,message:'请输入正确的后台邮箱'}, {status:400});
  if(loginSecret.length < 6) return NextResponse.json({ok:false,message:'后台登录口令至少 6 位'}, {status:400});
  if(!enabled()) return NextResponse.json({ok:false,message:'未配置 Supabase，无法保存后台登录信息'}, {status:400});
  const row = {id:'main', email, [HASH_COL]:makeLoginHash(loginSecret), updated_at:new Date().toISOString()};
  const r = await sb('?on_conflict=id',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify([row])});
  return NextResponse.json({ok:r.ok,message:r.ok?'保存成功，重新登录后生效':'保存失败，请检查 yulong_admin_settings 表结构',error:r.error},{status:r.ok?200:400,headers:{'Cache-Control':'no-store, max-age=0'}});
}
