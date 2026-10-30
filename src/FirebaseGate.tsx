import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Activity } from 'lucide-react';
import { firebaseAuth, firebaseReady, requireDemoIdentity } from './firebase';
import version from './app-version.json';
import { clearFirebaseDemoMemory } from './firebase-api';

export default function FirebaseGate({children}:{children:React.ReactNode}) {
  const [ready,setReady]=useState(false),[allowed,setAllowed]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>onAuthStateChanged(firebaseAuth,async user=>{
    setAllowed(false);
    if(!user)clearFirebaseDemoMemory();
    if(user)try{await requireDemoIdentity();setAllowed(true);}catch(e){setError(e instanceof Error?e.message:'Zugang nicht freigeschaltet.');}
    setReady(true);
  }),[]);
  if(!ready)return <div className="loading"><Activity className="pulse"/><p>Demo-Zugang wird geprüft …</p></div>;
  if(allowed)return <><div className="firebase-demo-bar"><span>Geschützte Demo · ausschließlich erfundene Beispieldaten</span><button onClick={()=>void signOut(firebaseAuth)}>Demo-Zugang abmelden</button></div>{children}</>;
  return <main className="firebase-gate"><section className="firebase-gate-story"><Activity size={48}/><h1>Ihr Weg zu mehr Bewegung.</h1><p>Physiopraxis Gregor Drößler</p><small>Version {version.version} · Versionsdatum {version.date.split('-').reverse().join('.')}</small></section>
    <form className="firebase-gate-form" onSubmit={async event=>{
      event.preventDefault();setError('');setBusy(true);
      const form=new FormData(event.currentTarget);
      try{
        if(String(form.get('username')||'').trim()!==import.meta.env.VITE_DEMO_LOGIN_NAME)throw new Error('Benutzername oder Passwort ist nicht korrekt.');
        await firebaseReady;
        await signInWithEmailAndPassword(firebaseAuth,import.meta.env.VITE_DEMO_LOGIN_EMAIL,String(form.get('password')||''));
        await requireDemoIdentity();
      }catch{setError('Die Anmeldung ist fehlgeschlagen. Bitte Zugangsdaten und Internetverbindung prüfen.');}finally{setBusy(false);}
    }}><span className="eyebrow">TRAININGSDEMO</span><h2>Geschützter Zugang</h2><p>Nach der Anmeldung können Sie Patienten-, Therapie- und Administrationsansicht ausprobieren.</p>
      <label>Benutzername<input name="username" autoComplete="username" required autoFocus/></label>
      <label>Passwort<input name="password" type="password" autoComplete="current-password" required/></label>
      {error&&<p className="firebase-gate-error" role="alert">{error}</p>}<button className="button primary full" disabled={busy}>{busy?'Anmeldung läuft …':'Demo öffnen'}</button>
      <small>Keine echten Patientendaten eintragen. Änderungen an den Beispieldaten werden für diesen Demo-Zugang gespeichert.</small>
    </form></main>;
}
