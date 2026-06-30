'use client';
import {useEffect,useState} from 'react';
const box={maxWidth:760,margin:'40px auto',fontFamily:'Arial,Microsoft YaHei,sans-serif',background:'#fff',border:'1px solid #dfe7f3',borderRadius:16,padding:24};
const btn={border:0,borderRadius:10,padding:'10px 14px',background:'#1769ff',color:'#fff',cursor:'pointer'};
const pre={background:'#101828',color:'#d7f8ff',borderRadius:12,padding:14,whiteSpace:'pre-wrap'};
export default function DbPage(){
 const [data,setData]=useState(null);
 async function run(){const r=await fetch('/api/db-check',{cache:'no-store'});setData(await r.json())}
 useEffect(()=>{run()},[]);
 return <main style={{minHeight:'100vh',background:'#f3f6fb',padding:20}}><section style={box}><h1>玉龙VPN 数据库检查</h1><p>连接状态：<b style={{color:data?.connected?'#178c42':'#c62828'}}>{data?.message||'检查中'}</b></p><p>数据源：{data?.source||'-'}</p><p>节点数量：{data?.nodeCount??'-'}</p><p>是否可编辑：{data?.editable?'是':'否'}</p><button style={btn} onClick={run}>重新检查</button><p><a href="/">返回后台</a></p><pre style={pre}>{JSON.stringify(data,null,2)}</pre></section></main>
}
