import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { PDFDocument, decodePDFRawStream } from 'pdf-lib';
import { createApp } from '../server/app.mjs';
import { illustratedExercises, renameWideSquats } from '../server/exercise-catalog.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
import { defaultPlanDosage, dosageLabel } from '../src/dosage.ts';

function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-wall-bridge-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  return runtime;
}
async function staff(runtime) {
  const a=request.agent(runtime.app),session=(await a.get('/api/session')).body;
  await a.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  return {a,csrf:(await a.get('/api/session')).body.csrf};
}

test('wall sit uses a hold dose and the two bridge illustrations have distinct support legs',()=>{
  const wall=illustratedExercises.find(e=>e.id==='wandsitz');
  assert.equal(wall.dosageMode,'hold');
  assert.equal(defaultPlanDosage(wall).hold,20);
  const dose={...defaultPlanDosage(wall),hold:35,exercise:wall};
  assert.equal(dosageLabel(dose),'2 Sätze × 35 Sekunden halten');
  assert(!dosageLabel(dose,true).includes('Wdh'));
  assert.equal(resolveReferencePose(wall).frameRows,1);
  const bridge=illustratedExercises.find(e=>e.id==='bruecke-rueckenlage');
  const single=illustratedExercises.find(e=>e.id==='bruecke-einbeinig');
  assert.equal(resolveReferencePose(bridge).row,0);
  assert.equal(resolveReferencePose(single).row,0);
  assert.equal(resolveReferencePose(single).atlas,'reference-single-leg-bridge-right');
  assert.equal(bridge.position,'In Rückenlage');
  assert(single.start.includes('nach oben strecken'));
  assert(single.end.includes('keinen Bodenkontakt'));
  assert.equal(dosageLabel({...defaultPlanDosage(bridge),exercise:bridge}),'2 Sätze × 10 Wiederholungen');
});

test('wide squat title correction versions existing entries once and preserves previous and individually edited content', t=>{
  const runtime=fixture(t),id='sumo-kreuzheben-ohne-gewicht';
  const row=runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=1').get(id);
  const original={...JSON.parse(row.payload),title:'Breitbeiniges Kreuzheben ohne Gewicht',familyTitle:'Breitbeiniges Kreuzheben',precautions:'Individuell geprüft und ergänzt'};
  runtime.db.prepare('UPDATE exercise_versions SET payload=? WHERE exercise_id=? AND version=1').run(JSON.stringify(original),id);
  renameWideSquats(runtime.db);
  const updated=JSON.parse(runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=2').get(id).payload);
  assert.equal(updated.title,'Breitbeinige Kniebeugen ohne Gewicht');
  assert.equal(updated.familyTitle,'Breitbeinige Kniebeugen');
  assert.equal(updated.precautions,original.precautions);
  assert.deepEqual(JSON.parse(runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=1').get(id).payload),original);
  renameWideSquats(runtime.db);
  assert.equal(runtime.db.prepare('SELECT current_version FROM exercises WHERE id=?').get(id).current_version,2);
  const other='sumo-kreuzheben-zusatzgewicht';
  const custom={...JSON.parse(runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=1').get(other).payload),title:'Meine individuell benannte Variante'};
  runtime.db.prepare('UPDATE exercise_versions SET payload=? WHERE exercise_id=? AND version=1').run(JSON.stringify(custom),other);
  renameWideSquats(runtime.db);
  assert.equal(runtime.db.prepare('SELECT current_version FROM exercises WHERE id=?').get(other).current_version,1);
});

test('wall sit holds validate, persist through exercise editing and plan assignment, and appear as seconds in the PDF',async t=>{
  const runtime=fixture(t),admin=await staff(runtime);
  let wall=(await admin.a.get('/api/exercises/wandsitz').expect(200)).body;
  const saved=(await admin.a.put('/api/exercises/wandsitz').set('X-CSRF-Token',admin.csrf).send({...wall,defaultHoldSeconds:35}).expect(200)).body;
  wall=(await admin.a.get('/api/exercises/wandsitz').expect(200)).body;
  assert.equal(wall.defaultHoldSeconds,35);
  assert.equal(wall.dosageMode,'hold');
  assert.equal(wall.version,saved.version);
  await admin.a.put('/api/exercises/wandsitz').set('X-CSRF-Token',admin.csrf).send({...wall,defaultHoldSeconds:601}).expect(400);
  // Test-only clinical approval in this isolated database; production gates stay intact.
  runtime.db.prepare("UPDATE exercises SET status='published' WHERE id='wandsitz'").run();
  const plan={title:'Haltedauer-Testplan',focus:'Kraft',note:'',start:'2026-10-20',end:'2026-11-20',days:[0,1,2,3,4,5,6],items:[{exerciseId:wall.id,exerciseVersion:wall.version,sets:3,reps:1,hold:35,pause:30,side:'Beidseits',resistance:'Ohne Zusatzgewicht',note:''}]};
  await admin.a.post('/api/patients/demo-patient/plans').set('X-CSRF-Token',admin.csrf).send({...plan,items:[{...plan.items[0],hold:0}]}).expect(400);
  await admin.a.post('/api/patients/demo-patient/plans').set('X-CSRF-Token',admin.csrf).send({...plan,items:[{...plan.items[0],hold:601}]}).expect(400);
  const assigned=(await admin.a.post('/api/patients/demo-patient/plans').set('X-CSRF-Token',admin.csrf).send(plan).expect(200)).body;
  const overview=(await admin.a.get('/api/overview?patient=demo-patient')).body;
  const item=overview.plans.find(p=>p.id===assigned.id).items[0];
  assert.equal(item.hold,35);
  assert.equal(dosageLabel(item),'3 Sätze × 35 Sekunden halten');
  const response=await admin.a.get(`/api/plans/${assigned.id}/pdf`).expect(200);
  const pdf=await PDFDocument.load(response.body);
  const content=pdf.getPages().map(page=>{
    const streams=page.node.Contents();
    return Array.from({length:streams.size()},(_,i)=>Buffer.from(decodePDFRawStream(pdf.context.lookup(streams.get(i))).decode()).toString('latin1')).join('\n');
  }).join('\n');
  assert(content.includes(Buffer.from('Sekunden halten','latin1').toString('hex').toUpperCase()));
  assert(!content.includes(Buffer.from('Wiederholungen','latin1').toString('hex').toUpperCase()));
});
