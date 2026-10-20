# Ausfallschritte, seitliches Hüftheben und rechte Beinseite · 20.10.2026

Nachtrag: Mit drei seitlichen Ausfallschritten und dem exzentrischen Step-down umfasst die aktuelle Sammlung 19 Einträge. [Aktuelle Erweiterung](SEITLICHE-AUSFALLSCHRITTE-STEPDOWN.md).

Die Sammlung enthält jetzt 15 Einträge. Ergänzt wurden:

| Übung | ID | Hilfsmittel |
| --- | --- | --- |
| Ausfallschritte ohne Gewicht | `ausfallschritt-ohne-gewicht` | Ohne Zusatzgerät |
| Ausfallschritte mit Kurzhanteln | `ausfallschritt-kurzhanteln` | Zwei Kurzhanteln seitlich |
| Ausfallschritte mit Langhantel | `ausfallschritt-langhantel` | Langhantel auf dem oberen Rücken |
| Seitliches Hüftheben | `seitliches-hueftheben` | Matte, Unterarm-Seitstütz am Boden |

Die drei Ausfallschritte bilden eine Familie mit Variantenwechsel. Beim seitlichen Hüftheben wird das Becken im Seitstütz abgesenkt und angehoben; Beine bleiben zusammen. Die erste, unbelastete Variante der Nutzerreferenz wurde umgesetzt. Die neuen Einträge haben eigene deutsche Anleitungen, Start-/Endbeschreibung, Fehlerhinweise, Quellen und Filterzuordnungen. Dosierung erfolgt über Wiederholungen und persönliche Planvorgaben. Es gibt keine automatische Diagnosezuordnung oder klinische Freigabe.

## Rechte Beinseite der Brücke

Für `bruecke-einbeinig` ist in beiden neuen Bildern das anatomisch rechte Bein angehoben und nach oben gestreckt. Das linke Bein bleibt mit aufgestelltem Fuß die Stütze. Die Perspektive zeigt die rechte Seite vorn; das angehobene rechte Bein kommt in beiden Bildern aus der vorderen Hüftseite.

Die Anleitung benennt die Seite ausdrücklich. Beim Start vorhandener Installationen wird die bisherige generische Standardbeschreibung gezielt als neue Version aktualisiert. Individuelle Textänderungen außerhalb der ersetzten Formulierungen bleiben erhalten; alte Inhaltsversionen werden nicht geändert. Die neue Bildzuordnung gilt für die einbeinige Brücke, während die beidbeinige Brücke ihre bestehende Tafel behält.

## Neue Bilddateien

Werkzeug: integrierte `image_gen`-Funktion. Keine CLI. Die Nutzerbilder wurden ausschließlich als Bewegungsreferenzen verwendet. Weder Originalgrafiken noch Ausschnitte oder Wasserzeichen werden in die App kopiert. Figuren-/Stilvorlage war die vorhandene Kreuzheben-Tafel; für die Brückenkorrektur diente die vorhandene Brückentafel als Referenz.

- `server/assets/reference/reference-lunges.png`: tatsächlich 1254 × 1254 Pixel, zwei Spalten/drei Zeilen. Links Stand, rechts Ausfallschritt. Oben ohne Gewicht, Mitte Kurzhanteln, unten Langhantel. Rasterausschnitt pro Zelle 627 × 418 Pixel.
- `server/assets/reference/reference-side-hip-lift.png`: tatsächlich 1774 × 887 Pixel, zwei Spalten/eine Zeile. Links abgesenktes, rechts angehobenes Becken im Seitstütz.
- `server/assets/reference/reference-single-leg-bridge-right.png`: tatsächlich 1774 × 887 Pixel, zwei Spalten/eine Zeile. In beiden Stellungen rechtes Bein oben, linker Fuß aufgesetzt.

Die generierten Größen weichen vom angefragten Pixelmaß ab, die für die Ausschnitte benötigten Seitenverhältnisse stimmen. Es wurden keine Bilder per Skript bearbeitet. Zugriff erfolgt über die bestehende geschützte, übungs- und versionsgebundene Bildroute. Die bisherigen Tafeln bleiben vorhanden; für die korrigierte einbeinige Brücke wird eine eigene neue Datei verwendet.

## Quellen

- [ACE – Forward Lunge](https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/) für das Ausfallschritt-Grundmuster.
- [South Tees Hospitals NHS – Functional hip strengthening](https://www.southtees.nhs.uk/resources/functional-hip-strengthening-class/) für Ausfallschritt-Varianten und verwandte Grundübungen.
- [NASM – Side Plank](https://www.nasm.org/resource-center/exercise-library/side-plank) für den Seitstütz. Die Quelle behandelt das statische Grundmuster, nicht einen Wirksamkeitsnachweis der dynamischen Hüfthebe-Variante.
- [ACE – Modified Side Plank](https://www.acefitness.org/resources/everyone/exercise-library/100/side-plank-modified/) für eine einfachere Stützvariante.

Eigene Texte und neue Bilder; keine Übernahme fremder Medien und keine Behauptung einer fremden CC-/Public-Domain-Lizenz.

## Verwendete Prompts

### Ausfallschritte

Use case scientific-educational. Create a WHOLLY NEW physiotherapy FORWARD LUNGE atlas. Reference1 is ONLY the movement mechanics and equipment; do not copy its anatomical skin muscle rendering, female likeness, original pixels, watermark or layout. Reference2 is ONLY the character and illustration style to preserve: friendly adult curly brown-haired man, blue t-shirt, orange shorts, blue trainers, polished flat hand-drawn style. Exact square1536x1536 canvas, strict2columns3rows of equal768x512 cells with at least40px padding inside every cell. Pale white background, subtle floor shadow. Each cell ONE fully visible person, no text labels arrows logo watermark. Same three-quarter side camera facing right. LEFT column START upright feet together hip-width standing. RIGHT column END forward lunge, RIGHT foot stepped forward and fully flat, left leg behind supported on toes heel raised, right knee bent about90degrees over ankle, left knee lowered close to floor without touching, torso and back upright, eyes forward. Row1 no weights arms relaxed by sides. Row2 TWO dark dumbbells, one in each hand hanging straight at sides in both standing and lunge. Row3 ONE light barbell held with BOTH hands across UPPER BACK below neck throughout standing and lunge; small balanced plates each end, full bar contained in cell. Do not put bar on neck, no overhead lift. Distinct upright standing versus lowered lunge. Same RIGHT leg forward in all lunge frames. Clothing/body proportions consistent. Show physically correct hands, two legs, grounded forward heel, rear knee bent, neutral spine.

### Ausfallschritte: abschließende Randkorrektur

Layout-only correction of this lunge atlas. Preserve exact six figures, poses, equipment, colors and illustration style, no anatomical changes. Square canvas strict2columns3rows with equal cells. Scale EACH ENTIRE figure and any equipment/floor shadow down uniformly by20percent about its own cell CENTER, so there is a large completely empty pale-white margin above and below every figure. All hair, shoes, barbell plates and shadows must be at least45pixels away from each cell boundary on1254square canvas. Horizontal splits exactly at one-third and two-thirds of full canvas height. Make gutters around all cells completely blank white, NO body part or shadow touching a split. Especially TOP LEFT standing shoes must end well ABOVE the first split, never bleed into middle row. Keep right column forward lunges, left column standing, top no weights middle two dumbbells bottom barbell across upper back. No new objects, labels letters arrows watermark or logos. Do not change which leg is in front or which hands hold weights. This is only shrink-in-cell spacing correction.

### Seitliches Hüftheben

Use case scientific-educational. Create a wholly NEW original physiotherapy SIDE PLANK HIP LIFT instructional image, not a retouch of reference1. Reference1 ONLY movement mechanics of the LEFTMOST unweighted variant: forearm supported side-lying hip dip to lifted side plank, ignore dumbbell and bench variations. Never copy anatomical muscle rendering, original people's likenesses, pixels, logos or watermark. Reference2 ONLY same friendly adult curly brown-haired male, blue T-shirt orange shorts blue trainers, clean polished hand-drawn flat illustration style. Landscape1536x768, exactly2 equal768x768 square cells left start right end, pale white backdrop teal exercise mat, at least50px padding each cell, full body inside cells, no words labels arrows watermark or logo. Consistent near-side view from slightly above so show hips legs forearm and upper hand. Head LEFT feet RIGHT. SAME support LEFT FOREARM on mat in both frames, elbow under shoulder bent90degrees, forearm directed forward across mat, left palm resting. Both legs straight, feet stacked, upper RIGHT hand on upper hip, upper shoulder open toward viewer. LEFT START hips lowered toward mat while maintaining forearm contact, torso lowered in side-lying supported position, legs straight. RIGHT END hips and pelvis clearly lifted well above mat into straight side-plank line from head through shoulders hips to ankles, only left forearm and outer edge of lower foot support body; upper right hand remains on hip. Both shoulders stacked, no trunk twist, neutral neck. This is dynamic side hip lifting, not side leg raises, not front plank. NO dumbbells bench or added equipment other than mat.

### Einbeinige Brücke: rechtes Bein

Precise anatomy/side correction using this glute bridge character/style reference. Create a NEW separate SINGLE LEG GLUTE BRIDGE pair, ONLY2cells side-by-side, landscape1536x768, each768x768 square. Same friendly adult curly brown-haired man blue shirt orange shorts blue trainers, teal mat and pale white background. Full body completely inside each cell, minimum50px padding. Head LEFT feet RIGHT, supine seen obliquely from his ANATOMICAL RIGHT SIDE so the RIGHT shoulder/arm/hip/leg are nearest the viewer. BOTH cells: anatomical RIGHT LEG is the straight raised leg pointing up toward ceiling, anatomical LEFT LEG is bent with left foot flat on mat supporting. The raised RIGHT thigh must come from the NEAR/FOREGROUND right side of orange shorts, visibly IN FRONT of the supporting bent LEFT leg farther from viewer. Never switch which leg is raised between panels. Right arm nearest viewer rests along mat and right hip is immediately above it. LEFT cell START buttocks on mat, right leg extended UP, left knee bent left foot planted. RIGHT cell END buttocks/pelvis lifted into bridge with shoulders and head remaining on mat, right leg remains extended UP from FOREGROUND hip, left foot still planted BEHIND it supporting, left knee bent. Show right raised leg IN FRONT overlapping far supporting thigh, without impossible joint positions. Pelvis level and neutral spine, no gymnast backbend. Do not just mirror one frame. Same anatomical right leg raised from same foreground hip in both. No labels text letters arrows watermark, no weights. Preserve exact reference character style.

## Prüfung

44 Tests prüfen unter anderem korrekte Geräte-/Bildzuordnung, Filter und Klassifikation, Ergänzungen ohne Wiederherstellung entfernter Einträge, unveränderte frühere Inhaltsversionen, idempotente Seitenkorrektur sowie gesperrte Bildzugriffe auf andere Übungen und für nicht zugeordnete Patienten. TypeScript und Produktionsbuild werden zusätzlich geprüft.

