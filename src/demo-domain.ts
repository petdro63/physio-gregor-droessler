import { z } from 'zod';
import { birthDate, exerciseSchema, planSchema, text } from './domain-validation.ts';
import catalogMedia from './catalog-media.json' with {type:'json'};
import retiredExerciseIds from './retired-exercise-ids.json' with {type:'json'};
import type { User } from './types.ts';
const retiredExercises = new Set<string>(retiredExerciseIds);

// This model intentionally represents one password-protected SYNTHETIC demo.
// Firebase owns the outer identity; selecting a demo role is a simulation.
export type DemoState = {
  schemaVersion:number; users:User[]; assignments:{therapist_id:string;patient_id:string}[];
  exercises:Record<string,any[]>; catalogIds:string[]; plans:Record<string,any[]>;
  history:any[]; audit:any[]; invitations:any[]; accounts:Record<string,any>;
  media:Record<string,any>; coverage:string[][]; practice:any;
};
export type DemoContext = {userId:string|null;origin:string;version:string;date:string;now?:Date};
export const demoToday = (now=new Date()) => now.toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'});
function fail(message:string):never { throw new Error(message); }
const id = () => crypto.randomUUID();
const last = (rows:any[]|undefined) => rows?.[rows.length-1];
const digest = async (value:string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
export const demoActive = (user:User|undefined,now=new Date()) => !!user && user.status==='active' && (!user.accessUntil || user.accessUntil>=demoToday(now));
export const demoCanPatient = (state:DemoState,user:User,patientId:string) => user.role==='admin' || (user.role==='patient' && user.id===patientId) ||
  (user.role==='therapist' && state.assignments.some(a=>a.therapist_id===user.id && a.patient_id===patientId));
export function demoExercise(state:DemoState,exerciseId:string,version?:number) {
  const rows=state.exercises[exerciseId];
  const current=last(rows);
  const e=version?rows?.find(e=>e.version===version):current;
  return e?{...e,status:current.status,mediaDetails:e.media.map((m:string)=>state.media[m]).filter(Boolean).map((m:any)=>({id:m.id,kind:m.kind}))}:null;
}
export const demoPlans = (state:DemoState,patientId:string) => Object.values(state.plans).map(last).filter(p=>p?.patientId===patientId);
export function demoCanExercise(state:DemoState,user:User,exerciseId:string,version?:number,now=new Date()) {
  if (retiredExercises.has(exerciseId)) return false;
  const e=demoExercise(state,exerciseId,version);
  if (!e) return false;
  if (user.role!=='patient') return true;
  if(e.status==='archived'||(e.licenseUntil&&e.licenseUntil<demoToday(now))) return false;
  return (state.practice.catalogEnabled && e.status==='published') || demoPlans(state,user.id).some(p=>p.status==='active'&&p.items.some((i:any)=>i.exerciseId===exerciseId&&(!version||i.exerciseVersion===version)));
}
export function demoHydratePlan(state:DemoState,plan:any,user:User,now=new Date()) {
  return {...plan,therapistName:state.users.find(u=>u.id===plan.therapistId)?.name||'Praxisteam',
    items:plan.items.filter((i:any)=>demoCanExercise(state,user,i.exerciseId,i.exerciseVersion,now)).map((i:any)=>({...i,exercise:demoExercise(state,i.exerciseId,i.exerciseVersion)}))};
}
const audit = (state:DemoState,user:User,action:string,target:string,now:Date) => {
  state.audit.unshift({id:id(),actor_id:user.id,actor:user.name,action,target_id:target,created_at:now.toISOString()});
  state.audit=state.audit.slice(0,100);
};
export async function demoPasswordHash(password:string,salt=id()) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:150000},key,256);
  return {salt,hash:Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')};
}
export function validateDemoPayload(state:DemoState) {
  if(state.schemaVersion!==1||!Array.isArray(state.users)||!state.exercises||!state.plans||!state.practice) fail('Demodaten sind nicht lesbar.');
  const payload=JSON.stringify(state);
  if(new TextEncoder().encode(payload).length>850000) fail('Der Speicher dieser Demo ist voll. Bitte einen neuen Demostand bereitstellen.');
  return payload;
}
export async function handleDemoRequest(state:DemoState,context:DemoContext,path:string,method='GET',body:any=undefined):Promise<{value:any;userId?:string|null}> {
  const now=context.now||new Date();
  const url=new URL(path,context.origin);
  const route=url.pathname;
  const actor=state.users.find(u=>u.id===context.userId);
  const user=demoActive(actor,now)?actor:undefined;
  const ok=(value:any={ok:true})=>({value});
  if(route==='/session') return ok({csrf:'firebase-token-authentication',user:user||null,demo:true,version:context.version,date:context.date,practice:state.practice});
  if(route==='/logout'&&method==='POST') return {value:{ok:true},userId:null};
  if(route==='/demo'&&method==='POST') {
    const role=z.enum(['patient','therapist','admin']).parse(body.role);
    return {value:{ok:true},userId:`demo-${role}`};
  }
  if(route==='/login'&&method==='POST') {
    const d=z.object({email:z.email(),password:z.string().max(128)}).parse(body);
    const candidate=state.users.find(u=>u.email.toLowerCase()===d.email.toLowerCase());
    const account=candidate&&state.accounts[candidate.id];
    if(!candidate||!account||!demoActive(candidate,now)||(await demoPasswordHash(d.password,account.salt)).hash!==account.hash) fail('Anmeldedaten stimmen nicht überein. Für die Beispielpersonen bitte die Demo-Rollenwahl verwenden.');
    return {value:{mfaRequired:false},userId:candidate.id};
  }
  if(route==='/invitation'||route==='/invitation/accept') {
    const token=method==='GET'?url.searchParams.get('token'):body?.token;
    const tokenHash=await digest(String(token||''));
    const invite=state.invitations.find(i=>i.token_hash===tokenHash&&!i.used_at&&i.expires_at>now.toISOString());
    if(!invite) fail('Einladung ist ungültig oder abgelaufen.');
    const invited=state.users.find(u=>u.id===invite.user_id)!;
    if(method==='GET') return ok({name:invited.name,email:invited.email,role:invited.role});
    const password=z.string().min(12).max(128).parse(body.password);
    state.accounts[invited.id]=await demoPasswordHash(password);
    invite.used_at=now.toISOString();
    // Matches the original invitation: patient activation is an admin action.
    return ok();
  }
  if(!user) fail('Bitte eine Demo-Rolle auswählen.');
  const staff=()=>{if(user.role==='patient') fail('Nur für das Praxisteam.');};
  const admin=()=>{if(user.role!=='admin') fail('Nur für die Praxisadministration.');};
  const patient=(patientId:string)=>{
    const p=state.users.find(u=>u.id===patientId&&u.role==='patient');
    if(!p||!demoCanPatient(state,user,patientId)) fail('Patient nicht gefunden.');
    return p!;
  };
  const invite=async(targetId:string)=>{
    const token=id()+id();
    state.invitations=state.invitations.filter(i=>i.user_id!==targetId||i.used_at);
    const expires=new Date(now.getTime()+48*3600000).toISOString();
    state.invitations.push({id:id(),user_id:targetId,token_hash:await digest(token),expires_at:expires,used_at:null,created_by:user.id});
    audit(state,user,'invitation_created',targetId,now);
    return {url:`${context.origin}/?einladung=${token}`,expires};
  };
  if(route==='/overview'&&method==='GET') {
    const patients=state.users.filter(u=>u.role==='patient'&&demoCanPatient(state,user,u.id));
    const selected=patients.find(p=>p.id===(user.role==='patient'?user.id:url.searchParams.get('patient')))||patients[0];
    const exercises=state.catalogIds.filter(e=>demoCanExercise(state,user,e,undefined,now)).map(e=>demoExercise(state,e));
    return ok({patients,selectedPatient:selected||null,plans:selected?demoPlans(state,selected.id).map(p=>demoHydratePlan(state,p,user,now)):[],exercises,
      history:selected?state.history.filter(h=>h.patient_id===selected.id).slice(0,300):[],practice:state.practice,
      coverage:state.coverage.map(([key,name])=>({key,name,count:exercises.filter(e=>e.region===key).length,published:exercises.filter(e=>e.region===key&&e.status==='published').length}))});
  }
  if(route==='/patients'&&method==='POST') {
    staff();
    const d=z.object({name:text.min(2).max(100),email:z.email().max(254),birthDate:birthDate.optional()}).parse(body);
    if(state.users.some(u=>u.email.toLowerCase()===d.email.toLowerCase())) fail('Diese E-Mail-Adresse ist schon vorhanden.');
    const uid=id();
    state.users.push({id:uid,...d,email:d.email.toLowerCase(),role:'patient',status:'invited',accessUntil:null,birthDate:d.birthDate||null,mfaEnabled:false});
    state.assignments.push({therapist_id:user.id,patient_id:uid});
    audit(state,user,'patient_created',uid,now);
    return ok({id:uid});
  }
  let match=route.match(/^\/patients\/([^/]+)(?:\/(profile|invite|plans|export))?$/);
  if(match) {
    const p=patient(match[1]);
    const action=match[2];
    if(action==='profile'&&method==='PATCH'){staff();p.birthDate=z.object({birthDate}).parse(body).birthDate||null;audit(state,user,'patient_profile_updated',p.id,now);return ok();}
    if(action==='invite'&&method==='POST'){staff();return ok(await invite(p.id));}
    if(!action&&method==='PATCH'){admin();const d=z.object({status:z.enum(['active','blocked','archived','invited']),accessUntil:z.union([z.iso.date(),z.literal('')])}).parse(body);Object.assign(p,d,{accessUntil:d.accessUntil||null});audit(state,user,'access_'+d.status,p.id,now);return ok();}
    if(action==='export'&&method==='GET') return ok({profile:p,plans:Object.values(state.plans).flat().filter(v=>v.patientId===p.id),training:state.history.filter(h=>h.patient_id===p.id)});
    if(action==='plans'&&method==='POST') {
      staff();const d=planSchema.parse(body);
      for(const item of d.items){const e=demoExercise(state,item.exerciseId,item.exerciseVersion);if(!e||e.version!==last(state.exercises[item.exerciseId]).version||!['published','demo'].includes(e.status))fail('Nur aktuelle, freigegebene Übungen können zugewiesen werden.');if(e.dosageMode==='hold'&&item.hold<1)fail('Für Halteübungen muss eine Haltedauer in Sekunden angegeben werden.');}
      const previous=demoPlans(state,p.id).find(v=>v.status==='active');const planId=previous?.id||id();const version=(previous?.version||0)+1;
      (state.plans[planId]||=[]).push({...d,id:planId,version,status:'active',patientId:p.id,therapistId:user.id});
      audit(state,user,'plan_saved',planId,now);return ok({id:planId,version});
    }
  }
  match=route.match(/^\/exercises(?:\/([^/]+))?(?:\/(status|media))?$/);
  if(match) {
    const exerciseId=match[1];const action=match[2];const version=url.searchParams.has('version')?Number(url.searchParams.get('version')):undefined;
    if(method==='GET'&&exerciseId&&!action){if(!demoCanExercise(state,user,exerciseId,version,now))fail('Übung nicht gefunden.');return ok(demoExercise(state,exerciseId,version));}
    staff();
    if(!exerciseId&&method==='POST') {const d=exerciseSchema.parse(body);if(d.media.length)fail('Neue Übung zunächst ohne Medien anlegen.');const uid=id();state.exercises[uid]=[{...d,id:uid,version:1,status:'draft',mediaDetails:[]}];state.catalogIds.push(uid);audit(state,user,'exercise_created',uid,now);return ok({id:uid});}
    const e=demoExercise(state,exerciseId);if(!e)fail('Übung nicht gefunden.');
    if(!action&&method==='PUT') {const d=exerciseSchema.parse(body);if(d.media.some(m=>state.media[m]?.exercise_id!==e.id))fail('Medium gehört nicht zu dieser Übung.');const version=e.version+1;state.exercises[e.id].push({...d,id:e.id,demo:false,version,status:'draft'});audit(state,user,'exercise_updated',e.id,now);return ok({version});}
    if(action==='status'&&method==='POST') {
      const status=z.enum(['draft','review','published','archived']).parse(body.status);
      if(status==='published') {
        admin();const media=e.media.map((m:string)=>state.media[m]).filter(Boolean);const assets=catalogMedia.filter(a=>e.catalogMedia.includes(a.id));
        const images=media.filter((m:any)=>m.kind==='image').length+assets.reduce((n,a)=>n+a.files.filter(f=>f.endsWith('.png')).length,0);
        if(e.demo||!e.reviewer||!e.reviewedAt||!e.license||!e.precautions||!e.transcript||images<2||(!media.some((m:any)=>m.kind==='video')&&!assets.some(a=>a.files.includes('video.mp4')))||(!media.some((m:any)=>m.kind==='captions')&&!assets.some(a=>a.files.includes('captions.vtt'))))fail('Für die Freigabe fehlen geprüfte Inhalte, mindestens zwei Bilder, Video, Untertitel, Transkript oder Rechteangaben.');
        if(e.licenseUntil&&e.licenseUntil<demoToday(now))fail('Medienlizenz abgelaufen.');
      }
      last(state.exercises[e.id]).status=status;audit(state,user,'exercise_'+status,e.id,now);return ok();
    }
    if(action==='media'&&method==='POST') {
      const d=z.object({id:z.string().uuid(),kind:z.enum(['image','video','captions']),mime:z.enum(['image/png','image/jpeg','image/webp','video/mp4','video/webm','text/vtt']),size:z.number().int().positive().max(50*1024*1024),chunks:z.number().int().positive().max(100),original_name:text.max(200)}).parse(body);
      if(state.media[d.id])fail('Diese Mediendatei existiert bereits.');state.media[d.id]={...d,exercise_id:e.id,created_at:now.toISOString()};audit(state,user,'media_uploaded',e.id,now);return ok({id:d.id,kind:d.kind});
    }
  }
  match=route.match(/^\/plans\/([^/]+)(?:\/(pdf-data))?$/);
  if(match){const p=last(state.plans[match[1]]);if(!p)fail('Plan nicht gefunden.');const owner=patient(p.patientId);
    if(match[2]&&method==='GET')return ok({plan:demoHydratePlan(state,p,user,now),patient:owner,practice:state.practice,version:context.version,date:context.date,demo:true});
    if(method==='PATCH'){staff();const status=z.enum(['active','paused','archived']).parse(body.status);for(const row of state.plans[p.id])row.status=status;audit(state,user,'plan_'+status,p.id,now);return ok();}}
  if(route==='/training'&&method==='POST'){
    if(user.role!=='patient')fail('Nur Patienten können ihr Training dokumentieren.');
    const d=z.object({planId:text,planVersion:z.number().int().positive(),exerciseId:text,outcome:z.enum(['done','skipped']),pain:z.number().int().min(0).max(10).nullable(),note:text.max(1000)}).parse(body);
    const p=demoPlans(state,user.id).find(p=>p.id===d.planId&&p.version===d.planVersion&&p.status==='active');const today=demoToday(now);
    if(!p||p.start>today||p.end<today||!p.days.includes(new Date(today+'T12:00:00').getDay()))fail('Dieser Plan ist nicht aktiv. Bitte neu laden.');
    const item=p.items.find((i:any)=>i.exerciseId===d.exerciseId);if(!item||!demoCanExercise(state,user,item.exerciseId,item.exerciseVersion,now))fail('Übung nicht im Trainingsplan oder nicht mehr verfügbar.');
    const uid=id();state.history.unshift({id:uid,patient_id:user.id,plan_id:p.id,plan_version:p.version,exercise_id:item.exerciseId,exercise_version:item.exerciseVersion,outcome:d.outcome,pain:d.pain,note:d.note,created_at:now.toISOString()});return ok({id:uid});
  }
  if(route==='/settings'&&method==='PUT'){admin();const d=z.object(Object.fromEntries(Object.keys(state.practice).map(k=>[k,k==='catalogEnabled'?z.boolean():text]))).parse(body);state.practice=d;audit(state,user,'settings_updated','practice',now);return ok();}
  if(route==='/audit'&&method==='GET'){admin();return ok(state.audit);}
  if(route==='/team') {
    admin();if(method==='GET')return ok(state.users.filter(u=>u.role!=='patient'));
    if(method==='POST'){const d=z.object({name:text.min(2).max(100),email:z.email().max(254),role:z.enum(['admin','therapist'])}).parse(body);if(state.users.some(u=>u.email.toLowerCase()===d.email.toLowerCase()))fail('Diese E-Mail-Adresse ist schon vorhanden.');const uid=id();state.users.push({id:uid,...d,status:'active',accessUntil:null,birthDate:null,mfaEnabled:false});audit(state,user,'team_created',uid,now);return ok({id:uid,...await invite(uid)});}
  }
  fail('Diese Funktion ist in der Firebase-Demo nicht verfügbar.');
  return ok();
}
