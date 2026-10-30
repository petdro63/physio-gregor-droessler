import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';
import { classifyExercise } from '../server/exercise-catalog.mjs';
import { coverage } from '../server/seed.mjs';

if(!process.argv.includes('--seed-only')) {
  if(fs.existsSync('.env.firebase'))process.loadEnvFile('.env.firebase');
  const config=JSON.parse(process.env.VITE_FIREBASE_CONFIG||'null');
  const project=JSON.parse(fs.readFileSync('.firebaserc','utf8')).projects.default;
  if(process.env.VITE_BACKEND!=='firebase'||!config||config.projectId!==project||project==='kontaktwerk-45210'||!process.env.VITE_DEMO_LOGIN_NAME||!process.env.VITE_DEMO_LOGIN_EMAIL)throw new Error('Für den Firebase-Build fehlt die getrennte Trainingskonfiguration in .env.firebase.');
}

// Always build from a NEW synthetic database, never from data/demo or practice.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'physio-static-seed-'));
let runtime;
try {
  runtime = createApp({demo:true, production:false, dataDir:dir});
  const db = runtime.db;
  const catalogIds = db.prepare('SELECT id FROM exercises WHERE id NOT IN (SELECT exercise_id FROM exercise_list_removals) ORDER BY rowid').all().map(r=>r.id);
  const needed = new Set(catalogIds);
  for (const row of db.prepare('SELECT payload FROM plan_versions').all()) for (const item of JSON.parse(row.payload).items) needed.add(item.exerciseId);
  const exercises = {};
  for (const id of needed) {
    const current = db.prepare('SELECT * FROM exercises WHERE id=?').get(id);
    exercises[id] = db.prepare('SELECT * FROM exercise_versions WHERE exercise_id=? ORDER BY version').all(id).map(row=>({
      ...classifyExercise(JSON.parse(row.payload),id),id,version:row.version,status:current.status,mediaDetails:[],
    }));
  }
  const users = db.prepare('SELECT * FROM users').all().map(u=>({id:u.id,name:u.name,email:u.email,role:u.role,status:u.status,accessUntil:u.access_until,birthDate:u.birth_date ?? null,mfaEnabled:false}));
  const plans = {};
  for (const p of db.prepare('SELECT * FROM plans').all()) plans[p.id] = db.prepare('SELECT * FROM plan_versions WHERE plan_id=? ORDER BY version').all(p.id).map(v=>({
    ...JSON.parse(v.payload),id:p.id,version:v.version,status:p.status,patientId:p.patient_id,therapistId:p.therapist_id,
  }));
  const state = {schemaVersion:1,users,assignments:db.prepare('SELECT * FROM assignments').all(),exercises,catalogIds,plans,
    history:[],audit:[],invitations:[],accounts:{},media:{},coverage,
    practice:JSON.parse(db.prepare("SELECT payload FROM settings WHERE id='practice'").get().payload)};
  const json = JSON.stringify(state);
  if (Buffer.byteLength(json)>700000) throw new Error('Synthetic seed exceeds the demo document budget.');
  fs.mkdirSync('output',{recursive:true});
  fs.writeFileSync('output/firebase-demo-seed.json',json+'\n');
  if(process.argv.includes('--seed-only')) {
    console.log(`Synthetic demo seed: ${catalogIds.length} exercises, ${Buffer.byteLength(json)} bytes; no existing data read.`);
  } else {
  const publicDir=path.resolve('output/firebase-public');
  // Recreate the public staging directory to avoid shipping assets from prior releases.
  fs.rmSync(publicDir,{recursive:true,force:true});
  fs.mkdirSync(publicDir,{recursive:true});
  for(const name of fs.readdirSync('public'))if(name!=='demo-assets'&&!name.startsWith('.'))fs.cpSync(path.join('public',name),path.join(publicDir,name),{recursive:true});
  const assets = path.join(publicDir,'demo-assets');
  fs.cpSync(path.resolve('server/assets'),assets,{recursive:true});
  console.log(`Synthetic demo: ${users.length} people, ${catalogIds.length} catalog exercises, ${Buffer.byteLength(json)} bytes. No accounts, passwords, sessions or local data exported.`);
  }
} finally {
  runtime?.close();
  fs.rmSync(dir,{recursive:true,force:true});
}
