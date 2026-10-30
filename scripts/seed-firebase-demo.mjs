import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
if(fs.existsSync('.env.firebase')) process.loadEnvFile('.env.firebase');
const config=JSON.parse(process.env.VITE_FIREBASE_CONFIG||'null');
const project=JSON.parse(fs.readFileSync('.firebaserc','utf8')).projects.default;
if(!config||config.projectId!==project||project==='kontaktwerk-45210')throw new Error('Das getrennte Trainingsprojekt ist nicht korrekt konfiguriert.');
let input='';for await(const chunk of process.stdin)input+=chunk;
const {password}=JSON.parse(input);
if(typeof password!=='string'||password.length<1)throw new Error('Demo-Passwort auf stdin erforderlich; niemals als Argument übergeben.');
const app=initializeApp(config),auth=getAuth(app);
try{
  const {user}=await signInWithEmailAndPassword(auth,process.env.VITE_DEMO_LOGIN_EMAIL,password);
  if((await user.getIdTokenResult()).claims.trainingDemo!==true)throw new Error('Dieses Konto ist nicht für die Trainingsdemo freigeschaltet.');
  const db=getFirestore(app,process.env.VITE_FIRESTORE_DATABASE||'demo'),ref=doc(db,'demoStates',user.uid);
  const current=await getDoc(ref);
  if(current.exists()){console.log('Demodaten bereits vorhanden; keine Daten überschrieben.');process.exitCode=0;}
  else{
    const state=JSON.parse(fs.readFileSync('output/firebase-demo-seed.json','utf8'));
    const today=new Date(),end=new Date(today.getTime()+28*86400000);
    for(const rows of Object.values(state.plans))for(const p of rows){p.start=today.toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'});p.end=end.toLocaleDateString('sv-SE',{timeZone:'Europe/Berlin'});}
    const payload=JSON.stringify(state);if(Buffer.byteLength(payload)>850000)throw new Error('Demodaten zu groß.');
    await setDoc(ref,{schemaVersion:1,ownerUid:user.uid,revision:1,payload,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    console.log(`Erfundene Beispieldaten im Trainingsprojekt gespeichert (${state.catalogIds.length} Übungen).`);
  }
}finally{await signOut(auth);}
