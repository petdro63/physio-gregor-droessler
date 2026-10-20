import fs from "node:fs";
import { iso, transaction } from "./db.mjs";
import { clinicalMappings, rehabExercises } from "./clinical-content.mjs";

export const taxonomy = JSON.parse(fs.readFileSync(new URL("../src/exercise-taxonomy.json", import.meta.url), "utf8"));
const legacy = JSON.parse(fs.readFileSync(new URL("./legacy-exercise-classification.json", import.meta.url), "utf8"));
export const additionalExercises = JSON.parse(fs.readFileSync(new URL("./additional-exercises.json", import.meta.url), "utf8"));
export const expandedExercises = JSON.parse(fs.readFileSync(new URL("./expanded-exercises.json", import.meta.url), "utf8"));
export const illustratedExercises = JSON.parse(fs.readFileSync(new URL("./illustrated-exercises.json", import.meta.url), "utf8"));
// Retain the requested collection on first installation as well as upgrades.
export const collectionExerciseIds = [
  'einbein-kreuzheben-kurzhanteln', 'einbein-kreuzheben-langhantel',
  'kniebeuge-ohne-gewicht', 'kniebeuge-zusatzgewicht',
  'sumo-kreuzheben-ohne-gewicht', 'sumo-kreuzheben-zusatzgewicht',
  'wadenheben-ohne-gewicht', 'wadenheben-zusatzgewicht',
  'wandsitz', 'bruecke-rueckenlage', 'bruecke-einbeinig',
  'ausfallschritt-ohne-gewicht', 'ausfallschritt-kurzhanteln',
  'ausfallschritt-langhantel', 'seitliches-hueftheben',
  'seitlicher-ausfallschritt-ohne-gewicht', 'seitlicher-ausfallschritt-kurzhantel',
  'seitlicher-ausfallschritt-langhantel', 'quadrizeps-exzentrisch-step-down',
  'katze-kuh-mobilisation', 'piriformisdehnung-rueckenlage',
];

export function correctSingleLegBridgeSide(db) {
  transaction(db, () => {
    const row=db.prepare("SELECT * FROM exercises WHERE id='bruecke-einbeinig'").get();
    if (!row) return;
    const current=JSON.parse(db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=?').get(row.id,row.current_version).payload);
    // Only replace the original generic wording, preserving individual edits.
    if (!current.start.includes('Ein Bein bleibt angewinkelt')) return;
    const updated={...current,
      start:current.start.replace('Ein Bein bleibt angewinkelt','Das linke Bein bleibt angewinkelt').replace('Das andere Bein vom Boden lösen','Das rechte Bein vom Boden lösen'),
      end:current.end.replace('über den einen aufgestellten Fuß','über den linken aufgestellten Fuß').replace('Das freie Bein bleibt nach oben gestreckt','Das rechte Bein bleibt nach oben gestreckt'),
      steps:current.steps.map(s=>s.replace('Dann ein Bein nach oben strecken, das andere mit aufgestelltem Fuß als Stützbein belassen.','Dann das rechte Bein nach oben strecken, das linke mit aufgestelltem Fuß als Stützbein belassen.').replace('über den aufgestellten Fuß','über den linken aufgestellten Fuß').replace('Das freie Bein bleibt gestreckt','Das rechte Bein bleibt gestreckt')),
    };
    if (current.variantLabel==='Einbeinig · freies Bein gestreckt') updated.variantLabel='Einbeinig · rechtes Bein angehoben';
    if (current.subtitle==='Ein Fuß trägt · freies Bein nach oben gestreckt') updated.subtitle='Linker Fuß trägt · rechtes Bein bleibt nach oben gestreckt';
    const version=row.current_version+1;
    db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(row.id,version,JSON.stringify(updated),iso());
    db.prepare('UPDATE exercises SET current_version=? WHERE id=?').run(version,row.id);
  });
}

// A title correction creates a new current version; prescribed older versions
// and individual editorial titles remain intact.
export function renameWideSquats(db) {
  transaction(db, () => {
    for (const id of ['sumo-kreuzheben-ohne-gewicht','sumo-kreuzheben-zusatzgewicht']) {
      const row=db.prepare('SELECT * FROM exercises WHERE id=?').get(id);
      if (!row) continue;
      const stored=db.prepare('SELECT payload FROM exercise_versions WHERE exercise_id=? AND version=?').get(id,row.current_version);
      const current=JSON.parse(stored.payload);
      if (!['Breitbeiniges Kreuzheben ohne Gewicht','Breitbeiniges Kreuzheben mit Zusatzgewicht'].includes(current.title)) continue;
      const updated={...current,title:current.title.replace('Breitbeiniges Kreuzheben','Breitbeinige Kniebeugen'),familyTitle:'Breitbeinige Kniebeugen'};
      if (updated.subtitle === 'Sumo-Variante · deutliche Kniebeugung · aufrechter, gerader Rücken')
        updated.subtitle='Breiter Stand · deutliche Kniebeugung · aufrechter, gerader Rücken';
      const version=row.current_version+1;
      db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(id,version,JSON.stringify(updated),iso());
      db.prepare('UPDATE exercises SET current_version=? WHERE id=?').run(version,id);
    }
  });
}

// One-time collection reset requested by the user. Keep versioned records for
// existing plans and history; later newly created exercises remain addable.
export function resetExerciseListToDeadlifts(db) {
  const marker = 'exercise-list-reset-deadlifts-2026-10-20';
  transaction(db, () => {
    if (db.prepare('SELECT 1 FROM settings WHERE id=?').get(marker)) return;
    const removedAt = iso();
    db.prepare(`INSERT OR IGNORE INTO exercise_list_removals (exercise_id,removed_at)
      SELECT id,? FROM exercises WHERE id NOT IN (${collectionExerciseIds.map(()=>'?').join(',')})`).run(removedAt,
      ...collectionExerciseIds);
    db.prepare('INSERT INTO settings (id,payload) VALUES (?,?)').run(marker,JSON.stringify({appliedAt:removedAt}));
  });
}

export function classifyExercise(exercise, id = exercise.id) {
  const defaults = legacy[id] || { trainingTypes: [], joints: [], strengthMuscles: [] };
  return { ...defaults, sources: [], conditionUses: [], methodTags: [], catalogMedia: [], requiresSupervision: false, brochureId: "", end: "", familyId: "", familyTitle: "", variantLabel: "", sourceNote: "", ...clinicalMappings[id], ...exercise };
}

// Only the demonstration database receives research drafts automatically.
// INSERT OR IGNORE preserves edits and publication decisions across restarts.
export function seedResearchDrafts(db) {
  transaction(db, () => {
    for (const entry of [...additionalExercises, ...rehabExercises, ...expandedExercises, ...illustratedExercises]) {
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
