# Automatische Updates der lokalen Vorschau

Ab Version 0.1.23-dev startet `npm run dev` einen lokalen Begleitprozess. Er prüft beim Start und danach alle 60 Sekunden `origin/master` im Repository `https://github.com/petdro63/physio-gregor-droessler.git`.

## Einmal einschalten

Den bisherigen Server mit Strg+C beenden und im Projektordner ausführen:

```sh
git pull origin master
npm run dev
```

Das Terminal geöffnet lassen. Künftige GitHub-Änderungen werden automatisch übernommen. Nach der Meldung „Version … bereit“ genügt das Neuladen von http://localhost:3180/ im Browser. Bei ausgeschaltetem Computer oder geschlossenem Terminal erfolgt die Prüfung beim nächsten Start von `npm run dev`.

## Verhalten

- Nur der erwartete HTTPS-Remote und der Branch `master` werden verwendet.
- Eigene Änderungen, neue unversionierte Dateien oder abweichende lokale Commits pausieren die Aktualisierung. Es gibt kein automatisches Zurücksetzen, Verwerfen oder Stashen.
- Neue Versionen werden ausschließlich per Fast-Forward übernommen. Vor dem Schreiben werden Arbeitsverzeichnis und Commit erneut geprüft.
- Ignorierte Dateien wie `.env`, `data/`, lokale Datenbanken und Backups bleiben erhalten.
- Vor der Übernahme wird der laufende Server beendet. Geänderte Abhängigkeiten werden mit `npm ci` installiert; anschließend wird der Build geprüft und die Vorschau neu gestartet.
- Bei einem Installations- oder Buildfehler bleibt die Vorschau gestoppt. Die Fehlermeldung steht im Terminal. Nach Behebung und erneutem `npm run dev` wird die unterbrochene Installation/Prüfung wiederholt.
- Ist GitHub nicht erreichbar, läuft eine bereits gestartete Vorschau weiter; die Prüfung wird nach 60 Sekunden wiederholt.
- Während Übernahme, Installation und Neustart ist die lokale Seite kurz nicht erreichbar. Offene, noch nicht gespeicherte Eingaben vor dem Neuladen sichern.

Diese Funktion aktualisiert die lokale Entwicklungsvorschau. `npm start` für den Produktionsbetrieb bleibt unverändert. Sie richtet weder einen Computer-Autostart noch eine externe Veröffentlichung ein. Manuell ohne GitHub-Prüfung starten: `npm run dev:manual`.

## Prüfung

Die Tests verwenden lokale temporäre Git-Repositories. Geprüft werden Fast-Forward-Übernahme, Erkennung geänderter Abhängigkeiten, Erhalt ignorierter Daten, Pausieren bei lokalen Änderungen, abweichendem Remote/Branch/Commits sowie Abbruch bei zwischenzeitlichen Änderungen.
