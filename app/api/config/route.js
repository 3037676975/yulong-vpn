import { NextResponse } from 'next/server';
const nodes=[
 {id:'us01',name:'美国01',server:'fan.365747.xyz',port:443,scheme:'https',priority:10},
 {id:'us-la01',name:'美国洛杉矶01',server:'fan.891058.xyz',port:443,scheme:'https',priority:11},
 {id:'us-la02',name:'美国洛杉矶02',server:'fan.596189.xyz',port:443,scheme:'https',priority:12},
 {id:'us-sj01',name:'美国圣何塞',server:'fan.226278.xyz',port:443,scheme:'https',priority:13},
 {id:'jp01',name:'日本01',server:'fan.587475.xyz',port:443,scheme:'https',priority:20},
 {id:'jp02',name:'日本02',server:'fan.571589.xyz',port:443,scheme:'https',priority:21},
 {id:'hk01',name:'香港01',server:'fan.240104.xyz',port:443,scheme:'https',priority:30},
 {id:'hk02',name:'香港02',server:'hk30.240104.xyz',port:443,scheme:'https',priority:31},
 {id:'hk03',name:'香港03',server:'fan2.240104.xyz',port:443,scheme:'https',priority:32},
 {id:'de01',name:'德国01',server:'fan.973511.xyz',port:443,scheme:'https',priority:40},
 {id:'fr01',name:'法国01',server:'fan.132031.xyz',port:443,scheme:'https',priority:50}
];
export async function GET(){return NextResponse.json({product:'玉龙VPN',version:5,updated:new Date().toISOString(),mode:'chrome-proxy',nodes});}
