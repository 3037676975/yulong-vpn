import { NextResponse } from 'next/server';
import { listNodes } from '../../../lib/nodes';
import { verifyAccessCode } from '../../../lib/usage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function esc(v){
  return String(v ?? '').replace(/\\/g,'\\\\').replace(/"/g,'\\"');
}
function safeName(v, fallback){
  return esc(String(v || fallback || 'node').trim());
}
function nodeToProxy(n, i){
  const name = safeName(n.name, `节点${i+1}`);
  const server = esc(n.server || n.address || '127.0.0.1');
  const port = Number(n.port || 443);
  const scheme = String(n.scheme || 'https').toLowerCase();
  const tls = scheme === 'https' ? '\n  tls: true' : '';
  return `- name: "${name}"
  type: http
  server: "${server}"
  port: ${port}${tls}`;
}
function yaml(nodes){
  const usable = (nodes || []).filter(n => n && (n.server || n.address));
  const names = usable.map((n,i)=>`      - "${safeName(n.name, `节点${i+1}`)}"`).join('\n') || '      - DIRECT';
  const proxies = usable.map(nodeToProxy).join('\n') || '- name: "DIRECT-BACKUP"\n  type: direct';
  return `# 玉龙VPN 2.0 Clash 配置
# 由后台自动生成，请不要手工修改。

mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
ipv6: false

dns:
  enable: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 8.8.8.8
    - 1.1.1.1

proxies:
${proxies}

proxy-groups:
  - name: "玉龙VPN"
    type: select
    proxies:
${names}
      - DIRECT
  - name: "自动选择"
    type: url-test
    url: "https://www.gstatic.com/generate_204"
    interval: 300
    proxies:
${names}

rules:
  - MATCH,玉龙VPN
`;
}

export async function GET(request){
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  if(code){
    const ok = await verifyAccessCode(code);
    if(!ok.ok){
      return new NextResponse('invalid access code', {status:401, headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
    }
  }
  const data = await listNodes();
  return new NextResponse(yaml(data.items || []), {
    status:200,
    headers:{
      'content-type':'text/yaml; charset=utf-8',
      'cache-control':'no-store, max-age=0',
      'profile-update-interval':'6',
      'subscription-userinfo':'upload=0; download=0; total=107374182400; expire=4102444800'
    }
  });
}
