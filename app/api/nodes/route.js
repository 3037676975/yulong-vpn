import { NextResponse } from 'next/server';
const items = [
 {id:'us01',name:'美国01',region:'美国',address:'fan.365747.xyz',port:443,delay:168,status:'正常',priority:10},
 {id:'us-la01',name:'美国洛杉矶01',region:'美国',address:'fan.891058.xyz',port:443,delay:194,status:'正常',priority:11},
 {id:'us-la02',name:'美国洛杉矶02',region:'美国',address:'fan.596189.xyz',port:443,delay:242,status:'观察',priority:12},
 {id:'us-sj01',name:'美国圣何塞',region:'美国',address:'fan.226278.xyz',port:443,delay:178,status:'正常',priority:13},
 {id:'jp01',name:'日本01',region:'日本',address:'fan.587475.xyz',port:443,delay:98,status:'正常',priority:20},
 {id:'jp02',name:'日本02',region:'日本',address:'fan.571589.xyz',port:443,delay:126,status:'正常',priority:21},
 {id:'hk01',name:'香港01',region:'香港',address:'fan.240104.xyz',port:443,delay:312,status:'延迟升高',priority:30},
 {id:'hk02',name:'香港02',region:'香港',address:'hk30.240104.xyz',port:443,delay:205,status:'正常',priority:31},
 {id:'hk03',name:'香港03',region:'香港',address:'fan2.240104.xyz',port:443,delay:199,status:'正常',priority:32},
 {id:'de01',name:'德国01',region:'德国',address:'fan.973511.xyz',port:443,delay:187,status:'正常',priority:40},
 {id:'fr01',name:'法国01',region:'法国',address:'fan.132031.xyz',port:443,delay:245,status:'观察',priority:50}
];
export async function GET() { return NextResponse.json({ ok:true,total:items.length,items,updated:new Date().toISOString() }); }
