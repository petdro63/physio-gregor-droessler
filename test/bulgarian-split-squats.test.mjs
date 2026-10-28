import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { bulgarianSplitSquats, collectionExerciseIds } from '../server/exercise-catalog.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
import { createApp } from '../server/app.mjs';

const ids=['bulgarian-split-squat-ohne-gewicht','bulgarian-split-squat-kurzhanteln'];

test('Bulgarian split squats have proper equipment, bench, anatomical phases and distinct raster artwork',()=>{
  assert.deepEqual(bulgarianSplitSquats.map(e=>e.id),ids);
  for (const [i,e] of bulgarianSplitSquats.entries()) {
    assert(collectionExerciseIds.includes(e.id));
    assert.deepEqual(e.joints,['Kniegelenk','Hüftgelenk']);
    assert(e.trainingTypes.includes('Kraft'));
    assert(e.requiresSupervision);
    assert(e.start.includes('Bank') && e.end.includes('hintere'));
    assert(e.steps.length>=4 && e.precautions && e.mistakes);
    const pose=resolveReferencePose(e);
    assert.equal(pose.atlas,i?'reference-bulgarian-kurzhanteln':'reference-bulgarian-ohne-gewicht');
    assert.equal(pose.frameColumns,2);
    assert.equal(pose.frameRows,1);
    const image=fs.readFileSync(new URL('../server/assets/reference/'+pose.atlas+'.webp',import.meta.url));
    assert(image.length>10000);
    assert.equal(image.subarray(0,4).toString(),'RIFF');
    assert.equal(image.subarray(8,12).toString(),'WEBP');
  }
  assert.equal(bulgarianSplitSquats[0].equipment,'Ohne Zusatzgerät');
  assert.equal(bulgarianSplitSquats[1].equipment,'Hanteln');
});

test('new split squats are available only as staff drafts and media remain exercise-specific',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bss-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  const a=request.agent(runtime.app);
  const session=(await a.get('/api/session')).body;
  await a.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  const entries=(await a.get('/api/overview').expect(200)).body.exercises;
  for(const id of ids) {
    const e=entries.find(x=>x.id===id);
    assert(e,id);
    assert.equal(e.status,'draft');
    assert.equal(e.reviewer,'');
    const pose=resolveReferencePose(e);
    const url='/api/reference-poses/'+id+'/'+pose.atlas+'?version=1';
    const res=await a.get(url).expect(200).expect('Content-Type',/image\/webp/);
    assert.equal(res.body.subarray(0,4).toString(),'RIFF');
    await a.get(url.replace(pose.atlas,id===ids[0]?'reference-bulgarian-kurzhanteln':'reference-bulgarian-ohne-gewicht')).expect(404);
  }
  const p=request.agent(runtime.app);
  const ps=(await p.get('/api/session')).body;
  await p.post('/api/demo').set('X-CSRF-Token',ps.csrf).send({role:'patient'}).expect(200);
  const patientExercises=(await p.get('/api/overview').expect(200)).body.exercises;
  assert(ids.every(id=>!patientExercises.some(e=>e.id===id)));
  await p.get('/api/reference-poses/'+ids[0]+'/reference-bulgarian-ohne-gewicht?version=1').expect(404);
});
