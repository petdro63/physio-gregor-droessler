import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import sharp from 'sharp';
import { shoulderRotationExercises, collectionExerciseIds } from '../server/exercise-catalog.mjs';
import { createApp } from '../server/app.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
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
    const pose=resolveReferencePose(exercise);
    assert(pose && pose.atlas.startsWith('reference-shoulder-rotation-'));
    assert.equal(pose.frameColumns,2);
    assert.equal(pose.frameRows,1);
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
    const pose=resolveReferencePose(entry);
    const res=await staff.get(`/api/reference-poses/${id}/${pose.atlas}?version=${entry.version}`).expect(200).expect('Content-Type',/image\/webp/);
    assert.equal(res.body.subarray(0,4).toString(),'RIFF');
    assert.equal(res.body.subarray(8,12).toString(),'WEBP');
    const enhanced = [];
    for (const frame of [0, 1]) {
      const preview = await staff.get(`/api/reference-poses/${id}/${pose.atlas}?version=${entry.version}&frame=${frame}`)
        .expect(200).expect('Content-Type',/image\/webp/);
      // Preserve original image pixels and dimensions, instead of claiming
      // artificially interpolated pixels are new high-resolution details.
      const sourceFile = path.resolve('server/assets/reference', `${pose.atlas}.webp`);
      const sourceInfo = await sharp(sourceFile).metadata();
      const width = sourceInfo.width / 2;
      const height = sourceInfo.height;
      const metadata = await sharp(preview.body).metadata();
      assert.equal(metadata.width, width);
      assert.equal(metadata.height, height);
      const sourcePixels = await sharp(sourceFile)
        .extract({ left: frame * width, top: 0, width, height })
        .removeAlpha().raw().toBuffer();
      const servedPixels = await sharp(preview.body)
        .removeAlpha().raw().toBuffer();
      assert.equal(servedPixels.length, sourcePixels.length);
      let difference = 0;
      for (let index = 0; index < sourcePixels.length; index++) {
        difference += Math.abs(sourcePixels[index] - servedPixels[index]);
      }
      assert(difference / sourcePixels.length < 1,
        `served image must match original pixels for ${id}, frame ${frame}`);
      enhanced.push(preview.body);
    }
    assert.notDeepEqual(enhanced[0],enhanced[1], 'start and end must be distinct');
  }
  const patient=request.agent(runtime.app);
  const session2=(await patient.get('/api/session')).body;
  await patient.post('/api/demo').set('X-CSRF-Token',session2.csrf).send({role:'patient'}).expect(200);
  const patientList=(await patient.get('/api/overview').expect(200)).body;
  assert(ids.every(id=>!patientList.exercises.some(e=>e.id===id)));
  await patient.get('/api/reference-poses/schulter-aussenrotation-u-halte-sitz/reference-shoulder-rotation-u-hold?version=1').expect(404);
  await patient.get('/api/reference-poses/schulter-aussenrotation-u-halte-sitz/reference-shoulder-rotation-u-hold?version=1&frame=0').expect(404);
  await staff.get('/api/reference-poses/schulter-aussenrotation-u-halte-sitz/reference-shoulder-rotation-u-hold?version=1&frame=2').expect(404);
});
