# training.physio-lfd.de auf die Trainingsdemo schalten

Stand: 30.10.2026. Die Demo läuft bereits auf https://physio-lfd-training.web.app/. Die Wunschdomain ist diesem Firebase-Hosting zugeordnet. Firebase meldet noch abweichendes Hosting, fehlende Eigentumsbestätigung und ein Zertifikat in Prüfung. Die folgenden Einträge stammen aus der tatsächlichen Firebase-Domainkonfiguration, zuletzt am 30.10.2026 geprüft.

Der Administrator der DNS-Zone **physio-lfd.de** muss ausschließlich folgende Einträge ändern:

| Aktion | Typ | Vollständiger DNS-Name | Wert |
|---|---|---|---|
| Entfernen | A | training.physio-lfd.de | 91.204.46.88 |
| Entfernen | AAAA | training.physio-lfd.de | 2a03:4000:61:842e::20:2018 |
| Hinzufügen | CNAME | training.physio-lfd.de | physio-lfd-training.web.app |
| Hinzufügen | TXT | _acme-challenge.training.physio-lfd.de | AxDCVMT88noAZRJf2KhfCRI7Hhpz0xuoyvewX1hFaJk |

Bei Verwaltungsoberflächen, die den Zonennamen automatisch anhängen, lauten die Namen `training` und `_acme-challenge.training`. Ein abschließender Punkt am CNAME-Ziel ist abhängig vom DNS-Editor zulässig beziehungsweise erforderlich. Am Namen `training` dürfen keine konkurrierenden A-/AAAA-Einträge verbleiben. Bestehende Einträge für Website, Mail und andere Subdomains unverändert lassen. Keine zusätzliche HTTP-Weiterleitung und keinen Proxy vorschalten.

Der TXT-Wert ist ein öffentlicher Zertifikatsnachweis und kein Passwort. Falls die Umstellung erst später erfolgt und Firebase einen anderen Nachweis anzeigt, den dann aktuellen Wert aus **Firebase Console → physio-lfd-training → Hosting → training.physio-lfd.de** übernehmen.

Weiterleitbarer Auftrag:

> Bitte die Subdomain training.physio-lfd.de auf Firebase Hosting umstellen: die bisherigen A- und AAAA-Einträge für training entfernen und den CNAME training auf physio-lfd-training.web.app setzen. Für die Zertifikatsvalidierung bitte den oben aufgeführten TXT-Eintrag unter _acme-challenge.training ergänzen. Alle anderen DNS-Einträge unverändert lassen. Die Anwendung läuft bereits; ein Webhostingpaket oder Node.js-Dienst ist dafür nicht nötig.

Nach DNS-Verteilung und erfolgreicher Firebase-Zertifikatsausstellung muss https://training.physio-lfd.de/ die Firebase-Anmeldung ohne Zertifikatswarnung zeigen. Danach Anmeldung, Übungsbilder, PDF sowie sichtbare Version **0.1.31-dev / 30.10.2026** auf dieser Domain prüfen. Diese Prüfung steht aus, solange die DNS-Einträge auf Netcup zeigen. Die bisherige Netcup-Passwortabfrage entfällt nach der Umstellung; der Zugang wird dann von der Firebase-Anmeldeseite geschützt.
