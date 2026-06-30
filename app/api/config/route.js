import { NextResponse } from 'next/server';
const nodes=[
 {id:'us01',name:'美国01',server:'fan.365747.xyz',port:443,scheme:'https',priority:10},
 {id:'jp01',name:'日本01',server:'fan.587475.xyz',port:443,scheme:'https',priority:20},
 {id:'hk02',name:'香港02',server:'hk30.240104.xyz',port:443,scheme:'https',priority:30},
 {id:'de01',name:'德国01',server:'fan.973511.xyz',port:443,scheme:'https',priority:40}
];
export async function GET(){return NextResponse.json({product:'玉龙VPN',version:2,updated:new Date().toISOString(),mode:'chrome-proxy',nodes});}
