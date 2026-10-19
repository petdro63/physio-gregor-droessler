import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openDatabase } from "../server/db.mjs";
import { additionalExercises, taxonomy } from "../server/exercise-catalog.mjs";
import { findExercises } from "../src/exercise-search.ts";

const entries = additionalExercises.map(e => ({ ...e, tags: [], difficulty: "Leicht" }));

test("catalog filters combine equipment, position, joint, type and strengthening muscle", () => {
  const result = findExercises(entries, {
    equipment: "Hanteln", position: "Im Sitzen", joint: "Ellenbogengelenk",
    trainingType: "Kraft", muscle: "Bizeps (M. biceps brachii)",
  });
  assert.deepEqual(result.map(e => e.id), ["hantel-beugen-sitz"]);
  assert.equal(findExercises(entries, { trainingType: "Dehnung", muscle: "Bizeps (M. biceps brachii)" }).length, 0);
  assert.equal(findExercises(entries, { position: "Im Vierfüßlerstand" }).length, 2);
  assert.equal(findExercises(entries, { equipment: "Pezziball" }).length, 4);
  assert.equal(findExercises(entries, { search: "  BIZEPS  " }).length, 5);
});

test("joint sorting is stable and does not change catalog order", () => {
  const before = entries.map(e => e.id);
  const sorted = findExercises(entries, { sort: "joint" });
  const keys = sorted.map(e => [...e.joints].sort((a,b) => a.localeCompare(b,"de"))[0]);
  assert.deepEqual(keys, [...keys].sort((a,b) => a.localeCompare(b,"de")));
  assert.deepEqual(entries.map(e => e.id), before);
});

test("all research entries have valid anatomy, sources and the requested coverage", () => {
  assert.equal(entries.length, 18);
  for (const e of entries) {
    assert(e.trainingTypes.length && e.trainingTypes.every(t => taxonomy.trainingTypes.includes(t)));
    assert(e.joints.length && e.joints.every(j => taxonomy.joints.includes(j)));
    assert(e.strengthMuscles.every(m => taxonomy.muscles.includes(m)));
    assert.equal(e.strengthMuscles.length > 0, e.trainingTypes.includes("Kraft"));
    assert(e.sources.every(s => s.title && s.url.startsWith("https://")));
    assert(!JSON.stringify(e).includes("?"), "No damaged umlauts in the research entries");
  }
  for (const equipment of ["Hanteln", "Stab", "Theraband", "Pezziball"]) assert(entries.some(e => e.equipment === equipment));
  for (const type of ["Kraft", "Mobilisation", "Dehnung"]) assert(entries.some(e => e.trainingTypes.includes(type)));
});

test("existing exercise versions gain metadata without changing instructions or versions", t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "physio-classification-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  let db = openDatabase(dir);
  db.prepare("DELETE FROM schema_migrations WHERE id=4").run();
  db.prepare("INSERT INTO users (id,name,email,role,created_at) VALUES ('author','Test','test@example.invalid','admin','2026-01-01')").run();
  db.prepare("INSERT INTO exercises VALUES ('knie-strecken',1,'draft','author')").run();
  const original = { title: "Meine Knieübung", steps: ["Eigene Anleitung behalten"], media: [] };
  db.prepare("INSERT INTO exercise_versions VALUES ('knie-strecken',1,?,'2026-01-01')").run(JSON.stringify(original));
  db.close();
  db = openDatabase(dir);
  const updated = JSON.parse(db.prepare("SELECT payload FROM exercise_versions").get().payload);
  assert.deepEqual(updated.steps, original.steps);
  assert.equal(updated.title, original.title);
  assert.deepEqual(updated.trainingTypes, ["Kraft"]);
  assert.deepEqual(updated.joints, ["Kniegelenk"]);
  assert.equal(updated.strengthMuscles[0], "Vorderer Oberschenkel (M. quadriceps femoris)");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM exercise_versions").get().count, 1);
  db.close();
});
