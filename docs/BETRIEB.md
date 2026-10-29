# Betrieb und Hosting

## Festgestellter Bestand

Am 18.10.2026 wurde das vom Nutzer benannte Projekt `LP-WebSeite` unter `U:\LP` gelesen. Es beschreibt KontaktWerk mit Firebase Hosting (`kontaktwerk-45210`), Firestore in `europe-west3` (Frankfurt), Tarif Spark, und einem separaten Cloudflare-Worker mit R2-Dateispeicher. Eine Hostingzuordnung oder ein Tarif für `vitalcoaching.eu` ist dort nicht dokumentiert. DNS-Abfragen zeigten INWX-Nameserver; daraus lässt sich kein Webhostingtarif ableiten.

KontaktWerk und seine produktiven Ressourcen wurden nicht verändert. GitHub ist Quellcodeverwaltung und CI, kein Ersatz für den geschützten Anwendungsserver. GitHub Pages ist für dieses Backend ungeeignet.

## Vorgeschlagene Zielarchitektur

Die neue App auf einem eigenen Server oder Containerhost in Deutschland/EU betreiben und `training.physio-lfd.de` dorthin routen. Node.js 24, persistenter Speicher, TLS-Reverse-Proxy und verschlüsselte externe Backups werden benötigt. Eine statische Ablage im bestehenden Firebase-Hosting reicht für diese serverseitige Architektur nicht aus. Eine spätere Portierung auf verwaltete Firebase-/Cloudflare-Dienste erfordert ein eigenes Projekt und eine Prüfung der Datenverarbeitung; bestehende KontaktWerk-Ressourcen werden nicht wiederverwendet.

Mit einem Docker-Volume für `/app/data` ist der Container unabhängig vom Host. `deploy/Caddyfile.example` zeigt die geplante Subdomain. Vor Verwendung DNS und TLS tatsächlich einrichten. Noch keine der Beispieladressen bedeutet eine vorhandene Bereitstellung.

## Einrichtung

1. Repository auschecken und `npm ci` ausführen.
2. `.env.example` nach `.env` kopieren.
3. `DEMO_MODE=false`, `HOST=127.0.0.1` und `APP_ORIGIN=https://training.physio-lfd.de` setzen.
4. Einen eigenen zufälligen Schlüssel mit 32 Bytes als 64 hexadezimale Zeichen in `TOTP_ENCRYPTION_KEY` hinterlegen. Den Wert ausschließlich im Secretstore oder der ungetrackten Serverkonfiguration halten und separat gesichert verwahren.
5. `npm run setup` interaktiv ausführen. Name und E-Mail der gewünschten Administration angeben. Der einmalige Einrichtungslink ist vertraulich und 48 Stunden gültig.
6. `npm run build` und `npm start` ausführen. Für Docker den Setup-Befehl innerhalb derselben Volumeumgebung ausführen.
7. Den Einrichtungslink selbst öffnen, Passwort festlegen und bei der ersten Mitarbeiteranmeldung eine Authenticator-App einrichten.
8. Vollständige Betreiberangaben und Inhalte ergänzen.

Im Produktionsbetrieb verweigert die App den Start mit aktivem Demomodus ohne ausdrückliche, passwortgeschützte Demo-Freischaltung oder fehlendem TOTP-Verschlüsselungsschlüssel. Der Reverse-Proxy muss HTTPS terminieren und Forwarded-Header zuverlässig überschreiben. Der App-Port darf von außen ausschließlich über den vertrauenswürdigen Proxy erreichbar sein; `trust proxy=1` setzt diese Topologie voraus.

Passwörter werden mit bcrypt verarbeitet. Sitzungen werden serverseitig verwaltet, laufen nach einer Stunde ab und verwenden HttpOnly/SameSite-Strict-Cookies, produktiv zusätzlich Secure und den `__Host-`-Präfix. Mitarbeiter absolvieren TOTP nach der Passwortprüfung. Zugangswiederherstellung und MFA-Rücksetzung sind in dieser Fassung bewusst ein dokumentierter Betreiberprozess; es gibt keinen ungesicherten Selfservice-Reset.

## Passwortgeschützte Internetdemo

Auftrag vom 29.10.2026: die bisherige Demo mit erfundenen Personen unter `https://training.physio-lfd.de` zeigen. DNS löst auf Netcup auf; HTTPS leitet korrekt weiter. Ohne Zugangsdaten antworten Startseite und API mit HTTP 401. Die übermittelten Zugangsdaten öffnen derzeit eine Netcup-Platzhalterseite, `/api/session` ist dort noch nicht vorhanden (HTTP 404). Diese Prüfung bestätigt den bestehenden Domainschutz, keine Anwendungsbereitstellung.

Die FTPES-Anmeldung am Netcup-Server gelang mit gültigem TLS-Zertifikat. Passive FTP-Datenverbindungen und SSH-Port 22 waren aus dem verwendeten Netz nicht erreichbar. Die Node.js-Verfügbarkeit und der tatsächliche Dokumentenstamm müssen noch in der Hostingverwaltung geprüft werden. Ein reiner FTP-Upload von `dist/` genügt nicht: Die Demo benötigt das Express-/SQLite-Backend.

Für den ausdrücklich freigegebenen Demobetrieb folgende Werte ausschließlich als geheime Host-Umgebungsvariablen oder in einer ungetrackten `.env` im Anwendungsstamm setzen:

```dotenv
NODE_ENV=production
DEMO_MODE=true
HOSTED_DEMO=true
APP_ORIGIN=https://training.physio-lfd.de
HOST=127.0.0.1
PORT=3180
DEMO_ACCESS_USER=<bereitgestellter Benutzername>
DEMO_ACCESS_PASSWORD_HASH='<bcrypt-Hash des bereitgestellten Passworts, Kosten 12>'
TOTP_ENCRYPTION_KEY=<64 zufällige hexadezimale Zeichen>
```

`DATA_DIR` muss bei dieser Betriebsart ungesetzt bleiben. Die App erzeugt auf dem Zielhost eine eigene Datenbank unter `data/demo`; lokale Datenbanken, Sitzungsschlüssel und Praxisdaten werden nicht übertragen. Fehlende Zugangsdaten, ungeeignete Hashes, ein HTTP-Origin und abweichende Datenverzeichnisse verhindern den Start. `HOSTED_DEMO=true` ist ausschließlich mit `DEMO_MODE=true` im Produktionsmodus zulässig. Ohne diese ausdrückliche Einstellung bleibt der bisherige Schutz gegen produktiven Demobetrieb bestehen.

Der zusätzliche HTTP-Basic-Schutz in `server/hosted-demo.mjs` gilt vor Sitzungserstellung für die gesamte App einschließlich HTML, API, Service Worker und Medien. Fehlversuche werden auf 30 je 15 Minuten und IP begrenzt; erfolgreiche Zugriffe werden nur mit einem pro Prozess geheimen HMAC zwischengespeichert. Der vorhandene Netcup-Passwortschutz bleibt bestehen und verwendet dieselben Zugangsdaten. Der Proxy muss den Authorization-Header an die App weiterreichen. Passwörter und Hashes gehören nicht in Git, Dokumentation oder Ausgaben.

Auf dem Zielhost `npm ci`, `npm run build` und `npm start` mit Node.js 24 ausführen beziehungsweise die entsprechenden Funktionen des Hostingpanels verwenden. Anwendungsstamm, `data/`, `.env` und Quellcode müssen außerhalb des öffentlich statisch ausgelieferten Dokumentenstamms liegen; nur `dist/` darf als statisches Webverzeichnis dienen, API-Anfragen müssen den Node-Prozess erreichen. Ein vorhandener Webserver bleibt für HTTPS und die Domain zuständig. Bei Docker `/app/data` persistent einbinden und für die Internetdemo `DEMO_MODE=true` sowie die oben genannten Variablen übergeben; im Container `HOST=0.0.0.0` verwenden und den App-Port ausschließlich für den Reverse-Proxy zugänglich machen.

Nach Bereitstellung auf der tatsächlichen Domain ohne Kennwort HTTP 401 sowie mit Kennwort Anmeldung, Demo-Rollen, Übungsbilder, PDF und die sichtbare Version mit Datum prüfen. Die Demo ist vollständig bearbeitbar und ihre Demo-Rollen sind allen Personen mit dem gemeinsamen Demo-Zugang zugänglich; keine echten Patientendaten eintragen.

Referenzen: [Netcup WCP-Auto-Login](https://www.netcup.com/de/helpcenter/dokumentation/webhosting/auto-login-webhosting-control-panel), [Netcup Webhostingverwaltung](https://www.netcup.com/de/helpcenter/dokumentation/webhosting/interface).

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
