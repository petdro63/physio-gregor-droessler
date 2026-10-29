import fs from "node:fs";
import { iso, transaction } from "./db.mjs";
import { clinicalMappings, rehabExercises } from "./clinical-content.mjs";

export const taxonomy = JSON.parse(fs.readFileSync(new URL("../src/exercise-taxonomy.json", import.meta.url), "utf8"));
const legacy = JSON.parse(fs.readFileSync(new URL("./legacy-exercise-classification.json", import.meta.url), "utf8"));
export const additionalExercises = JSON.parse(fs.readFileSync(new URL("./additional-exercises.json", import.meta.url), "utf8"));
export const expandedExercises = JSON.parse(fs.readFileSync(new URL("./expanded-exercises.json", import.meta.url), "utf8"));
export const illustratedExercises = JSON.parse(fs.readFileSync(new URL("./illustrated-exercises.json", import.meta.url), "utf8"));
export const neckExercises = JSON.parse(fs.readFileSync(new URL("./neck-exercises.json", import.meta.url), "utf8"));
export const shoulderRotationExercises = JSON.parse(fs.readFileSync(new URL("./shoulder-rotation-exercises.json", import.meta.url), "utf8"));
export const bulgarianSplitSquats = JSON.parse(fs.readFileSync(new URL("./bulgarian-split-squats.json", import.meta.url), "utf8"));
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
  'katze-kuh-mobilisation', 'piriformisdehnung-rueckenlage', 'hueftbeuger-dehnung-kniestand',
  'hws-tiefe-halsbeuger-isometrisch','hws-tiefe-halsbeuger-kopfheben','hws-nackenstrecker-rueckenlage','hws-nackenstrecker-bauchlage','hws-stabilisation-sitz','hws-isometrie-handwiderstand','hws-stabilisation-vorlage','hws-dynamische-kontrolle-sitz',
  'oberkoerperrotation-sitz',
  'schulter-aussenrotation-stand', 'schulter-aussenrotation-sitz', 'schulter-aussenrotation-u-halte-sitz',
  'bulgarian-split-squat-ohne-gewicht', 'bulgarian-split-squat-kurzhanteln',
  'unterarmstuetz', 'unterarmstuetz-knie',
  'liegestuetz', 'liegestuetz-knie',
  'unterarmstuetz-beinheben', 'unterarmstuetz-beinheben-knie',
  'seitstuetz', 'seitstuetz-knie', 'seitliches-hueftheben-knie',
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


// Update the existing seated neck rotation without duplicating it or overwriting personal edits.
// Add a NEW library exercise; never restore or alter previously removed exercises.
export function publishSeatedNeckRotation(db) {
  transaction(db, () => {
    const id = 'kopfrotation-sitzend';
    // Restore the prior list reset's removal entry if older application versions cleared it.
    if (db.prepare("SELECT 1 FROM settings WHERE id='exercise-list-reset-deadlifts-2026-10-20'").get() && db.prepare("SELECT 1 FROM exercises WHERE id='nacken-drehen'").get()) {
      db.prepare('INSERT OR IGNORE INTO exercise_list_removals (exercise_id,removed_at) VALUES (?,?)').run('nacken-drehen', iso());
    }
    if (db.prepare('SELECT 1 FROM exercises WHERE id=?').get(id)) return;
    const exercise = classifyExercise({
      id, title: 'Kopfrotation im Sitzen', region: 'Nacken', goal: 'Mobilisation',
      trainingTypes: ['Mobilisation'], joints: ['Halswirbelsäule'],
      position: 'Im Sitzen', equipment: 'Stuhl',
      subtitle: 'Langsame Rotation nach links und rechts',
      start: 'Aufrecht auf einem stabilen Stuhl sitzen, beide Füße auf dem Boden. Schultern locker und Blick geradeaus.',
      end: 'Der Kopf ist behutsam zu einer Seite gedreht; Oberkörper und Schultern bleiben nach vorn gerichtet.',
      steps: [
        'Den Kopf langsam nach links drehen, nur so weit wie angenehm.',
        'Zur Mitte zurückkehren und den Kopf langsam nach rechts drehen.',
        'Kontrolliert zur Mitte zurückkehren und ruhig weiteratmen.'
      ],
      mistakes: 'Nicht ruckartig drehen, den Oberkörper mitdrehen oder eine schmerzhafte Endstellung erzwingen.',
      precautions: 'Vor Anwendung individuell therapeutisch prüfen. Bei Schwindel, neu auftretenden ausstrahlenden Beschwerden oder zunehmenden Schmerzen abbrechen.',
      breathing: 'Gleichmäßig weiteratmen.',
      easier: 'Bewegungsumfang verkleinern.',
      harder: 'Nur nach therapeutischer Freigabe anpassen.',
      difficulty: 'Leicht', duration: 3, media: [], demo: false,
      author: 'Eigene Übungsbeschreibung', reviewer: '', reviewedAt: '',
      license: 'Eigene schematische Illustration; fachliche Prüfung ausstehend.',
      licenseUntil: '', transcript: '', tags: ['Nacken', 'Mobilisation', 'Im Sitzen']
    });
    const creator = db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return; // Fresh practice install: wait until staff setup is complete.
    db.prepare('INSERT INTO exercises VALUES (?,?,?,?)').run(id, 1, 'draft', creator.id);
    db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(id, 1, JSON.stringify(exercise), iso());
  });
}


// Add the two additional seated neck mobility exercises without changing existing edits.
export function publishAdditionalSeatedNeckExercises(db) {
  transaction(db, () => {
    const creator = db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return;
    const exercises = [
      {
        id: 'kopfseitneigung-sitzend', title: 'Kopfseitneigung im Sitzen',
        subtitle: 'Kopf sanft zur linken und rechten Schulter neigen',
        start: 'Aufrecht auf einem stabilen Stuhl sitzen, beide Füße stehen auf dem Boden. Der Blick geht geradeaus; die Schultern bleiben locker.',
        end: 'Ein Ohr nähert sich langsam der gleichseitigen Schulter, ohne dass die Schulter angehoben oder der Kopf verdreht wird.',
        steps: ['Den Kopf vorsichtig nach links neigen und dabei weiter geradeaus schauen.', 'Zur Mitte zurückkehren und den Kopf langsam nach rechts neigen.', 'Ohne Schwung zur Mitte zurückkehren und gleichmäßig atmen.'],
        mistakes: 'Nicht den Kopf drehen, die Schulter hochziehen oder mit der Hand an der Halswirbelsäule ziehen.',
      },
      {
        id: 'taube-sitzend', title: 'Taube im Sitzen – Kopf vor und zurück',
        subtitle: 'Kopf horizontal vor- und zurückschieben, hinten mit leichtem Doppelkinn',
        start: 'Seitlich betrachtet aufrecht auf einem stabilen Stuhl sitzen. Rücken und Oberkörper bleiben ruhig, der Blick bleibt waagerecht.',
        end: 'Der Kopf wird ohne Nicken nach hinten geführt, sodass ein sanftes Doppelkinn entsteht.',
        steps: ['Den Kopf langsam waagerecht nach vorne schieben, ohne das Kinn anzuheben oder abzusenken.', 'Den Kopf kontrolliert waagerecht nach hinten zurückschieben und dabei ein leichtes Doppelkinn bilden.', 'In die neutrale Position zurückkehren und ruhig weiteratmen.'],
        mistakes: 'Nicht den ganzen Oberkörper verschieben, den Kopf nach oben oder unten kippen oder die Halswirbelsäule überstrecken.',
      }
    ];
    for (const item of exercises) {
      if (db.prepare('SELECT 1 FROM exercises WHERE id=?').get(item.id)) continue;
      const exercise = classifyExercise({
        ...item, region:'Nacken', goal:'Mobilisation', trainingTypes:['Mobilisation'],
        joints:['Halswirbelsäule'], position:'Im Sitzen', equipment:'Stuhl',
        precautions:'Vor Anwendung individuell therapeutisch prüfen. Bei Schwindel, ausstrahlenden Beschwerden oder zunehmenden Schmerzen abbrechen.',
        breathing:'Gleichmäßig weiteratmen.', easier:'Bewegungsumfang verkleinern.',
        harder:'Nur nach therapeutischer Freigabe anpassen.',
        difficulty:'Leicht', duration:3, media:[], demo:false,
        author:'Eigene Übungsbeschreibung', reviewer:'', reviewedAt:'',
        license:'Eigene schematische Illustration; fachliche Prüfung ausstehend.',
        licenseUntil:'', transcript:'', tags:['Nacken','Mobilisation','Im Sitzen']
      });
      db.prepare('INSERT INTO exercises VALUES (?,?,?,?)').run(item.id,1,'draft',creator.id);
      db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(item.id,1,JSON.stringify(exercise),iso());
    }
  });
}

// Add new shoulder rotation entries to existing practice installations as drafts. Never touch edits or publish.
export function publishShoulderRotationExercises(db) {
  transaction(db, () => {
    const creator = db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return;
    for (const entry of shoulderRotationExercises) {
      if (db.prepare("SELECT 1 FROM exercises WHERE id=?").get(entry.id)) continue;
      const payload = classifyExercise({
        ...entry, author:'Eigene Übungsbeschreibung nach Nutzervorgabe',
        reviewer:'', reviewedAt:'', licenseUntil:'', transcript:'',
        tags:[...entry.trainingTypes,...entry.joints,entry.position,entry.equipment]
      });
      db.prepare("INSERT INTO exercises VALUES (?,?,?,?)").run(entry.id,1,'draft',creator.id);
      db.prepare("INSERT INTO exercise_versions VALUES (?,?,?,?)").run(entry.id,1,JSON.stringify(payload),iso());
    }
  });
}

// Add the new hip flexor stretch to existing practice installations as a draft.
// Never overwrite locally edited versions or publication decisions.
export function publishHipFlexorStretch(db) {
  transaction(db, () => {
    const entry = illustratedExercises.find(e => e.id === 'hueftbeuger-dehnung-kniestand');
    if (!entry || db.prepare('SELECT 1 FROM exercises WHERE id=?').get(entry.id)) return;
    const creator = db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return;
    const payload = classifyExercise({
      ...entry, author:'Eigene Übungsbeschreibung nach Nutzervorgabe',
      reviewer:'', reviewedAt:'', licenseUntil:'', transcript:'',
      media:[], demo:false, tags:[...entry.tags,...entry.joints,entry.position,entry.equipment]
    });
    db.prepare('INSERT INTO exercises VALUES (?,?,?,?)').run(entry.id,1,'draft',creator.id);
    db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(entry.id,1,JSON.stringify(payload),iso());
  });
}

// Add new cervical exercises to existing practices without overwriting individual edits.
export function publishNeckExercises(db) {
  transaction(db, () => {
    const creator = db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return;
    for (const entry of neckExercises) {
      if (db.prepare('SELECT 1 FROM exercises WHERE id=?').get(entry.id)) continue;
      const payload = classifyExercise({
        ...entry,
        author: 'Eigene deutschsprachige Beschreibung nach Bewegungsreferenz',
        reviewer: '', reviewedAt: '', licenseUntil: '', transcript: '', media: [], demo: false
      });
      db.prepare('INSERT INTO exercises VALUES (?,?,?,?)').run(entry.id,1,'draft',creator.id);
      db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(entry.id,1,JSON.stringify(payload),iso());
    }
  });
}

// New Bulgarian split squat drafts for already installed practices; do not change existing versions.
export function publishBulgarianSplitSquats(db) {
  transaction(db, () => {
    const creator=db.prepare("SELECT id FROM users WHERE role IN ('admin','therapist') ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at LIMIT 1").get();
    if (!creator) return;
    for (const entry of bulgarianSplitSquats) {
      if (db.prepare('SELECT 1 FROM exercises WHERE id=?').get(entry.id)) continue;
      const payload=classifyExercise({...entry,tags:[...entry.trainingTypes,...entry.joints,entry.position,entry.equipment]});
      db.prepare("INSERT INTO exercises VALUES (?,?,?,?)").run(entry.id,1,'draft',creator.id);
      db.prepare('INSERT INTO exercise_versions VALUES (?,?,?,?)').run(entry.id,1,JSON.stringify(payload),iso());
    }
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
    for (const entry of [...additionalExercises, ...rehabExercises, ...expandedExercises, ...illustratedExercises, ...neckExercises, ...shoulderRotationExercises, ...bulgarianSplitSquats]) {
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
