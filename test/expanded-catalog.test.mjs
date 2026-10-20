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
    assert(['reference-joints','reference-ball','reference-equipment','reference-lower-equipment','reference-single-leg-rdl','reference-squats','reference-sumo-upright','reference-calf-raises','reference-wall-sit','reference-bridges','reference-single-leg-bridge-right','reference-lunges','reference-side-hip-lift','reference-lateral-lunges','reference-eccentric-step-down','reference-cat-cow','reference-piriformis-stretch','reference-seated-trunk-rotation','reference-planks','reference-pushups','reference-plank-leg-lifts','reference-side-planks'].includes(pose.atlas));
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
  assert.deepEqual(overview.exercises.map(e=>e.id).sort(),['einbein-kreuzheben-kurzhanteln','einbein-kreuzheben-langhantel','kniebeuge-ohne-gewicht','kniebeuge-zusatzgewicht','sumo-kreuzheben-ohne-gewicht','sumo-kreuzheben-zusatzgewicht','wadenheben-ohne-gewicht','wadenheben-zusatzgewicht','wandsitz','bruecke-rueckenlage','bruecke-einbeinig','ausfallschritt-ohne-gewicht','ausfallschritt-kurzhanteln','ausfallschritt-langhantel','seitliches-hueftheben','seitlicher-ausfallschritt-ohne-gewicht','seitlicher-ausfallschritt-kurzhantel','seitlicher-ausfallschritt-langhantel','quadrizeps-exzentrisch-step-down','katze-kuh-mobilisation','piriformisdehnung-rueckenlage','oberkoerperrotation-sitz','unterarmstuetz','liegestuetz','unterarmstuetz-beinheben','seitstuetz','unterarmstuetz-knie','liegestuetz-knie','unterarmstuetz-beinheben-knie','seitstuetz-knie','seitliches-hueftheben-knie'].sort());
  assert(overview.exercises.every(e=>e.status==='draft' && e.reviewer===''));
  const patient=request.agent(runtime.app);
  const ps=(await patient.get('/api/session')).body;
  await patient.post('/api/demo').set('X-CSRF-Token',ps.csrf).send({role:'patient'}).expect(200);
  await patient.get(route).expect(404);
  await patient.get(rdlRoute).expect(404);
  assert(!(await patient.get('/api/overview')).body.exercises.some(e=>e.id.startsWith('katalog-')));
  const csrf=(await staff.get('/api/session')).body.csrf;
  const exercise=(await staff.get('/api/exercises/katalog-shoulder-flex-stand-aktiv').expect(200)).body;
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

test('seated trunk rotation uses static frontal start and end frames with fixed pelvis and optional head following',()=>{
  const e=illustratedExercises.find(e=>e.id==='oberkoerperrotation-sitz');
  assert.deepEqual(e.trainingTypes,['Mobilisation']);
  assert.deepEqual(e.strengthMuscles,[]);
  assert.deepEqual(e.conditionUses,[]);
  assert.equal(e.position,'Im Sitzen');
  assert(e.start.includes('von vorn'));
  assert(e.end.includes('Das Becken bleibt unverändert'));
  assert(e.end.includes('Knie und Füße bewegen sich nicht mit'));
  assert(e.end.includes('Der Kopf darf dem Arm'));
  const pose=resolveReferencePose(e);
  assert.equal(pose.atlas,'reference-seated-trunk-rotation');
  assert.equal(pose.frameColumns,2); assert.equal(pose.frameRows,1);
  assert.equal(pose.fixedFrame,undefined);
  assert.equal(resolveReferencePose({...e,equipment:'Langhantel'}),undefined);
  assert.equal(findExercises([{...e,tags:[]}],{position:'Im Sitzen',trainingType:'Mobilisation'}).length,1);
});

test('cat-cow is mobilisation and the right-on-left piriformis stretch uses timed stretching instead of strength repetitions',()=>{
  const cat=illustratedExercises.find(e=>e.id==='katze-kuh-mobilisation');
  const piriformis=illustratedExercises.find(e=>e.id==='piriformisdehnung-rueckenlage');
  assert.deepEqual(cat.trainingTypes,['Mobilisation']);
  assert.equal(cat.position,'Im Vierfüßlerstand');
  assert.equal(cat.dosageMode,'repetitions');
  assert.deepEqual(piriformis.trainingTypes,['Dehnung']);
  assert.equal(piriformis.dosageMode,'hold');
  assert.equal(piriformis.defaultHoldSeconds,20);
  assert(piriformis.start.includes('rechten Knöchel auf den linken Oberschenkel'));
  assert(piriformis.end.includes('rechte Knöchel bleibt auf dem linken Oberschenkel'));
  assert(piriformis.steps.some(s=>s.includes('hinter den linken Oberschenkel')));
  for(const e of [cat,piriformis]) {
    assert.deepEqual(e.strengthMuscles,[]);
    assert.deepEqual(e.conditionUses,[]);
    assert(e.joints.every(j=>taxonomy.joints.includes(j)));
    assert.equal(resolveReferencePose(e).frameRows,1);
    assert.equal(resolveReferencePose({...e,equipment:'Hanteln'}),undefined);
  }
  const list=[cat,piriformis];
  assert.equal(findExercises(list,{trainingType:'Mobilisation',position:'Im Vierfüßlerstand'}).length,1);
  assert.equal(findExercises(list,{trainingType:'Dehnung',search:'Piriformis'}).length,1);
  assert.equal(findExercises(list,{trainingType:'Kraft'}).length,0);
});

test('lateral lunges map each load separately and eccentric quadriceps work specifies slow lowering with supported return',()=>{
  const variants=illustratedExercises.filter(e=>e.familyId==='seitliche-ausfallschritte');
  assert.equal(variants.length,3);
  for(const [equipment,row] of [['Ohne Zusatzgerät',0],['Hanteln',1],['Langhantel',2]]) {
    const entry=variants.find(e=>e.equipment===equipment),pose=resolveReferencePose(entry);
    assert.equal(pose.atlas,'reference-lateral-lunges'); assert.equal(pose.row,row);
    assert.equal(pose.frameRows,3); assert.equal(pose.frameColumns,2);
    assert.equal(resolveReferencePose({...entry,equipment:'Theraband'}),undefined);
    assert.equal(findExercises(variants.map(e=>({...e,tags:[]})),{equipment,joint:'Kniegelenk',trainingType:'Kraft'}).length,1);
  }
  const step=illustratedExercises.find(e=>e.id==='quadrizeps-exzentrisch-step-down');
  assert.equal(step.equipment,'Stufe'); assert.equal(step.dosageMode,'repetitions');
  assert.deepEqual(step.strengthMuscles,['Vorderer Oberschenkel (M. quadriceps femoris)']);
  assert(step.steps.some(s=>s.includes('3–5 Sekunden')));
  assert(step.steps.some(s=>s.includes('mit beiden Beinen')));
  assert.equal(step.conditionUses.length,0);
  assert.equal(resolveReferencePose(step).atlas,'reference-eccentric-step-down');
});

test('standing strength additions are filterable by joint and muscle and have distinct unloaded and weighted image rows', () => {
  const families=['kniebeuge','sumo-kreuzheben','wadenheben'];
  for(const family of families) {
    const variants=illustratedExercises.filter(e=>e.familyId===family);
    assert.equal(variants.length,2);
    const unloaded=variants.find(e=>e.equipment==='Ohne Zusatzgerät');
    const weighted=variants.find(e=>e.equipment==='Hanteln');
    const emptyPose=resolveReferencePose(unloaded),loadedPose=resolveReferencePose(weighted);
    assert.equal(emptyPose.row,0); assert.equal(loadedPose.row,1);
    assert.equal(emptyPose.atlas,loadedPose.atlas);
    assert.equal(emptyPose.frameColumns,2); assert.equal(emptyPose.frameRows,2);
    assert.equal(resolveReferencePose({...weighted,equipment:'Langhantel'}),undefined);
    const list=variants.map(e=>({...e,tags:[]}));
    assert.equal(findExercises(list,{equipment:'Ohne Zusatzgerät',trainingType:'Kraft',joint:unloaded.joints[0]}).length,1);
    assert.equal(findExercises(list,{muscle:weighted.strengthMuscles[0],equipment:'Hanteln'}).length,1);
    for(const e of variants) {
      assert(e.requiresSupervision && e.start && e.end && e.steps.length>=3 && e.precautions);
      assert.equal(e.conditionUses.length,0);
      assert(e.trainingTypes.every(t=>taxonomy.trainingTypes.includes(t)));
      assert(e.joints.every(j=>taxonomy.joints.includes(j)));
    }
  }
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
