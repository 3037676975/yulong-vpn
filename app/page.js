'use client';
import { useEffect, useMemo, useState } from 'react';

const navs = [
  { id: 'dashboard', label: '控制台' },
  { id: 'db', label: '数据库检查' },
  { id: 'nodes', label: '节点管理' },
  { id: 'detect', label: '连通检测' },
  { id: 'config', label: '配置发布' },
  { id: 'notices', label: '前台通知' },
  { id: 'users', label: '用户统计 / 验证码' },
  { id: 'logs', label: '系统日志' },
  { id: 'settings', label: '系统设置' }
];

const blankNode = { id: '', name: '', region: '', server: '', port: 443, scheme: 'https', priority: 99, status: '正常' };
const blankNotice = { id: '', title: '', type: '系统通知', status: '已发布', content: '', priority: 10 };

const S = {
  page: { minHeight: '100vh', background: 'radial-gradient(circle at 82% 0,#3c2b12 0,#101214 38%,#050607 100%)', color: '#f7ead0', fontFamily: 'Arial,Microsoft YaHei,sans-serif' },
  login: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 },
  shell: { display: 'flex', minHeight: '100vh', gap: 18, padding: 18 },
  panel: { background: 'rgba(18,20,24,.78)', border: '1px solid rgba(225,190,116,.22)', borderRadius: 24, boxShadow: '0 18px 70px rgba(0,0,0,.46)', backdropFilter: 'blur(18px)' },
  side: { width: 260, padding: 18, position: 'sticky', top: 18, height: 'calc(100vh - 36px)', overflow: 'auto' },
  main: { flex: 1, padding: 22, minWidth: 0 },
  logo: { width: 44, height: 44, borderRadius: 15, display: 'grid', placeItems: 'center', fontWeight: 900, color: '#17120a', background: 'linear-gradient(135deg,#fff1bb,#d59d3a 60%,#7b4d14)', boxShadow: '0 12px 36px rgba(213,157,58,.28)' },
  nav: { display: 'block', width: '100%', margin: '8px 0', border: 0, borderRadius: 15, padding: '14px 15px', color: '#f7ead0', textAlign: 'left', cursor: 'pointer', fontWeight: 700 },
  card: { padding: 18, marginBottom: 16 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 },
  form: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, margin: '12px 0' },
  form3: { display: 'grid', gridTemplateColumns: '2fr 140px 120px', gap: 10, margin: '12px 0' },
  input: { height: 44, border: '1px solid rgba(225,190,116,.26)', borderRadius: 14, background: 'rgba(255,255,255,.06)', color: '#fff', padding: '0 13px', outline: 'none' },
  area: { minHeight: 110, border: '1px solid rgba(225,190,116,.26)', borderRadius: 14, background: 'rgba(255,255,255,.06)', color: '#fff', padding: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  btn: { border: 0, borderRadius: 14, padding: '11px 16px', background: 'linear-gradient(135deg,#f4d78b,#a87222)', color: '#161008', fontWeight: 900, cursor: 'pointer' },
  ghost: { border: '1px solid rgba(225,190,116,.24)', borderRadius: 14, padding: '10px 14px', background: 'rgba(255,255,255,.05)', color: '#f7ead0', cursor: 'pointer' },
  td: { borderBottom: '1px solid rgba(225,190,116,.12)', padding: 10, fontSize: 14, verticalAlign: 'top' },
  table: { width: '100%', borderCollapse: 'collapse' },
  pre: { background: '#07090c', borderRadius: 16, padding: 14, color: '#d6f5ff', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 420 },
  ok: { color: '#7dff9e' },
  bad: { color: '#ff8b8b' },
  warn: { color: '#ffd36a' },
  muted: { color: '#b7aa91' },
  chip: { display: 'inline-block', padding: '5px 10px', borderRadius: 999, border: '1px solid rgba(225,190,116,.24)', background: 'rgba(225,190,116,.10)', fontSize: 12 },
  code: { fontSize: 42, letterSpacing: 8, margin: '8px 0 4px', color: '#f4d78b', fontWeight: 900 }
};

function Card({ children, style }) {
  return <section style={{ ...S.panel, ...S.card, ...(style || {}) }}>{children}</section>;
}
function Stat({ label, value, tone, sub }) {
  return <Card><div style={S.muted}>{label}</div><h2 style={{ margin: '8px 0 4px', ...(tone === 'ok' ? S.ok : tone === 'bad' ? S.bad : tone === 'warn' ? S.warn : {}) }}>{value}</h2>{sub && <small style={S.muted}>{sub}</small>}</Card>;
}
function makeNoticeId() {
  return 'notice-' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}
function niceDate(v) {
  if (!v) return '-';
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}
function StatusText({ ok, text }) {
  return <span style={ok ? S.ok : S.bad}>{text}</span>;
}
function NodeTable({ nodes, onEdit, onRemove, onTest }) {
  return <table style={S.table}><thead><tr>{['节点', '地区', '地址/IP', '端口', '协议', '优先级', '状态', '操作'].map(h => <th key={h} style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>{h}</th>)}</tr></thead><tbody>{nodes.map(n => <tr key={n.id || n.name}><td style={S.td}><b>{n.name || '-'}</b><br /><span style={S.muted}>{n.id || '-'}</span></td><td style={S.td}>{n.region || '-'}</td><td style={S.td}>{n.server || n.address || '-'}</td><td style={S.td}>{n.port || '-'}</td><td style={S.td}>{n.scheme || '-'}</td><td style={S.td}>{n.priority}</td><td style={S.td}>{n.status || '-'}</td><td style={S.td}>{onTest && <button style={S.ghost} onClick={() => onTest(n)}>检测</button>} {onEdit && <button style={S.ghost} onClick={() => onEdit(n)}>修改</button>} {onRemove && <button style={S.ghost} onClick={() => onRemove(n)}>删除</button>}</td></tr>)}</tbody></table>;
}
function BatchTable({ data }) {
  if (!data?.results) return <p style={S.muted}>还没有检测结果，点击“一键检测全部节点”。</p>;
  return <table style={S.table}><thead><tr>{['节点', '地区', '地址/IP', '结果', '延迟', '状态码'].map(h => <th key={h} style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>{h}</th>)}</tr></thead><tbody>{data.results.map(x => <tr key={x.id || x.name}><td style={S.td}><b>{x.name}</b><br /><span style={S.muted}>{x.id}</span></td><td style={S.td}>{x.region || '-'}</td><td style={S.td}>{x.host}:{x.port}</td><td style={S.td}><StatusText ok={x.ok} text={x.message} /></td><td style={{ ...S.td, ...(x.ok ? S.ok : S.warn) }}>{x.ms ? x.ms + ' ms' : '-'}</td><td style={S.td}>{x.status || '-'}</td></tr>)}</tbody></table>;
}
function NoticeTable({ items, onEdit, onRemove }) {
  return <table style={S.table}><thead><tr>{['标题', '状态', '内容', '优先级', '操作'].map(h => <th key={h} style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>{h}</th>)}</tr></thead><tbody>{items.map(n => <tr key={n.id}><td style={S.td}><b>{n.title}</b><br /><span style={S.muted}>{n.id}</span></td><td style={S.td}><span style={S.chip}>{n.status}</span></td><td style={S.td}>{n.content}</td><td style={S.td}>{n.priority}</td><td style={S.td}><button style={S.ghost} onClick={() => onEdit(n)}>修改</button> <button style={S.ghost} onClick={() => onRemove(n)}>删除</button></td></tr>)}</tbody></table>;
}

export default function Page() {
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('dashboard');

  const [health, setHealth] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeRaw, setNoticeRaw] = useState(null);
  const [config, setConfig] = useState(null);
  const [db, setDb] = useState(null);
  const [logApi, setLogApi] = useState(null);
  const [usage, setUsage] = useState(null);
  const [accessCode, setAccessCode] = useState(null);

  const [nodeForm, setNodeForm] = useState(blankNode);
  const [noticeForm, setNoticeForm] = useState(blankNotice);
  const [msg, setMsg] = useState('');
  const [test, setTest] = useState(null);
  const [allTest, setAllTest] = useState(null);
  const [testingAll, setTestingAll] = useState(false);
  const [localLogs, setLocalLogs] = useState([]);

  const stats = useMemo(() => ({
    published: notices.filter(n => n.status === '已发布').length,
    failed: allTest?.failCount ?? '-',
    passed: allTest?.okCount ?? '-',
    last: allTest?.checkedAt ? niceDate(allTest.checkedAt) : '未检测'
  }), [notices, allTest]);

  const usageStats = usage?.stats || {};

  function addLog(text) {
    setLocalLogs(x => [{ time: new Date().toLocaleString(), text }, ...x].slice(0, 30));
  }

  async function login() {
    setErr('');
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pwd }) });
    if (!r.ok) { setErr('邮箱或密码错误'); return; }
    setLogged(true);
    addLog('登录后台');
  }

  async function checkDb() {
    const r = await fetch('/api/db-check', { cache: 'no-store' });
    const j = await r.json();
    setDb(j);
    return j;
  }

  async function loadUsage() {
    const [u, c] = await Promise.all([
      fetch('/api/client-stats', { cache: 'no-store' }).then(r => r.json()).catch(() => null),
      fetch('/api/access-code', { cache: 'no-store' }).then(r => r.json()).catch(() => null)
    ]);
    setUsage(u);
    setAccessCode(c);
  }

  async function loadLogs() {
    const r = await fetch('/api/admin-logs', { cache: 'no-store' }).then(x => x.json()).catch(() => null);
    setLogApi(r);
  }

  async function load() {
    const [h, n, no, c, d] = await Promise.all([
      fetch('/api/health', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/nodes', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/notices', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/config', { cache: 'no-store' }).then(r => r.json()),
      checkDb()
    ]);
    setHealth(h);
    setNodes(n.items || []);
    setNotices(no.items || []);
    setNoticeRaw(no);
    setConfig(c);
    setDb(d);
    await Promise.all([loadUsage(), loadLogs()]);
    addLog('刷新后台数据');
  }

  useEffect(() => { if (logged) load(); }, [logged]);

  async function saveNode() {
    setMsg('保存节点中...');
    const body = { ...nodeForm, port: Number(nodeForm.port || 443), priority: Number(nodeForm.priority || 99), _method: nodeForm._edit ? 'update' : undefined };
    const r = await fetch('/api/nodes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(j.message || '节点保存失败'); return; }
    setMsg('节点已保存');
    setNodeForm(blankNode);
    addLog('保存节点：' + (body.name || body.id));
    load();
  }

  async function removeNode(n) {
    if (!confirm('确认删除 ' + n.name + ' ?')) return;
    const r = await fetch('/api/nodes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ _method: 'remove', id: n.id }) });
    setMsg(r.ok ? '节点已删除' : '删除失败');
    addLog('删除节点：' + n.name);
    load();
  }

  async function testNode(n) {
    setTest({ message: '检测中...', node: n.name });
    const r = await fetch('/api/node-test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(n) });
    const j = await r.json();
    setTest(j);
    addLog('单节点检测：' + n.name + ' · ' + (j.message || ''));
  }

  async function testAll() {
    setTestingAll(true);
    setAllTest({ message: '正在一键检测全部节点...' });
    const r = await fetch('/api/node-test-all', { method: 'POST', headers: { 'content-type': 'application/json' } });
    const j = await r.json().catch(() => ({ ok: false, message: '检测失败' }));
    setAllTest(j);
    setTestingAll(false);
    addLog('一键检测全部节点：成功 ' + (j.okCount ?? 0) + ' / 失败 ' + (j.failCount ?? 0));
    loadLogs();
  }

  async function saveNotice() {
    setMsg('保存通知中...');
    const body = { ...noticeForm, id: noticeForm.id || makeNoticeId(), type: noticeForm.type || '系统通知', status: noticeForm.status || '已发布', priority: Number(noticeForm.priority || 10), _method: noticeForm._edit ? 'update' : undefined };
    const r = await fetch('/api/notices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(j.message || '通知保存失败'); return; }
    setMsg('通知已保存，插件刷新后会显示');
    setNoticeForm(blankNotice);
    addLog('保存通知：' + body.title);
    load();
  }

  async function removeNotice(n) {
    if (!confirm('确认删除通知 ' + n.title + ' ?')) return;
    const r = await fetch('/api/notices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ _method: 'remove', id: n.id }) });
    setMsg(r.ok ? '通知已删除' : '删除失败');
    addLog('删除通知：' + n.title);
    load();
  }

  async function copy(text) {
    await navigator.clipboard?.writeText(String(text || ''));
    setMsg('已复制到剪贴板');
  }

  if (!logged) {
    return <div style={S.page}><main style={S.login}><section style={{ ...S.panel, width: 460, padding: 32 }}><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><div style={S.logo}>龙</div><div><h1 style={{ margin: 0 }}>玉龙VPN 管理后台</h1><p style={{ ...S.muted, margin: '6px 0 0' }}>SECURE · CLEAN · ADMIN</p></div></div><div style={{ display: 'grid', gap: 10, marginTop: 24 }}><input style={S.input} value={email} onChange={e => setEmail(e.target.value)} placeholder='后台邮箱' /><input style={S.input} value={pwd} onChange={e => setPwd(e.target.value)} placeholder='后台密码' type='password' /><p style={{ color: '#ff8b8b' }}>{err}</p><button style={S.btn} onClick={login}>登录后台</button></div></section></main></div>;
  }

  return <div style={S.page}><div style={S.shell}><aside style={{ ...S.panel, ...S.side }}><div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}><div style={S.logo}>龙</div><div><h2 style={{ margin: 0 }}>玉龙VPN</h2><p style={{ ...S.muted, margin: '4px 0 0' }}>统一后台 v16</p></div></div>{navs.map(x => <button key={x.id} onClick={() => { setTab(x.id); if (x.id === 'users') loadUsage(); if (x.id === 'logs') loadLogs(); }} style={{ ...S.nav, background: tab === x.id ? 'linear-gradient(135deg,rgba(241,209,138,.28),rgba(155,107,34,.18))' : 'rgba(255,255,255,.04)' }}>{x.label}</button>)}</aside><main style={S.main}><h1>{navs.find(x => x.id === tab)?.label}</h1>

  {tab === 'dashboard' && <><div style={S.grid4}><Stat label='后端状态' value={health?.status || 'running'} tone='ok' sub={'v' + (health?.version || 16)} /><Stat label='数据库' value={db?.connected ? '已连接' : '未连接'} tone={db?.connected ? 'ok' : 'bad'} sub={db?.source || '-'} /><Stat label='节点总数' value={nodes.length} sub='来自 Supabase' /><Stat label='通知数量' value={notices.length} sub={'已发布 ' + stats.published} /></div><div style={S.grid4}><Stat label='检测成功' value={stats.passed} tone='ok' sub='一键检测结果' /><Stat label='检测失败' value={stats.failed} tone={allTest?.failCount ? 'bad' : 'ok'} sub='一键检测结果' /><Stat label='今日活跃用户' value={usageStats.activeToday ?? 0} sub='匿名设备活跃' /><Stat label='今日验证码' value={accessCode?.code || '------'} sub='插件输入后可使用' /></div><Card><h2>快速操作</h2><button style={S.btn} onClick={testAll} disabled={testingAll}>{testingAll ? '检测中...' : '一键检测全部节点'}</button> <button style={S.ghost} onClick={load}>刷新数据</button> <button style={S.ghost} onClick={() => setTab('nodes')}>进入节点管理</button> <button style={S.ghost} onClick={() => setTab('users')}>进入用户统计</button></Card><Card><h2>检测概览</h2><BatchTable data={allTest} /></Card></>}

  {tab === 'nodes' && <Card><h2>节点管理</h2><p style={S.muted}>管理节点、单个检测和一键全部检测都放在这里。保存后插件点击“刷新节点”即可读取最新配置。</p><div style={S.form}>{['id', 'name', 'region', 'server', 'port', 'scheme', 'priority', 'status'].map(k => <input key={k} style={S.input} value={nodeForm[k] || ''} onChange={e => setNodeForm({ ...nodeForm, [k]: e.target.value })} placeholder={k === 'server' ? 'server / IP 地址' : k} />)}</div><button style={S.btn} onClick={saveNode}>{nodeForm._edit ? '保存修改' : '新增节点'}</button> <button style={S.ghost} onClick={() => setNodeForm(blankNode)}>清空</button> <button style={S.ghost} onClick={load}>刷新列表</button> <button style={S.ghost} onClick={testAll} disabled={testingAll}>{testingAll ? '检测中...' : '一键全部检测'}</button><p>{msg}</p><NodeTable nodes={nodes} onEdit={n => setNodeForm({ ...n, server: n.server || n.address, _edit: true })} onRemove={removeNode} onTest={testNode} /><h3>一键检测结果</h3><BatchTable data={allTest} /></Card>}

  {tab === 'detect' && <Card><h2>检测中心</h2><p style={S.muted}>后台会真实访问每个节点入口，返回成功/失败、延迟和状态码。真正走 Chrome 代理的测速仍以插件端为准。</p><button style={S.btn} onClick={testAll} disabled={testingAll}>{testingAll ? '检测中...' : '一键检测全部节点'}</button> <button style={S.ghost} onClick={() => setAllTest(null)}>清空结果</button><div style={{ ...S.grid4, marginTop: 14 }}><Stat label='总节点' value={allTest?.total ?? nodes.length} /><Stat label='成功' value={allTest?.okCount ?? '-'} tone='ok' /><Stat label='失败' value={allTest?.failCount ?? '-'} tone={allTest?.failCount ? 'bad' : 'ok'} /><Stat label='检测耗时' value={allTest?.costMs ? allTest.costMs + ' ms' : '-'} /></div><BatchTable data={allTest} /><h3>单个节点检测</h3><NodeTable nodes={nodes} onTest={testNode} /><h3>单个检测结果</h3><pre style={S.pre}>{JSON.stringify(test, null, 2)}</pre></Card>}

  {tab === 'notices' && <Card><h2>前台通知</h2><p style={S.muted}>这里直接管理插件顶部通知，不需要再跳转页面。状态为“已发布”的内容才会显示在插件里。</p><div style={S.grid3}><Stat label='通知数据源' value={noticeRaw?.source || '-'} tone={noticeRaw?.editable ? 'ok' : 'bad'} /><Stat label='已发布' value={stats.published} /><Stat label='可编辑' value={noticeRaw?.editable ? '是' : '否'} tone={noticeRaw?.editable ? 'ok' : 'bad'} /></div><div style={S.form3}><input style={S.input} value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder='通知标题' /><select style={S.input} value={noticeForm.status} onChange={e => setNoticeForm({ ...noticeForm, status: e.target.value })}><option>已发布</option><option>草稿</option></select><input style={S.input} value={noticeForm.priority} onChange={e => setNoticeForm({ ...noticeForm, priority: e.target.value })} placeholder='优先级' /></div><textarea style={S.area} value={noticeForm.content} onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })} placeholder='通知内容，例如：今晚 23:00 节点维护，建议使用日本01。' /><div style={{ marginTop: 12 }}><button style={S.btn} onClick={saveNotice}>{noticeForm._edit ? '保存修改' : '新增通知'}</button> <button style={S.ghost} onClick={() => setNoticeForm(blankNotice)}>清空</button> <button style={S.ghost} onClick={load}>刷新通知</button></div><p>{msg}</p><NoticeTable items={notices} onEdit={n => setNoticeForm({ ...n, _edit: true })} onRemove={removeNotice} /></Card>}

  {tab === 'users' && <><div style={S.grid4}><Stat label='总使用者' value={usageStats.totalClients ?? 0} sub='匿名设备数' /><Stat label='今日活跃' value={usageStats.activeToday ?? 0} sub='今天有使用的设备' /><Stat label='7天活跃' value={usageStats.active7d ?? 0} sub='近 7 天活跃' /><Stat label='事件总数' value={usageStats.totalEvents ?? 0} sub='打开 / 连接 / 测速 / 验证' /></div><Card><h2>今日动态验证码</h2><p style={S.muted}>目前不做收费，也不做用户等级。用户只要在插件中输入这个 6 位动态验证码即可正常使用。验证码每天自动变化。</p><div style={S.code}>{accessCode?.code || '------'}</div><p>过期时间：{niceDate(accessCode?.expiresAt)}</p><button style={S.btn} onClick={() => copy(accessCode?.code || '')}>复制验证码</button> <button style={S.ghost} onClick={loadUsage}>刷新用户数据</button></Card><div style={S.grid4}><Stat label='打开插件' value={usageStats.opens ?? 0} /><Stat label='连接次数' value={usageStats.connects ?? 0} /><Stat label='测速次数' value={usageStats.speedTests ?? 0} /><Stat label='验证成功 / 失败' value={(usageStats.verifySuccess ?? 0) + ' / ' + (usageStats.verifyFailed ?? 0)} /></div><Card><h2>常用节点</h2><table style={S.table}><thead><tr><th style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>节点</th><th style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>使用次数</th></tr></thead><tbody>{(usage?.topNodes || []).map(x => <tr key={x.name}><td style={S.td}>{x.name}</td><td style={S.td}>{x.count}</td></tr>)}</tbody></table></Card><Card><h2>最近使用者</h2><table style={S.table}><thead><tr>{['匿名ID', '插件版本', '首次使用', '最后活跃'].map(h => <th key={h} style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>{h}</th>)}</tr></thead><tbody>{(usage?.clients || []).slice(0, 50).map(x => <tr key={x.client_id}><td style={S.td}>{x.client_id}</td><td style={S.td}>{x.plugin_version || '-'}</td><td style={S.td}>{niceDate(x.first_seen_at)}</td><td style={S.td}>{niceDate(x.last_seen_at)}</td></tr>)}</tbody></table></Card><Card><h2>最近事件</h2><table style={S.table}><thead><tr>{['时间', '匿名ID', '事件', '节点'].map(h => <th key={h} style={{ ...S.td, textAlign: 'left', color: '#d8b86f' }}>{h}</th>)}</tr></thead><tbody>{(usage?.events || []).slice(0, 80).map((x, i) => <tr key={i}><td style={S.td}>{niceDate(x.created_at)}</td><td style={S.td}>{x.client_id}</td><td style={S.td}>{x.event}</td><td style={S.td}>{x.node_name || '-'}</td></tr>)}</tbody></table></Card></>}

  {tab === 'config' && <Card><h2>配置发布</h2><div style={S.grid4}><Stat label='配置版本' value={'v' + (config?.version || '-')} /><Stat label='配置源' value={config?.source || '-'} tone={config?.editable ? 'ok' : 'warn'} /><Stat label='节点数量' value={config?.nodes?.length || 0} /><Stat label='模式' value={config?.mode || '-'} /></div><p>插件配置地址：</p><pre style={S.pre}>/api/config</pre><button style={S.btn} onClick={() => copy('/api/config')}>复制配置地址</button> <button style={S.ghost} onClick={load}>刷新配置</button><h3>高级查看</h3><pre style={S.pre}>{JSON.stringify(config, null, 2)}</pre></Card>}

  {tab === 'db' && <Card><h2>数据库检查</h2><div style={S.grid4}><Stat label='Supabase' value={db?.connected ? '正常' : '异常'} tone={db?.connected ? 'ok' : 'bad'} /><Stat label='节点表' value={db?.tables?.yulong_nodes?.count ?? '-'} sub='yulong_nodes' /><Stat label='用户表' value={db?.tables?.yulong_clients?.exists ? '已创建' : '未创建'} tone={db?.tables?.yulong_clients?.exists ? 'ok' : 'bad'} sub='yulong_clients' /><Stat label='事件表' value={db?.tables?.yulong_usage_events?.exists ? '已创建' : '未创建'} tone={db?.tables?.yulong_usage_events?.exists ? 'ok' : 'bad'} sub='yulong_usage_events' /></div><button style={S.btn} onClick={checkDb}>重新检查</button><pre style={S.pre}>{JSON.stringify(db, null, 2)}</pre></Card>}

  {tab === 'logs' && <Card><h2>系统日志</h2><p style={S.muted}>这里展示最近后台检测日志和本地操作日志。</p><h3>后台日志 / 检测历史</h3><pre style={S.pre}>{JSON.stringify(logApi, null, 2)}</pre><h3>当前浏览器操作日志</h3>{localLogs.length ? localLogs.map((l, i) => <p key={i}><b>{l.time}</b> · {l.text}</p>) : <p>暂无日志</p>}</Card>}

  {tab === 'settings' && <Card><h2>系统设置</h2><p>后台版本：v16</p><p>项目地址：yulong-vpn-git-main-3037676975s-projects.vercel.app</p><p>插件配置接口：/api/config</p><p>插件通知接口：/api/notices?public=1</p><p>用户统计接口：/api/client-stats</p><p>动态验证码接口：/api/access-code</p><p>为了避免截图泄露，后台不再明文展示密码。</p></Card>}

  </main></div></div>;
}
