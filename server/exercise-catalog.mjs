import fs from "node:fs";
import { iso, transaction } from "./db.mjs";
import { clinicalMappings, rehabExercises } from "./clinical-content.mjs";

export const taxonomy = JSON.parse(fs.readFileSync(new URL("../src/exercise-taxonomy.json", import.meta.url), "utf8"));
const legacy = JSON.parse(fs.readFileSync(new URL("./legacy-exercise-classification.json", import.meta.url), "utf8"));
export const additionalExercises = JSON.parse(fs.readFileSync(new URL("./additional-exercises.json", import.meta.url), "utf8"));

export function classifyExercise(exercise, id = exercise.id) {
  const defaults = legacy[id] || { trainingTypes: [], joints: [], strengthMuscles: [] };
  return { ...defaults, sources: [], conditionUses: [], methodTags: [], catalogMedia: [], requiresSupervision: false, brochureId: "", ...clinicalMappings[id], ...exercise };
}

// Only the demonstration database receives research drafts automatically.
// INSERT OR IGNORE preserves edits and publication decisions across restarts.
export function seedResearchDrafts(db) {
  transaction(db, () => {
    for (const entry of [...additionalExercises, ...rehabExercises]) {
      if (db.prepare("SELECT 1 FROM exercises WHERE id=?").get(entry.id)) continue;
      const payload = {
        difficulty: "Leicht", duration: 3, breathing: "Ruhig weiteratmen; Bewegungen kontrolliert ausführen.",
        precautions: "Rechercheentwurf: Eignung, Bewegungsausmaß und Dosierung vor Verwendung therapeutisch prüfen. Bei neuen oder zunehmenden Beschwerden, Schwindel oder Unsicherheit abbrechen. Belastbarkeit der beteiligten Gelenke und sichere Hilfsmittel prüfen.",
        easier: "Nach therapeutischer Vorgabe Bewegungsumfang oder Widerstand reduzieren.",
        harder: "Widerstand oder Komplexität nur nach individueller Freigabe erhöhen.",
        author: "Eigener deutscher Rechercheentwurf", reviewer: "", reviewedAt: "",
        license: "Eigene Kurzbeschreibung; Originalbroschüren nur verlinkt. Für zusätzliche Katalogmedien gelten die gesonderten Herkunfts- und Rechteangaben.",
        licenseUntil: "", transcript: "", media: [], demo: false,
        tags: [...entry.trainingTypes, ...entry.joints, entry.equipment, entry.position],
        ...classifyExercise({ ...entry, ...clinicalMappings[entry.id] }),
      };
      db.prepare("INSERT INTO exercises VALUES (?,?,?,?)").run(entry.id, 1, "draft", "demo-admin");
      db.prepare("INSERT INTO exercise_versions VALUES (?,?,?,?)").run(entry.id, 1, JSON.stringify(payload), iso());
    }
  });
}
