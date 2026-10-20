# Übungsliste bereinigt · 20.10.2026

Aktueller Stand: Die Sammlung wurde später um Wandsitz und zwei Brücken auf elf Einträge erweitert. [Aktuelle Ergänzungen](WANDSITZ-UND-BRUECKEN.md).

Nachtrag: Anschließend wurden auf Nutzerwunsch sechs neue Stand-Kraftübungen ergänzt. Die aktuelle Sammlung enthält damit acht Einträge; die historische Bereinigung bleibt wirksam. Auch beim Erststart werden die sechs später ergänzten IDs erhalten. [Neue Übungen und Bilder](STAND-KRAFTUEBUNGEN.md).

Auf ausdrücklichen Nutzerwunsch enthielt die Sammlung nach Version 0.1.11 nur noch:

- Einbeiniges Kreuzheben mit Kurzhanteln (`einbein-kreuzheben-kurzhanteln`)
- Einbeiniges Kreuzheben mit Langhantel (`einbein-kreuzheben-langhantel`)

Alle anderen zum Zeitpunkt des Updates vorhandenen Einträge werden einmalig und dauerhaft aus der Übungsliste entfernt. Dies gilt auch nach Neustarts und erneuter Initialisierung der Demo-Inhalte. Es handelt sich nicht um einen vorübergehenden Suchfilter.

Die neue Tabelle `exercise_list_removals` speichert die entfernten Listenmitgliedschaften. Die einmalige Anwendung wird in `settings` protokolliert. Danach neu angelegte Übungen können normal in die Sammlung aufgenommen werden; es gibt keine dauerhafte Beschränkung auf zwei fest codierte IDs.

Übungsversionen, Medien, bestehende Pläne, Planversionen und Trainingsverläufe werden nicht gelöscht oder geändert. Frühere Übungen bleiben dort erhalten, wo bereits bestehende Pläne und Verläufe darauf verweisen. Die Bibliotheks-, Vorschlags- und Auswahlansichten verwenden die bereinigte Liste.

In kleinen Sammlungen werden Varianten standardmäßig einzeln angezeigt. Die leere Gelenkübersicht entfällt bei zwei Einträgen. Der neue Test prüft die Übernahme einer bestehenden Datenbank, unveränderte Pläne und Trainingsdaten, das Ergebnis nach einem Neustart und die Aufnahme einer später neu angelegten Übung.
