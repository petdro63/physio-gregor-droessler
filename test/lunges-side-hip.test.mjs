import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../server/app.mjs';
import { illustratedExercises, correctSingleLegBridgeSide, taxonomy } from '../server/exercise-catalog.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
import { findExercises } from '../src/exercise-search.ts';

test('three lunge variants have equipment-specific rows and the side hip lift has its own movement pair',()=>{
  const lunges=illustratedExercises.filter(e=>e.familyId==='ausfallschritte');
  assert.equal(lunges.length,3);
  for(const [equipment,row] of [['Ohne Zusatzgerät',0],['Hanteln',1],['Langhantel',2]]) {
    const e=lunges.find(e=>e.equipment===equipment),pose=resolveReferencePose(e);
    assert.equal(pose.row,row); assert.equal(pose.frameColumns,2); assert.equal(pose.frameRows,3);
    assert.equal(pose.atlas,'reference-lunges');
    assert.equal(resolveReferencePose({...e,equipment:'Theraband'}),undefined);
    assert.equal(findExercises(lunges.map(e=>({...e,tags:[]})),{equipment,joint:'Kniegelenk',trainingType:'Kraft'}).length,1);
  }
  const side=illustratedExercises.find(e=>e.id==='seitliches-hueftheben');
  assert.equal(side.position,'In Seitlage');
  assert.equal(side.dosageMode,'repetitions');
  assert(side.start.includes('Unterarm') && side.end.includes('Becken ist von der Matte abgehoben'));
  assert.equal(resolveReferencePose(side).atlas,'reference-side-hip-lift');
  for(const e of [...lunges,side]) {
    assert(e.start && e.end && e.steps.length>=4 && e.requiresSupervision);
    assert(e.joints.every(j=>taxonomy.joints.includes(j)));
    assert(e.strengthMuscles.every(m=>taxonomy.muscles.includes(m)));
    assert.equal(e.conditionUses.length,0);
    assert(!JSON.stringify(e).includes('codex-clipboard'));
  }
});

test('right-leg bridge correction is versioned once, preserves previous content and serves the corrected image only for that exercise',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-right-bridge-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  const id='bruecke-einbeinig';
  const original=JSON.parse(runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=1').get(id).payload);
  original.start=original.start.replace('Das linke Bein bleibt angewinkelt','Ein Bein bleibt angewinkelt').replace('Das rechte Bein vom Boden lösen','Das andere Bein vom Boden lösen');
  original.end=original.end.replace('über den linken aufgestellten Fuß','über den einen aufgestellten Fuß').replace('Das rechte Bein bleibt nach oben gestreckt','Das freie Bein bleibt nach oben gestreckt');
  original.precautions='Persönlich ergänzter Hinweis bleibt erhalten';
  runtime.db.prepare('UPDATE exercise_versions SET payload=? WHERE exercise_id=? AND version=1').run(JSON.stringify(original),id);
  correctSingleLegBridgeSide(runtime.db);
  correctSingleLegBridgeSide(runtime.db);
  assert.equal(runtime.db.prepare('SELECT current_version FROM exercises WHERE id=?').get(id).current_version,2);
  assert.deepEqual(JSON.parse(runtime.db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=1').get(id).payload),original);
  const a=request.agent(runtime.app),session=(await a.get('/api/session')).body;
  await a.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  const current=(await a.get('/api/exercises/'+id).expect(200)).body;
  assert(current.start.includes('Das rechte Bein vom Boden lösen'));
  assert(current.end.includes('Das rechte Bein bleibt nach oben gestreckt'));
  assert(current.end.includes('linken aufgestellten Fuß'));
  assert.equal(current.precautions,original.precautions);
  assert.equal(resolveReferencePose(current).atlas,'reference-single-leg-bridge-right');
  await a.get(`/api/reference-poses/${id}/reference-single-leg-bridge-right?version=2`).expect(200).expect('Content-Type',/image\/png/);
  await a.get('/api/reference-poses/bruecke-rueckenlage/reference-single-leg-bridge-right?version=1').expect(404);
  await a.get('/api/reference-poses/ausfallschritt-kurzhanteln/reference-side-hip-lift?version=1').expect(404);
  const patient=request.agent(runtime.app),ps=(await patient.get('/api/session')).body;
  await patient.post('/api/demo').set('X-CSRF-Token',ps.csrf).send({role:'patient'}).expect(200);
  await patient.get('/api/reference-poses/ausfallschritt-kurzhanteln/reference-lunges?version=1').expect(404);
  await patient.get('/api/reference-poses/seitliches-hueftheben/reference-side-hip-lift?version=1').expect(404);
});
