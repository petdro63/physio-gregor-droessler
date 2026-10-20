# Einbeiniges Kreuzheben · 20.10.2026

Zwei Varianten der eingereichten Bewegung wurden als neue Entwürfe ergänzt:

- `einbein-kreuzheben-kurzhanteln`: einbeiniger Hüftknick mit zwei Kurzhanteln.
- `einbein-kreuzheben-langhantel`: gleicher Bewegungsablauf mit beidhändig gehaltener leichter Langhantel.

Beide Einträge gehören zur Familie `einbein-kreuzheben`. Sie sind über Hüftgelenk, Kraft, Koordination, Gesäß und hintere Oberschenkelmuskulatur auffindbar. Persönliche Anleitung und sichere Einbeinbelastung sind Voraussetzung; es wurden keine krankheitsbezogenen Indikationen oder automatischen Freigaben hinzugefügt.

## Neue Bilder statt Originalgrafik

Die Nutzerdatei wurde ausschließlich als Bewegungsreferenz gelesen. Sie wurde weder in das Projekt kopiert noch als Bild-URL, Vorschaubild oder ausgeliefertes Medium hinterlegt. Die Darstellung wurde mit der integrierten Bildgenerierung vollständig neu im Stil der vorhandenen App-Figur erstellt: bekleidete Figur mit blauem Shirt und orangefarbener Hose statt anatomischer Muskeldarstellung. Die Originalgrafik wird in der App nicht gezeigt. Es wurde keine fremde CC-/Public-Domain-Lizenz behauptet.

Neue Projektdatei: `server/assets/reference/reference-single-leg-rdl.png`.

SHA-256 der neuen Bilddatei: `ae31defe3917d35634fadc58476ba57b398f262baf0df03eb4727e4f7bbe15e1`.

Das neue Bild besteht aus zwei Zeilen und zwei Spalten. Oben stehen Start und Endstellung mit Kurzhanteln, unten mit Langhantel. Die App zeigt je Variante ausschließlich die passende Zeile. Für diese und künftige Tafeln können Bildraster und Seitenverhältnis in der Zuordnung explizit angegeben werden. Der Zugriff bleibt an Anmeldung, Übung und Version gebunden.

## Technische und redaktionelle Prüfung

Sichtkontrolle: neue bekleidete Figur, zwei unterschiedliche Geräte, angehobenes freies Bein, Hüftknick, körpernahe Last und keine Bestandteile der Originalgrafik. Die medizinische Freigabe steht weiterhin aus; die Zeichnung gibt keinen verbindlichen individuellen Bewegungsumfang vor.

Grundmuster-Recherche: [NHS WWL – Hip Level 3](https://www.wwl.nhs.uk/media/.leaflets/65783110320970.56499712.pdf) und [ACE – Romanian Deadlift](https://www.acefitness.org/continuing-education/certified/may-2025/8865/the-ace-do-it-better-series-the-romanian-deadlift/). Eigene deutsche Beschreibung, keine Übernahme der dortigen Bilder.

## Bildprompt

Werkzeug: integrierte `image_gen`-Funktion. Referenz 1: Nutzerbild als Bewegungsreferenz. Referenz 2: bestehende App-Gelenktafel als Figuren- und Stilreferenz. Keine CLI/API-Stapelverarbeitung.

Create a wholly new, fully clothed, original physiotherapy instructional illustration of the movement shown in reference 1, in the flat editorial character style of reference 2. Reference 1 is ONLY for recognizing the single-leg Romanian deadlift mechanics. Do not include any pixels, anatomical muscle render, figure likeness, watermark, logo, text or background from reference 1. This is a new illustration, not a retouch of its image. Match reference 2: adult person with curly brown hair, blue shirt, orange shorts, warm skin, charcoal weights, clean crisp outlines, white background. Exactly TWO ROWS by TWO COLUMNS, four equal large cells with generous white gutters and consistent scale. TOP ROW: a pair for single-leg Romanian deadlift with TWO small dumbbells, one in each hand. Left cell START: upright standing on the right leg with a softly bent knee, other foot lifted slightly clear of floor, arms hanging holding the dumbbells beside thighs. Right cell END: same right foot planted, right knee still softly bent, hinge backward from hips, straight neutral spine and head in line with torso, torso inclined toward floor, left leg extends backward in line with trunk, pelvis square to ground, arms hang vertically under shoulders, dumbbells near right shin but not touching floor. BOTTOM ROW: identical movement pair with ONE light short BARBELL held by BOTH hands in front of thighs at START, bar hangs under shoulders close to standing shin at END. Show the full bar with two balanced small end plates, no bar passing through the shin. All four figures shown in consistent near-side three-quarter view facing right so lifted leg behind, stance leg, both hands and equipment remain distinguishable. Entire figures and all weights inside cells, no crops. Stance knee about 15 degrees flexed, no deep squat, no rounded back, no hyperextended spine, no backward trunk bend, no twisted pelvis. Final hinge about 60 degrees from upright, not an extreme stretch. Flat floor baseline only, no furnishings, no poster framing, no text, no arrows, no muscle highlighting. Each cell contains one person, exactly four figures total. Draft for later clinical review.
