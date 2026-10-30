import { doc, getDocFromServer, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore, requireDemoIdentity } from './firebase';
import version from './app-version.json';
import { demoCanExercise, demoExercise, handleDemoRequest, validateDemoPayload } from './demo-domain';
import type { DemoContext, DemoState } from './demo-domain';
import { registerMediaResolver } from './resources';

const key='physio-firebase-demo-role';
const mediaUrls=new Map<string,string>();
let lastState:DemoState|null=null;
export function clearFirebaseDemoMemory() {
  for(const url of mediaUrls.values())URL.revokeObjectURL(url);
  mediaUrls.clear();lastState=null;sessionStorage.removeItem(key);
}
const context=():DemoContext=>({userId:sessionStorage.getItem(key),origin:location.origin,version:version.version,date:version.date});
async function reference(){const user=await requireDemoIdentity();return doc(firestore,'demoStates',user.uid);}
function parse(data:any):DemoState{const state=JSON.parse(data.payload);validateDemoPayload(state);return state;}
async function load() {
  const ref=await reference();
  const snapshot=await getDocFromServer(ref);
  if(snapshot.exists()){lastState=parse(snapshot.data());return lastState;}
  throw new Error('Die Beispieldaten für diesen Demo-Zugang wurden noch nicht eingerichtet.');
}
export async function firebaseApi<T=any>(path:string,method='GET',body?:unknown):Promise<T> {
  if(body instanceof FormData) return await upload(path,body) as T;
  if(method==='GET'){
    const state=await load();
    const result=await handleDemoRequest(state,context(),path,method,body);
    if(path.startsWith('/overview'))await prepareMedia(state);
    return result.value;
  }
  const ref=await reference();
  await load();
  const result=await runTransaction(firestore,async transaction=>{
    const current=await transaction.get(ref);
    if(!current.exists())throw new Error('Demodaten sind nicht vorhanden. Bitte neu laden.');
    const state=parse(current.data());
    const before=validateDemoPayload(state);
    const result=await handleDemoRequest(state,context(),path,method,body);
    const after=validateDemoPayload(state);
    if(before!==after)transaction.update(ref,{payload:after,revision:current.data().revision+1,updatedAt:serverTimestamp()});
    return result;
  });
  if('userId' in result)sessionStorage.setItem(key,result.userId||'');
  if(result.value?.url&&!result.value.qr){const qr=await import('qrcode');result.value.qr=await qr.toDataURL(result.value.url);}
  return result.value;
}
async function prepareMedia(state:DemoState) {
  const user=state.users.find(u=>u.id===context().userId);
  if(!user)return;
  for(const [id,m] of Object.entries(state.media)) {
    if(!demoCanExercise(state,user,m.exercise_id))continue;
    if(mediaUrls.has(id))continue;
    const owner=await requireDemoIdentity();
    const chunks:Uint8Array<ArrayBuffer>[]=[];
    for(let i=0;i<m.chunks;i++){
      const snap=await getDocFromServer(doc(firestore,'demoStates',owner.uid,'media',id,'chunks',String(i)));
      if(!snap.exists())throw new Error('Eine Mediendatei ist unvollständig.');
      const raw=atob(snap.data().data);const bytes=new Uint8Array(raw.length);for(let j=0;j<raw.length;j++)bytes[j]=raw.charCodeAt(j);chunks.push(bytes);
    }
    mediaUrls.set(id,URL.createObjectURL(new Blob(chunks,{type:m.mime})));
  }
}
function signature(bytes:Uint8Array,text:string,offset=0){return Array.from(text).every((c,i)=>bytes[offset+i]===c.charCodeAt(0));}
async function inspectFile(file:File) {
  if(file.size===0||file.size>50*1024*1024)throw new Error('Die Datei muss zwischen 1 Byte und 50 MB groß sein.');
  const bytes=new Uint8Array(await file.arrayBuffer());let mime='';
  if(bytes[0]===0x89&&signature(bytes,'PNG\r\n\x1a\n',1))mime='image/png';
  else if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)mime='image/jpeg';
  else if(signature(bytes,'RIFF')&&signature(bytes,'WEBP',8))mime='image/webp';
  else if(signature(bytes,'ftyp',4))mime='video/mp4';
  else if(bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3)mime='video/webm';
  else if(file.name.toLowerCase().endsWith('.vtt')&&bytes.length<100000&&/^WEBVTT[\s\S]*\d{2}:\d{2}[.:][\d.]+ --> \d{2}:\d{2}[.:][\d.]+/.test(new TextDecoder().decode(bytes)))mime='text/vtt';
  if(!mime)throw new Error('Erlaubt sind JPEG, PNG, WebP, MP4, WebM und zeitcodierte VTT-Untertitel.');
  if(mime.startsWith('image/')) {
    const bitmap=await createImageBitmap(file);
    if(bitmap.width*bitmap.height>25000000){bitmap.close();throw new Error('Das Bild ist zu groß.');}
    const scale=Math.min(1,1600/bitmap.width);const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const converted=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Bildverarbeitung fehlgeschlagen.')),'image/webp',0.85));
    return {blob:converted,mime:converted.type,kind:'image'};
  }
  return {blob:new Blob([bytes],{type:mime}),mime,kind:mime==='text/vtt'?'captions':'video'};
}
async function upload(path:string,form:FormData) {
  const exerciseId=/^\/exercises\/([^/]+)\/media$/.exec(path)?.[1];
  const file=form.get('file');if(!exerciseId||!(file instanceof File))throw new Error('Bitte eine Datei auswählen.');
  const owner=await requireDemoIdentity(),state=await load(),actor=state.users.find(u=>u.id===context().userId);
  if(!actor||actor.role==='patient'||!demoExercise(state,exerciseId))throw new Error('Nur für das Praxisteam.');
  const data=await inspectFile(file),buffer=new Uint8Array(await data.blob.arrayBuffer());
  const id=crypto.randomUUID(),chunkSize=600000,chunks=Math.ceil(buffer.length/chunkSize);
  try{
    const metadata=writeBatch(firestore);
    metadata.set(doc(firestore,'demoStates',owner.uid,'media',id),{ownerUid:owner.uid,mediaId:id,mime:data.mime,size:buffer.length,chunks,createdAt:serverTimestamp()});
    await metadata.commit();
    // At most 6.4 MB of base64 per request, including for a 50 MiB video.
    // Expose the file in the workspace only after every batch succeeds.
    for(let start=0;start<chunks;start+=8){
      const batch=writeBatch(firestore);
      for(let i=start;i<Math.min(start+8,chunks);i++){
        const bytes=buffer.subarray(i*chunkSize,(i+1)*chunkSize);let binary='';for(let j=0;j<bytes.length;j+=8192)binary+=String.fromCharCode(...bytes.subarray(j,j+8192));
        batch.set(doc(firestore,'demoStates',owner.uid,'media',id,'chunks',String(i)),{ownerUid:owner.uid,mediaId:id,index:i,data:btoa(binary),createdAt:serverTimestamp()});
      }
      await batch.commit();
    }
    const result=await firebaseApi(path,'POST',{id,kind:data.kind,mime:data.mime,size:buffer.length,chunks,original_name:file.name.slice(0,200)});
    mediaUrls.set(id,URL.createObjectURL(data.blob));return result;
  }catch(error){const cleanup=writeBatch(firestore);for(let i=0;i<chunks;i++)cleanup.delete(doc(firestore,'demoStates',owner.uid,'media',id,'chunks',String(i)));cleanup.delete(doc(firestore,'demoStates',owner.uid,'media',id));await cleanup.commit().catch(()=>{});throw error;}
}
export function uploadedMediaUrl(id:string){return mediaUrls.get(id)||'';}
export function uploadedMediaType(id:string){return lastState?.media[id]?.mime||'';}
registerMediaResolver(uploadedMediaUrl,uploadedMediaType);
export async function firebaseDownload(path:string) {
  if(path.endsWith('/pdf')){const data=await firebaseApi(path.replace(/\/pdf$/,'/pdf-data'));const {createBrowserPlanPdf}=await import('./plan-pdf');return new Blob([await createBrowserPlanPdf(data)],{type:'application/pdf'});}
  if(path.endsWith('/export'))return new Blob([JSON.stringify(await firebaseApi(path),null,2)],{type:'application/json'});
  const id=/^\/media\/([^/]+)$/.exec(path)?.[1];if(id&&mediaUrls.has(id)){await requireDemoIdentity();return await fetch(mediaUrls.get(id)!).then(r=>r.blob());}
  throw new Error('Datei nicht gefunden.');
}
