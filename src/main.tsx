import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import "./design.css";
const root=createRoot(document.getElementById('root')!);
if(import.meta.env.VITE_BACKEND==='firebase') {
  document.body.classList.add('firebase-demo');
  import('./FirebaseGate').then(({default:Gate})=>root.render(<React.StrictMode><Gate><App/></Gate></React.StrictMode>))
    .catch(()=>root.render(<main className="loading"><p>Die Trainingsdemo konnte nicht geladen werden. Bitte neu laden.</p></main>));
} else root.render(<React.StrictMode><App/></React.StrictMode>);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  navigator.serviceWorker.register("/sw.js").catch(() => {});
