import { initializeApp } from 'firebase/app';
import { browserSessionPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const configText=import.meta.env.VITE_FIREBASE_CONFIG;
if(!configText) throw new Error('Die Firebase-Webkonfiguration fehlt.');
export const firebaseApp=initializeApp(JSON.parse(configText));
export const firebaseAuth=getAuth(firebaseApp);
export const firestore=getFirestore(firebaseApp,import.meta.env.VITE_FIRESTORE_DATABASE||'demo');
if(import.meta.env.VITE_FIREBASE_EMULATORS==='true') {
  if(!['localhost','127.0.0.1'].includes(location.hostname)) throw new Error('Emulatorzugriff ist ausschließlich lokal erlaubt.');
  connectAuthEmulator(firebaseAuth,'http://127.0.0.1:9199',{disableWarnings:true});
  connectFirestoreEmulator(firestore,'127.0.0.1',8180);
}
export const firebaseReady=setPersistence(firebaseAuth,browserSessionPersistence).then(()=>firebaseAuth.authStateReady());

export async function requireDemoIdentity() {
  await firebaseReady;
  const user=firebaseAuth.currentUser;
  if(!user) throw new Error('Bitte zuerst mit dem Demo-Zugang anmelden.');
  const token=await user.getIdTokenResult();
  if(token.claims.trainingDemo!==true) throw new Error('Dieses Konto ist nicht für die Trainingsdemo freigeschaltet.');
  return user;
}
