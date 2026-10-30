import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { handleDemoRequest, demoPasswordHash, validateDemoPayload } from '../src/demo-domain.ts';
const seed=()=>JSON.parse(fs.readFileSync(new URL('../output/firebase-demo-seed.json',import.meta.url),'utf8'));
const context=(userId='demo-admin')=>({userId,origin:'https://training.example.invalid',version:'test-version',date:'2026-10-30',now:new Date('2026-10-30T12:00:00Z')});
const call=async(state,path,method='GET',body=undefined,userId='demo-admin')=>(await handleDemoRequest(state,context(userId),path,method,body)).value;

test('Firebase demo seed has no passwords, session secrets or copied database rows',()=>{
  const state=seed();assert.equal(state.catalogIds.length,48);assert.equal(state.users.length,4);assert.deepEqual(state.accounts,{});
  assert(!JSON.stringify(state).includes('password_hash'));assert(!JSON.stringify(state).includes('session-secret'));assert(validateDemoPayload(state).length<700000);
});
test('Firebase demo role selection, patient isolation, blocking and exercise permissions match the demo',async()=>{
  const s=seed();const session=await call(s,'/session','GET',undefined,null);assert.equal(session.user,null);assert.equal(session.version,'test-version');
  assert.equal((await handleDemoRequest(s,context(null),'/demo','POST',{role:'admin'})).userId,'demo-admin');
  await assert.rejects(()=>call(s,'/overview','GET',undefined,null),/Demo-Rolle/);
  const overview=await call(s,'/overview?patient=demo-patient-b','GET',undefined,'demo-patient');assert.equal(overview.selectedPatient.id,'demo-patient');assert.equal(overview.patients.length,1);assert.equal(overview.exercises.length,0);
  await assert.rejects(()=>call(s,'/team','GET',undefined,'demo-patient'),/Praxisadministration/);
  await assert.rejects(()=>call(s,'/patients/demo-patient-b/export','GET',undefined,'demo-patient'),/nicht gefunden/);
  await call(s,'/patients/demo-patient','PATCH',{status:'blocked',accessUntil:''});assert.equal((await call(s,'/session','GET',undefined,'demo-patient')).user,null);
});
test('Firebase exercise validation, publication checks, immutable versions and access expiry remain enforced in the demo',async()=>{
  const s=seed();const first=s.exercises[s.catalogIds[0]].at(-1);const original=structuredClone(first);
  await assert.rejects(()=>call(s,`/exercises/${first.id}/status`,'POST',{status:'published'}),/Freigabe fehlen/);
  await assert.rejects(()=>call(s,`/exercises/${first.id}`,'PUT',{...first,title:''}),/./);
  const result=await call(s,`/exercises/${first.id}`,'PUT',{...first,title:'Geänderter Demoentwurf'});assert.equal(result.version,first.version+1);assert.equal(s.exercises[first.id][0].title,original.title);
  const historyPlan=s.plans['demo-plan'][0];const oldItems=structuredClone(historyPlan.items);assert.deepEqual(s.plans['demo-plan'][0].items,oldItems);
  await call(s,'/patients/demo-patient','PATCH',{status:'active',accessUntil:'2000-01-01'});assert.equal((await call(s,'/session','GET',undefined,'demo-patient')).user,null);
});
test('Firebase demo patient creation, invitations, acceptance and explicit activation work without public registration',async()=>{
  const s=seed();const patient=await call(s,'/patients','POST',{name:'Erfundene Person',email:'synthetic@example.invalid',birthDate:'1990-01-01'});
  const invitation=await call(s,`/patients/${patient.id}/invite`,'POST');const token=new URL(invitation.url).searchParams.get('einladung');assert(!JSON.stringify(s.invitations).includes(token));
  assert.equal((await call(s,'/invitation?token='+token,'GET',undefined,null)).name,'Erfundene Person');
  await call(s,'/invitation/accept','POST',{token,password:'Synthetic-test-password-2026'},null);
  await assert.rejects(()=>call(s,'/invitation?token='+token,'GET',undefined,null),/ungültig/);
  await assert.rejects(()=>call(s,'/login','POST',{email:'synthetic@example.invalid',password:'Synthetic-test-password-2026'},null),/Anmeldedaten/);
  await call(s,`/patients/${patient.id}`,'PATCH',{status:'active',accessUntil:''});
  const login=await handleDemoRequest(s,context(null),'/login','POST',{email:'synthetic@example.invalid',password:'Synthetic-test-password-2026'});assert.equal(login.userId,patient.id);
  assert(s.audit.length>=3);
});
test('Firebase demo plans preserve previous versions and training only follows an active assigned plan',async()=>{
  const s=seed();for(const rows of Object.values(s.plans))for(const p of rows){p.start='2026-01-01';p.end='2026-12-31';p.days=[0,1,2,3,4,5,6];}
  const original=structuredClone(s.plans['demo-plan'][0]);const p=original;
  const saved=await call(s,'/patients/demo-patient/plans','POST',{...p,title:'Neue Planversion'});assert.equal(saved.version,2);assert.deepEqual(s.plans['demo-plan'][0],original);
  await assert.rejects(()=>call(s,'/training','POST',{planId:p.id,planVersion:1,exerciseId:p.items[0].exerciseId,outcome:'done',pain:null,note:''},'demo-patient'),/nicht aktiv/);
  const entry=await call(s,'/training','POST',{planId:p.id,planVersion:2,exerciseId:p.items[0].exerciseId,outcome:'done',pain:0,note:'Demonstration'},'demo-patient');assert.equal(s.history[0].id,entry.id);assert.equal(s.history[0].plan_version,2);
  await call(s,`/plans/${p.id}`,'PATCH',{status:'paused'});
  await assert.rejects(()=>call(s,'/training','POST',{planId:p.id,planVersion:2,exerciseId:p.items[0].exerciseId,outcome:'done',pain:null,note:''},'demo-patient'),/nicht aktiv/);
});
test('Firebase demo storage and settings reject invalid input; media stay exercise-bound',async()=>{
  const s=seed();const e=s.exercises[s.catalogIds[0]].at(-1);
  await assert.rejects(()=>call(s,`/exercises/${e.id}`,'PUT',{...e,media:['ce8b3e39-4ba6-43e7-aa62-a548af004dfd']}),/gehört nicht/);
  await assert.rejects(()=>call(s,'/settings','PUT',{...s.practice,catalogEnabled:'yes'}),/./);
  s.practice.message='x'.repeat(900000);assert.throws(()=>validateDemoPayload(s),/Speicher/);
});
