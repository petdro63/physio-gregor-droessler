# Kniebeugen, breites Kreuzheben und Wadenheben · 20.10.2026

Nachtrag: Die breite Variante wurde in „Breitbeinige Kniebeugen“ umbenannt. Mit Wandsitz und zwei Brücken umfasst die aktuelle Sammlung elf Einträge. Die folgenden Angaben beschreiben den Stand von Version 0.1.12. [Aktuelle Erweiterung](WANDSITZ-UND-BRUECKEN.md).

Die Sammlung enthält zusätzlich sechs Einträge, jeweils ohne Gewicht und mit Kurzhantel-Zusatzgewicht:

| Familie | Ohne Gewicht | Mit Zusatzgewicht |
| --- | --- | --- |
| Kniebeugen | `kniebeuge-ohne-gewicht` | `kniebeuge-zusatzgewicht`: eine Kurzhantel vor der Brust (Goblet) |
| Breitbeiniges Kreuzheben | `sumo-kreuzheben-ohne-gewicht` | `sumo-kreuzheben-zusatzgewicht`: eine Kurzhantel zwischen den Beinen |
| Wadenheben | `wadenheben-ohne-gewicht` | `wadenheben-zusatzgewicht`: zwei Kurzhanteln seitlich |

Mit den beiden vorhandenen einbeinigen Kreuzheben-Varianten stehen acht Einträge zur Verfügung. Der einmalige frühere Listenreset behält bei Neuinstallationen auch die sechs Ergänzungen. Bereits bereinigte Installationen erhalten sie durch die bestehende, Bearbeitungen erhaltende Initialisierung. Historisch entfernte Einträge werden nicht wieder sichtbar. Später selbst angelegte Übungen bleiben möglich.

Alle neuen Einträge haben Ausgangs-/Endstellung, Anleitung, Atemhinweis, Fehlerhinweise, Varianten, Quellen und Filterzuordnungen für Kraft, Gelenk und Zielmuskeln. Die Gewichte sind bewusst nicht mit einem pauschalen Kilogrammwert vorgegeben. Persönliche Bewegungstiefe und Belastung bleiben im Trainingsplan festzulegen. Es gibt keine automatische Diagnosezuordnung; die Einträge bleiben fachlich zu prüfende Entwürfe.

## Bilder und Korrektur

Werkzeug: integrierte `image_gen`-Funktion, keine CLI. Figuren-/Stilreferenz war ausschließlich die vorhandene App-Datei `server/assets/reference/reference-single-leg-rdl.png`. Keine fremden Fotos oder Anatomiegrafiken wurden eingebunden.

Die finalen Projektdateien sind:

- `server/assets/reference/reference-squats.png`
- `server/assets/reference/reference-sumo-upright.png`
- `server/assets/reference/reference-calf-raises.png`

Alle drei Tafeln sind 1536 × 1024 Pixel mit zwei Spalten und zwei Zeilen. Links steht jeweils die Ausgangsstellung, rechts die Endstellung; obere Zeile ohne Gewicht, untere Zeile mit Zusatzgewicht. Die Zuordnung erfolgt je Übungs-ID und Hilfsmittel, einschließlich geschützter Bild-URL. Die bestehende Kreuzheben-Tafel bleibt unverändert.

Die breite Variante wurde auf ausdrückliche Nutzerkorrektur überarbeitet: deutlich mehr Kniebeugung, Becken zwischen den Beinen abgesenkt, Rücken gerade und Rumpf aufrecht statt Vorneigung aus der Taille. Nur die korrigierte Tafel wird ausgeliefert. Die dargestellte tiefe Stellung ist ein Illustrationsbeispiel; geringerer individuell freigegebener Bewegungsumfang ist in der Anleitung ausdrücklich möglich.

Sichtkontrolle: alle Körper und Hanteln vollständig in den Bildzellen; Gewicht nur in der passenden Zeile; breiter Stand und deutliche Kniebeugung bei der Sumo-Variante; sichtbarer Fersenhub beim beidbeinigen Wadenheben. Illustration und Text sind für spätere persönliche Prüfung gekennzeichnet.

## Technische Quellen

- [AAOS: Knee Conditioning Program](https://www.orthoinfo.org/recovery/knee-conditioning-program/) beschreibt das Kniebeugen-Grundmuster.
- [NASM: Goblet Squat](https://www.nasm.org/resource-center/exercise-library/goblet-squat) beschreibt die Kurzhantelhaltung und Zielmuskeln.
- [European Powerlifting Federation: Wide Stance (Sumo) Deadlift](https://www.europowerlifting.org/fileadmin/data/coach_corner/Competition_Deadlift_Sumo.pdf) beschreibt den breiten Stand mit stärkerer Kniebeugung und aufrechtem Rücken. Die App zeigt eine vereinfachte Variante ohne beziehungsweise mit einer Kurzhantel; Wettkampflasten und Atemvorgaben werden nicht übertragen.
- [AAOS: Foot and Ankle Conditioning Program](https://www.orthoinfo.org/recovery/foot-and-ankle-conditioning-program) beschreibt Wadenheben mit Stütze. Die freie und belastete Variante benötigt zusätzlich sichere Balance und persönliche Freigabe.

Eigene deutsche Texte und neu generierte Bilder. Die Quellen dienen der Bewegungsrecherche, nicht als Nachweis der Wirksamkeit jeder einzelnen Variante bei einem Krankheitsbild.

## Finaler Prompt-Satz

Gemeinsame Vorgabe für alle Tafeln: scientific-educational, Figuren-/Stilreferenz ist die vorhandene Kreuzheben-Tafel. Same friendly adult curly-brown-haired male character, blue T-shirt, orange shorts, blue trainers; polished flat hand-drawn illustration. Landscape 1536x1024, strict 2 columns × 2 rows, full body with generous padding, pale almost-white background, subtle floor shadows, no text, watermark or logo. Left starting position, right end position. Top row without equipment, bottom row with the specified dumbbells.

Kniebeugen: three-quarter side view facing right; shoulder-width stance, arms forward without weights. Upright left, controlled squat right, knees following toes and heels grounded, back natural. Weighted row holds one vertical dumbbell close to the chest with both hands throughout, upright left and lowered right.

Breite Variante (finale Korrektur des ersten Sumo-Entwurfs): Keep both left standing frames unchanged. Correct both right lowered frames: significantly more knee bend, thighs nearly horizontal, hips down between legs, chest lifted and back straight and upright, shoulders vertically nearly above hips, no leaning torso forward at waist. Knees point outward following toes, heels planted. Arms hang straight down between knees. Top right without weight; bottom right one vertical dumbbell held by its upper head in both hands, lower end just above floor. Same wide stance and character throughout. No stiff-leg hip hinge.

Wadenheben: consistent side view facing right, both feet hip-width, torso upright, legs long with soft knees. Left feet flat, right raised on both balls of feet with visibly lifted heels and grounded toes/forefeet. Top row no weights, bottom row one small dumbbell in each hand at sides. No step, no single-leg stance, no jumping, no bent-knee squat or bent trunk.

## Prüfung

Integrationstests prüfen die acht Einträge bei Erststart und nach Übernahme einer bereits bereinigten Installation, unveränderte historische Pläne und Verläufe, erhaltene redaktionelle Bearbeitungen, Filterung und getrennte Bildzeilen. Für jede Ergänzung wird die passende geschützte Bildroute aufgerufen und eine falsche Tafel abgewiesen.
