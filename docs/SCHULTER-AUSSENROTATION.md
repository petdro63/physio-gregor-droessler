# Schulteraußenrotation · drei eigene Übungen · 28.10.2026

Drei neue fachlich **noch nicht freigegebene** Übungsentwürfe:
1. Außenrotation im Stand, Ellenbogen etwa 90° gebeugt und seitlich am Rumpf.
2. Außenrotation im Sitzen, gleiche Ellenbogenführung am Rumpf.
3. Außenrotation im Sitzen bei seitlich auf Schulterhöhe angehobenen Oberarmen. **Ellenbogen bereits in der Ausgangsstellung etwa 90° gebeugt.** Unterarme zeigen räumlich nach vorne (vor den Körper, Richtung Blickrichtung); ohne die Oberarme oder Ellenbogen abzusenken werden nur die Unterarme nach oben/hinten in die U-Halte gedreht.

Alle drei Übungen sind Mobilisationsentwürfe ohne externen Widerstand. Widerstand, individuelle Dosierung und Patienteneignung sind therapeutisch gesondert zu prüfen. Bei der U-Halte nicht in Schmerz, Instabilität oder den Endbereich zwingen.

## Illustrationsherkunft

Stilvorlage vom Nutzer: freundliche eigene Comicfigur mit lockigem braunem Haar, blauem Shirt, orangefarbener kurzer Hose und blauen Schuhen. Die Anwendung enthält eine **neu gerenderte WebP-Illustrationen** mit zwei statischen Bildphasen je Übung unter `server/assets/reference/reference-shoulder-rotation-*.webp`. Die vom Nutzer eingereichte PNG-Datei wird nicht mit ausgeliefert. Beim Schulterhöhenbild sind die Ellenbogen in beiden Phasen gebeugt: in der Startphase zeigen die Unterarme perspektivisch zum Betrachter, in der Endphase nach oben.

Die neuen Bilder ersetzen die alte provisorische SVG-Figur. Das Bild wird aus einem schmalen Zwei-Phasen-Atlas je Übung über die vorhandene authentifizierte Bildroute geladen. Die gerenderten Bilder zeigen die zum Betrachter gerichteten Unterarme in der U-Halte-Ausgangsstellung stark perspektivisch verkürzt; die korrekte Beugestellung ist zusätzlich in Text und Alternativbeschreibung fixiert und muss vor klinischer Freigabe visuell geprüft werden.

Die Darstellungen werden nur in den berechtigten Übungsansichten angezeigt; die bestehende geschützte Medienroute für die bisherigen Übungsbilder wird nicht verändert. Übungen werden in Demo und bestehenden Praxen als Entwürfe erstellt, nie automatisch als freigegeben markiert.

## Referenz

[AAOS: Rotator Cuff and Shoulder Conditioning Program](https://orthoinfo.aaos.org/en/recovery/rotator-cuff-and-shoulder-conditioning-program/) als allgemeine Quelle für Schulterübungen; keine automatische Indikationszuordnung oder Wirksamkeitsbehauptung für diese drei Eigenvarianten.

## Schärfere Darstellung (28.10.2026)

Die bisherigen Atlanten haben nur 300 × 286 Pixel für **zwei** Posen. Für diese drei Übungen liefert die bereits authentifizierte Referenzbild-API nun jede Phase einzeln als WebP aus, mit vierfacher Kantenauflösung (je 600 × 1144 Pixel), hochwertiger Interpolation und moderater Nachschärfung. Der Browser zeigt die Einzelbilder proportionsgetreu mit `object-fit: contain`; das unscharfe CSS-Sprite-Zoomen entfällt. Die vorhandenen Originaldateien und die Zugriffsprüfung bleiben unverändert.

**Grenze:** Das verbessert die Darstellung, rekonstruiert aber keine echten hochauflösenden anatomischen Details. Für vollständig neue Details sind fachlich geprüfte, neu gerenderte Originale erforderlich. Die Entwürfe bleiben ungeprüft.

## Größen- und Qualitätskorrektur (28.10.2026)

Auf ausdrücklichen Wunsch werden **keine neu generierten Figuren** eingesetzt. Die drei bestehenden zweiphasigen WebP-Dateien bleiben unverändert. Die serverseitig aus den vorhandenen Originalen abgeleiteten Einzelphasen werden mit Lanczos vergrößert, moderat geschärft und nun *verlustfrei* als WebP ausgegeben (ohne erneute verlustbehaftete Kompression).

Die Übungskarten passen die ganze Figur in die Kartenhöhe ein. In der Detailansicht beträgt die maximale Bildhöhe jetzt **300 CSS-Pixel** statt der bisherigen vollen Spaltenbreite; die beiden Phasen stehen weiterhin nebeneinander. Dies reduziert die wahrgenommene Unschärfe und verhindert übergroße Portraits. Der automatische Test vergleicht auf Pixelbasis die herunterskalierten Ausgaben mit den Originalphasen. Das erzeugt keine nicht vorhandenen anatomischen Details und ersetzt keine fachliche Freigabe.

## Originalgetreue Bildausgabe statt künstlicher Hochskalierung

Die originale WebP-Datei jeder Außenrotationsübung enthält **zwei Phasen auf insgesamt nur 300 × 286 Pixeln**, also **150 × 286 Pixel pro Phase**. Die bisherige vierfache Vergrößerung und Nachschärfung erzeugte keine zusätzlichen Bilddetails und war auf Bildschirmen weiterhin weich. Diese doppelte Interpolation wurde entfernt.

Die vorhandenen sechs Phasen werden jetzt aus den bisherigen Originaldateien **ohne Resampling** ausgeschnitten und als verlustfreies WebP übertragen. In der Detailansicht wird die Darstellung auf 220 CSS-Pixel Höhe begrenzt, damit der Browser keine Vergrößerung über die Originalauflösung erzwingt. Ein Regressionstest verifiziert die identischen Pixeldaten, dimensionsgetreue Wiedergabe und die geschützte Bildroute.

Dies ist die technisch verlustärmste Anzeige der vorhandenen Dateien, **keine echte Hochauflösungsrestauration**. Für sichtbar feinere Gesichter, Hände und Konturen werden **höher aufgelöste Ausgangszeichnungen der exakt selben Figur und Posen** benötigt. Es wurden weder neue Figuren noch neue Bilder erstellt. Die Übungen bleiben fachlich ungeprüfte Entwürfe.
