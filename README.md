# Physio Gregor Drößler – Mein Übungsplan

Erste funktionsfähige Entwicklungsfassung für die Physiopraxis Gregor Drößler in Leinefelde. Version **0.1.23-dev**, Versionsdatum **22.10.2026**, Zeitzone **Europe/Berlin**.

Privates GitHub-Repository: https://github.com/petdro63/physio-gregor-droessler

## Lokal ausprobieren

Voraussetzung: Node.js 24 und npm.

```powershell
npm ci
npm run dev
```

`npm run dev` prüft beim Start und alle 60 Sekunden den GitHub-Branch `master`, übernimmt neue Versionen und startet die lokale Vorschau automatisch neu. Danach genügt das Neuladen der Browserseite. Das Terminal muss geöffnet bleiben. Lokale Änderungen oder abweichende Commits pausieren Updates; ohne Netzwerk bleibt die bisherige Version verfügbar. Ohne automatische Updates: `npm run dev:manual`. [Details und einmalige Einrichtung](docs/AUTOMATISCHE-UPDATES.md).

Öffnen: **http://localhost:3180**. Auf der Anmeldeseite „Patientenansicht entdecken“ oder „Praxisansicht öffnen“ wählen. Die Auswahl oben wechselt zwischen Patienten-, Therapie- und Administrationsansicht.

Die Vorschau nutzt ausschließlich erfundene Personen. Demo- und Praxisdatenbanken liegen getrennt in `data/demo` und `data/practice`. Weder Datenbanken, Sitzungsschlüssel, Backups noch lokale Umgebungsdateien werden in Git gespeichert. Die Demo läuft standardmäßig nur an der lokalen Loopbackadresse.

## Enthalten

- Vier neue Stützübungen mit deutschen Anleitungen und jeweils leichter Kniestütz-Variante; zusätzlich seitliches Hüftheben auf den Knien. Statische Stützübungen werden in Sekunden, dynamische in Wiederholungen dosiert. [Bilder, Prompts und Quellen](docs/PLANK-STUETZVARIANTEN.md).
- Bereinigte Übungsliste mit 31 Einträgen: Kraftübungen und Varianten sowie Katze–Kuh, Oberkörperrotation im Sitz und Piriformisdehnung in Rückenlage. Frühere entfernte Einträge bleiben ausgeschlossen; vorhandene Pläne und Verläufe bleiben erhalten.
- Oberkörperrotation im Sitz als statisches Start-/Endbild mit frontalem Ausgangssitz, ruhigem Becken und Drehpfeil. Die bisherige Piriformis-Grafik bleibt auf Nutzerwunsch erhalten. [Details und Bildprompt](docs/OBERKOERPERROTATION-SITZ.md).
- Katze–Kuh und Piriformisdehnung mit neuen Bildpaaren im bisherigen Stil. Bei der Piriformisdehnung liegt der rechte Knöchel auf dem linken Kniebereich; Haltedauer in Sekunden. [Bilder, Anleitungen und Prompts](docs/KATZE-KUH-PIRIFORMIS.md).
- Seitliche Ausfallschritte ohne Gewicht, mit Kurzhantel und mit Langhantel sowie exzentrische Quadrizeps-Kräftigung über langsames Absenken von einer niedrigen Stufe. Eigene Bilder im bisherigen Stil und Format. [Details, Quellen und Prompts](docs/SEITLICHE-AUSFALLSCHRITTE-STEPDOWN.md).
- Neue Ausfallschritte ohne Gewicht, mit Kurz- und Langhantel sowie seitliches Hüftheben im Unterarm-Seitstütz. Bei der einbeinigen Brücke ist das rechte Bein in beiden Bildern angehoben. [Bilder, Anleitungen und Prompts](docs/AUSFALLSCHRITTE-UND-HUEFTHEBEN.md).
- Wandsitz mit Sekunden Haltedauer statt Wiederholungen im Planeditor, auf Übungskarten, im Training und im PDF. Neue Start-/Endbilder für Wandsitz und beide Brücken; breite Variante in „Breitbeinige Kniebeugen“ umbenannt. [Details, Bilder und Prompts](docs/WANDSITZ-UND-BRUECKEN.md).
- Sechs neue Stand-Kraftübungen mit eigenen Start-/Endbildern aus der vorhandenen App-Figur. Breite Variante mit stärkerer Kniebeugung und aufrechtem Rücken korrigiert. [Anleitungen, Quellen und Bildherkunft](docs/STAND-KRAFTUEBUNGEN.md).
- Einbeiniges Kreuzheben mit Kurzhanteln und Langhantel: eigene neue Start-/Enddarstellungen, Anleitung und Filterzuordnung. Die Nutzer-Originalgrafik wird nicht ausgeliefert. [Bildherkunft und Details](docs/EINBEINIGES-KREUZHEBEN.md).
- Neues sportliches Design mit klarer Gelenkauswahl. Broschürenfilter und Broschürenliste entfernt; Quellen an den Übungen bleiben erhalten. [Gestaltung, Bildherkunft und offene Abdeckung](docs/DESIGN-UND-BILDER.md).

- Responsive Patientenansicht mit persönlichem Trainingsplan und Übungskarten.
- Bilder als eigene schematische SVG-Illustrationen, technisches MP4-Demovideo und beschriebene Übungsbeispiele.
- Ein externes Originalvideo mit einer realen Person beim Kniebeispiel; datensparsame Einbettung erst nach bewusstem Laden, mit Quelle und direktem Originallink.
- Eine eigene, durchgehend animierte 3D-Kniestreckung mit gesichtsneutraler Figur, deutscher Erklärung und deutschen Untertiteln. Direkt öffnen: `/?uebung=knie-strecken&video=eigenes`.
- Geführtes Training mit Timer, erledigten/ausgelassenen Übungen, freiwilliger Rückmeldung und Verlauf.
- Drei serverseitig durchgesetzte Rollen, Patientenzuordnungen, Freischaltung, Sperrung und Zugriffsablauf.
- Einmalige Einladungen mit 48 Stunden Gültigkeit und QR-Code; keine offene Registrierung.
- Passwortanmeldung, verpflichtende TOTP-Zwei-Faktor-Anmeldung für Mitarbeiter, verschlüsselte TOTP-Geheimnisse.
- Übungseditor, geschützte Bild-/Video-Uploads mit Inhaltsprüfung, Redaktionsstatus und Freigabeprüfung.
- Übungs- und Trainingsplanversionen; alte Trainingseinträge verweisen auf ihre ursprünglichen Versionen.
- Suchbare Bibliothek mit kombinierten Filtern für Trainingsart (Kraft/Mobilisation/Dehnung), Gelenke, Zielmuskeln, Hilfsmittel und Ausgangsstellung; Sortierung nach Gelenk, Trainingsart oder Name.
- Abdeckungskatalog, individuelle Dosierung und Planreihenfolge.
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

## Erweiterung Reha und Evidenz (19.10.2026)

Die aktuelle Übungsliste enthält 31 Einträge einschließlich Unterarmstütz, Liegestütz, Unterarmstütz mit Beinheben und Seitstütz mit leichten Kniestütz-Varianten. Frühere Rechercheeinträge erscheinen nicht mehr in der Sammlung. Ihre versionierten Daten bleiben für bestehende Pläne und Trainingsverläufe erhalten. Die interne Herkunftsdokumentation bleibt nachvollziehbar; Original-PDFs und deren Fotos werden nicht ausgeliefert.

Unter **Krankheitsbilder & Evidenz** findet das Praxisteam ausdrücklich zugeordnete Vorschläge nach Diagnose, Phase und Behandlungsvariante für lumbalen Bandscheibenvorfall, vorderen Kreuzbandriss, Knie-/Hüft-/Schulter-TEP, Frozen Shoulder sowie CMD und unspezifische Nackenschmerzen. Studienkarten unterscheiden Programm-/Verfahrensnachweise von unbewiesenen Einzelübungen. Die Entspannungsseite erklärt PIR und zeigt zugängliche Entspannungsübungen.

Vier gemeinfreie CDC-Animationen sind als lokale Bilder und MP4 mit deutschen Untertiteln eingebettet. Herkunft, Nutzung und Bearbeitungen sind dokumentiert. **Die neuen Einträge sind nicht automatisch fachlich freigegeben.**

- [Quelleninventar, Zuordnungen und Evidenz](docs/REHA-EVIDENZ.md)
- [Medienrechte und Bearbeitungen](docs/MEDIEN-LIZENZEN.md)

## Stand der Inhalte

**Die 31 Einträge der aktuellen Sammlung sind Entwürfe und noch nicht für den realen Patienteneinsatz fachlich freigegeben.** Historische technische Beispiele und deren schematische Videos bleiben ebenfalls ungeprüft. Neue Übungen können nach Bedarf wieder in die Sammlung aufgenommen werden; Demoübungen können nicht durch einen bloßen Statuswechsel produktiv freigegeben werden.

Lizenz der schematischen Medien: im Projekt selbst erzeugt, ohne fremde Patientenaufnahmen. Es wurde keine externe Übungsbibliothek übernommen und keine Lizenz bestehender Anbieter vorausgesetzt.

Die Anwendung ist lokal lauffähig. Eine Veröffentlichung auf `physio.vitalcoaching.eu` wurde noch nicht vorgenommen. Der Produktivbetrieb benötigt die in der Betriebsdokumentation genannten Betreiberangaben, Freigaben und Infrastrukturkonfigurationen.
