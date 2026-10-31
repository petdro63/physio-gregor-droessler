# Automatische Firebase-Veröffentlichung ohne PowerShell

Der Ablauf `.github/workflows/deploy-firebase.yml` wird bei jedem GitHub-Push auf `master` gestartet und veröffentlicht die fertige Demo unter https://physio-lfd-training.web.app/. **Er kann erst funktionieren, nachdem vier geschützte Werte einmalig hinterlegt wurden.** Die lokale Fehlermeldung wegen `.env.firebase` spielt beim neuen GitHub-Ablauf keine Rolle mehr.

## Einmalige Einrichtung im Browser

Öffne [GitHub → Repository Secrets](https://github.com/petdro63/physio-gregor-droessler/settings/secrets/actions), klicke jeweils **New repository secret** und lege diese vier Namen an:

1. `VITE_FIREBASE_CONFIG` — das vollständige JSON-Objekt der öffentlichen Firebase-Web-App-Konfiguration (einschließlich `apiKey`, `authDomain`, `projectId` und `appId`), ohne vorangestelltes `const firebaseConfig =`. In [Firebase → Projekteinstellungen → Allgemein → Meine Apps](https://console.firebase.google.com/project/physio-lfd-training/settings/general) unter **SDK-Einrichtung und Konfiguration** zu finden. `projectId` muss `physio-lfd-training` sein.
2. `VITE_DEMO_LOGIN_NAME` — der bisherige Benutzername deiner Online-Demo (ohne Passwort).
3. `VITE_DEMO_LOGIN_EMAIL` — die E-Mail-Adresse des freigeschalteten Firebase-Demokontos unter **Authentication → Users** (ohne Passwort).
4. `FIREBASE_SERVICE_ACCOUNT_JSON` — der komplette JSON-Schlüssel eines auf **Firebase Hosting** beschränkten Google-Cloud-Dienstkontos im Projekt `physio-lfd-training`. Erstelle es unter [Google Cloud → Dienstkonten](https://console.cloud.google.com/iam-admin/serviceaccounts?project=physio-lfd-training) und erteile die notwendigen Rollen **Firebase Hosting Admin** und **Service Usage API Keys Viewer**. Unter **Keys → Add Key → Create new key → JSON** erhältst du den Schlüssel. Füge ihn ausschließlich als verschlüsseltes GitHub-Secret ein; lade ihn nicht in den Chat, nicht in Git und nicht auf eine Webseite außerhalb der Google/GitHub-Konsolen hoch. Entferne nicht benötigte Kopien der Datei sicher.

Die vier Werte sind in GitHub verschlüsselt und nicht Teil des Quellcodes. Ein Firebase-Dienstkontoschlüssel ist eine langlebige Berechtigung: Zugriff sorgfältig begrenzen und Schlüssel später möglichst durch **Workload Identity Federation (OIDC)** ersetzen. Siehe [offizielle Firebase-Anleitung](https://firebase.google.com/docs/hosting/github-integration).

## Einmalig die neue Version starten

Gehe zu [GitHub → Actions → Firebase-Trainingsdemo automatisch veroeffentlichen](https://github.com/petdro63/physio-gregor-droessler/actions/workflows/deploy-firebase.yml), wähle **Run workflow** mit Branch `master` und überprüfe, dass der Lauf grün abgeschlossen ist.

Erst **danach** mit **Strg + F5** die [Online-Demo](https://physio-lfd-training.web.app/) neu laden. Auf der Anmeldeseite steht dann **Version 0.1.33-dev / 31.10.2026**. Die acht HWS-Broschürenübungen und drei Schulteraußenrotationen dürfen nicht mehr angezeigt werden.

## Ab dann nur noch Strg + F5

Wenn zukünftig Änderungen auf `master` gespeichert werden, baut und veröffentlicht GitHub sie automatisch. Du musst weder PowerShell starten noch `git pull` oder `npm` ausführen. **Strg + F5 lädt lediglich die bereits veröffentlichte Version** und ist erst nach einem erfolgreichen GitHub-Actions-Lauf wirksam.

Fehlgeschlagener Lauf? Öffne im GitHub-Actions-Tab den roten Schritt. Ein fehlendes Secret wird im Schritt „Firebase-Zugang sicher pruefen“ namentlich angezeigt. Weder Firestore-Daten, Firebase-Authentifizierung noch Patientendaten werden bei dieser automatischen Veröffentlichung überschrieben. Für `training.physio-lfd.de` muss unabhängig davon noch das DNS eingerichtet werden.
