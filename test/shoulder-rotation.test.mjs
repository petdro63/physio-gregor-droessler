import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { shoulderRotationExercises, collectionExerciseIds } from '../server/exercise-catalog.mjs';
import { createApp } from '../server/app.mjs';
const ids = ['schulter-aussenrotation-stand','schulter-aussenrotation-sitz','schulter-aussenrotation-u-halte-sitz'];
test('three distinct shoulder rotations preserve flexed elbows and raised U-hold geometry', () => {
  assert.deepEqual(shoulderRotationExercises.map(e=>e.id),ids);
  for(const exercise of shoulderRotationExercises) {
    assert(collectionExerciseIds.includes(exercise.id));
    assert.equal(exercise.region,'Schulter');
    assert.equal(exercise.goal,'Mobilisation');
    assert(exercise.requiresSupervision);
    assert(exercise.start.includes('90°'));
    assert(exercise.steps.length>=3);
    assert(exercise.precautions && exercise.mistakes);
  }
  const raised=shoulderRotationExercises[2];
  assert(raised.start.includes('bereits in der Ausgangsstellung'));
  assert(raised.start.includes('nach vorn'));
  assert(raised.end.includes('90° gebeugt'));
  assert(raised.end.includes('U-Halte'));
  assert(raised.steps[0].includes('90° beugen'));
});
test('shoulder rotation drafts appear in existing demo collection without publishing them', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-shoulder-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  const staff=request.agent(runtime.app);
  const session=(await staff.get('/api/session')).body;
  await staff.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  const overview=(await staff.get('/api/overview').expect(200)).body;
  for(const id of ids) {
    const entry=overview.exercises.find(e=>e.id===id);
    assert(entry,id);
    assert.equal(entry.status,'draft');
    assert.equal(entry.reviewer,'');
  }
  const patient=request.agent(runtime.app);
  const session2=(await patient.get('/api/session')).body;
  await patient.post('/api/demo').set('X-CSRF-Token',session2.csrf).send({role:'patient'}).expect(200);
  const patientList=(await patient.get('/api/overview').expect(200)).body;
  assert(ids.every(id=>!patientList.exercises.some(e=>e.id===id)));
});
