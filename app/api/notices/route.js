import { NextResponse } from 'next/server';
const items=[
 {id:'n1',title:'玉龙VPN 后台上线',type:'系统通知',status:'已发布',content:'后台已经接入 API，可作为插件远程配置源。'},
 {id:'n2',title:'旧节点配置已导入',type:'配置通知',status:'已发布',content:'已按旧插件结构导入节点域名与端口。'},
 {id:'n3',title:'配置发布链路恢复',type:'发布通知',status:'草稿',content:'config 与 notice 接口已可被前端读取。'}
];
export async function GET(){return NextResponse.json({ok:true,items,updated:new Date().toISOString()});}
