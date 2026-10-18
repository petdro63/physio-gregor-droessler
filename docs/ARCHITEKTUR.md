# Datenmodell und Entscheidungen

`server/migrations/001-initial.sql` ist die initiale relationale Migration. Weitere Schemaänderungen erhalten neue Migrationen; bereits angewandte Dateien dürfen nicht nachträglich ersetzt werden. Der Migrationsrunner führt neue SQL-Migrationen der Reihe nach atomar aus und protokolliert ihren Stand. Die zweite Migration ergänzt den Medientyp für VTT-Untertitel.

| Tabelle | Zweck |
| --- | --- |
| users | Identität, Rolle, Passwort-Hash, Freischaltung, Ablaufdatum und verschlüsseltes TOTP-Geheimnis |
| assignments | Sichtberechtigungen von Therapeuten auf Patienten |
| invitations | Token-Hash, Ablauf und einmalige Nutzung |
| exercises | Stabile Übungsidentität und aktueller Redaktionsstatus |
| exercise_versions | Unveränderliche Inhalte je Version |
| media | Geschützte Medienmetadaten, Zuordnung und tatsächlicher MIME-Typ |
| plans / plan_versions | Patientenzuweisung und unveränderliche Planversionen |
| training_sessions | Übungsereignis mit ursprünglicher Plan- und Übungsversion |
| audit_events | Datensparsame Sicherheits- und Änderungsereignisse |
| settings | Zentral verwaltete Praxisinformationen |
| http_sessions | Widerrufbare, serverseitige Sitzungen |

Medienrechte werden in der Inhaltsversion dokumentiert. Eine feiner aufgelöste Rechteverwaltung pro einzelner Datei einschließlich Releases ist ein späterer Schemaausbau. Medien liegen außerhalb des Webroots und sind nur mit passender Rolle beziehungsweise Planzuweisung erreichbar.

Eine Therapiezuweisung enthält die konkrete Übungsversion; das Speichern einer neuen Übung oder Dosierung überschreibt keine früheren Einträge. Eine veröffentlichte Übung kann nach Bearbeitung wieder einen Entwurf haben; zuvor zugewiesene Versionen bleiben im Plan erhalten. Neue Pläne dürfen ausschließlich die aktuelle freigegebene Version verwenden.

Die Patientensicht liefert nur das eigene Profil, eigene Pläne und eigene Ereignisse. Therapeutische Schreibrechte setzen eine Zuordnung voraus. Die Administration kann alle Praxispatienten verwalten. API-Fehlermeldungen zu nicht berechtigten fremden Objekten bestätigen deren Existenz nicht.

## Abgrenzung der Startfassung

Bereit sind der durchgängige lokale Demonstrationsablauf und der technische Grundstock des geschützten Praxisbetriebs. Es gibt keine selbstständige Diagnostik, keine medizinische KI, keine automatische Belastungsanpassung und keine laufende Alarmüberwachung. E-Mail-Versand, native App-Stores, Teletherapie und Abrechnung sind nicht Bestandteil dieser ersten Etappe.

Offene produktive Ausbauten sind im Betriebs- und Inhaltsdokument konkret benannt: echte freigegebene Medien, Vorlagenverwaltung, Patientenumverteilung, Speicher-/Videobetrieb sowie rechtliche und klinische Freigaben.
