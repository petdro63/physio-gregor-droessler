# Physio Gregor Drößler – Mein Übungsplan

Erste funktionsfähige Entwicklungsfassung für die Physiopraxis Gregor Drößler in Leinefelde. Version **0.1.5-dev**, Versionsdatum **18.10.2026**, Zeitzone **Europe/Berlin**.

Privates GitHub-Repository: https://github.com/petdro63/physio-gregor-droessler

## Lokal ausprobieren

Voraussetzung: Node.js 24 und npm.

```powershell
npm ci
npm run dev
```

Öffnen: **http://localhost:3180**. Auf der Anmeldeseite „Patientenansicht entdecken“ oder „Praxisansicht öffnen“ wählen. Die Auswahl oben wechselt zwischen Patienten-, Therapie- und Administrationsansicht.

Die Vorschau nutzt ausschließlich erfundene Personen. Demo- und Praxisdatenbanken liegen getrennt in `data/demo` und `data/practice`. Weder Datenbanken, Sitzungsschlüssel, Backups noch lokale Umgebungsdateien werden in Git gespeichert. Die Demo läuft standardmäßig nur an der lokalen Loopbackadresse.

## Enthalten

- Responsive Patientenansicht mit persönlichem Trainingsplan und Übungskarten.
- Bilder als eigene schematische SVG-Illustrationen, technisches MP4-Demovideo und beschriebene Übungsbeispiele.
- Ein externes Originalvideo mit einer realen Person beim Kniebeispiel; datensparsame Einbettung erst nach bewusstem Laden, mit Quelle und direktem Originallink.
- Geführtes Training mit Timer, erledigten/ausgelassenen Übungen, freiwilliger Rückmeldung und Verlauf.
- Drei serverseitig durchgesetzte Rollen, Patientenzuordnungen, Freischaltung, Sperrung und Zugriffsablauf.
- Einmalige Einladungen mit 48 Stunden Gültigkeit und QR-Code; keine offene Registrierung.
- Passwortanmeldung, verpflichtende TOTP-Zwei-Faktor-Anmeldung für Mitarbeiter, verschlüsselte TOTP-Geheimnisse.
- Übungseditor, geschützte Bild-/Video-Uploads mit Inhaltsprüfung, Redaktionsstatus und Freigabeprüfung.
- Übungs- und Trainingsplanversionen; alte Trainingseinträge verweisen auf ihre ursprünglichen Versionen.
- Suchbare und filterbare Bibliothek, Abdeckungskatalog, individuelle Dosierung und Planreihenfolge.
- PDF-Export mit Bildern, Datenauskunft als JSON, Praxisverwaltung, Teameinladungen und Auditprotokoll.
- PWA-Manifest und datensparsame Offline-Seite; kein Offlinecache für Gesundheitsdaten.
- Verschlüsselte Backups einschließlich Datenbank und Medien sowie getestete Wiederherstellung.
- GitHub Actions für Build und Zugriffstests.

## Architektur

React/TypeScript und Vite für die Oberfläche; Express für die serverseitige Geschäftslogik; SQLite mit versioniertem SQL-Schema für relationale Daten. Medien liegen außerhalb des öffentlichen Webverzeichnisses. Express-Session verwendet einen eigenen SQLite-Store. bcryptjs, OTPAuth, Helmet, express-rate-limit und Zod übernehmen etablierte Authentifizierungs- und Schutzbausteine.

Geschützte Antworten tragen `Cache-Control: private, no-store`. Schreibende Anfragen benötigen einen sitzungsgebundenen CSRF-Token und einen passenden Origin. Jede Anfrage prüft Rolle, Patientenzuordnung, aktuellen Kontostatus und Zugriffslaufzeit. Medien werden ausschließlich über berechtigte API-Anfragen ausgeliefert.

Die erste Fassung ist für eine einzelne Praxis ausgelegt. Die aktuelle Node-SQLite-API wird von Node noch als experimentell markiert; für eine größere Installation kann die klar getrennte Datenzugriffsschicht auf PostgreSQL umgestellt werden.

## Prüfung

```powershell
npm run build
npm test
```

Die Integrationstests prüfen tatsächliche HTTP-Zugriffe auf isolierte temporäre Datenbanken: Patiententrennung, Rollen, CSRF, Sperrung, abgelaufene Zugänge, Einladungen, TOTP inklusive Wiederverwendungsschutz, Medienprüfung, Freigabesperren, Planhistorie, PDF und Backup/Wiederherstellung.

## Dokumentation

- [Betrieb und Hosting](docs/BETRIEB.md)
- [Praxisanleitung](docs/PRAXISANLEITUNG.md)
- [Inhalte und Abdeckung](docs/INHALTE.md)
- [Datenmodell und Entscheidungen](docs/ARCHITEKTUR.md)

## Stand der Inhalte

**Keine Übung ist für den realen Patienteneinsatz fachlich freigegeben.** Die 12 Beispiele und das schematische Video zeigen die Technik. Das Video ist keine bewegungsspezifische Therapieanleitung. Eine vollständige Bibliothek aller gängigen Praxisübungen bleibt das Ziel; ihr Ausbau benötigt eigene oder lizenzierte Originalmedien und fachliche Prüfung. Demoübungen können nicht durch einen bloßen Statuswechsel produktiv freigegeben werden.

Lizenz der schematischen Medien: im Projekt selbst erzeugt, ohne fremde Patientenaufnahmen. Es wurde keine externe Übungsbibliothek übernommen und keine Lizenz bestehender Anbieter vorausgesetzt.

Die Anwendung ist lokal lauffähig. Eine Veröffentlichung auf `physio.vitalcoaching.eu` wurde noch nicht vorgenommen. Der Produktivbetrieb benötigt die in der Betriebsdokumentation genannten Betreiberangaben, Freigaben und Infrastrukturkonfigurationen.
