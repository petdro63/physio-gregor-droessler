import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createApp } from "../server/app.mjs";
import { additionalExercises, classifyExercise } from "../server/exercise-catalog.mjs";
import { clinicalMappings, clinicalLibrary, rehabExercises, catalogMedia } from "../server/clinical-content.mjs";
import { suggestExercises } from "../src/condition-search.ts";

const brochures=JSON.parse(fs.readFileSync(new URL("../src/brochure-library.json",import.meta.url),"utf8"));
const exercises=[...additionalExercises,...rehabExercises].map(e => classifyExercise({...e,...clinicalMappings[e.id],status:"draft"}));

test("all 15 source brochures have own summaries and every clinical assignment is internally valid", () => {
  assert.equal(brochures.length,15);
  assert.equal(new Set(rehabExercises.map(e => e.id)).size,rehabExercises.length);
  for (const brochure of brochures) {
    const covered=rehabExercises.filter(e => e.brochureId===brochure.id);
    assert(covered.length>0,brochure.id);
    assert(covered.every(e => e.sources.some(s => s.url===brochure.url)));
  }
  const known=new Set([...additionalExercises,...rehabExercises].map(e=>e.id).concat("huefte-seitlich","vierfuessler-diagonal"));
  for(const [id,mapping] of Object.entries(clinicalMappings)) {
    assert(known.has(id),`Unknown exercise ${id}`);
    for(const use of mapping.conditionUses || []) {
      const condition=clinicalLibrary.conditions.find(c=>c.id===use.conditionId);
      assert(condition);
      assert(use.phases.length && use.phases.every(p=>condition.phases.some(v=>v.id===p)));
      assert(use.evidenceIds.every(id=>clinicalLibrary.evidence.some(e=>e.id===id)));
      assert(use.variants.every(v=>condition.variants.some(variant=>variant.id===v)));
      if(condition.variants.length) assert(use.variants.length);
    }
  }
});

test("clinical suggestions require valid explicit phase and prothesis or treatment variant", () => {
  assert.equal(suggestExercises(exercises,"schulter-tep","").length,0);
  assert.equal(suggestExercises(exercises,"schulter-tep","schutz").length,0);
  assert.equal(suggestExercises(exercises,"schulter-tep","schutz","unknown").length,0);
  for(const variant of ["anatomisch","invers"]) {
    const early=suggestExercises(exercises,"schulter-tep","schutz",variant);
    assert(early.length>0);
    assert(early.every(e=>["birshof-06-fingerkontakt","birshof-06-handgelenk","birshof-06-faust","birshof-06-lagern"].includes(e.id)));
    assert(!early.some(e=>e.title.includes("Stütz") || e.equipment==="Hanteln"));
  }
  assert(!suggestExercises(exercises,"frozen-shoulder","schmerz").some(e=>e.trainingTypes.includes("Dehnung")));
  assert(!suggestExercises(exercises,"kreuzband","frueh","rekonstruktion").some(e=>e.id==="reha-knie-strecken"));
  assert(suggestExercises(exercises,"kreuzband","aufbau","rekonstruktion").some(e=>e.id==="reha-knie-strecken"));
  assert.equal(suggestExercises(exercises,"unknown","aufbau").length,0);
});

test("cork and PIR techniques remain supervised and the cork has no invented study link", () => {
  const cork=exercises.find(e=>e.id==="kiefer-korken");
  assert(cork.requiresSupervision);
  assert(cork.precautions.includes("Verschlucken"));
  assert(cork.conditionUses.every(use=>use.evidenceIds.length===0 && use.phases.every(p=>p==="angeleitet")));
  assert(!suggestExercises(exercises,"kiefer","bewegung").includes(cork));
  assert(suggestExercises(exercises,"kiefer","angeleitet").includes(cork));
  for(const e of exercises.filter(e=>e.methodTags.includes("PIR"))) assert(e.requiresSupervision);
});

test("bundled free media has provenance and real PNG/MP4/caption files", () => {
  assert.equal(catalogMedia.length,4);
  for(const asset of catalogMedia) {
    assert(asset.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"));
    assert(asset.license.includes("Public Domain"));
    assert.match(asset.sourceSha256,/^[a-f0-9]{64}$/);
    const base=new URL(`../server/assets/catalog/${asset.id}/`,import.meta.url);
    assert.equal(fs.readFileSync(new URL("start.png",base)).subarray(1,4).toString(),"PNG");
    assert.equal(fs.readFileSync(new URL("video.mp4",base)).subarray(4,8).toString(),"ftyp");
    assert(fs.readFileSync(new URL("captions.vtt",base),"utf8").startsWith("WEBVTT"));
  }
});

test("reopening the demo keeps existing curated edits, versions and statuses", t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"physio-curation-"));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  let runtime=createApp({demo:true,production:false,dataDir:dir});
  const row=runtime.db.prepare("SELECT payload FROM exercise_versions WHERE exercise_id='kiefer-korken'").get();
  const custom={...JSON.parse(row.payload),title:"Individuell geprüfte Fassung",conditionUses:[]};
  runtime.db.prepare("UPDATE exercise_versions SET payload=? WHERE exercise_id='kiefer-korken'").run(JSON.stringify(custom));
  runtime.db.prepare("UPDATE exercises SET status='review' WHERE id='kiefer-korken'").run();
  const count=runtime.db.prepare("SELECT COUNT(*) n FROM exercises").get().n;
  runtime.close();
  runtime=createApp({demo:true,production:false,dataDir:dir});
  assert.equal(runtime.db.prepare("SELECT COUNT(*) n FROM exercises").get().n,count);
  assert.equal(JSON.parse(runtime.db.prepare("SELECT payload FROM exercise_versions WHERE exercise_id='kiefer-korken'").get().payload).title,custom.title);
  assert.equal(runtime.db.prepare("SELECT status FROM exercises WHERE id='kiefer-korken'").get().status,"review");
  runtime.close();
});
