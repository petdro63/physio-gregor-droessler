import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { openDatabase } from '../server/db.mjs';
import { seed } from '../server/seed.mjs';
import { seedResearchDrafts } from '../server/exercise-catalog.mjs';
import { createApp } from '../server/app.mjs';

async function admin(runtime) {
  const agent=request.agent(runtime.app);
  const session=(await agent.get('/api/session')).body;
  await agent.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  return {agent,csrf:(await agent.get('/api/session')).body.csrf};
}

test('exercise-list reset retains only the two recent deadlifts, preserves history, and survives restarts', async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-list-reset-'));
  let runtime=null;
  t.after(()=>{runtime?.close();fs.rmSync(dir,{recursive:true,force:true});});
  let db=openDatabase(dir);
  seed(db); seedResearchDrafts(db);
  db.prepare(`INSERT INTO training_sessions VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    'existing-history','demo-patient','demo-plan',1,'schulterkreisen',1,'done',0,'Saved before removal','2026-10-19T10:00:00.000Z');
  const before={
    exercises:db.prepare('SELECT COUNT(*) n FROM exercises').get().n,
    versions:db.prepare('SELECT COUNT(*) n FROM exercise_versions').get().n,
    plan:db.prepare('SELECT payload FROM plan_versions WHERE plan_id=? AND version=1').get('demo-plan').payload,
    history:db.prepare('SELECT * FROM training_sessions WHERE id=?').get('existing-history'),
  };
  db.close();
  runtime=createApp({demo:true,production:false,dataDir:dir});
  let staff=await admin(runtime);
  let list=(await staff.agent.get('/api/overview').expect(200)).body;
  assert.deepEqual(list.exercises.map(e=>e.id).sort(),['einbein-kreuzheben-kurzhanteln','einbein-kreuzheben-langhantel'].sort());
  assert.equal(runtime.db.prepare('SELECT COUNT(*) n FROM exercise_list_removals').get().n,before.exercises-2);
  assert.equal(runtime.db.prepare('SELECT COUNT(*) n FROM exercises').get().n,before.exercises);
  assert.equal(runtime.db.prepare('SELECT COUNT(*) n FROM exercise_versions').get().n,before.versions);
  assert.equal(runtime.db.prepare('SELECT payload FROM plan_versions WHERE plan_id=? AND version=1').get('demo-plan').payload,before.plan);
  assert.deepEqual(runtime.db.prepare('SELECT * FROM training_sessions WHERE id=?').get('existing-history'),before.history);
  const created=(await staff.agent.post('/api/exercises').set('X-CSRF-Token',staff.csrf).send({...list.exercises[0],title:'Später neu angelegte Übung',familyId:'',familyTitle:'',variantLabel:''}).expect(201)).body;
  runtime.close(); runtime=null;
  runtime=createApp({demo:true,production:false,dataDir:dir});
  staff=await admin(runtime);
  list=(await staff.agent.get('/api/overview').expect(200)).body;
  assert.equal(list.exercises.length,3);
  assert(list.exercises.some(e=>e.id===created.id),'Later user-created exercises stay in the list');
  assert(!list.exercises.some(e=>e.id==='schulterkreisen'),'Seeding never restores removed list entries');
  assert.equal(list.history.length,1);
});
