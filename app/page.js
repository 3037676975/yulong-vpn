'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [health, setHealth] = useState(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => setHealth({ ok:false }));
  }, []);

  if (!authed) {
    return <main className="login"><section><h1>玉龙管理后台</h1><p>输入演示信息进入后台。</p><input placeholder="邮箱"/><input placeholder="密码" type="password"/><button onClick={() => setAuthed(true)}>进入后台</button></section></main>;
  }

  return <main className="shell"><aside><h2>玉龙管理后台</h2><button>控制台</button><button>节点管理</button><button>配置发布</button><button>公告管理</button><button>系统日志</button></aside><section className="content"><h1>控制台</h1><p>前端已经连接到后端接口 <code>/api/health</code>。</p><div className="cards"><div><b>后端状态</b><strong>{health?.status || 'loading'}</strong></div><div><b>项目状态</b><strong>已初始化</strong></div><div><b>部署方式</b><strong>GitHub + Vercel</strong></div></div><pre>{JSON.stringify(health, null, 2)}</pre></section></main>;
}
