# Praxisanleitung

## Vorschau

`npm run dev` starten und `http://localhost:3180` öffnen. Die Patientenansicht enthält Anna Beispiel; die Praxisansicht gehört einem synthetischen Administrationskonto. Oben lässt sich die Demoansicht wechseln. In der Vorschau keine echten Patientendaten eingeben.

## Einen Patienten aufnehmen

1. In „Patienten“ auf „Patient anlegen“ klicken und die erforderlichen Mindestangaben erfassen.
2. „Einladung“ erzeugt einen persönlichen Link und QR-Code für die Übergabe. Es wird keine E-Mail verschickt.
3. Der Patient legt über den einmaligen Link sein Passwort fest.
4. Die Administration wählt unter „Zugang“ den Status „Freigeschaltet“ und gegebenenfalls ein Ablaufdatum.
5. Über „Plan ansehen“ den Patienten auswählen und einen individuellen Trainingsplan erstellen.

Patienteneinladung und Freischaltung sind bewusst getrennte Schritte. Eine neue Einladung macht einen älteren, ungenutzten Link ungültig. Eine Sperrung entzieht bestehende Sitzungen und weitere Medienzugriffe. Bereits vom Gerät empfangene Daten können technisch nicht zurückgerufen werden.

## Übungen pflegen

Unter „Übungsbibliothek“ neue Übung anlegen. Ausgangsstellung, einzelne Durchführungsschritte, Hinweise und Metadaten ausfüllen. Zunächst als Entwurf speichern. Danach „Bearbeiten & Medien“ öffnen, eigene Bilder und ein Video hochladen und erneut speichern. Erst dann sind die hochgeladenen Dateien der neuen Inhaltsversion zugeordnet.

Inhaltsänderungen erzeugen einen neuen Entwurf. Ein bereits zugewiesener Plan behält seine ursprüngliche Übungsversion. Die Freigabeprüfung benötigt mindestens zwei Bilder, Video, VTT-Untertitel, Rechteangabe, fachlichen Prüfer, Prüfdatum, Vorsichtshinweise und Transkript. „Demonstration“ ist keine fachliche Freigabe. Die Administration nimmt die abschließende Veröffentlichung vor.

## Trainingsplan erstellen

Patient auswählen, „Trainingsplan erstellen“ öffnen, Name, Laufzeit und Wochentage festlegen. Freigegebene Übungen hinzufügen, Dosierung, Körperseite, Widerstand und individuelle Hinweise eintragen. Über den Pfeil die Reihenfolge ändern. Speichern erzeugt eine neue Planversion; bestehende Trainingseinträge bleiben unverändert.

Die Startfassung bietet aktive Pläne; Pausieren und Archivieren sind über die geschützte API vorbereitet. Persönliche Planvorlagen und eine eigene Vorlagenoberfläche sind ein weiterer Ausbauschritt.

## Patiententraining

„Training starten“ führt durch den Plan. Der Timer unterstützt Halte- oder Pausenzeiten. „Erledigt & weiter“ beziehungsweise „Auslassen“ speichern den Eintrag. Beschwerden und Anmerkungen sind freiwillig. Der Verlauf zeigt Zeit, Übung und zugrunde liegende Planversion. Die App ändert keine Therapie automatisch.

Über „Plan als PDF“ einen Ausdruck herunterladen. In „Praxis & Hilfe“ lassen sich eigene gespeicherte Daten als JSON exportieren. Rückmeldungen sind kein Notfallkanal; der Leseturnus wird von der Praxis zentral hinterlegt.

## Team und Praxisdaten

Die Administration pflegt unter „Praxisverwaltung“ Kontakt- und Rechtstexte sowie die persönliche Nachricht. Neue Mitarbeiter erhalten einen eigenen Einladungslink. Bei der ersten Anmeldung ist die Einrichtung der Zwei-Faktor-Anmeldung verpflichtend. Therapeutenzuordnungen werden aktuell beim Anlegen des Patienten gesetzt; die Übergabe bestehender Patienten an weitere Mitarbeiter ist als administrativer Datenprozess dokumentiert und benötigt eine eigene Bedienoberfläche im nächsten Ausbau.

## Versionsprüfung

Links unten „Über die App“ öffnen. Dort stehen Anwendungsversion, Versionsdatum, Zeitzone und Betriebsart.
