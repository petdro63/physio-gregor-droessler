import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { openDatabase, iso } from '../server/db.mjs';
import { seed } from '../server/seed.mjs';
import { retiredExerciseIds, collectionExerciseIds } from '../server/exercise-catalog.mjs';
import { createApp } from '../server/app.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';

test('eleven requested HWS and shoulder-rotation exercises are absent from fresh installation and seed', async t => {
  assert.equal(retiredExerciseIds.length,11);
  assert.equal(new Set(retiredExerciseIds).size,11);
  assert(retiredExerciseIds.every(id=>!collectionExerciseIds.includes(id)));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-retired-fresh-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  const staff=request.agent(runtime.app);
  const session=(await staff.get('/api/session')).body;
  await staff.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  const overview=(await staff.get('/api/overview')).body;
  assert(retiredExerciseIds.every(id=>!overview.exercises.some(e=>e.id===id)));
  assert(retiredExerciseIds.every(id=>!runtime.db.prepare('SELECT 1 FROM exercises WHERE id=?').get(id)));
  for(const id of retiredExerciseIds) assert.equal(resolveReferencePose({id,equipment:'Stuhl'}),undefined);
  assert(overview.exercises.some(e=>e.id==='hueftbeuger-dehnung-kniestand'));
});

test('old installation archives targeted entries without deleting historical versions',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-retired-existing-'));
  let runtime;
  t.after(()=>{runtime?.close();fs.rmSync(dir,{recursive:true,force:true});});
  const db=openDatabase(dir);
  seed(db);
  for(const id of retiredExerciseIds){
    db.prepare('INSERT INTO exercises VALUES (?,?,?,?)').run(id,1,'draft','demo-admin');
    db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(id,1,JSON.stringify({
      id,title:'Historische Übung',equipment:'Stuhl',position:'Im Sitzen',region:'Nacken',
      trainingTypes:['Mobilisation'],strengthMuscles:[],joints:['Halswirbelsäule'],
      steps:['Alt'],sources:[],media:[],conditionUses:[],status:'draft'
    }),iso());
  }
  db.close();
  runtime=createApp({demo:true,production:false,dataDir:dir});
  const staff=request.agent(runtime.app);
  const session=(await staff.get('/api/session')).body;
  await staff.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  const overview=(await staff.get('/api/overview')).body;
  for(const id of retiredExerciseIds){
    assert(!overview.exercises.some(e=>e.id===id),id);
    assert.equal(runtime.db.prepare('SELECT status FROM exercises WHERE id=?').get(id).status,'archived');
    assert.equal(runtime.db.prepare('SELECT COUNT(*) AS n FROM exercise_versions WHERE exercise_id=?').get(id).n,1);
    assert(runtime.db.prepare('SELECT 1 FROM exercise_list_removals WHERE exercise_id=?').get(id));
  }
});
