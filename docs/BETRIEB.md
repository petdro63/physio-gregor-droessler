# Betrieb und Hosting

## Festgestellter Bestand

Am 18.10.2026 wurde das vom Nutzer benannte Projekt `LP-WebSeite` unter `U:\LP` gelesen. Es beschreibt KontaktWerk mit Firebase Hosting (`kontaktwerk-45210`), Firestore in `europe-west3` (Frankfurt), Tarif Spark, und einem separaten Cloudflare-Worker mit R2-Dateispeicher. Eine Hostingzuordnung oder ein Tarif für `vitalcoaching.eu` ist dort nicht dokumentiert. DNS-Abfragen zeigten INWX-Nameserver; daraus lässt sich kein Webhostingtarif ableiten.

KontaktWerk und seine produktiven Ressourcen wurden nicht verändert. GitHub ist Quellcodeverwaltung und CI, kein Ersatz für den geschützten Anwendungsserver. GitHub Pages ist für dieses Backend ungeeignet.

## Vorgeschlagene Zielarchitektur

Die neue App auf einem eigenen Server oder Containerhost in Deutschland/EU betreiben und `physio.vitalcoaching.eu` dorthin routen. Node.js 24, persistenter Speicher, TLS-Reverse-Proxy und verschlüsselte externe Backups werden benötigt. Eine statische Ablage im bestehenden Firebase-Hosting reicht für diese serverseitige Architektur nicht aus. Eine spätere Portierung auf verwaltete Firebase-/Cloudflare-Dienste erfordert ein eigenes Projekt und eine Prüfung der Datenverarbeitung; bestehende KontaktWerk-Ressourcen werden nicht wiederverwendet.

Mit einem Docker-Volume für `/app/data` ist der Container unabhängig vom Host. `deploy/Caddyfile.example` zeigt die geplante Subdomain. Vor Verwendung DNS und TLS tatsächlich einrichten. Noch keine der Beispieladressen bedeutet eine vorhandene Bereitstellung.

## Einrichtung

1. Repository auschecken und `npm ci` ausführen.
2. `.env.example` nach `.env` kopieren.
3. `DEMO_MODE=false`, `HOST=127.0.0.1` und `APP_ORIGIN=https://physio.vitalcoaching.eu` setzen.
4. Einen eigenen zufälligen Schlüssel mit 32 Bytes als 64 hexadezimale Zeichen in `TOTP_ENCRYPTION_KEY` hinterlegen. Den Wert ausschließlich im Secretstore oder der ungetrackten Serverkonfiguration halten und separat gesichert verwahren.
5. `npm run setup` interaktiv ausführen. Name und E-Mail der gewünschten Administration angeben. Der einmalige Einrichtungslink ist vertraulich und 48 Stunden gültig.
6. `npm run build` und `npm start` ausführen. Für Docker den Setup-Befehl innerhalb derselben Volumeumgebung ausführen.
7. Den Einrichtungslink selbst öffnen, Passwort festlegen und bei der ersten Mitarbeiteranmeldung eine Authenticator-App einrichten.
8. Vollständige Betreiberangaben und Inhalte ergänzen.

Im Produktionsbetrieb verweigert die App den Start mit aktivem Demomodus oder fehlendem TOTP-Verschlüsselungsschlüssel. Der Reverse-Proxy muss HTTPS terminieren und Forwarded-Header zuverlässig überschreiben. Der App-Port darf von außen ausschließlich über den vertrauenswürdigen Proxy erreichbar sein; `trust proxy=1` setzt diese Topologie voraus.

Passwörter werden mit bcrypt verarbeitet. Sitzungen werden serverseitig verwaltet, laufen nach einer Stunde ab und verwenden HttpOnly/SameSite-Strict-Cookies, produktiv zusätzlich Secure und den `__Host-`-Präfix. Mitarbeiter absolvieren TOTP nach der Passwortprüfung. Zugangswiederherstellung und MFA-Rücksetzung sind in dieser Fassung bewusst ein dokumentierter Betreiberprozess; es gibt keinen ungesicherten Selfservice-Reset.

## Backups

Nur in einer geschützten Operatorsitzung `BACKUP_PASSPHRASE` bereitstellen (mindestens 20 Zeichen). Danach:

```powershell
npm run backup
```

Der Prozess erstellt einen konsistenten SQLite-Snapshot und verschlüsselt Datenbank, lokale Sitzungsschlüssel und Medien mit AES-256-GCM; der Schlüssel wird über scrypt abgeleitet. Die Dateien liegen standardmäßig unter `data/backups`. Den TOTP-Produktionsschlüssel getrennt sichern. Das Backupwerkzeug lädt das gesamte Archiv in den Speicher; vor einem großen Videoarchiv ist es durch eine streamende Sicherung beziehungsweise ein geeignetes professionelles Backupwerkzeug zu ersetzen.

Wiederherstellung benötigt ein leeres Ziel:

```powershell
npm run restore -- C:\sicherungen\physio.enc C:\physio-wiederherstellung
```

Danach `DATA_DIR` auf das Ziel setzen und den Dienst mit demselben TOTP-Schlüssel starten. Wiederhergestellte Sitzungen werden entfernt. Der Test überprüft Datenbankintegrität und Mediendateien. Im Betrieb sind Wiederherstellungen regelmäßig mit isolierter Umgebung zu proben. Keine Backups ins Repository aufnehmen.

## Noch vor echtem Patienteneinsatz

- Konkreten Hostingtarif, Datenstandorte, AV-Verträge, Schutz- und Löschkonzept festlegen.
- Zweckbestimmung und gegebenenfalls medizinprodukterechtliche Anforderungen prüfen.
- Rechtsgrundlagen und erforderliche Einwilligungen, Datenschutzhinweise, vollständiges Impressum und Aufbewahrungsfristen fachlich festlegen.
- Fachliche Freigabe jeder verwendeten Übung, Medienrechte und Einwilligungen dokumentieren.
- Echte Übungsvideos mit passenden deutschen VTT-Untertiteln und Transkript bereitstellen. Die Freigabeprüfung benötigt mindestens zwei Bilder, ein Video und eine zeitcodierte VTT-Datei; die inhaltliche Synchronität ist zusätzlich fachlich zu prüfen.
- Videotranscodierung, adaptive Auflösungen und Streaming für größere Uploadmengen ergänzen. Vorhandene Uploads werden auf Typ und Größe geprüft, Bilder optimiert; Videos bleiben im Originalformat.
- Monitoring, Protokollrotation, Speicherwarnungen und geplante externe Backups auf dem Zielhost einrichten.
- Lösch-/Aufbewahrungsprozesse organisatorisch festlegen. Der aktuelle Export ist vorhanden; ein freier Löschknopf ist wegen noch offener Aufbewahrungsregeln nicht eingebaut.
- Datenschutz- und Sicherheitstest der tatsächlichen Hostingumgebung durchführen.

Diese Punkte sind offen dokumentiert und durch keine pauschale Behauptung „DSGVO-konform“ ersetzt.

## Versionierung und Abnahme

Bei einer neuen Auslieferung `package.json`, `server/version.mjs`, den PWA-Cache-Namen und die Releaseangaben gemeinsam aktualisieren. Bestehende Umgebungssuffixe beibehalten, Datum nach Europe/Berlin bestimmen. Nach Bereitstellung unter „Über die App“ Version und Datum prüfen sowie Anmelden, Sperren, Medienzugriff und PDF auf der tatsächlichen Domain testen.
