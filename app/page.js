'use client';
import { useEffect, useState } from 'react';

const navs = [
  ['dashboard','控制台'],
  ['db','数据库检查'],
  ['nodes','节点管理'],
  ['detect','连通检测'],
  ['config','配置发布'],
  ['notices','前台通知'],
  ['usersFull','用户统计完整页'],
  ['logs','系统日志'],
  ['settings','系统设置']
];
const blankNode = { id:'', name:'', region:'', server:'', port:443, scheme:'https', priority:99, status:'正常' };
const S = {
  page:{minHeight:'100vh',background:'radial-gradient(circle at 82% 0,#3c2b12 0,#101214 38%,#050607 100%)',color:'#f7ead0',fontFamily:'Arial,Microsoft YaHei,sans-serif'},
  login:{minHeight:'100vh',display:'grid',placeItems:'center',padding:24},
  shell:{display:'flex',minHeight:'100vh',gap:18,padding:18},
  panel:{background:'rgba(18,20,24,.78)',border:'1px solid rgba(225,190,116,.22)',borderRadius:24,boxShadow:'0 18px 70px rgba(0,0,0,.46)',backdropFilter:'blur(18px)'},
  side:{width:260,padding:18,position:'sticky',top:18,height:'calc(100vh - 36px)',overflow:'auto'},
  main:{flex:1,padding:22,minWidth:0},
  logo:{width:44,height:44,borderRadius:15,display:'grid',placeItems:'center',fontWeight:900,color:'#17120a',background:'linear-gradient(135deg,#fff1bb,#d59d3a 60%,#7b4d14)',boxShadow:'0 12px 36px rgba(213,157,58,.28)'},
  nav:{display:'block',width:'100%',margin:'8px 0',border:0,borderRadius:15,padding:'14px 15px',color:'#f7ead0',textAlign:'left',cursor:'pointer',fontWeight:700},
  card:{padding:18,marginBottom:16},
  grid4:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:14},
  grid3:{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:14},
  form:{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,margin:'12px 0'},
  input:{height:44,border:'1px solid rgba(225,190,116,.26)',borderRadius:14,background:'rgba(255,255,255,.06)',color:'#fff',padding:'0 13px',outline:'none'},
  btn:{border:0,borderRadius:14,padding:'11px 16px',background:'linear-gradient(135deg,#f4d78b,#a87222)',color:'#161008',fontWeight:900,cursor:'pointer'},
  ghost:{border:'1px solid rgba(225,190,116,.24)',borderRadius:14,padding:'10px 14px',background:'rgba(255,255,255,.05)',color:'#f7ead0',cursor:'pointer'},
  table:{width:'100%',borderCollapse:'collapse'},
  td:{borderBottom:'1px solid rgba(225,190,116,.12)',padding:10,fontSize:14,verticalAlign:'top'},
  pre:{background:'#07090c',borderRadius:16,padding:14,color:'#d6f5ff',whiteSpace:'pre-wrap',overflow:'auto',maxHeight:420},
  muted:{color:'#b7aa91'}, ok:{color:'#7dff9e'}, bad:{color:'#ff8b8b'}, warn:{color:'#ffd36a'}
};
function Card({children,style}){return <section style={{...S.panel,...S.card,...(style||{})}}>{children}</section>}
function Stat({label,value,sub,tone}){return <Card><div style={S.muted}>{label}</div><h2 style={{margin:'8px 0 4px',...(tone==='ok'?S.ok:tone==='bad'?S.bad:tone==='warn'?S.warn:{})}}>{value}</h2>{sub&&<small style={S.muted}>{sub}</small>}</Card>}
function nice(v){if(!v)return '-';try{return new Date(v).toLocaleString()}catch{return String(v)}}
function nodeAddr(n){return n.server||n.address||''}
function NodeTable({nodes,onEdit,onRemove,onTest}){return <table style={S.table}><thead><tr>{['节点','地区','地址/IP','端口','状态','操作'].map(h=><th key={h} style={{...S.td,textAlign:'left',color:'#d8b86f'}}>{h}</th>)}</tr></thead><tbody>{nodes.map(n=><tr key={n.id||n.name}><td style={S.td}><b>{n.name||'-'}</b><br/><span style={S.muted}>{n.id||'-'}</span></td><td style={S.td}>{n.region||'-'}</td><td style={S.td}>{nodeAddr(n)||'-'}</td><td style={S.td}>{n.port||'-'}</td><td style={S.td}>{n.status||'-'}</td><td style={S.td}>{onTest&&<button style={S.ghost} onClick={()=>onTest(n)}>检测</button>} {onEdit&&<button style={S.ghost} onClick={()=>onEdit(n)}>修改</button>} {onRemove&&<button style={S.ghost} onClick={()=>onRemove(n)}>删除</button>}</td></tr>)}</tbody></table>}
function BatchTable({data}){if(!data?.results)return <p style={S.muted}>还没有检测结果。</p>;return <table style={S.table}><thead><tr>{['节点','地址','结果','延迟','状态码'].map(h=><th key={h} style={{...S.td,textAlign:'left',color:'#d8b86f'}}>{h}</th>)}</tr></thead><tbody>{data.results.map(x=><tr key={x.id||x.name}><td style={S.td}>{x.name}</td><td style={S.td}>{x.host}:{x.port}</td><td style={{...S.td,...(x.ok?S.ok:S.bad)}}>{x.message}</td><td style={S.td}>{x.ms?x.ms+' ms':'-'}</td><td style={S.td}>{x.status||'-'}</td></tr>)}</tbody></table>}

export default function Page(){
  const [logged,setLogged]=useState(false),[email,setEmail]=useState(''),[pwd,setPwd]=useState(''),[err,setErr]=useState(''),[tab,setTab]=useState('dashboard');
  const [health,setHealth]=useState(null),[db,setDb]=useState(null),[nodes,setNodes]=useState([]),[config,setConfig]=useState(null),[notices,setNotices]=useState([]),[usage,setUsage]=useState(null),[code,setCode]=useState(null),[logs,setLogs]=useState(null);
  const [nodeForm,setNodeForm]=useState(blankNode),[msg,setMsg]=useState(''),[test,setTest]=useState(null),[allTest,setAllTest]=useState(null),[testing,setTesting]=useState(false);
  const u=usage?.stats||{};
  async function login(){setErr('');const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:pwd})});if(!r.ok){setErr('邮箱或密码错误');return}setLogged(true)}
  async function load(){const [h,d,n,c,no,u,cod,lg]=await Promise.all([
    fetch('/api/health',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/db-check',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/nodes',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/config',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/notices',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/client-stats',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/access-code',{cache:'no-store'}).then(r=>r.json()).catch(()=>null),
    fetch('/api/admin-logs',{cache:'no-store'}).then(r=>r.json()).catch(()=>null)
  ]);setHealth(h);setDb(d);setNodes(n?.items||[]);setConfig(c);setNotices(no?.items||[]);setUsage(u);setCode(cod);setLogs(lg)}
  useEffect(()=>{if(logged)load()},[logged]);
  async function saveNode(){setMsg('保存中...');const body={...nodeForm,port:Number(nodeForm.port||443),priority:Number(nodeForm.priority||99),_method:nodeForm._edit?'update':undefined};const r=await fetch('/api/nodes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});setMsg(r.ok?'已保存':'保存失败');setNodeForm(blankNode);load()}
  async function removeNode(n){if(!confirm('确认删除 '+n.name+' ?'))return;const r=await fetch('/api/nodes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({_method:'remove',id:n.id})});setMsg(r.ok?'已删除':'删除失败');load()}
  async function testNode(n){setTest({message:'检测中...',node:n.name});const r=await fetch('/api/node-test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(n)});setTest(await r.json())}
  async function testAll(){setTesting(true);setAllTest({message:'检测中...'});const r=await fetch('/api/node-test-all',{method:'POST',headers:{'content-type':'application/json'}});const j=await r.json().catch(()=>({ok:false,message:'检测失败'}));setAllTest(j);setTesting(false);load()}
  async function copy(text){await navigator.clipboard?.writeText(String(text||''));setMsg('已复制')}
  if(!logged)return <div style={S.page}><main style={S.login}><section style={{...S.panel,width:460,padding:32}}><div style={{display:'flex',gap:14,alignItems:'center'}}><div style={S.logo}>龙</div><div><h1 style={{margin:0}}>玉龙VPN 管理后台</h1><p style={{...S.muted,margin:'6px 0 0'}}>SECURE · CLEAN · ADMIN</p></div></div><div style={{display:'grid',gap:10,marginTop:24}}><input style={S.input} value={email} onChange={e=>setEmail(e.target.value)} placeholder='后台邮箱'/><input style={S.input} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder='后台密码' type='password'/><p style={{color:'#ff8b8b'}}>{err}</p><button style={S.btn} onClick={login}>登录后台</button></div></section></main></div>;
  return <div style={S.page}><div style={S.shell}><aside style={{...S.panel,...S.side}}><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:18}}><div style={S.logo}>龙</div><div><h2 style={{margin:0}}>玉龙VPN</h2><p style={{...S.muted,margin:'4px 0 0'}}>统一后台 v17</p></div></div>{navs.map(([id,label])=><button key={id} onClick={()=>{setTab(id); if(id==='usersFull') setTimeout(load,100)}} style={{...S.nav,background:tab===id?'linear-gradient(135deg,rgba(241,209,138,.28),rgba(155,107,34,.18))':'rgba(255,255,255,.04)'}}>{label}</button>)}</aside><main style={S.main}><h1>{navs.find(x=>x[0]===tab)?.[1]}</h1>
  {tab==='dashboard'&&<><div style={S.grid4}><Stat label='后端状态' value={health?.status||'running'} tone='ok' sub={'v'+(health?.version||17)}/><Stat label='数据库' value={db?.connected?'已连接':'未连接'} tone={db?.connected?'ok':'bad'} sub={db?.source||'-'}/><Stat label='节点总数' value={nodes.length}/><Stat label='今日验证码' value={code?.code||'------'} sub={code?.expiresAt?'过期 '+nice(code.expiresAt):''}/></div><div style={S.grid4}><Stat label='总使用者' value={u.totalClients??0}/><Stat label='今日活跃' value={u.activeToday??0}/><Stat label='连接次数' value={u.connects??0}/><Stat label='测速次数' value={u.speedTests??0}/></div><Card><h2>快速操作</h2><button style={S.btn} onClick={testAll} disabled={testing}>{testing?'检测中...':'一键检测全部节点'}</button> <button style={S.ghost} onClick={load}>刷新数据</button> <button style={S.ghost} onClick={()=>setTab('usersFull')}>打开用户统计完整页</button></Card><Card><h2>检测概览</h2><BatchTable data={allTest}/></Card></>}
  {tab==='nodes'&&<Card><h2>节点管理</h2><p style={S.muted}>保存后插件点击“刷新节点”即可读取最新配置。</p><div style={S.form}>{['id','name','region','server','port','scheme','priority','status'].map(k=><input key={k} style={S.input} value={nodeForm[k]||''} onChange={e=>setNodeForm({...nodeForm,[k]:e.target.value})} placeholder={k==='server'?'server / IP 地址':k}/>)}</div><button style={S.btn} onClick={saveNode}>{nodeForm._edit?'保存修改':'新增节点'}</button> <button style={S.ghost} onClick={()=>setNodeForm(blankNode)}>清空</button> <button style={S.ghost} onClick={load}>刷新列表</button> <button style={S.ghost} onClick={testAll} disabled={testing}>{testing?'检测中...':'一键全部检测'}</button><p>{msg}</p><NodeTable nodes={nodes} onEdit={n=>setNodeForm({...n,server:nodeAddr(n),_edit:true})} onRemove={removeNode} onTest={testNode}/><h3>一键检测结果</h3><BatchTable data={allTest}/></Card>}
  {tab==='detect'&&<Card><h2>检测中心</h2><p style={S.muted}>后台服务器真实访问每个节点入口，插件端测速仍以浏览器插件为准。</p><button style={S.btn} onClick={testAll} disabled={testing}>{testing?'检测中...':'一键检测全部节点'}</button> <button style={S.ghost} onClick={()=>setAllTest(null)}>清空结果</button><div style={{...S.grid4,marginTop:14}}><Stat label='总节点' value={allTest?.total??nodes.length}/><Stat label='成功' value={allTest?.okCount??'-'} tone='ok'/><Stat label='失败' value={allTest?.failCount??'-'} tone={allTest?.failCount?'bad':'ok'}/><Stat label='耗时' value={allTest?.costMs?allTest.costMs+' ms':'-'}/></div><BatchTable data={allTest}/><h3>单个检测结果</h3><pre style={S.pre}>{JSON.stringify(test,null,2)}</pre></Card>}
  {tab==='notices'&&<Card style={{height:'calc(100vh - 120px)',padding:0,overflow:'hidden'}}><iframe src='/notices' style={{width:'100%',height:'100%',border:0,borderRadius:24,background:'#060708'}} /></Card>}
  {tab==='usersFull'&&<Card style={{height:'calc(100vh - 120px)',padding:0,overflow:'hidden'}}><iframe src='/users' style={{width:'100%',height:'100%',border:0,borderRadius:24,background:'#060708'}} /></Card>}
  {tab==='config'&&<Card><h2>配置发布</h2><div style={S.grid4}><Stat label='配置版本' value={'v'+(config?.version||'-')}/><Stat label='配置源' value={config?.source||'-'} tone={config?.editable?'ok':'warn'}/><Stat label='节点数量' value={config?.nodes?.length||0}/><Stat label='模式' value={config?.mode||'-'}/></div><p>插件配置地址：</p><pre style={S.pre}>/api/config</pre><button style={S.btn} onClick={()=>copy('/api/config')}>复制配置地址</button> <button style={S.ghost} onClick={load}>刷新配置</button><h3>高级查看</h3><pre style={S.pre}>{JSON.stringify(config,null,2)}</pre></Card>}
  {tab==='db'&&<Card><h2>数据库检查</h2><div style={S.grid4}><Stat label='Supabase' value={db?.connected?'正常':'异常'} tone={db?.connected?'ok':'bad'}/><Stat label='节点表' value={db?.tables?.yulong_nodes?.count??'-'}/><Stat label='用户表' value={db?.tables?.yulong_clients?.exists?'已创建':'未创建'} tone={db?.tables?.yulong_clients?.exists?'ok':'bad'}/><Stat label='验证码设置表' value={db?.tables?.yulong_access_settings?.exists?'已创建':'未创建'} tone={db?.tables?.yulong_access_settings?.exists?'ok':'bad'}/></div><button style={S.btn} onClick={load}>重新检查</button><pre style={S.pre}>{JSON.stringify(db,null,2)}</pre></Card>}
  {tab==='logs'&&<Card><h2>系统日志</h2><p style={S.muted}>这里展示最近后台检测日志。</p><pre style={S.pre}>{JSON.stringify(logs,null,2)}</pre></Card>}
  {tab==='settings'&&<Card><h2>系统设置</h2><p>后台版本：v17</p><p>项目地址：yulong-vpn-git-main-3037676975s-projects.vercel.app</p><p>插件配置接口：/api/config</p><p>插件通知接口：/api/notices?public=1</p><p>用户统计接口：/api/client-stats</p><p>动态验证码接口：/api/access-code</p><p>验证码设置接口：/api/access-settings</p></Card>}
  </main></div></div>;
}
