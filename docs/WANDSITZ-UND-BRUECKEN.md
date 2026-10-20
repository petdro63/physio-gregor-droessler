# Wandsitz und Brücken · 20.10.2026

Die breite Kniebeugen-Variante heißt jetzt **Breitbeinige Kniebeugen ohne Gewicht** beziehungsweise **Breitbeinige Kniebeugen mit Zusatzgewicht**. Die bestehenden internen IDs bleiben erhalten. Bei vorhandenen Einträgen mit dem ursprünglichen Titel wird eine neue Übungsversion erstellt; alte Planverweise und individuelle Umbenennungen bleiben erhalten.

Drei neue Entwürfe ergänzen die Sammlung auf elf Einträge:

- `wandsitz`: aufrechter Stand an der Wand → Wandsitz mit etwa 90° Kniebeugung, Dosierung als Haltedauer.
- `bruecke-rueckenlage`: Rückenlage mit angewinkelten Beinen und aufgestellten Füßen → Becken und Gesäß angehoben.
- `bruecke-einbeinig`: gleiche Ausgangslage mit einem nach oben gestreckten freien Bein → Becken über nur einem aufgestellten Fuß anheben. Das freie Bein bleibt gestreckt angehoben.

Die Einträge sind über Trainingsart, Gelenk, Zielmuskel, Hilfsmittel und Ausgangsstellung auffindbar. Die Brücken verwenden Wiederholungen; Wandsitz verwendet Sekunden. Alle bleiben fachlich zu prüfende Entwürfe.

## Haltedauer

Das versionierte Übungsfeld `dosageMode` unterscheidet `hold` und `repetitions`. Bestehende Übungen ohne dieses Feld behalten ihre Wiederholungsdarstellung. Beim Hinzufügen einer Halteübung zum Plan wird die vorgeschlagene Dauer aus `defaultHoldSeconds` übernommen. Beim Wandsitz sind 20 Sekunden als bearbeitbarer Startwert hinterlegt, keine individuelle Therapieempfehlung.

Der Planeditor zeigt bei Halteübungen **Haltedauer (Sekunden)** und kein Wiederholungsfeld. Übungskarten, geführtes Training und Plan-PDF zeigen etwa „3 Sätze × 35 Sekunden halten“. Der bestehende Countdown verwendet die gespeicherte Haltezeit. Die serverseitige Prüfung verlangt 1–600 Sekunden. Der Übungseditor kann Dosierungsart und Vorschlagsdauer pflegen; Speichern erstellt wie bisher eine neue Inhaltsversion.

## Bilder

Werkzeug: integrierte `image_gen`-Funktion. Stil- und Figurenreferenz war `server/assets/reference/reference-single-leg-rdl.png`; die Vorlage wurde nicht überschrieben.

- `server/assets/reference/reference-wall-sit.png`: 1536 × 1024 Pixel, zwei Spalten/eine Zeile, Stand links, Wandsitz rechts. Geschützte Zuordnung zur Wandübung.
- `server/assets/reference/reference-bridges.png`: 1536 × 1024 Pixel, zwei Spalten/zwei Zeilen. Links Ausgangsstellung, rechts angehobenes Becken. Oben beidbeinig, unten einbeinig mit nach oben gestrecktem freien Bein.

Sichtprüfung: Wandkontakt, aufrechter Rücken und ungefähr rechtwinklige Knie im Wandsitz; Gesäß in den Endstellungen vom Boden gelöst; Kopf und Schultern bei den Brücken auf der Matte; freies Bein bei der einbeinigen Variante gestreckt oben. Persönlicher Bewegungsweg und sichere Belastung bleiben individuell festzulegen.

Bewegungsrecherche: [South Tees Hospitals NHS – Functional hip strengthening class](https://www.southtees.nhs.uk/resources/functional-hip-strengthening-class/) beschreibt Wandkniebeugen mit 90° Kniebeugung, Brücken und einbeinige Progressionen. Eigene deutsche Texte und neue Bilder; keine fremden Fotos übernommen und keine automatische Diagnoseindikation ergänzt.

## Verwendete Prompts

### Wandsitz

Use case scientific-educational. Create a new physiotherapy WALL SIT instructional atlas using the reference ONLY for matching the same friendly adult man, curly brown hair, blue T-shirt, orange shorts, blue trainers, polished flat hand-drawn style. Landscape1536x1024, exactly TWO equal portrait cells side-by-side 768x1024, pale white background, generous full-body padding, no text watermark arrows or logo. Both cells same scale exact SIDE VIEW facing right, a clearly visible simple vertical pale blue wall immediately behind his back on left, horizontal floor. LEFT START: standing UPRIGHT with back against wall, hips and knees extended, both feet placed forward away from wall so he can slide down; arms relaxed at sides. RIGHT END: WALL SIT, back and pelvis supported against vertical wall, torso fully upright, hips lowered until thighs horizontal and shins vertical, knee angle exactly90degrees, both feet flat and heels grounded directly under knees. No chair or stool under buttocks; pelvis suspended in air supported by wall and legs. Hands relaxed without pressing on thighs. Show wall-floor corner, clear90degree knee bend in end, same figure identity and clothing throughout. This is static hold position, NOT a free squat, NOT sitting on an object. Entire body including hair and soles fully in each cell. Preserve stylistic match to reference.

### Brücken

Use case scientific-educational. New physiotherapy glute BRIDGE instructional atlas in reference's exact polished flat hand-drawn style, same adult man curly brown hair blue T-shirt orange shorts blue trainers. Reference ONLY character and style, change poses completely. Landscape1536x1024 exactly2columns2rows four equal768x512 cells, pale white background, thin teal exercise mat on floor each cell. Side view, head LEFT feet RIGHT in every cell, full body comfortably inside each cell generous padding, no text arrows watermark or logos. TOP LEFT bilateral START: lying SUPINE flat on back, head shoulders and buttocks on mat, both knees bent, both feet flat hip-width, arms alongside body on mat. TOP RIGHT bilateral END: same head and shoulders resting on mat and both feet flat; pelvis and BUTTOCKS lifted clearly off mat until shoulders hips knees form straight diagonal line. Bent knees above feet, no lumbar overextension, not a gymnast backbend. BOTTOM LEFT single-leg START: head shoulders and buttocks resting on mat, ONE knee bent with that foot flat on mat, OTHER leg completely STRAIGHT extended UP towards ceiling, that foot in air, distinct silhouette. BOTTOM RIGHT single-leg END: same support foot stays on mat with bent knee, pelvis raised off mat to bridge, OTHER leg remains completely straight extended UP toward ceiling, only ONE foot contacts mat. Arms on mat, shoulders and head supported, pelvis level, no lumbar arch. Top row both feet grounded, bottom row one grounded foot plus one straight raised leg. Keep the single-leg exercise clearly visibly distinct from bilateral. All equipment only mat, NO weights.

### Brücken: abschließende Ausschnittkorrektur

Precise layout-only correction of this1536x1024 glute bridge atlas. Keep same four poses, character identity, clothing, colors and style. Strict equal2columns by2rows split at x768 and y512. NO part of any figure may come within30pixels of any cell boundary. Especially bottom-row raised shoes MUST begin BELOW y550, entirely inside bottom half; currently the raised shoes extend to the horizontal split and cause image bleed. Scale bottom row figures down uniformly about12percent around each cell center so all parts (raised toes, head, mat) stay in its own cell with minimum30px padding. Keep top row bilateral bridge, bottom row single leg bridge with one leg straight upward, left hips down right hips raised. Preserve anatomical pose mechanics and head/shoulder support on mat. Very pale white background, teal mats, no labels arrows logos or watermarks. Do not add or remove any limbs or weights. This is ONLY a spacing/layout correction for independent cropping into four exact768x512 frames.

## Validierung

Integrationstests prüfen die Versionsübernahme bei der Umbenennung, unveränderte alte Fassungen und individuelle Namen, die passenden Bildzeilen, das Hinzufügen zur bereinigten Sammlung, die Speicherung der Dosierungsart und Haltedauer, die Ablehnung ungültiger Haltezeiten und die Sekundenanzeige im tatsächlichen PDF-Inhalt.

