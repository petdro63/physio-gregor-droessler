# Design und Übungsbilder · 0.1.9-dev

## Gestaltung

Die öffentlichen Seiten von [Physiofit](https://physiofit.app/) und der [offizielle Google-Play-Eintrag](https://play.google.com/store/apps/details?hl=de&id=io.physiofit.production) wurden am 19.10.2026 als Referenz angesehen. Das angemeldete Produkt wurde nicht getestet. Anregungen sind klare Trainingsführung, eine deutliche visuelle Hierarchie und schnell erkennbare Aufgaben. Texte, Fotos, Logos und geschützte Übungsinhalte von Physiofit wurden nicht übernommen.

Die eigene Gestaltung verwendet dunkles Marineblau, kräftiges Kobaltblau, kleine Orangeakzente, lokale Groteskschriften, flächige Karten, große Überschriften und nummerierte Gelenkzugänge. Keine externe Schrift- oder Bildverbindung ist notwendig. Die Figur bleibt als durchgängiges Illustrationselement erhalten.

Der Broschürenfilter in der Übungsbibliothek und die Broschürenliste im Evidenzbereich wurden entfernt. Quellenverweise an einzelnen Übungen und die interne Herkunftsdokumentation bleiben bestehen. Die Übungen aus den Broschüren werden nicht gelöscht.

## Bilder mit Hilfsmitteln

Zwei neue Bildtafeln wurden mit der integrierten Bildgenerierung aus der bestehenden Figurenreferenz erzeugt und unverändert in das Projekt kopiert:

- `server/assets/reference/reference-equipment.png`: Hantelcurl im Stand und Sitz, Handgelenkstrecken mit Hantel, schräges Armheben mit Hanteln, Rudern mit Theraband und Schulterrotation mit Band.
- `server/assets/reference/reference-lower-equipment.png`: Kniestrecken mit Manschette, Hüftabduktion mit Manschette, Fußheben und Fußsenken mit Band, Armheben mit Stab und geführte Stabrotation im Sitz.

Nicht jede gezeichnete Szene wurde Übungen zugeordnet. Insbesondere wird die Band-Schulterrotation aus der ersten neuen Tafel nicht verwendet, weil die Oberarmposition für eine sichere Zuordnung nicht hinreichend eindeutig ist. Alle Abbildungen bleiben Illustrationsentwürfe vor der klinischen Prüfung.

Die Zuordnung ist jetzt sowohl nach Übungs-ID als auch nach Grundmuster, Hilfsmittel und Variantenkennung möglich. Geänderte Hilfsmittel sperren eine unpassende bisherige Zuordnung. Exzentrische Varianten erhalten eine umgekehrte Bildreihenfolge. Statische Bandhaltungen verwenden ein festes Bild und bleiben ausdrücklich Grundmusterdarstellungen. Eine Variante mit Band bekommt kein Bild ohne Band, eine Manschettenübung kein Bild mit nacktem Knöchel.

Bereits vorhandene CDC-Videos bleiben neben den neuen Illustrationen verfügbar. Die Trainingsansicht zeigt die zur Übung gehörenden Bilder, soweit vorhanden. Bei fehlender Zuordnung wird kein beliebiges Demo-Männchen als Anleitung für eine andere Übung eingesetzt. Dasselbe gilt für generische Bilder in PDF-Ausgaben.

## Stand der vollständigen Bebilderung

Der Auftrag zur Bebilderung aller Übungen ist noch nicht vollständig abgeschlossen. Vier Tafeln enthalten insgesamt 24 Bildpaare. Nur passende Darstellungen werden verwendet; deren Vorhandensein wird nicht als vollständige Abdeckung des Katalogs ausgegeben. Bilder für zahlreiche weitere Körperstellungen und persönlich angeleitete Widerstandsvarianten fehlen noch. Neue Bilder müssen die tatsächliche Übung, das tatsächliche Hilfsmittel und bei manuellen Techniken den Gegenhalt zeigen. Die großen Textkataloge bleiben bis dahin Entwürfe.

`src/reference-lookup.ts` ist die gemeinsame Zuordnungslogik für Browser und Server. Der Server prüft weiter Anmeldung, Übungsberechtigung, Version und konkrete Bildtafel. Die Bilder werden nicht durch das Generieren automatisch zu klinisch freigegebenen Medien.

## Bildprompts dieser Version

Werkzeug: integrierte `image_gen`-Funktion, keine API-/CLI-Stapelverarbeitung. Bildreferenz: bestehende Gelenktafel `server/assets/reference/reference-joints.png`.

### Oberkörper und Hilfsmittel

Create a NEW physiotherapy illustration plate derived from the supplied character sheet. Preserve the same curly brown hair character, blue T-shirt, orange shorts, warm skin, clean commissioned editorial illustration style. Adult proportions. Exactly SIX equal panels in a 2 COLUMN by 3 ROW GRID, each panel TWO figures left START right END, white background, clear gutters. No text, no logos, no arrows, no decoration. Explicit equipment must be visible and mechanically correct. Row1 left: STANDING biceps curl with TWO small charcoal DUMBBELLS: start elbows straight arms down palms forward holding dumbbells, end elbows bent with dumbbells near shoulders, upper arms remain at torso. Row1 right: SEATED biceps curl with TWO small DUMBBELLS, sturdy chair, same start/end arm motion. Row2 left: SEATED supported wrist EXTENSION holding ONE small dumbbell, forearm PALM DOWN on table with hand beyond edge; start wrist slightly flexed down holding weight, end back of hand raised holding same weight, forearm remains on table. Row2 right: STANDING shoulder SCAPTION holding small dumbbells, start arms down, end arms diagonal forward and outward at about shoulder height thumbs upward, no shrugging. Row3 left: STANDING resistance band ROW: purple elastic band anchored on secure wall fixture in front at elbow height; start arms reaching forward holding ends, end elbows pulled back alongside torso, band taut in both. Row3 right: STANDING shoulder external rotation with elbow tucked at side at 90 degrees, purple band securely anchored across body on opposite side: start hand near abdomen, end forearm rotated outward, upper arm stays vertical beside ribs, band drawn taut, opposite hand rests down. Show fixed wall anchor clearly, no floating bands. Accurate anatomy and exercise mechanics. All full figures and equipment inside their panel, no cropping. Human clinical review draft.

### Unterkörper und Stab

New illustrated physiotherapy plate using the supplied sheet as character/style reference: same adult curly brown-haired person, blue tee, orange shorts. Precisely 2 columns and 3 rows, SIX equal panels, white background, straight gutters, each panel contains TWO drawings of SAME view: START left and END right, no text, no arrows, no watermark. Row1 left: seated on stable chair SIDE VIEW, small charcoal ankle weight cuff securely around ONE lower shin just above ankle, START knee bent foot down, END same knee straightened so foot forward at knee height, thigh stays supported on chair. Row1 right: FRONT VIEW standing beside sturdy chair holding it, charcoal ankle cuff on moving leg, START legs together, END one straight leg abducted sideways about 20 degrees with toes forward, pelvis level and torso vertical. Row2 left: SIDE VIEW long sitting with back supported, purple elastic band loops over TOP of forefoot and is anchored securely ahead of toes on low fixed wall hook, START ankle relaxed pointed slightly away, END ankle pulls forefoot UP toward shin against band, heel stays on ground, knee still. Row2 right: SIDE VIEW long sitting with back supported, purple elastic band runs under SOLE across ball of foot with two ends held back by both hands, START toes toward shin, END foot points AWAY pressing band, heel and leg remain still, hands do not move. Row3 left: FRONT VIEW standing, smooth wooden STICK held in BOTH hands shoulder width at thighs, START arms down, END hands lift stick FORWARD to shoulder height, elbows softly straight, torso upright, show stick continuously between hands. Row3 right: FRONT VIEW seated with elbows next to torso bent ninety degrees, wooden STICK held horizontally by both hands at waist level, START hands centered, END stick slides horizontally to one side guiding shoulder external rotation, elbows remain in contact with ribs and shoulders level, NOT lifting stick. All gear clearly visible and physically connected, no floating bands, avoid extreme joints. Human clinical review draft.
