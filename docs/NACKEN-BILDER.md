# Nackenübungen – einheitliche Illustrationen

Stand: 22.10.2026, Version 0.1.22-dev.

Die bisherigen SVG-Bilder der drei Nackenübungen wurden durch eigene, mit dem eingebauten ImageGen erzeugte PNG-Bildpaare ersetzt. Stilreferenz: `server/assets/reference/reference-seated-trunk-rotation.png` aus diesem Repository. Figur, Kleidung und Darstellung entsprechen den übrigen Übungsillustrationen. Fachlicher Entwurfsstatus bleibt bestehen.

## Dateien und Bildaufträge

Alle Dateien liegen unter `server/assets/reference/`. Jedes Bild enthält zwei gleich große quadratische Felder nebeneinander (Ausgangs- und Endstellung), ohne eingebrannte Beschriftungen. Die Darstellung verwendet daher `frameAspectRatio: 1`.

- `reference-neck-rotation-seated.png`: Aufrechter Sitz, Hände auf den Oberschenkeln, zunächst Blick geradeaus; danach nur den Kopf zur Seite drehen. Schultern und Becken bleiben frontal, Kinn waagerecht. Kleiner blauer Drehpfeil am Kopf. Vorlage ist die Oberkörperrotationsgrafik, aber ohne ausgestreckte Arme oder Rumpfdrehung.
- `reference-neck-tilt-seated.png`: Bearbeitung der neuen Kopfrotationsgrafik mit identischer Figur, Kleidung, Sitzposition und Aufteilung. Ausgangsbild neutral; Endbild Kopf etwa 20 Grad zur linken Schulter (rechts im Bild) geneigt. Gesicht weiterhin frontal, Schultern entspannt, Rumpf senkrecht. Gebogener blauer Pfeil für Seitneigung, keine Kopfdrehung oder Handhilfe.
- `reference-neck-glide-seated.png`: Dieselbe Figur in vollständiger Seitenansicht nach rechts. Aufrechter Sitz, Hände auf den Oberschenkeln, Füße am Boden. Links Kopf leicht vorverlagert, rechts horizontal zurückgeschoben mit leichtem Doppelkinn; Blickhöhe konstant, kein Nicken. Blauer gerader Rückwärtspfeil. Gemeint ist die Nackenübung „Taube“, keine Yoga-Haltung.

Gemeinsame Vorgaben der Bildgenerierung: erwachsener Mann mit braunen Locken, blauem Shirt, orangefarbenen Shorts und blauen Schuhen; grauer Hocker; weißer Hintergrund; weiche Schattierung; vollständige Figur mit Rand in beiden Feldern; keine Texte, Trennlinien oder zusätzlichen Gliedmaßen.

## Einbindung und Prüfung

Die geschützte Bildroute liefert nun auch diese drei Atlanten als PNG aus. Die bestehenden Zuordnungen und Zugriffskontrollen bleiben erhalten. Der Integrationstest ruft alle drei Bildrouten ab und prüft PNG-Inhalt und Content-Type. Build und gezielte Katalogtests wurden erfolgreich ausgeführt.

## Anzeige nach GitHub-Upload

Der vorhandene GitHub-Workflow führt Build und Tests aus, veröffentlicht aber keine Anwendung. Für eine lokale Installation müssen Änderungen zuerst mit `git pull` übernommen und der Server neu gestartet werden; im Produktionsmodus ist außerdem `npm run build` erforderlich. Anschließend die Browserseite neu laden. Die geschützten Antworten verwenden bereits `Cache-Control: private, no-store`.
