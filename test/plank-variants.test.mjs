import test from 'node:test';
import assert from 'node:assert/strict';
import { illustratedExercises, collectionExerciseIds, taxonomy } from '../server/exercise-catalog.mjs';
import { resolveReferencePose } from '../src/reference-lookup.ts';
import { defaultPlanDosage, dosageLabel } from '../src/dosage.ts';
import { findExercises } from '../src/exercise-search.ts';

test('four support families offer distinct standard and knee illustrations with appropriate dosage',()=>{
  for(const [family,atlas,hold] of [
    ['unterarmstuetz','reference-planks',true],
    ['liegestuetz','reference-pushups',false],
    ['unterarmstuetz-beinheben','reference-plank-leg-lifts',false],
    ['seitstuetz','reference-side-planks',true],
  ]) {
    const variants=illustratedExercises.filter(e=>e.familyId===family);
    assert.equal(variants.length,2,family);
    const standard=variants.find(e=>e.id===family),knee=variants.find(e=>e.id===family+'-knie');
    assert.equal(knee.difficulty,'Leicht');
    assert(knee.title.includes('Kniestütz'));
    for(const [index,e] of [standard,knee].entries()) {
      assert(collectionExerciseIds.includes(e.id));
      assert.deepEqual(e.trainingTypes,['Kraft']);
      assert.deepEqual(e.conditionUses,[]);
      assert(e.requiresSupervision);
      assert(e.start && e.end && e.steps.length>=3 && e.precautions);
      assert(e.joints.every(j=>taxonomy.joints.includes(j)));
      assert(e.strengthMuscles.every(m=>taxonomy.muscles.includes(m)));
      const pose=resolveReferencePose(e);
      assert.equal(pose.atlas,atlas); assert.equal(pose.row,index);
      assert.equal(pose.frameColumns,2);
      assert.equal(resolveReferencePose({...e,equipment:'Hanteln'}),undefined);
      const dosage=defaultPlanDosage(e);
      assert.equal(e.dosageMode,hold?'hold':'repetitions');
      assert.equal(dosage.hold,hold?20:0);
      assert.equal(dosageLabel({...dosage,exercise:e}).includes('Sekunden'),hold);
    }
    const filtered=findExercises(variants.map(e=>({...e,tags:[]})),{equipment:'Matte',trainingType:'Kraft',muscle:standard.strengthMuscles[0]});
    assert.equal(filtered.length,2);
  }
});

test('existing dynamic side hip lift gains a knee option without becoming a static timed exercise',()=>{
  const standard=illustratedExercises.find(e=>e.id==='seitliches-hueftheben');
  const knee=illustratedExercises.find(e=>e.id==='seitliches-hueftheben-knie');
  assert.equal(knee.familyId,standard.familyId);
  assert.equal(knee.dosageMode,'repetitions');
  assert.equal(defaultPlanDosage(knee).hold,0);
  assert.equal(resolveReferencePose(knee).row,2);
  assert.equal(resolveReferencePose(knee).atlas,'reference-side-planks');
  assert.equal(resolveReferencePose(standard).atlas,'reference-side-hip-lift');
  assert(knee.start.includes('90 Grad') && knee.end.includes('Knie bleiben auf der Matte'));
  assert(collectionExerciseIds.includes(knee.id));
  assert.equal(collectionExerciseIds.length,45);
});
