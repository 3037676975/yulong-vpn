'use client';
import { useEffect } from 'react';
export default function SidebarAccountEntry(){
  useEffect(()=>{
    function run(){
      const aside=document.querySelector('aside');
      if(!aside||document.getElementById('yulong-account-entry')) return;
      const btn=document.createElement('button');
      btn.id='yulong-account-entry';
      btn.textContent='账号密码设置';
      btn.onclick=()=>{location.href='/account'};
      Object.assign(btn.style,{display:'block',width:'100%',margin:'8px 0',border:'0',borderRadius:'15px',padding:'14px 15px',color:'#f7ead0',textAlign:'left',cursor:'pointer',fontWeight:'700',background:'rgba(255,255,255,.04)'});
      aside.appendChild(btn);
    }
    run();
    const timer=setInterval(run,1000);
    return ()=>clearInterval(timer);
  },[]);
  return null;
}
