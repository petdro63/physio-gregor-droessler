import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { dosageLabel } from './dosage';
import { referencePose } from './ReferencePositions';
import { resourceUrl } from './resources';
export async function createBrowserPlanPdf(data:any) {
  const {plan,patient,practice,version,date}=data;
  const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  let page:any,y=0;
  const clean=(value:unknown)=>String(value||'').replace(/[^\x20-\x7e\xa0-\xff\u20ac]/g,'-');
  function add(){page=doc.addPage([595.28,841.89]);y=790;line(practice.name,17,true);line(`${patient.name} | ${plan.title}`,11);line(`Planversion ${plan.version} | ${plan.start} bis ${plan.end}`,9);line('DEMONSTRATION - nicht zur Behandlung freigegeben',10,true);y-=12;}
  function line(value:unknown,size=11,heavy=false){let row='';const f=heavy?bold:font;for(const word of clean(value).split(/\s+/)){if(f.widthOfTextAtSize(row+' '+word,size)>485&&row){draw(row,size,f);row=word;}else row+=(row?' ':'')+word;}if(row)draw(row,size,f);}
  function draw(value:string,size:number,f:any){if(y<65)add();page.drawText(value,{x:50,y,size,font:f,color:rgb(.1,.22,.19)});y-=size+7;}
  async function image(exercise:any) {
    const source=exercise.mediaDetails?.find((m:any)=>m.kind==='image');let src=source?resourceUrl('/api/media/'+source.id):'';
    const pose=referencePose(exercise);
    const frame=pose?(pose.fixedFrame??(pose.reverse?1:0)):0;
    if(!src&&pose)src=resourceUrl(`/api/reference-poses/${exercise.id}/${pose.atlas}${pose.atlas.startsWith('reference-shoulder-rotation-')?'?frame='+frame:''}`);
    if(!src)return;
    const blob=await fetch(src).then(r=>{if(!r.ok)throw new Error('Übungsbild konnte nicht geladen werden.');return r.blob();});
    const bitmap=new Image(),objectUrl=URL.createObjectURL(blob);
    try{await new Promise<void>((resolve,reject)=>{bitmap.onload=()=>resolve();bitmap.onerror=()=>reject(new Error('Übungsbild konnte nicht für das PDF gelesen werden.'));bitmap.src=objectUrl;});}finally{URL.revokeObjectURL(objectUrl);}
    let sx=0,sy=0,width=bitmap.naturalWidth,height=bitmap.naturalHeight;
    if(!source&&pose&&!pose.atlas.startsWith('reference-shoulder-rotation-')){width/=pose.frameColumns??4;height/=pose.frameRows??3;sx=(pose.column*2+frame)*width;sy=pose.row*height;}
    const canvas=document.createElement('canvas');const scale=Math.min(1,480/width,180/height);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);canvas.getContext('2d')!.drawImage(bitmap,sx,sy,width,height,0,0,canvas.width,canvas.height);
    const bytes=await (await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PDF-Bild konnte nicht erzeugt werden.')),'image/png'))).arrayBuffer();
    const png=await doc.embedPng(bytes),dims=png.scaleToFit(240,95);page.drawImage(png,{x:50,y:y-dims.height,width:dims.width,height:dims.height});y-=dims.height+12;
  }
  add();for(const [index,item] of plan.items.entries()){if(y<290)add();const e=item.exercise;line(`${index+1}. ${e.title}`,14,true);line(`${dosageLabel(item)} | Pause: ${item.pause}s`,10);await image(e);line(e.start,10);e.steps.forEach((s:string,i:number)=>line(`${i+1}) ${s}`,10));if(item.note)line(`Persönlicher Hinweis: ${item.note}`,10);line(e.precautions,9);y-=18;}
  for(const [i,p] of doc.getPages().entries())p.drawText(clean(`Physio Gregor Droessler | ${version} | ${date} | Seite ${i+1}`),{x:50,y:30,size:8,font});
  return new Uint8Array(await doc.save());
}
