# Betrieb der Firebase-Trainingsdemo

Version **0.1.31-dev**, Versionsdatum **30.10.2026**, Zeitzone Europe/Berlin.

## Bereitgestellte Umgebung

| Einstellung | Wert |
|---|---|
| Projekt / Hosting-Site | physio-lfd-training |
| Aktuell nutzbare Adresse | https://physio-lfd-training.web.app/ |
| Vorbereitete Wunschdomain | training.physio-lfd.de; DNS-Umstellung ausstehend |
| Firestore | Datenbank demo, Enterprise mit nativer Firestore-Schnittstelle, Echtzeit aktiviert |
| Datenbankregion | europe-west3 / Frankfurt, Deutschland |
| Anmeldung | Firebase Authentication, E-Mail/Passwort; keine anonyme Anmeldung |
| Freischaltung | vom Betreiber gesetzter Custom Claim trainingDemo=true |
| Tarif bei Einrichtung | Spark, kein Abrechnungskonto aktiviert, Datenbank mit kostenlosem Kontingent |

KontaktWerk und dessen Firebase-/Cloudflare-Ressourcen werden nicht verwendet oder verändert. Die Datenbankregion beschreibt Firestore; Firebase Hosting verwendet die Infrastruktur des Anbieters zur Auslieferung der öffentlichen Programmdateien. Node.js wird auf dem Entwicklungsrechner für Build, Tests und Bereitstellung benötigt, nicht als laufender Webserver.

## Was die gemeinsame Demo bedeutet

Der äußere Demo-Zugang ist ein echtes Firebase-Konto. Nur ein angemeldetes, vom Betreiber mit `trainingDemo=true` freigeschaltetes Konto darf seinen eigenen Demobereich lesen und schreiben. Eine selbst angelegte E-Mail-Anmeldung erhält diesen Claim nicht und bekommt keinen Datenzugriff. Es gibt kein Registrierungsformular. Firebase-Kennwort und Admin-Zugänge gehören weder in Quellcode noch in Umgebungsdateien für den Browser-Build.

Innerhalb dieses Zugangs können alle Besucher Patienten-, Therapie- und Administrationsansicht auswählen. Diese Rollen sind eine Simulation mit denselben Beispieldaten; sie sind keine voneinander abgeschotteten persönlichen Praxiszugänge. Die Demo unterstützt Plan- und Übungsbearbeitung, Versionen, Freigabeprüfungen, Einladungsabläufe, Trainingsverlauf, PDF und JSON-Auskunft. Innere Einladungen und Konten dienen nur der Vorführung und besitzen kein echtes Mitarbeiter-TOTP. Die Node-Praxisinstallation behält ihre serverseitige Rollenprüfung und Mitarbeiter-Zwei-Faktor-Anmeldung.

Bei der Einrichtung wurden **48 sichtbare Übungen, vier erfundene Personen und ein Beispielplan** aus einer frisch erzeugten temporären Datenbank übernommen. Bestehende lokale Demo-/Praxisdatenbanken wurden nicht gelesen oder hochgeladen. Änderungen im Cloud-Demobereich bleiben erhalten und sind für alle Besucher mit demselben Zugang sichtbar. Keine echten Patientendaten oder vertraulichen Medien eingeben. Browseranmeldung gilt für die jeweilige Browsersitzung; Abmelden entfernt zusätzlich temporäre Medien-URLs und die gewählte Demo-Rolle aus dem Arbeitsspeicher beziehungsweise Sitzungsspeicher.

Allgemeine Übungsbilder, Beispielvideos und Programmdateien werden als öffentliche statische Dateien unter `/demo-assets/` ausgeliefert. Diese enthalten keine Personenakten oder Zugangsdaten. Das Programm-HTML ist ebenfalls öffentlich erreichbar und zeigt die Anmeldeseite. Die gemeinsame Cloud-Datenbank und neu hochgeladene Dateien liegen hinter Firebase Authentication und Firestore-Regeln. Dies ersetzt die frühere HTTP-Basic-Abfrage vor sämtlichen Dateien durch einen Anwendungszugang.

## Daten und Uploads

`demoStates/{firebaseUid}` enthält einen versionierten JSON-Demostand mit Eigentümer, Schema, fortlaufender Revision und Zeitstempeln. Der Client begrenzt das JSON auf 850.000 UTF-8-Bytes; Firestore-Regeln prüfen zulässige Felder, Typen, Eigentümer und Revisionen. Transaktionen verhindern das Überschreiben zwischenzeitlicher Änderungen. Das Modell ist bewusst für eine kleine gemeinsame Vorführung ausgelegt und keine Produktionsdatenbank für viele Patienten. Voller Speicher erzeugt einen sichtbaren Fehler; ein neuer Stand wird nicht automatisch über vorhandene Daten geschrieben.

Eigene Uploads liegen unter `demoStates/{uid}/media/{uuid}` mit unveränderlichen Metadaten und Base64-Teilen in `chunks/{index}`. JPEG/PNG/WebP werden im Browser decodiert, auf maximal 1.600 Pixel Breite verkleinert und neu als WebP ohne Originalmetadaten gespeichert. MP4/WebM sowie zeitcodierte VTT-Untertitel werden anhand von Signatur beziehungsweise Inhalt geprüft. Maximal 50 MiB pro Datei; begrenzte Teilanfragen verhindern übergroße Firestore-Schreibanfragen. Erst nach vollständiger Übertragung wird die Datei im Demostand eingetragen; abgefangene Fehler lösen eine Bereinigung der Teile aus. Ein hart geschlossener Browser kann unvollständige, weiterhin private Uploadteile hinterlassen; diese muss ein Betreiber bei Bedarf löschen.

Dateien werden für die Anzeige vollständig geladen; es gibt kein adaptives Streaming. Häufige große Videos verbrauchen das kostenlose Kontingent schnell. Für umfangreichen Medienbetrieb ist ein geeigneter Objektspeicher mit gesondertem Zugriffs- und Kostenkonzept erforderlich. Weder Firebase Storage, Cloud Functions, App Hosting noch ein kostenpflichtiger Server wurden aktiviert. Kostenpflichtige Erweiterungen sind kein Bestandteil dieses Auftrags.

## Build und Bereitstellung

Voraussetzung: Node.js 24 oder neuer, npm und eine für das Trainingsprojekt berechtigte Firebase-CLI-Anmeldung. Für Regeltests zusätzlich Java 21 oder neuer. Die Firebase-CLI über `npx -y firebase-tools@latest` verwenden.

Eine ungetrackte `.env.firebase` im Projektstamm enthält die öffentliche Web-App-Konfiguration aus Firebase sowie folgende Einstellungen; Platzhalter vor Verwendung ersetzen:

```dotenv
VITE_BACKEND=firebase
VITE_FIREBASE_CONFIG='{"apiKey":"<öffentlicher Web-API-Schlüssel>","authDomain":"physio-lfd-training.firebaseapp.com","projectId":"physio-lfd-training","appId":"<Web-App-ID>"}'
VITE_FIRESTORE_DATABASE=demo
VITE_DEMO_LOGIN_NAME=<Demo-Benutzername>
VITE_DEMO_LOGIN_EMAIL=<E-Mail des freigeschalteten Firebase-Kontos>
```

`VITE_*`-Werte werden in den Browser-Build eingebaut und sind öffentlich. Dort niemals Passwörter, Admin-Schlüssel oder Service-Account-Dateien hinterlegen. Die Firebase-Webkonfiguration ist ein öffentlicher Clientbezeichner; den Datenzugriff erzwingen die Regeln und der signierte Claim. `.firebaserc` und die Buildprüfung binden die Bereitstellung an das getrennte Trainingsprojekt.

```powershell
npm ci
npm test
npm run test:firebase-rules
npm run build
npm run build:firebase
npx -y firebase-tools@latest deploy --only hosting,firestore,auth --project physio-lfd-training
```

`npm run deploy:firebase` fasst Firebase-Build und Bereitstellung zusammen. Der Build erzeugt ausschließlich aus einer neuen temporären synthetischen SQLite-Datenbank `output/firebase-demo-seed.json`. Diese Datei wird **nicht** öffentlich ausgeliefert. Statische Bibliotheksmedien landen in `output/firebase-public/demo-assets/`; Vite erstellt `output/firebase-dist/`. Der normale Node-Build filtert diese generierten Demomedien aus und schreibt nach `dist/`.

Die einmalige Datenanlage erfolgt mit `scripts/seed-firebase-demo.mjs`, nachdem das freigeschaltete Firebase-Konto vom Betreiber angelegt wurde. Der Prozess erwartet das Passwort ausschließlich als JSON auf **stdin**, nicht als Kommandozeilenargument oder Datei. Er prüft Projekt und Claim und verweigert das Überschreiben eines vorhandenen Demostands. Normale Builds und Deployments ändern vorhandene Demodaten nicht. Vor Änderungen am Datenschema einen geschützten Export des Demostands sichern; das Node-/SQLite-Backupwerkzeug sichert Firestore nicht.

## Regeln, Tests und veröffentlichte Version

`firestore.rules` verweigert alle nicht ausdrücklich erlaubten Pfade. Lesen und Schreiben setzen passenden Eigentümer und signierten Demo-Claim voraus. Eigentümer/Erstellungszeit sind unveränderlich; Änderungen benötigen exakt die nächste Revision und einen Serverzeitstempel. Medien und Teile sind nach Anlage unveränderlich. Querschnittsabfragen, fremde Demobereiche und eine Rollenfreischaltung durch selbst geschriebene Kontofelder werden abgewiesen.

Geprüft wurden 69 Anwendungs-/Domain-Tests und sechs Gruppen von Firestore-Emulatortests: nicht angemeldete oder nicht freigeschaltete Konten, Eigentümerwechsel, fehlende/zusätzliche Pflichtfelder, falsche Datentypen, Revisions-/Zeitstempelmanipulation, kontenübergreifende Zugriffe, verwaiste Medien, Teilgrößen/-indizes, wiederholte Teilanlage und mehrere begrenzte Uploadanfragen. Erwartete Regelablehnungen sind erfolgreiche Angriffstests. Der Windows-Teststarter unterdrückt zusätzliche Java-Konsolenfenster und bereinigt ausschließlich Emulatorprozesse dieses Testprojekts und dieses Checkout-Regelpfads.

Browserprüfung auf Firebase: falsches Passwort abgewiesen, richtiger Zugang akzeptiert, Übungsbilder geladen, Beispieländerung nach Neuladen erhalten und zurückgesetzt, Bild-Upload mit privaten Firestore-Teilen und anschließender Testbereinigung sowie PDF-Download erfolgreich. Version und Datum werden auf Anmeldung und im App-Menü angezeigt. Hosting liefert HTTPS, restriktive Content-Security-Policy, Frame-Schutz und `no-store`. Abhängigkeiten wurden ohne gemeldete npm-Sicherheitslücken geprüft.

Die Wunschdomain bleibt bis zur DNS-Umstellung ausdrücklich ungeprüft. [DNS-Auftrag für den Administrator](DNS-TRAINING.md). Nach Umstellung Anmeldung, PDF, Bilder sowie sichtbare Version und Datum auch auf dieser Domain kontrollieren.
