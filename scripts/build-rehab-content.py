"""Curated, independently worded research summaries; originals stay in tmp/."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def read(name): return json.loads((root/name).read_text(encoding="utf-8-sig"))
def write(name, data): (root/name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
taxonomy = read("src/exercise-taxonomy.json")
for value in ["Kiefergelenk"]:
    if value not in taxonomy["joints"]: taxonomy["joints"].append(value)
for value in ["Tiefe Halsbeuger", "Nackenstrecker", "Kaumuskulatur (M. masseter / temporalis)", "Kieferöffner (suprahyoidale Muskulatur)", "Hüftadduktoren", "Beckenbodenmuskulatur", "Schulterinnenrotatoren (M. subscapularis)"]:
    if value not in taxonomy["muscles"]: taxonomy["muscles"].append(value)
write("src/exercise-taxonomy.json", taxonomy)
J=taxonomy["joints"]; M=taxonomy["muscles"]
manifest=read("tmp/research/hirslanden/manifest.json") if (root/"tmp/research/hirslanden/manifest.json").exists() else read("src/brochure-library.json")
titles=["Schulter selbst bewegen", "Kiefergelenk und Kaumuskulatur", "Schultertraining mit Hanteln", "Schultertraining mit Theraband", "Schulterkapsel und Mobilisation", "Heimprogramm obere Extremität", "Halswirbelsäule", "Stretching", "Beintraining mit belasteter Beugung", "Schultertraining mit Stützaktivität", "Schulterblattstabilisation", "Beintraining mit gestrecktem Knie", "Knie und Hüfte mobilisieren", "Segmentale Rumpfstabilisation", "Heimprogramm untere Extremität"]
brochures=[dict(id=s["id"], title=titles[i], url=s["url"], pages=s["pages"], reviewedOn="2026-10-19", treatment="Eigene Kurzfassungen; Originalfotos nicht übernommen") for i,s in enumerate(manifest)]

# doc|key|title|type|position|equipment|joints|muscles|movement
# A short movement summary preserves the exercise family without copying the handouts.
rows="""
1|arm-gefuehrt|Arm geführt anheben|Mobilisation|In Rückenlage|Kein Hilfsmittel|3,4||Gesunde Hand unterstützt den betroffenen Arm beim Anheben.
1|ellbogen-oeffnen|Ellenbogen seitlich öffnen|Mobilisation|In Rückenlage|Kein Hilfsmittel|3,4||Hände an der Stirn halten; Ellenbogen behutsam auseinanderführen.
1|haengen-gestuetzt|Arm unterstützt hängen lassen|Mobilisation|Im Sitzen|Kein Hilfsmittel|3||Arm mit anderer Hand tragen; Oberkörper leicht vorbeugen.
1|haengen|Arm locker hängen lassen|Mobilisation|Im Stand|Tisch|3||Sicher abstützen, Oberkörper vorbeugen; Arm entspannt lassen.
1|arm-vor-sitz|Arm im Sitz führen|Mobilisation|Im Sitzen|Kein Hilfsmittel|3,4||Verschränkte Hände von der Stirn langsam nach vorn führen.
1|ellbogen-sitz|Ellenbogen im Sitz öffnen|Mobilisation|Im Sitzen|Kein Hilfsmittel|3,4||Hände an der Stirn; Ellenbogen kontrolliert öffnen und schließen.
1|ball-tisch|Ball auf Tisch rollen|Mobilisation|Im Stand|Kleiner Ball|3||Handauflage mit Ball nach vorn und seitlich verschieben.
1|stab-rotation|Schulterrotation mit Stab|Mobilisation|Im Sitzen|Stab|3||Ellenbogen am Rumpf; andere Hand unterstützt die Außenrotation.
2|kiefer-ruhe|Kiefer in Ruhe lösen|Entspannung|Im Sitzen|Kein Hilfsmittel|13||Zähne auseinanderlassen; Unterkiefer und Zunge bewusst entspannen.
2|zunge|Zunge locker bewegen|Koordination|Im Sitzen|Kein Hilfsmittel|13||Zunge ohne Kraft bewegen; anschließend Wangen locker aufblasen.
2|masseter|Wangen äußerlich ausstreichen|Entspannung|Im Sitzen|Kein Hilfsmittel|13||Kaumuskel außen behutsam ausstreichen, Druck schmerzfrei halten.
2|intraoral|Intraorale Muskelbehandlung|Entspannung|Im Sitzen|Therapeutische Anleitung|13||Fachperson prüft und zeigt die geeignete intraorale Behandlung.
2|temporalis|Schläfen sanft massieren|Entspannung|Im Sitzen|Kein Hilfsmittel|13||Schläfen mit leichtem Kontakt kreisend massieren.
2|kiefer-oeffnen|Mundöffnung vor Spiegel|Koordination|Im Sitzen|Spiegel|13||Mund langsam gerade öffnen; Kopf dabei ruhig halten.
2|kiefer-seite|Unterkiefer seitlich bewegen|Mobilisation|Im Sitzen|Spiegel|13||Unterkiefer klein nach links und rechts führen.
2|kiefer-vor|Unterkiefer nach vorn führen|Mobilisation|Im Sitzen|Spiegel|13||Bei lockeren Zähnen Unterkiefer vorsichtig vorschieben und zurücknehmen.
2|kiefer-dehnen|Mundöffnung sanft unterstützen|Dehnung|Im Sitzen|Therapeutische Anleitung|13||Nur angeleitet: Öffnung minimal unterstützen, keinesfalls gewaltsam aufdehnen.
2|kiefer-isometrie|Kiefer gegen Fingerkontakt stabilisieren|Kraft|Im Sitzen|Kein Hilfsmittel|13|23|Öffnen und Vorschieben gegen sehr leichten Fingerwiderstand andeuten.
2|kiefer-isoseite|Kiefer seitlich stabilisieren|Kraft|Im Sitzen|Kein Hilfsmittel|13|22|Seitwärtsdruck gegen Fingerkontakt andeuten; Kieferposition bleibt ruhig.
3|hantel-schulterblatt-sitz|Schulterblatt mit Hantel stabilisieren|Kraft|Im Sitzen|Hanteln|3,4|5,6|Unterstützten Arm etwas abheben, Schulter dabei ruhig halten.
3|hantel-rotation-sitz|Außenrotation mit aufgelegtem Ellenbogen|Kraft|Im Sitzen|Hanteln|3|4|Ellenbogen abstützen; leichte Hantel kontrolliert nach außen drehen.
3|hantel-arm-rueck|Armheben in Bauchlage|Kraft|In Bauchlage|Hanteln|3,4|3,5,6|Arm seitlich am Körper mit geringer Last etwas anheben.
3|hantel-rotation-bauch|Außenrotation in Bauchlage|Kraft|In Bauchlage|Hanteln|3,4|4,5|Oberarm abstützen; Unterarm mit leichter Hantel außenwärts drehen.
3|hantel-armzug|Arme in Bauchlage vorführen|Kraft|In Bauchlage|Hanteln|3,4|3,5|Arme kontrolliert nach vorn und zurück bewegen.
3|hantel-brust|Brustführung mit Hanteln|Kraft|In Rückenlage|Hanteln|3|9|Leichte Hanteln über der Brust zusammenführen und langsam öffnen.
3|hantel-ueberzug|Hantel hinter Kopf führen|Kraft|In Rückenlage|Hanteln|3|7,9|Gewicht im freigegebenen Bereich kopfwärts führen und zurückholen.
3|hantel-druecken|Hanteln über Kopf drücken|Kraft|Im Stand|Hanteln|3,5|2,3|Aus Schulterhöhe kontrolliert nach oben drücken und senken.
4|band-ruder|Rudern gegen Bandzug|Kraft|Im Stand|Theraband|3,4,5|0,5,6,7|Ellenbogen am Körper nach hinten ziehen, langsam nachgeben.
4|band-arm-rueck|Arme gestreckt zurückziehen|Kraft|Im Stand|Theraband|3,4|3,7|Gestreckte Arme gegen Bandzug nach hinten führen.
4|band-seitheben|Band seitlich anheben|Kraft|Im Sitzen|Theraband|3|3|Band sicher unter Füßen halten; Arme seitlich anheben.
4|band-frontheben|Band nach vorn anheben|Kraft|Im Stand|Theraband|3|3|Arme gegen Bandzug nach vorn oben führen.
4|band-beugen|Ellenbogen mit Band beugen|Kraft|Im Stand|Theraband|5|0,1|Ellenbogen beugen; Oberarme bleiben nahe am Rumpf.
4|band-aussen|Außenrotation am Rumpf|Kraft|Im Stand|Theraband|3|4|Unterarm nach außen drehen, Ellenbogen am Rumpf halten.
4|band-innen|Innenrotation am Rumpf|Kraft|Im Stand|Theraband|3|26|Unterarm gegen Bandzug nach innen drehen.
4|band-aussen-abgehoben|Außenrotation mit abgehobenem Oberarm|Kraft|Im Stand|Theraband|3|4,3|Nur freigegeben: abgehobenen Oberarm stabilisieren, Unterarm außenwärts drehen.
5|kapsel-quer|Arm quer vor Brust führen|Dehnung|Im Sitzen|Kein Hilfsmittel|3||Arm behutsam querführen, Schulter unten lassen.
5|kapsel-seite|Schulterdehnung in Seitenlage|Dehnung|In Seitenlage|Matte|3||Nur angeleitet: Unterarm bei abgestütztem Oberarm vorsichtig innenwärts führen.
5|kapsel-seite-rotation|Schulterdehnung mit Körperdrehung|Dehnung|In Seitenlage|Matte|3||Nur angeleitet: Körper minimal vorwärts drehen, Schulterposition kontrollieren.
5|kapsel-tuer-tief|Schulter am Türrahmen öffnen|Dehnung|Im Stand|Türrahmen|3||Handkontakt halten und Körper leicht vom Arm wegdrehen.
5|kapsel-aussen|Außenrotation unterstützt bewegen|Mobilisation|Im Sitzen|Stab|3||Stab mit anderer Hand seitwärts führen; Ellenbogen bleiben angelegt.
5|kapsel-innen|Hand hinter Rücken führen|Mobilisation|Im Sitzen|Kein Hilfsmittel|3||Nur freigegeben: andere Hand unterstützt kleinen Schürzengriff.
5|kapsel-tuer-hoch|Brust am Türrahmen öffnen|Dehnung|Im Stand|Türrahmen|3||Unterarme anlegen; Körper gering nach vorn verlagern.
5|kapsel-seitlich|Seitliche Schulter sanft dehnen|Dehnung|Im Stand|Türrahmen|3||Nur angeleitet: Ellenbogen abstützen und Körper gering wegbewegen.
6|fingerkontakt|Finger zum Daumen führen|Koordination|Im Sitzen|Kein Hilfsmittel|8||Nacheinander jede Fingerkuppe mit dem Daumen berühren.
6|handgelenk|Handgelenk locker bewegen|Mobilisation|Im Sitzen|Kein Hilfsmittel|7||Hand locker schließen; Handgelenk auf- und abbewegen.
6|faust|Hand schließen und öffnen|Mobilisation|Im Sitzen|Kein Hilfsmittel|8||Lockere Faust bilden und Finger wieder öffnen.
6|ellbogen|Arm vor Körper beugen|Mobilisation|Im Stand|Kein Hilfsmittel|5||Hand vom Oberschenkel über den Bauch zur Brust führen.
6|bws|Brustwirbelsäule im Sitz aufrichten|Mobilisation|Im Sitzen|Stuhl|1||Aus kleiner Vorlage aufrichten; Rücken nicht überstrecken.
6|arm-gefuehrt|Arm in Vorlage begleiten|Mobilisation|Im Sitzen|Kein Hilfsmittel|3||Gesunde Hand trägt den betroffenen Arm beim Vorneigen.
6|nacken|Nacken seitlich lösen|Dehnung|Im Sitzen|Stuhl|0||Kopf behutsam neigen, Schultergürtel entspannt lassen.
6|haengen|Arm hängend entlasten|Mobilisation|Im Sitzen|Kein Hilfsmittel|3||Arm entspannen; Oberkörper langsam etwas vorverlagern.
6|haengen-gestuetzt|Arm unterstützt entlasten|Mobilisation|Im Sitzen|Kein Hilfsmittel|3||Arm mit gesunder Hand sichern; Körper etwas vorbeugen.
6|lagern|Arm weich unterstützen|Entspannung|Im Sitzen|Kissen|3||Unterarm bequem auf Kissen lagern, Druckstellen vermeiden.
6|anziehen|Anziehen und Körperpflege üben|Koordination|Im Sitzen|Therapeutische Anleitung|3||Operierten Arm schützen; Alltagshandgriffe im Behandlungsteam einüben.
7|hws-vorn|Tiefe Halsbeuger aktivieren|Kraft|In Rückenlage|Matte|0|20|Kinnbewegung nur andeuten; Kopf liegen lassen, ruhig atmen.
7|hws-vorn-heben|Kopf minimal anheben|Kraft|In Rückenlage|Matte|0|20|Nach Kinnkontrolle den Kopf nur gering abheben.
7|hws-hinten|Nackenstrecker sanft aktivieren|Kraft|In Rückenlage|Matte|0|21|Hintere Halsmuskeln ohne sichtbare Kopfbewegung anspannen.
7|hws-bauch|Kopf in Bauchlage abheben|Kraft|In Bauchlage|Matte|0|21|Stirnauflage kurz verlassen; Halsposition neutral halten.
7|hws-sitz|Hals im Sitz stabilisieren|Kraft|Im Sitzen|Stuhl|0|20,21|Hals aufrichten und kleine Haltespannung aufbauen.
7|hws-isometrie|Hals gegen Handkontakt halten|Kraft|Im Sitzen|Kein Hilfsmittel|0|20,21|Stirn und Kopfseite leicht gegen Handkontakt drücken.
7|hws-vorlage|Hals bei Vorlage stabilisieren|Kraft|Im Sitzen|Stuhl|0|20,21|Oberkörper gering vorbeugen; Halsausrichtung dabei beibehalten.
7|hws-bewegen|Kopf kontrolliert bewegen|Mobilisation|Im Sitzen|Stuhl|0||Kopf klein vorführen, zurücknehmen, drehen und neigen.
8|dehn-ham-liege|Beinrückseite liegend dehnen|Dehnung|In Rückenlage|Matte|9,10||Oberschenkel halten; Knie langsam bis zum leichten Zug strecken.
8|dehn-ham-stand|Beinrückseite im Stand dehnen|Dehnung|Im Stand|Stuhl|9,10||Fuß sicher erhöht ablegen, mit geradem Rücken gering vorbeugen.
8|dehn-gesaess-sitz|Gesäß im Sitz dehnen|Dehnung|Im Sitzen|Stuhl|9||Fuß auf Gegenschenkel ablegen, Oberkörper vorsichtig vorbeugen.
8|dehn-gesaess-liege|Gesäß liegend dehnen|Dehnung|In Rückenlage|Matte|9||Gekreuzte Beinposition sanft zum Körper führen.
8|dehn-quad|Oberschenkelvorderseite dehnen|Dehnung|Im Stand|Stuhl|9,10||Abstützen; Fuß vorsichtig Richtung Gesäß führen.
8|dehn-quad-stuhl|Vorderseite mit Fußauflage dehnen|Dehnung|Im Stand|Stuhl|9,10||Hinteren Fuß ablegen; vorderes Bein gering beugen.
8|dehn-hueftbeuger|Hüftvorderseite sanft dehnen|Dehnung|Im Halbkniestand|Matte|9||Becken gering vorverlagern; Hohlkreuz vermeiden.
8|dehn-adduktor-stand|Beininnenseite im Stand dehnen|Dehnung|Im Stand|Kein Hilfsmittel|9||Breiten Stand wählen, Gewicht sanft seitlich verschieben.
8|dehn-adduktor-liege|Beininnenseite liegend dehnen|Dehnung|In Rückenlage|Matte|9||Aufgestellte Knie langsam auseinanderfallen lassen, nicht nachdrücken.
8|dehn-wade|Wade in Schrittstellung dehnen|Dehnung|Im Stand|Wand|11||Hintere Ferse belasten, Becken sanft vorverlagern.
8|dehn-brust|Brust im Vierfüßler lösen|Dehnung|Im Vierfüßlerstand|Matte|3||Arm seitlich auflegen, Oberkörper vorsichtig absenken.
8|dehn-nacken|Nacken im Stand dehnen|Dehnung|Im Stand|Kein Hilfsmittel|0||Kopf leicht neigen, gegenüberliegende Hand bodenwärts führen.
9|squat|Kontrollierte Kniebeuge|Kraft|Im Stand|Kein Hilfsmittel|9,10,11|13,16|Becken nach hinten führen; Knie beugen und aufrichten.
9|squat-seitschritt|Seitwärtsschritt in Kniebeuge|Kraft|Im Stand|Kein Hilfsmittel|9,10|14,16|In kleiner Kniebeuge Gewicht verlagern und Bein seitlich führen.
9|squat-gewicht|Kniebeuge mit Gewichtsführung|Kraft|Im Stand|Hanteln|3,9,10|3,13,16|Nur fortgeschritten: beim Aufrichten leichtes Gewicht kontrolliert anheben.
9|ausfallschritt|Ausfallschritt kontrollieren|Kraft|Im Stand|Stuhl|9,10,11|13,16|Schrittstellung halten; beide Knie kontrolliert beugen und strecken.
9|ausfall-rotation|Schrittstellung mit Gewichtsrotation|Kraft|Im Stand|Hanteln|1,9,10|10,13,16|Nur fortgeschritten: Gewicht bei stabilen Beinen seitlich führen.
9|ausfall-kniehub|Aus Schrittstellung aufrichten|Kraft|Im Stand|Stuhl|9,10,11|13,14,16|Vorderes Bein aufrichten und hinteres Knie langsam vorführen.
9|einbein-vorlage|Einbeinige kleine Vorlage|Kraft|Im Stand|Stuhl|9,10,11|13,14,16|Mit Sicherung auf einem Bein kontrolliert etwas vorbeugen.
9|vorfuss-kniebeuge|Kniebeuge auf Vorfüßen|Kraft|Im Stand|Stuhl|9,10,11|16,18|Nur fortgeschritten: mit Halt auf Vorfüßen kleine Kniebeuge ausführen.
10|stuetz|Schultergürtel im Vierfüßler halten|Kraft|Im Vierfüßlerstand|Matte|3,4|5,8,10|Hände belasten, Schulterblätter am Brustkorb kontrollieren.
10|stuetz-lang|Stützposition verlängern|Kraft|Im Vierfüßlerstand|Matte|3,4|8,10|Knie etwas zurücksetzen; Rumpfposition stabil halten.
10|stuetz-diagonal|Diagonale im Stütz lösen|Kraft|Im Vierfüßlerstand|Matte|3,4,9|8,10,12|Gegenüberliegende Hand und Fuß kontrolliert kurz entlasten.
10|unterarm-vor|Unterarmstütz mit Armführung|Kraft|Im Unterarmstütz|Matte|3,4|8,10|Mit Knieauflage einen Arm langsam nach vorn bewegen.
10|unterarm-lang|Langen Unterarmstütz halten|Kraft|Im Unterarmstütz|Matte|3,4,9|8,10|Nur fortgeschritten: Knie lösen, Rumpf ohne Einsinken halten.
10|stuetz-instabil|Diagonaler Stütz auf weicher Auflage|Koordination|Im Vierfüßlerstand|Balancekissen|3,4,9||Nur gesichert: Diagonale auf leicht nachgiebiger Unterlage entlasten.
10|seitstuetz|Seitstütz mit Knieauflage|Kraft|In Seitenlage|Matte|3,4,9|8,10,14|Auf Unterarm und gebeugte Knie stützen, Becken anheben.
10|stuetz-reaktiv|Reaktiven Handstütz üben|Kraft|Im Vierfüßlerstand|Matte|3,4,5|2,8,9|Nur unter Anleitung: Hände kurz entlasten, kontrolliert auffangen.
11|blatt-bauch|Schulterblatt in Bauchlage führen|Kraft|In Bauchlage|Liege|3,4|5,6|Aufgelegten Oberarm belassen, Schulterblatt behutsam abwärts führen.
11|blatt-sitz|Arm bei ruhigem Schulterblatt heben|Kraft|Im Sitzen|Tisch|3,4|5,6|Arm aus Auflage etwas lösen, Schulterposition kontrollieren.
11|blatt-decke|Hand zur Decke schieben|Kraft|In Rückenlage|Matte|3,4|8|Aufgerichteten Arm weiter deckenwärts schieben, Schulterblatt mitführen.
11|blatt-arm-bauch|Arm seitlich etwas abheben|Kraft|In Bauchlage|Matte|3,4|3,5,6|Schulterblatt ruhig halten; gestreckten Arm gering abheben.
11|blatt-seite|Schulterblatt mit Außenrotation halten|Kraft|In Seitenlage|Matte|3,4|4,5|Ellenbogen angelegt halten, Unterarm außenwärts führen.
11|blatt-rotation-bauch|Außenrotation mit Oberarmauflage|Kraft|In Bauchlage|Liege|3,4|4,5|Abgestützten Oberarm ruhig halten; Hand langsam nach oben drehen.
11|blatt-arm-ohr|Arm neben Kopf abheben|Kraft|In Bauchlage|Matte|3,4|3,5|Arm neben dem Kopf gering abheben, Rumpf stabilisieren.
11|blatt-stuetz|Schulterblatt unter Stützlast halten|Kraft|Im Vierfüßlerstand|Matte|3,4|5,8|Hände gegen Matte drücken; Schulterblätter kontrolliert halten.
12|bein-seite|Oberes Bein seitlich heben|Kraft|In Seitenlage|Matte|9|14|Oberes Bein gestreckt abheben und kontrolliert zurückführen.
12|bein-innen|Unteres Bein seitlich heben|Kraft|In Seitenlage|Matte|9|24|Oberes Bein sicher abstellen; unteres Bein leicht anheben.
12|bein-bauch|Bein in Bauchlage heben|Kraft|In Bauchlage|Matte|9|13,17|Gestrecktes Bein klein anheben; Becken bleibt ruhig.
12|stand-handtuch|Einbeinstand mit Kniehub|Koordination|Im Stand|Handtuchrolle|9,10,11||Nur gesichert: Stand auf Rolle halten und Gegenknie anheben.
12|stand-gewicht|Einbeinstand mit Armführung|Koordination|Im Stand|Hanteln|3,9,10,11||Nur fortgeschritten: Bein seitlich führen und leichte Gewichte anheben.
12|stand-rueck|Standbein mit Rückführung stabilisieren|Kraft|Im Stand|Hanteln|9,10,11|13,14|Anderes Bein rückwärts führen; Standachse kontrolliert beibehalten.
12|fersen|Fersen im Stand anheben|Kraft|Im Stand|Stuhl|11|18|Mit sicherem Halt auf Vorfüße heben und langsam senken.
12|beckenstufe|Becken auf Stufe kontrollieren|Kraft|Im Stand|Stufe|9|14|Gesichert stehen; freies Becken gering senken und anheben.
13|ferse-liege|Ferse liegend heranziehen|Mobilisation|In Rückenlage|Matte|9,10||Ferse zum Gesäß gleiten lassen, Bein wieder ausstrecken.
13|knie-bauch|Knie in Bauchlage bewegen|Mobilisation|In Bauchlage|Matte|10||Knie langsam beugen und strecken; Becken liegen lassen.
13|ferse-sitz|Ferse im Sitz verschieben|Mobilisation|Im Sitzen|Stuhl|10||Fuß am Boden langsam vor- und zurückgleiten lassen.
13|quad-sitz|Gestrecktes Bein im Sitz halten|Kraft|Im Sitzen|Stuhl|9,10|16|Oberschenkel anspannen, gestrecktes Bein kurz von Auflage lösen.
13|bruecke|Becken liegend anheben|Kraft|In Rückenlage|Matte|2,9|10,13,17|Füße aufstellen; Becken kontrolliert heben und ablegen.
13|knie-schritt|Knie in Schrittstellung bewegen|Mobilisation|Im Stand|Stuhl|9,10||Hinteres Knie bei stabiler Hüfte langsam beugen und strecken.
13|huefte-stufe|Hüfte mit Stufenauflage bewegen|Mobilisation|Im Stand|Stufe|9,10||Fuß niedrig aufsetzen, Hüfte nur freigegeben beugen.
13|patella|Kniescheibe vorsichtig mobilisieren|Mobilisation|In Rückenlage|Therapeutische Anleitung|10||Nach Anleitung entspannte Kniescheibe behutsam verschieben; nicht auf Wunden drücken.
14|rumpf-basis|Tiefe Rumpfspannung aufbauen|Kraft|In Rückenlage|Matte|2|10,12,25|Unterbauch sanft aktivieren; Wirbelsäule ruhig, Atmung frei lassen.
14|rumpf-bein|Rumpf beim Beinheben halten|Kraft|In Rückenlage|Matte|2,9|10,12|Rumpfspannung halten; einen Fuß klein von Unterlage lösen.
14|rumpf-bruecke|Brücke mit Fußentlastung|Kraft|In Rückenlage|Matte|2,9|10,13,17|Becken anheben; einen Fuß nur bei stabiler Haltung entlasten.
14|rumpf-muschel|Knie seitlich öffnen|Kraft|In Seitenlage|Matte|2,9|10,12,14|Fersen zusammenlassen, oberes Knie bei stabilem Becken anheben.
14|rumpf-hinten|Tiefe Rückenmuskelspannung fühlen|Kraft|In Bauchlage|Matte|2|12,25|Tiefe Rückenspannung ohne sichtbare Wirbelsäulenbewegung aufbauen.
14|rumpf-sitz|Rumpf bei Sitzbewegung halten|Kraft|Im Sitzen|Stuhl|2,9|10,12|Kleine Vorlage oder Fußentlastung bei ruhigem Rumpf üben.
14|rumpf-stand|Rumpf beim Stufenlösen halten|Kraft|Im Stand|Stufe|2,9|10,12,14|Fuß von niedriger Stufe lösen, Becken waagrecht halten.
14|rumpf-ausfall|Schrittbeuge mit stabilem Rumpf|Kraft|Im Stand|Stuhl|2,9,10|10,13,16|Mit Halt in Schrittstellung klein beugen und aufrichten.
15|wadenpumpe|Fußpumpe in Rückenlage|Mobilisation|In Rückenlage|Matte|11||Fußspitzen langsam abwechselnd zum Körper ziehen und wegführen.
15|kniebeuge-liege|Knie liegend bewegen|Mobilisation|In Rückenlage|Matte|9,10||Knie kontrolliert beugen, Bein wieder ausstrecken.
15|treppe-auf|Treppe mit Gehhilfen hinauf|Koordination|Im Stand|Gehhilfen|9,10,11||Eingeübte Reihenfolge nutzen; Belastungsvorgabe und Geländer beachten.
15|gesaess|Gesäßmuskeln kurz anspannen|Kraft|In Rückenlage|Matte|9|13|Gesäß beidseits sanft anspannen und wieder lösen.
15|gang|Gehen mit zwei Gehhilfen|Koordination|Im Stand|Gehhilfen|9,10,11||Verordnetes Gangmuster unter Beachtung der Teilbelastung einüben.
15|lagern|Bein zur Entlastung lagern|Entspannung|In Rückenlage|Kissen|9,10||Bein nach Behandlungsvorgabe unterstützt lagern; Druckstellen vermeiden.
15|quad|Oberschenkel im Liegen aktivieren|Kraft|In Rückenlage|Matte|10|16|Kniekehle sanft zur Unterlage führen, Spannung anschließend lösen.
15|kniebeuge-sitz|Knie im Sitz bewegen|Mobilisation|Im Sitzen|Stuhl|10||Fuß ohne Druck vor- und zurückgleiten lassen.
15|treppe-ab|Treppe mit Gehhilfen hinunter|Koordination|Im Stand|Gehhilfen|9,10,11||Verordnete Schrittfolge mit Geländer und eingeübten Gehhilfen nutzen.
"""
entries=[]
for row in rows.strip().splitlines():
    doc,key,title,kind,position,equipment,joints,muscles,action=row.split("|")
    source=brochures[int(doc)-1]
    supervised=any(word in key for word in ["intraoral", "kiefer-dehnen", "kapsel-seite", "kapsel-innen", "kapsel-seitlich", "patella", "reaktiv", "instabil", "stand-handtuch", "treppe", "gang"]) or 'Nur ' in action
    js=[J[int(x)] for x in joints.split(',') if x]; ms=[M[int(x)] for x in muscles.split(',') if x]
    region='Kiefer' if 13 in [int(x) for x in joints.split(',') if x] else ('Nacken' if js==[J[0]] else ('Rücken' if J[2] in js else ('Schulter' if J[3] in js else ('Knie' if J[10] in js else ('Hüfte' if J[9] in js else 'Hand')))))
    entries.append(dict(id=f'birshof-{int(doc):02}-{key}',title=title,region=region,goal='Kräftigung' if kind=='Kraft' else kind,trainingTypes=[kind],joints=js,strengthMuscles=ms,position=position,equipment=equipment,subtitle=f'{kind} · {position}',start=position+'. Hilfsmittel und sicheren Halt vorbereiten.',steps=[action,'Langsam lösen und in die Ausgangsposition zurückkehren.'],mistakes='Kein Schwung, kein Pressen, Beschwerden nicht erzwingen.',brochureId=source['id'],sources=[dict(title='Hirslanden Birshof – '+source['title'],url=source['url'])],requiresSupervision=supervised,conditionUses=[],methodTags=[],catalogMedia=[],difficulty='Anspruchsvoll' if 'fortgeschritten' in action else 'Leicht'))

sro='https://www.sro.ch/fileadmin/user_upload/09_Dokumente/Physiotherapie_Heimprogramme/SRO_AG_Physiotherapie_Kiefergelenk_Heimprogramm.pdf'
extras=[
dict(id='kiefer-korken',title='Korkenübung nach individueller Kieferanleitung',trainingTypes=['Koordination'],joints=[J[13]],strengthMuscles=[],position='Im Sitzen',equipment='Korken',region='Kiefer',steps=['Nur nach persönlicher Einweisung: sauberen, passend bemessenen Korken jederzeit sicher festhalten.','Ausschließlich die gezeigte kleine Kieferbewegung durchführen; kein kräftiges Zubeißen oder erzwungenes Knacken.','Korken herausnehmen und Kiefer locker lassen.'],precautions='Nur nach zahnärztlicher oder physiotherapeutischer Befundung und Anleitung. Nicht bei Schluckstörung, lockeren Zähnen, akuter Blockade, Luxation, frischer Zahn- oder Kieferoperation. Verschlucken verhindern: Korken festhalten, nicht unbeaufsichtigt üben. Passform und Bewegungsrichtung werden individuell vorgegeben; keine Selbstbehandlung einer Diskusverlagerung.',requiresSupervision=True,sources=[dict(title='Spital SRO – Kiefergelenk-Heimprogramm',url=sro)],methodTags=['Kiefer'],conditionUses=[]),
dict(id='pir-nacken',title='Postisometrische Relaxation für den Nacken',trainingTypes=['Entspannung','Dehnung'],joints=[J[0]],strengthMuscles=[],position='Im Sitzen',equipment='Therapeutische Anleitung',region='Nacken',steps=['Nach Einweisung den Kopf bequem ausrichten; die Hand gibt nur geringen Gegenhalt.','Die gewünschte Bewegung sanft andeuten, ohne dass der Kopf sich bewegt; ruhig weiteratmen.','Spannung vollständig lösen. Eine neue Position nur im angeleiteten, angenehmen Bereich zulassen.'],requiresSupervision=True,methodTags=['PIR'],sources=[dict(title='MET/PIR bei unspezifischem Nackenschmerz – systematische Übersicht 2023',url='https://pmc.ncbi.nlm.nih.gov/articles/PMC10687238/')],conditionUses=[]),
dict(id='pir-beinrueckseite',title='Postisometrisches Lösen der Beinrückseite',trainingTypes=['Entspannung','Dehnung'],joints=[J[9],J[10]],strengthMuscles=[],position='In Rückenlage',equipment='Therapeutische Anleitung',region='Hüfte',steps=['Fachperson unterstützt das Bein in einer angenehmen Position.','Die Beinrückseite gering gegen den gehaltenen Widerstand anspannen, ohne Bewegung.','Vollständig lösen; weitere Positionsänderung durch die Fachperson begleiten lassen.'],requiresSupervision=True,methodTags=['PIR'],sources=[dict(title='PIR/Muscle Energy: Verfahren; keine spezifische Wirksamkeitsprüfung dieses Beinbeispiels',url='https://pmc.ncbi.nlm.nih.gov/articles/PMC10687238/')],conditionUses=[]),
dict(id='pir-kiefer',title='Kiefer nach sanfter Isometrie entspannen',trainingTypes=['Entspannung'],joints=[J[13]],strengthMuscles=[],position='Im Sitzen',equipment='Therapeutische Anleitung',region='Kiefer',steps=['Individuell angeleitete Kieferposition einnehmen, Zähne voneinander lösen.','Bewegung gegen sehr leichten Fingerkontakt nur andeuten; keine sichtbare Kieferbewegung.','Fingerkontakt und Muskelspannung lösen, ohne die Öffnung zu erzwingen.'],requiresSupervision=True,methodTags=['PIR','Kiefer'],sources=[dict(title='PIR als Verfahrensprinzip – keine direkte Korken- oder Kiefer-PIR-Studie',url='https://pmc.ncbi.nlm.nih.gov/articles/PMC10687238/'),dict(title='Kieferübungen – systematische Übersicht 2025',url='https://pmc.ncbi.nlm.nih.gov/articles/PMC12426462/')],conditionUses=[]),
dict(id='reha-aufstehen',title='Kontrolliert vom Stuhl aufstehen',trainingTypes=['Kraft'],joints=[J[9],J[10],J[11]],strengthMuscles=[M[13],M[16]],position='Im Sitzen',equipment='Stuhl',region='Knie',steps=['Stabilen Stuhl gegen Verrutschen sichern; Füße passend aufstellen.','Oberkörper vorverlagern und mit individuell erlaubter Belastung aufstehen.','Langsam hinsetzen; erforderlichenfalls Armstützen oder Hilfestellung nutzen.'],requiresSupervision=False,methodTags=[],catalogMedia=['cdc-squat'],sources=[dict(title='NHS – Strength exercises',url='https://www.nhs.uk/live-well/exercise/strength-exercises/')],conditionUses=[]),
dict(id='reha-knie-strecken',title='Kniestreckung im Sitz aufbauen',trainingTypes=['Kraft'],joints=[J[10]],strengthMuscles=[M[16]],position='Im Sitzen',equipment='Stuhl',region='Knie',steps=['Auf stabilem Stuhl sitzen. Anfangs ohne Zusatzgewicht üben.','Unterschenkel im freigegebenen Winkelbereich kontrolliert strecken.','Langsam zurückführen; Widerstand nur nach therapeutischer Vorgabe ergänzen.'],requiresSupervision=False,methodTags=[],catalogMedia=['cdc-knee-extension'],precautions='Die CDC-Animation zeigt Fußgewichte. Diese sind keine Empfehlung für die Frührehabilitation. Nach Kreuzbandoperation gelten insbesondere Freigabe und Winkelvorgabe des Behandlungsteams.',sources=[dict(title='NHS – Strength exercises',url='https://www.nhs.uk/live-well/exercise/strength-exercises/')],conditionUses=[])
]
for e in extras:
    e.setdefault('goal',e['trainingTypes'][0]);e.setdefault('subtitle',e['goal']+' · '+e['position']);e.setdefault('start',e['position']+'. Bequeme, sichere Position wählen.');e.setdefault('mistakes','Keine Schmerzen, kein Pressen und keinen Bewegungsumfang erzwingen.');e.setdefault('catalogMedia',[]);e.setdefault('difficulty','Leicht');entries.append(e)

write('server/rehab-exercises.json',entries)
write('src/brochure-library.json',brochures)
print(f'{len(brochures)} brochures; {len(entries)} independently worded exercise drafts')
