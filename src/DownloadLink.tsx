import { useState } from 'react';
export function DownloadLink(props:React.AnchorHTMLAttributes<HTMLAnchorElement> & {href:string}) {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  if(import.meta.env.VITE_BACKEND!=='firebase')return <a {...props}/>;
  return <><a {...props} aria-disabled={busy} onClick={async event=>{
    event.preventDefault();if(busy)return;setBusy(true);setError('');
    try{const {firebaseDownload}=await import('./firebase-api');const blob=await firebaseDownload(props.href.replace(/^\/api/,''));const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=props.href.endsWith('/pdf')?'mein-uebungsplan.pdf':props.href.endsWith('/export')?'meine-demodaten.json':'mediendatei';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e){setError(e instanceof Error?e.message:'Download fehlgeschlagen.');}finally{setBusy(false);}
  }}/>{error&&<span role="alert" className="firebase-gate-error">{error}</span>}</>;
}
