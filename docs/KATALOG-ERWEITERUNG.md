# Übungskatalog 0.1.8-dev

## Umfang und Zählweise

Die Erweiterung enthält 1.200 zusätzliche redaktionelle Variantenentwürfe: für Schulter-, Ellenbogen-, Hand-, Hüft-, Knie- und Sprunggelenk jeweils 25 Grundmuster mit acht Varianten, also 200 Einträge pro Gelenk. Bestehende Übungen bleiben zusätzlich erhalten. Das sind **keine 1.200 unabhängig untersuchten Grundübungen**. Die Zählung umfasst unterschiedliche Kontraktionsformen, Unterstützung, Last und Bewegungskontrolle. Rechts/links, Wiederholungszahlen und Haltezeiten werden nicht als zusätzliche Übungen gezählt.

Jede Variante enthält Ausgangsstellung, Ablauf, Endstellung, Zielgelenk, Trainingsart, bei Kraftübungen Zielmuskeln, Hilfsmittel und Quellenhinweis. Die Varianten sind eigene Übertragungen verwandter Grundmuster, keine Übersetzungen vollständiger fremder Anleitungen. Ein Quellenlink bedeutet weder, dass die Quelle jede konkrete Variante empfiehlt, noch dass deren Wirksamkeit separat untersucht wurde.

Neue Einträge erhalten den Status `draft`, leere Prüferangaben und keine krankheitsbezogenen Einsatzfreigaben. Alle benötigen vor einer patientenbezogenen Nutzung eine persönliche Eignungsprüfung. Bestehende Zuordnungen zu Krankheitsbildern werden nicht aus einer bloßen Gelenkübereinstimmung auf neue Varianten übertragen.

## Recherche vom 19.10.2026

Ähnliche Programme wurden zur Orientierung hinsichtlich Bibliotheksstruktur, Varianten und Filtermöglichkeiten angesehen. Deren geschützte Videos, Bilder und Datenbestände wurden nicht übernommen:

- [Physitrack](https://www.physitrack.com/)
- [Physiotec / Wibbi](https://www.physiotec.app/uebungsbibliothek/)
- [NHS South Tees – Physiotherapie-Übungsübersicht](https://www.southtees.nhs.uk/services/physiotherapy/community-outpatient-physiotherapy-middlesbrough-redcar-and-cleveland/staff-area/menu/exercises/)

Anatomische Bewegungsrichtungen und verwandte Grundmuster wurden anhand folgender Klinik- und Fachgesellschaftsquellen recherchiert:

- [AAOS – Schulter](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/)
- [AAOS – Hüfte](https://www.orthoinfo.org/recovery/hip-conditioning-program/)
- [AAOS – Knie](https://www.orthoinfo.org/recovery/knee-conditioning-program/)
- [AAOS – Fuß und Sprunggelenk](https://www.orthoinfo.org/recovery/foot-and-ankle-conditioning-program/)
- [NHS Dynamic Health – Ellenbogen](https://www.dynamichealth.nhs.uk/help-and-advice/elbow-pain/)
- [NHS South Tees – Ellenbogenbeweglichkeit](https://www.southtees.nhs.uk/resources/elbow-rom/)
- [NHS Kent – Handgelenkkraft](https://www.kentcht.nhs.uk/leaflet/wrist-strength/)
- [NHS Guy's and St Thomas' – Handgelenkbewegungen](https://www.guysandstthomas.nhs.uk/health-information/wrist-movement-exercises-after-injury-or-surgery)
- [NHS – Knieübungen mit möglicher Gymball-Variante](https://www.nhs.uk/live-well/exercise/knee-exercises-for-runners/)
- [NHS – Gymball-Leitfaden](https://www.kentmedwaymentalhealth.nhs.uk/media/2612/km1237-physiotherapy-gym-ball-exercise-guide.pdf)

Der [vom Nutzer verlinkte Pinterest-Pin](https://de.pinterest.com/pin/703756182504599/) verweist auf das kommerzielle „Windhund Übungsposter Gymball“ mit 30 Übungen. Er wurde als thematische Anregung für Ballübungen verwendet. Poster und Verkaufsabbildungen wurden nicht kopiert und sind keine klinischen Wirksamkeitsnachweise.

## Bilder und offene Bildabdeckung

Mit der integrierten Bildgenerierung wurden zwei neue Bildtafeln anhand der vom Nutzer bereitgestellten Figur erstellt. Die zweite Tafel wurde nach Sichtkontrolle gezielt korrigiert. Originalbild, Pinterest-Abbildungen und Klinikfotos werden nicht ausgeliefert.

Die Tafeln enthalten zwölf Start-/End-Bildpaare. Sie sind 13 passenden Grundmustern zugeordnet (die Ball-Wandkniebeuge wird für Hüfte und Knie verwendet). Das sind **schematische Grundmusterbilder**, keine individuell geprüften Bilder jeder Kontraktions- oder Hilfsmittelvariante. Die App weist darauf hin. Für die übrigen Grundmuster sind derzeit nur textliche Start- und Endstellungen vorhanden; eine vollständige individuelle Bebilderung des gesamten Katalogs steht aus. Keine automatisch erzeugte Variante wird durch ein beliebiges, anatomisch unpassendes Bild ersetzt.

Projektdateien: `server/assets/reference/reference-joints.png`, `server/assets/reference/reference-ball.png`. Zuordnung: `src/reference-poses.json`. Die Bilder werden nur nach Anmeldung, Prüfung der Übungsberechtigung und passender Version ausgeliefert. Sie zählen nicht automatisch als klinisch geprüftes Veröffentlichungsmedium.

Die Bildtafeln sind KI-generierte Ableitungen einer Nutzerreferenz. Für diese wird keine fremde Creative-Commons- oder Public-Domain-Lizenz behauptet. Die Herkunfts- und Nutzungsrechte der Referenz sind vor einer späteren externen Medienverwertung fachlich beziehungsweise rechtlich zu klären. Die bisher vorhandenen CDC-Medien behalten ihre separat dokumentierte Public-Domain-Herkunft.

## Erzeugung und Wartung

`node scripts/build-expanded-catalog.mjs` erzeugt den Katalog und die Grundmusterübersicht aus den redaktionellen Definitionen. Der Generator validiert IDs, Familienzahlen und Muskelreferenzen. Er ersetzt keine physiotherapeutische Prüfung. Der Demo-Import fügt nur fehlende Übungen hinzu; bereits bearbeitete Fassungen und Statusentscheidungen bleiben erhalten. Praxisdatenbanken werden nicht automatisch mit Entwürfen befüllt.

Die Bibliothek fasst Varianten standardmäßig zu Grundmustern zusammen. Die Detailansicht bietet die verfügbaren Varianten als Auswahl an. Der Schalter über der Ergebnisliste zeigt auf Wunsch alle Einträge. Es werden maximal 24 Karten je Seite geladen, damit der große Katalog benutzbar bleibt.
