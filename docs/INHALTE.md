# Inhaltsstand und Abdeckung

Stand 19.10.2026: 12 technische Demonstrationsübungen und 18 neue Rechercheentwürfe, **0 fachlich freigegebene Übungen**. Es liegen keine lizenzierten Fremdinhalte oder echten Praxisvideos vor. Die 12 Beispiele sind ausdrücklich keine vollständige Sammlung aller gängigen Übungen.

| Bereich | Demonstration | Für den Produktivbestand noch erforderlich |
| --- | --- | --- |
| Halswirbelsäule/Nacken | Kopf behutsam drehen | Differenzierter Übungskatalog, geprüfte Beschreibung, eigene Bilder und Video |
| Brustwirbelsäule/Brustkorb | Brustkorb öffnen | Fachliche Prüfung und Originalmedien |
| Lendenwirbelsäule/Rumpf | Becken anheben | Fachliche Prüfung, Varianten und Originalmedien |
| Schulter/Schulterblatt | Schultern sanft kreisen | Fachliche Prüfung und Originalmedien |
| Ellenbogen/Unterarm | Ellenbogen beugen und strecken | Fachliche Prüfung und Originalmedien |
| Hand/Finger | Hände öffnen und schließen | Fachliche Prüfung und Originalmedien |
| Hüfte/Becken | Bein seitlich führen | Fachliche Prüfung und Originalmedien |
| Knie | Knie im Sitzen strecken | Fachliche Prüfung und Originalmedien |
| Fuß/Sprunggelenk | Fersen im Sitzen heben | Fachliche Prüfung und Originalmedien |
| Mobilisation/Beweglichkeit | In den regionalen Beispielen enthalten | Systematisch ausdifferenzieren und prüfen |
| Kräftigung/Stabilisation | In den regionalen Beispielen enthalten | Systematisch ausdifferenzieren und prüfen |
| Dehnung | Noch kein Beispiel | Fachlichen Katalog und vollständige Medien erstellen |
| Gleichgewicht/Koordination | Gewicht sicher verlagern | Fachliche Prüfung und Originalmedien |
| Gangschule/Alltag | Vom Stuhl aufstehen | Gangübungen ergänzen, fachlich prüfen und bebildern |
| Atmung/Entspannung | Ruhig in den Bauch atmen | Fachliche Prüfung und Originalmedien |
| Senioren/Sturzprävention | Vom Stuhl aufstehen | Weitere geeignete Varianten, Freigabe und Originalmedien |

Die Abdeckung in der App unterscheidet Beispiele und tatsächlich freigegebene Inhalte. Auch eine hohe Anzahl von Varianten beweist keine Vollständigkeit. Die Praxis soll einen verbindlichen Abdeckungskatalog festlegen; Lücken werden anhand dieses Katalogs geschlossen.

## Medien

- `src/Illustration.tsx`: selbst gezeichnete schematische Figuren und Bewegungsphasen, keine fotografische Anleitung.
- `server/assets/movement.mp4`: sechs Sekunden selbst erzeugte schematische Bewegung zur Demonstration des Videoplayers. Absichtlich als technische Demonstration beschriftet, keine übungsspezifische therapeutische Anleitung.
- `server/assets/captions.vtt`: passende deutsche Beschriftung des Demovideos.
- `scripts/generate-demo-video.py`: reproduzierbare Erstellung mit Pillow und imageio-ffmpeg; nur zur Medienentwicklung notwendig.

In den selbst erstellten schematischen Medien ist keine echte Person abgebildet. Medizinisch relevante Bewegungsdetails sind durch eine solche technische Darstellung nicht validiert. Für veröffentlichte Übungen sind geeignete fachlich geprüfte Aufnahmen erforderlich.

## Eigene 3D-Animation mit deutscher Tonspur

Für „Knie im Sitzen strecken“ gibt es zusätzlich ein vollständig selbst erstelltes 16-Sekunden-Video mit einer stilisierten, gesichtsneutralen 3D-Figur. Das Video ist eine Animation und keine Filmaufnahme einer realen Person. Modell, Stuhl, Umgebung, Beleuchtung, Bewegungsablauf und Textgrafiken sind im Projekt erstellt. Es wurde kein fremder Videoclip oder Bildausschnitt übernommen.

- `server/assets/knie-avatar-de.mp4`: 1280 × 720, H.264/AAC, kontinuierliche Animation.
- `server/assets/knie-avatar-de.vtt`: deutscher Sprechertext als zeitcodierte Untertitel.
- `server/assets/knie-avatar-de-poster.jpg`: Vorschaubild der eigenen Animation.
- `server/assets/knie-strecken-de-voice.wav`: selbst formulierter deutscher Sprechertext, mit der lokal installierten Windows-Stimme Microsoft Katja synthetisiert; keine Stimmkopie einer fremden Person.
- `scripts/knee-video-studio.html` und `.js`: ursprüngliche 3D-Szene und Videoaufnahme mit Three.js/Canvas. Three.js wird als Entwicklungsabhängigkeit verwendet; die Patientenansicht spielt die fertige MP4-Datei ab.
- `scripts/create-knee-voice.ps1`: reproduzierbare Erstellung der Tonspur auf einem Windows-System mit dieser Stimme.
- `scripts/finish-knee-video.py`: MP4-Export mit deutscher Tonspur, Poster und Untertiteln aus der eigenen WebM-Aufnahme.

Der lokale Einstieg lautet `/?uebung=knie-strecken&video=eigenes`. In der Übung kann zwischen eigenem deutschem Video und dem externen englischen Originalbeispiel gewechselt werden. Die eigenen Medien werden ausschließlich über die geschützte API für diese Übung ausgeliefert; es gibt keine Verbindung zu einem externen Videoanbieter.

Zur erneuten Produktion nach `npm ci` und `npm run dev` zuerst die Patientendemonstration öffnen und anschließend lokal `/scripts/knee-video-studio.html` aufrufen. Dort die Bewegung prüfen, „16-Sekunden-Video erstellen“ wählen und die eigene WebM-Datei herunterladen. Mit `python scripts/finish-knee-video.py PFAD_ZUR_WEBM_DATEI` werden die App-Medien erzeugt. Die benötigten Python-Pakete sind Pillow (für ältere Demonstrationen) und imageio-ffmpeg. Das Produktionswerkzeug ist kein Patientenmenü und wird nicht in die statische App-Ausgabe eingebaut.

Die Animation bleibt ein Demonstrationsentwurf: Bewegungsführung, Darstellung und Dosierung sind vor therapeutischer Nutzung durch die Praxis fachlich zu prüfen. Die Existenz eines eigenen Videos bewirkt keine fachliche Freigabe der Demoübung.

## Externes Beispiel mit einer realen Person

Bei „Knie im Sitzen strecken“ ist im Demomodus ein externes Originalvideo der **Cambridge University Hospitals NHS Foundation Trust** eingebettet: „Early knee exercises – phase 1“, YouTube-ID `AmpUL3sOz5g`, Ausschnitt ab 03:12. Quelle: https://www.cuh.nhs.uk/our-services/physiotherapy-outpatients/outpatient-physio-resources/resources/knee/early-knee-exercises/

Das Beispiel öffnet sich direkt unter `/?uebung=knie-strecken&video=menschen`, sobald ein berechtigter Demozugang aktiv ist. Der Originalplayer von youtube-nocookie.com wird erst nach „Beispielvideo laden“ angefordert. Es gibt vorher keine externen Vorschaubilder oder Videoabrufe. Das Beispiel übermittelt keine Patientenfelder an den Anbieter; beim Laden fallen die üblichen technischen Verbindungsdaten an. Schließen entfernt den Player wieder.

Originalsprache ist Englisch; das veröffentlichte Transkript bleibt auf der Quellseite verlinkt. Die fremde Videodatei wurde nicht heruntergeladen oder in Git übernommen. Aus der Einbettung wird keine Lizenz zur eigenen Vervielfältigung oder zur Integration einer vollständigen Produktivbibliothek abgeleitet. Die übrigen Demoaufnahmen und der Freigabestatus sind unverändert; das Beispiel ist keine individuelle Therapieverordnung.

## Redaktionsweg

Entwurf → fachliche Prüfung → Freigabe → Archivierung. Jede inhaltliche Änderung erzeugt eine neue Version und beginnt erneut als Entwurf. Übungsdosierung wird im individuellen Plan festgelegt; es gibt keine automatische Ableitung aus einer Diagnose.

Für jede produktive Übung dokumentieren: Inhalt/Variante, Autor, Prüfer, Prüfdatum, Quelle, Rechteinhaber, erlaubte Nutzung, Laufzeit, gegebenenfalls Modelrelease sowie deutschsprachige Untertitel und Transkript. Eine technische Pflichtfeldprüfung ersetzt die Prüfung der tatsächlichen Rechte und Inhalte nicht.

## Spezialisierte Module

Postoperative Rehabilitation, Neurologie, Beckenbodentraining und andere Spezialbereiche sind gesondert zu planen und durch entsprechend qualifizierte Fachpersonen freizugeben. Sie sind nicht als fertig enthalten ausgewiesen.


## Katalogerweiterung vom 19.10.2026

Die lokale Demo enthält zusätzlich 18 eigene deutsche Textentwürfe: drei Hantelübungen, drei Therabandübungen, zwei Stabübungen, vier Pezziballübungen, zwei Übungen im Vierfüßlerstand, Wandliegestütz, Brustdehnung im Sitz, Wadendehnung im Stand und Rumpfdrehung im Sitz. Sie werden einmalig als Entwürfe ergänzt; bestehende Bearbeitungen bleiben bei Neustarts erhalten. Im Praxisbetrieb werden keine Rechercheübungen automatisch eingespielt.

Jede Übung besitzt strukturierte `trainingTypes`, `joints` und `strengthMuscles`. Mehrfachzuordnungen sind möglich. Die Typen Kraft, Mobilisation und Dehnung werden getrennt geführt. Koordination und Entspannung bleiben zusätzliche Kategorien für die bestehenden Gleichgewichts- und Atembeispiele. `strengthMuscles` beschreibt ausschließlich Kräftigungsziele, nicht bloß bei einer Bewegung beteiligte oder gedehnte Muskeln. Bei Mobilisation und Dehnung ist diese Liste leer. Die anatomischen Zuordnungen sind redaktionelle Vorschläge und vor Veröffentlichung fachlich zu prüfen.

Die Bibliothek kombiniert Suche und Filter nach Typ, Gelenk, Zielmuskel, Hilfsmittel, Ausgangsstellung, Körperregion, Trainingsziel und Schwierigkeit. Standardmäßig wird nach Gelenk, dann nach Übungsname sortiert; bei Mehrgelenkübungen dient das alphabetisch erste Gelenk als Sortierschlüssel. Ein Gelenkfilter findet die Übung über jede ihrer Gelenkzuordnungen. Die Zuordnungen können im Übungseditor geändert werden und werden mit der nächsten Inhaltsversion gespeichert. Migration 004 ergänzt ausschließlich Klassifikationsmetadaten der zwölf ursprünglichen Beispiele; Anleitungen, Versionsnummern und Planreferenzen bleiben erhalten.

### Recherche und Quellen

Öffentliche Produktdokumentationen von [Rehab Guru](https://feedback.rehabguru.com/en/help/articles/10118487-searching-for-exercises-in-the-exercise-library) und [Physitrack](https://support.physitrack.com/article/372-lesson-1-assign-your-first-program) zeigen vergleichbare Suchmöglichkeiten nach Ziel, Muskel, Gelenk, Hilfsmittel und Position. Es wurde kein Zugriff auf private oder kostenpflichtige Kataloge vorgenommen.

Die Entwürfe enthalten einzeln verlinkte Quellen aus den offiziellen Informationen von [NHS](https://www.nhs.uk/live-well/exercise/strength-exercises/), [Dynamic Health](https://www.dynamichealth.nhs.uk/help-and-advice/shoulder-pain/), [Royal National Orthopaedic Hospital](https://www.rnoh.nhs.uk/patients-and-visitors/patient-information-guides/looking-after-your-shoulders-following-spinal-cord-injury-sci-patients-guide), [Royal Free London](https://www.royalfree.nhs.uk/services/therapy-services/physiotherapy/musculoskeletal-outpatient-physiotherapy) und [KMPT](https://www.kmpt.nhs.uk/media/2612/km1237-physiotherapy-gym-ball-exercise-guide.pdf). Weitere Quellen sind die NHS-Seiten zu [Sitzübungen](https://www.nhs.uk/live-well/exercise/sitting-exercises/) und [Dehnung](https://www.nhs.uk/live-well/exercise/flexibility-exercises/). Rechercheabruf: 19.10.2026. Spezifische Erkrankungs- oder Operationsprotokolle werden dadurch nicht zu allgemeinen Behandlungsfreigaben.

Die Beschreibungen sind eigenständig formuliert. Keine fremden Bilder, Videos, Dosierungsprogramme oder geschlossenen App-Inhalte wurden importiert. Zu den 18 neuen Entwürfen fehlen noch eigene oder lizenzierte Übungsmedien, die Prüfung der konkreten Eignung und die individuelle Dosierung. Die vorhandene Freigabeprüfung bleibt aktiv.


## Weitere Erweiterung: Hirslanden, Reha und PIR

Die Demo umfasst nun 167 Einträge. Zu allen 15 PDFs der Hirslanden-Broschürenseite wurden 131 eigene Kurzfassungen ergänzt, dazu sechs weitere Einträge für Korken, PIR und Reha. Wiederholte Varianten sind teilweise zusammengefasst. Die neuen Inhalte bleiben redaktionelle Entwürfe. Original-PDFs und deren Fotografien sind nicht Bestandteil der App.

Die Übersicht [Reha-Katalog und Evidenz](REHA-EVIDENZ.md) dokumentiert die 15 Quellen, acht Krankheitsbild-/Verfahrensbereiche, 13 Studien-/Leitlinienkarten, Zuordnungsregeln und Grenzen. Vier freie CDC-Mediensätze liefern je zwei Standbilder und ein MP4 mit eigenen deutschen Untertiteln. [Herkunft und Nutzung](MEDIEN-LIZENZEN.md) sind dokumentiert.
