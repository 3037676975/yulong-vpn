'use client';
import {useEffect,useMemo,useState} from 'react';

const blank={id:'',title:'',type:'系统通知',status:'已发布',content:'',priority:10};
const ui={
 page:{minHeight:'100vh',padding:24,color:'#f6ead3',fontFamily:'Arial,Microsoft YaHei,sans-serif',background:'radial-gradient(circle at 82% 0,#3c2b12 0,#121417 38%,#060708 100%)'},
 wrap:{maxWidth:1180,margin:'0 auto'},
 header:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginBottom:18},
 brand:{display:'flex',alignItems:'center',gap:14},
 logo:{width:48,height:48,borderRadius:16,display:'grid',placeItems:'center',fontWeight:900,color:'#17120a',background:'linear-gradient(135deg,#fff0b8,#d59d3a 60%,#7b4d14)',boxShadow:'0 12px 36px rgba(213,157,58,.28)'},
 panel:{background:'rgba(18,20,24,.78)',border:'1px solid rgba(225,190,116,.22)',borderRadius:24,boxShadow:'0 18px 70px rgba(0,0,0,.46)',backdropFilter:'blur(18px)'},
 card:{padding:18,marginBottom:16},
 row:{display:'grid',gridTemplateColumns:'2fr 150px 110px',gap:10,marginBottom:10},
 input:{height:44,border:'1px solid rgba(225,190,116,.26)',borderRadius:14,background:'rgba(255,255,255,.06)',color:'#fff',padding:'0 13px',outline:'none'},
 area:{minHeight:108,border:'1px solid rgba(225,190,116,.26)',borderRadius:14,background:'rgba(255,255,255,.06)',color:'#fff',padding:13,outline:'none',width:'100%',boxSizing:'border-box'},
 btn:{border:0,borderRadius:14,padding:'11px 16px',background:'linear-gradient(135deg,#f4d78b,#a87222)',color:'#161008',fontWeight:800,cursor:'pointer'},
 ghost:{border:'1px solid rgba(225,190,116,.24)',borderRadius:14,padding:'10px 14px',background:'rgba(255,255,255,.05)',color:'#f6ead3',cursor:'pointer'},
 table:{width:'100%',borderCollapse:'collapse'},
 td:{borderBottom:'1px solid rgba(225,190,116,.12)',padding:12,fontSize:14,verticalAlign:'top'},
 chip:{display:'inline-block',padding:'5px 10px',borderRadius:999,fontSize:12,border:'1px solid rgba(225,190,116,.24)',background:'rgba(225,190,116,.10)'}
};
function Card(p){return <section style={{...ui.panel,...ui.card,...(p.style||{})}}>{p.children}</section>}
function makeId(){return 'notice-'+new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)}
export default function NoticesPage(){
 const [items,setItems]=useState([]),[form,setForm]=useState(blank),[msg,setMsg]=useState(''),[raw,setRaw]=useState(null),[saving,setSaving]=useState(false);
 const published=useMemo(()=>items.filter(x=>x.status==='已发布').length,[items]);
 async function load(){const r=await fetch('/api/notices',{cache:'no-store'});const j=await r.json();setRaw(j);setItems(j.items||[])}
 useEffect(()=>{load()},[]);
 async function save(){setSaving(true);setMsg('保存中...');const body={...form,id:form.id||makeId(),type:form.type||'系统通知',status:form.status||'已发布',priority:Number(form.priority||10),_method:form._edit?'update':undefined};const r=await fetch('/api/notices',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));setSaving(false);if(!r.ok){setMsg(j.message||'保存失败，请检查 yulong_notices 表');return;}setMsg('已保存。插件刷新后会读取最新通知。');setForm(blank);load()}
 async function remove(n){if(!confirm('删除通知：'+n.title+' ?'))return;setMsg('删除中...');const r=await fetch('/api/notices',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({_method:'remove',id:n.id})});setMsg(r.ok?'已删除':'删除失败');load()}
 return <main style={ui.page}><div style={ui.wrap}><header style={ui.header}><div style={ui.brand}><div style={ui.logo}>龙</div><div><h1 style={{margin:0}}>玉龙VPN 前台通知</h1><p style={{margin:'6px 0 0',color:'#b9ad93'}}>后台发布后，插件顶部通知条会读取这里的已发布内容。</p></div></div><a style={{...ui.ghost,textDecoration:'none'}} href='/'>返回主后台</a></header><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}><Card>数据源<h2>{raw?.source||'-'}</h2></Card><Card>可编辑<h2 style={{color:raw?.editable?'#7dff9e':'#ff8b8b'}}>{raw?.editable?'是':'否'}</h2></Card><Card>已发布<h2>{published}</h2></Card></div><Card><h2>{form._edit?'修改通知':'新增通知'}</h2><p style={{color:'#b9ad93'}}>最少只填标题和内容。ID 可以留空，系统会自动生成。</p><div style={ui.row}><input style={ui.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder='标题，例如：节点维护提醒'/><select style={ui.input} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>已发布</option><option>草稿</option></select><input style={ui.input} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} placeholder='优先级'/></div><textarea style={ui.area} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder='通知内容，例如：今晚 23:00 节点维护，建议使用日本01。'/><div style={{marginTop:12}}><button style={ui.btn} disabled={saving} onClick={save}>{saving?'保存中...':(form._edit?'保存修改':'新增通知')}</button> <button style={ui.ghost} onClick={()=>setForm(blank)}>清空</button> <button style={ui.ghost} onClick={load}>刷新</button></div><p>{msg}</p></Card><Card><h2>通知列表</h2><table style={ui.table}><thead><tr>{['标题','状态','内容','优先级','操作'].map(h=><th key={h} style={{...ui.td,textAlign:'left',color:'#d9bd79'}}>{h}</th>)}</tr></thead><tbody>{items.map(n=><tr key={n.id}><td style={ui.td}><b>{n.title}</b><br/><span style={{color:'#8f866f'}}>{n.id}</span></td><td style={ui.td}><span style={ui.chip}>{n.status}</span></td><td style={ui.td}>{n.content}</td><td style={ui.td}>{n.priority}</td><td style={ui.td}><button style={ui.ghost} onClick={()=>setForm({...n,_edit:true})}>修改</button> <button style={ui.ghost} onClick={()=>remove(n)}>删除</button></td></tr>)}</tbody></table></Card></div></main>
}
