import { NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function enabled(){ return Boolean(SUPABASE_URL && SERVICE_KEY); }
async function db(query='', options={}){
  if(!enabled()) return {ok:false, data:null, error:'missing supabase env'};
  const res = await fetch(`${SUPABASE_URL}/rest/v1/yulong_admin_account${query}`,{
    ...options,
    headers:{apikey:SERVICE_KEY,authorization:`Bearer ${SERVICE_KEY}`,'content-type':'application/json',prefer:options.prefer||'return=representation'},
    cache:'no-store'
  });
  const text = await res.text();
  let data = null;
  try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
  return {ok:res.ok,data,error:res.ok?null:data};
}

export async function GET(request){
  if(!isAdminRequest(request)) return unauthorized();
  const r = await db('?select=email,updated_at&id=eq.main&limit=1',{method:'GET'});
  const row = Array.isArray(r.data) ? r.data[0] : null;
  return NextResponse.json({ok:true,email:row?.email||process.env.ADMIN_EMAIL||'admin@yulongvpn.local',source:row?'database':'env',updatedAt:row?.updated_at||null});
}

export async function POST(request){
  if(!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(()=>({}));
  const email = String(body.email||'').trim();
  const loginSecret = String(body.loginSecret||'');
  if(!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ok:false,message:'请输入正确邮箱'}, {status:400});
  if(loginSecret.length < 6) return NextResponse.json({ok:false,message:'密码至少 6 位'}, {status:400});
  const row = {id:'main',email,login_secret:loginSecret,updated_at:new Date().toISOString()};
  const r = await db('?on_conflict=id',{method:'POST',prefer:'resolution=merge-duplicates,return=representation',body:JSON.stringify([row])});
  return NextResponse.json({ok:r.ok,message:r.ok?'保存成功':'保存失败，请先创建 yulong_admin_account 数据表',error:r.error},{status:r.ok?200:400});
}
