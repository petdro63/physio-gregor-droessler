import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../server/app.mjs';
import { expandedExercises, additionalExercises, illustratedExercises, taxonomy } from '../server/exercise-catalog.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
import { findExercises } from '../src/exercise-search.ts';
import { suggestExercises } from '../src/condition-search.ts';
const poses = JSON.parse(fs.readFileSync(new URL('../src/reference-poses.json',import.meta.url),'utf8'));

test('expanded library provides 200 distinct authored variants and 25 families for each of six joints', () => {
  assert.equal(expandedExercises.length,1200);
  assert.equal(new Set(expandedExercises.map(e=>e.id)).size,1200);
  assert.equal(new Set(expandedExercises.map(e=>e.title)).size,1200);
  const grouped = Map.groupBy(expandedExercises,e=>e.joints[0]);
  assert.equal(grouped.size,6);
  for (const [joint, entries] of grouped) {
    assert.equal(entries.length,200,joint);
    assert.equal(new Set(entries.map(e=>e.familyId)).size,25);
    assert.equal(findExercises(entries.map(e=>({...e,tags:[]})),{joint}).length,200);
    for (const family of Map.groupBy(entries,e=>e.familyId).values()) {
      assert.equal(family.length,8);
      assert.equal(new Set(family.map(e=>e.steps[1])).size,8);
    }
  }
});

test('every variant has usable end instructions, valid classification and no fabricated clinical indications', () => {
  for (const e of expandedExercises) {
    assert(e.start && e.end && e.steps.length>=3 && e.mistakes && e.precautions && e.sourceNote,e.id);
    assert(e.trainingTypes.every(t=>taxonomy.trainingTypes.includes(t)),e.id);
    assert(e.joints.every(j=>taxonomy.joints.includes(j)),e.id);
    assert(e.strengthMuscles.every(m=>taxonomy.muscles.includes(m)),e.id);
    assert.equal(e.strengthMuscles.length>0,e.trainingTypes.includes('Kraft'),e.id);
    assert.equal(e.conditionUses.length,0,e.id);
    assert(e.requiresSupervision);
    assert(e.sources.every(s=>s.url.startsWith('https://')));
    if(e.variantLabel.startsWith('Isometrisch')) assert(e.end.includes('unverändert'),e.id);
  }
  assert.equal(suggestExercises(expandedExercises,'kreuzband','frueh','rekonstruktion').length,0);
});

test('reference art is explicitly mapped to real families and protected from patients and path injection', async t => {
  for (const pose of poses) {
    if (pose.familyId) assert(expandedExercises.some(e=>e.familyId===pose.familyId));
    if (pose.exerciseIds) assert(pose.exerciseIds.every(id=>[...additionalExercises,...illustratedExercises].some(e=>e.id===id)));
    assert(pose.column>=0 && pose.column<=1 && pose.row>=0 && pose.row<=2);
    assert(['reference-joints','reference-ball','reference-equipment','reference-lower-equipment','reference-single-leg-rdl'].includes(pose.atlas));
    assert(pose.column * 2 + 1 < (pose.frameColumns ?? 4));
    assert(pose.row < (pose.frameRows ?? 3));
    const image = fs.readFileSync(new URL(`../server/assets/reference/${pose.atlas}.png`,import.meta.url));
    assert.equal(image.subarray(1,4).toString(),'PNG');
  }
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'physio-expanded-'));
  const runtime=createApp({demo:true,production:false,dataDir:dir});
  t.after(()=>{runtime.close();fs.rmSync(dir,{recursive:true,force:true});});
  const route='/api/reference-poses/katalog-shoulder-flex-stand-aktiv/reference-joints?version=1';
  await request(runtime.app).get(route).expect(401);
  const staff=request.agent(runtime.app);
  const session=(await staff.get('/api/session')).body;
  await staff.post('/api/demo').set('X-CSRF-Token',session.csrf).send({role:'admin'}).expect(200);
  await staff.get(route).expect(200).expect('Content-Type',/image\/png/);
  const rdlRoute='/api/reference-poses/einbein-kreuzheben-kurzhanteln/reference-single-leg-rdl?version=1';
  await staff.get(rdlRoute).expect(200).expect('Content-Type',/image\/png/);
  await staff.get(rdlRoute.replace('reference-single-leg-rdl','codex-clipboard-b0213c39-af52-47d1-bc59-4bba02848577')).expect(404);
  await staff.get(route.replace('reference-joints','reference-ball')).expect(404);
  await staff.get(route.replace('version=1','version=2')).expect(404);
  await staff.get(route.replace('reference-joints','..%2f..%2f.env')).expect(404);
  const overview=(await staff.get('/api/overview')).body;
  const added=overview.exercises.filter(e=>e.id.startsWith('katalog-'));
  assert.equal(added.length,1200);
  assert(added.every(e=>e.status==='draft' && e.reviewer===''));
  const patient=request.agent(runtime.app);
  const ps=(await patient.get('/api/session')).body;
  await patient.post('/api/demo').set('X-CSRF-Token',ps.csrf).send({role:'patient'}).expect(200);
  await patient.get(route).expect(404);
  await patient.get(rdlRoute).expect(404);
  assert(!(await patient.get('/api/overview')).body.exercises.some(e=>e.id.startsWith('katalog-')));
  const csrf=(await staff.get('/api/session')).body.csrf;
  const exercise=added.find(e=>e.id==='katalog-shoulder-flex-stand-aktiv');
  const updated=(await staff.put('/api/exercises/'+exercise.id).set('X-CSRF-Token',csrf).send({...exercise,end:'Individuell geprüfte Endstellung'}).expect(200)).body;
  const stored=(await staff.get('/api/exercises/'+exercise.id)).body;
  assert.equal(stored.end,'Individuell geprüfte Endstellung');
  assert.equal(stored.familyId,exercise.familyId);
  assert.equal(stored.variantLabel,exercise.variantLabel);
});

test('single-leg deadlift variants use separate equipment-specific frames and stay clinical drafts', () => {
  const variants=illustratedExercises.filter(e=>e.familyId==='einbein-kreuzheben');
  assert.equal(variants.length,2);
  const dumbbell=variants.find(e=>e.equipment==='Hanteln');
  const barbell=variants.find(e=>e.equipment==='Langhantel');
  const start=resolveReferencePose(dumbbell), alternative=resolveReferencePose(barbell);
  assert.equal(start.atlas,'reference-single-leg-rdl');
  assert.equal(alternative.atlas,start.atlas);
  assert.equal(start.row,0); assert.equal(alternative.row,1);
  assert.equal(start.frameColumns,2); assert.equal(start.frameRows,2);
  assert.equal(resolveReferencePose({...dumbbell,equipment:'Theraband'}),undefined);
  for(const entry of variants) {
    assert(entry.requiresSupervision && entry.difficulty==='Anspruchsvoll');
    assert.deepEqual(entry.joints,['Hüftgelenk']);
    assert(entry.trainingTypes.includes('Kraft') && entry.trainingTypes.includes('Koordination'));
    assert(entry.strengthMuscles.includes('Hinterer Oberschenkel (ischiocrurale Muskulatur)'));
    assert(!entry.conditionUses?.length);
    assert(!JSON.stringify(entry).includes('codex-clipboard'));
  }
  const entryList=variants.map(e=>({...e,tags:[]}));
  assert.equal(findExercises(entryList,{joint:'Hüftgelenk',equipment:'Langhantel',trainingType:'Kraft'}).length,1);
});

test('illustrations match equipment and direction instead of reusing bare-arm art for resistance variants', () => {
  const get=id=>expandedExercises.find(e=>e.id===id);
  assert.equal(resolveReferencePose(get('katalog-shoulder-flex-stand-aktiv')).atlas,'reference-joints');
  assert.equal(resolveReferencePose(get('katalog-shoulder-flex-stand-band')),undefined);
  assert.equal(resolveReferencePose(get('katalog-shoulder-flex-stand-isometrisch')),undefined);
  const dynamic=resolveReferencePose(get('katalog-knee-streck-sitz-manschette'));
  const eccentric=resolveReferencePose(get('katalog-knee-streck-sitz-manschette-exzentrisch'));
  assert.equal(dynamic.atlas,'reference-lower-equipment');
  assert(!dynamic.reverse);
  assert(eccentric.reverse);
  assert.equal(resolveReferencePose(additionalExercises.find(e=>e.id==='hantel-beugen-sitz')).atlas,'reference-equipment');
  assert.equal(resolveReferencePose({...additionalExercises.find(e=>e.id==='hantel-beugen-sitz'),equipment:'Theraband'}),undefined);
  for(const e of illustratedExercises) {
    assert(resolveReferencePose(e),e.id);
    assert(e.start && e.end && e.steps.length && e.requiresSupervision);
    assert(e.strengthMuscles.every(m=>taxonomy.muscles.includes(m)));
  }
});
