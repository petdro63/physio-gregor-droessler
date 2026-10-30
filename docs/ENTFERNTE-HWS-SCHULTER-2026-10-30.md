# Rücknahme der HWS- und Schulteraußenrotationsübungen · 30.10.2026

Auf Anforderung wurden acht aus der Birshof-HWS-Broschüre abgeleitete Entwürfe und drei Schulteraußenrotationen aus der aktiven Sammlung entfernt. Dies betrifft nur die elf IDs in `src/retired-exercise-ids.json`, nicht die übrigen Mobilisationsübungen für den Nacken oder die Hüftbeuger-Dehnung.

- Die beiden Quellkataloge und die elf zugehörigen Illustrationsdateien wurden aus dem aktuellen GitHub-Stand entfernt. Ihre bisherigen historischen Beschreibungen sind in älteren Commits weiterhin nachvollziehbar.
- `collectionExerciseIds` und die automatische Anlage enthalten die elf IDs nicht mehr.
- Lokale Installationen archivieren vorhandene Einträge und führen sie in der Liste ausgeschlossener Übungen, ohne bestehende versionierte Einträge, Patientenzuordnungen, Pläne oder Verläufe zu löschen.
- In bestehenden Firebase-Demodaten bleiben die historischen Informationen in Firestore gespeichert. Die aktuelle Browser-App schließt die elf IDs von der Übungsbibliothek, Detailzugriffen und neuen Trainingsvorgängen aus, auch wenn ältere Demo-Zustände diese noch speichern.
- Der Firebase-Build erstellt für die entfernten Übungen keine neuen Bilddateien. Ein Quellcode-Commit allein ist keine Hosting-Bereitstellung.
- Als Funktionsprüfungen dienen die erneuerten Katalog-, Zugriffs- und Migrations-Tests.

Die drei bestehenden, separat angelegten Übungen `kopfrotation-sitzend`, `kopfseitneigung-sitzend` und `taube-sitzend` bleiben erhalten.
