'use client';
import {useState} from 'react';
export default function Page(){
 const [email,setEmail]=useState(''),[loginSecret,setLoginSecret]=useState(''),[msg,setMsg]=useState('');
 async function save(){setMsg('Saving');const r=await fetch('/api/admin-account',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,loginSecret})});const j=await r.json().catch(()=>({}));setMsg(j.message||String(r.status));}
 return <main style={{padding:24}}><h1>Yulong Admin Account</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email'/><input value={loginSecret} onChange={e=>setLoginSecret(e.target.value)} placeholder='new key'/><button onClick={save}>Save</button><p>{msg}</p></main>
}
