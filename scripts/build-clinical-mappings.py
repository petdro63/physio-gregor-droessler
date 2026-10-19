"""Explicit clinical curation. No suggestions are inferred from region or title."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
mapping={}
def add(ids, condition, phases, evidence, variants=None, note=""):
    for id in ids.split():
        target=mapping.setdefault(id,{})
        target.setdefault('conditionUses',[]).append(dict(conditionId=condition,phases=phases.split(),variants=(variants or '').split(),evidenceIds=evidence.split(),note=note or 'Redaktioneller Vorschlag aus der Übungsfamilie; Eignung und Dosierung individuell prüfen.'))

add('birshof-14-rumpf-basis birshof-14-rumpf-bein birshof-14-rumpf-muschel birshof-14-rumpf-sitz','bandscheibe','konservativ postop','ldh-2025 ldh-postop-2023',note='Rumpfkontrolle nach Befund; postoperativ ausschließlich gemäß persönlicher Freigabe. Die konkrete Übung wurde nicht als Einzelintervention geprüft.')
add('birshof-13-bruecke birshof-14-rumpf-stand vierfuessler-diagonal','bandscheibe','konservativ funktion','ldh-2025')
add('birshof-14-rumpf-bruecke birshof-14-rumpf-ausfall','bandscheibe','funktion','ldh-2025')

for variant,evidence in [('rekonstruktion','acl-aspetar-2023'),('konservativ','acl-kanon-2013')]:
    add('birshof-15-quad birshof-15-wadenpumpe birshof-13-ferse-liege birshof-13-ferse-sitz','kreuzband','vorbereitung frueh',evidence,variant,note='Bewegung und Aktivierung innerhalb der vorgegebenen Belastungs- und Winkelgrenzen; Begleitverletzungen berücksichtigen.')
    add('reha-aufstehen birshof-09-squat birshof-12-fersen birshof-13-bruecke','kreuzband','vorbereitung aufbau',evidence,variant)
    add('reha-knie-strecken','kreuzband','aufbau',evidence,variant,note='Offene Kette: freigegebenen Winkelbereich, Last und Transplantat berücksichtigen. Animation zeigt Fußgewicht; dieses ist keine automatische Vorgabe.')
    add('birshof-09-ausfallschritt birshof-12-beckenstufe birshof-09-squat-seitschritt','kreuzband','funktion',evidence,variant,note='Erst bei ausreichender Beinachsenkontrolle und Freigabe. Keine Return-to-Sport-Entscheidung aus dieser Liste ableiten.')

add('birshof-15-wadenpumpe birshof-15-quad birshof-15-gesaess birshof-13-ferse-liege birshof-13-ferse-sitz','knie-tep','frueh aufbau','tka-2026')
add('reha-aufstehen reha-knie-strecken birshof-12-fersen birshof-09-squat','knie-tep','aufbau funktion','tka-2026')
add('birshof-15-treppe-auf birshof-15-treppe-ab birshof-12-beckenstufe','knie-tep','funktion','tka-2026')

add('birshof-15-wadenpumpe birshof-15-quad birshof-15-gesaess birshof-15-gang','hueft-tep','frueh','tha-2023 tha-gait-2023',note='Nur gemäß Belastungs-, Zugang- und Bewegungsvorgaben des operierenden Teams. Gehschulung persönlich einüben.')
add('reha-aufstehen birshof-12-fersen huefte-seitlich','hueft-tep','aufbau funktion','tha-2023 tha-gait-2023',note='Abduktorenbelastung und Bewegungsumfang müssen zum OP-Zugang und möglichen Sehnenrekonstruktionen passen.')
add('birshof-15-treppe-auf birshof-15-treppe-ab birshof-12-beckenstufe','hueft-tep','funktion','tha-gait-2023')

for variant in ['anatomisch','invers']:
    add('birshof-06-fingerkontakt birshof-06-handgelenk birshof-06-faust birshof-06-lagern','schulter-tep','schutz','tsa-2022',variant,note='Nur Begleitbewegungen und Lagerung ohne Schulterbelastung, entsprechend OP-Anweisung. Die Studie prüft Reha-Zeitpunkte, nicht diese Einzelübung.')
    add('birshof-01-arm-gefuehrt birshof-01-ball-tisch birshof-01-haengen-gestuetzt','schulter-tep','mobilisation','tsa-2022',variant,note='Ausschließlich persönlich freigegebene geführte Bewegung. Bewegungsgrenzen, passive/aktive Anteile und Sehnenschutz aus dem OP-Protokoll übernehmen.')
    add('birshof-11-blatt-sitz birshof-11-blatt-decke','schulter-tep','aufbau','tsa-2022',variant,note='Aktive Bewegung erst nach expliziter Freigabe. Kein allgemeiner Wochenplan; Belastung und Prothesentyp individuell prüfen.')

add('birshof-01-haengen-gestuetzt birshof-01-ball-tisch birshof-01-stab-rotation','frozen-shoulder','schmerz steifigkeit','frozen-2022',note='Klein und verträglich bewegen. Keine aggressive Dehnung; Reaktion am Folgetag und Nachtschmerz berücksichtigen.')
add('birshof-01-arm-gefuehrt birshof-05-kapsel-quer birshof-05-kapsel-aussen','frozen-shoulder','steifigkeit','frozen-2022',note='Nur bei passender Reizbarkeit und ohne anhaltende Schmerzverstärkung. Kein Kraftdruck in die Endstellung.')
add('band-aussenrotation birshof-11-blatt-sitz birshof-04-band-ruder','frozen-shoulder','funktion','frozen-2022')

add('birshof-02-kiefer-ruhe birshof-02-masseter birshof-02-temporalis','kiefer','entspannung','tmd-2023 tmd-2025')
add('birshof-02-kiefer-oeffnen birshof-02-kiefer-seite birshof-02-kiefer-vor birshof-06-fingerkontakt','kiefer','bewegung','tmd-2023')
# Finger coordination is not a jaw exercise: no spurious region-based suggestions.
mapping.pop('birshof-06-fingerkontakt',None)
add('birshof-06-fingerkontakt','schulter-tep','schutz','tsa-2022','anatomisch invers',note='Fingerkoordination ohne Schulterlast, nach OP-Vorgabe.')
add('birshof-02-kiefer-isometrie birshof-02-kiefer-isoseite','kiefer','angeleitet','tmd-2023')
add('kiefer-korken','kiefer','angeleitet','',note='Klinisches Heimprogramm als Technikquelle. Kein belastbarer spezifischer Wirksamkeitsbeleg für Korken oder Diskusreposition; nur nach persönlicher Einweisung.')
add('pir-kiefer','kiefer','angeleitet','',note='Angeleitete Verfahrensvariante; kein Wirksamkeitsnachweis für genau diesen Ablauf. Nicht mit dem Nachweis allgemeiner Kieferübungen gleichsetzen.')
add('pir-nacken','nacken','entspannung','pir-neck-2023 pir-rct-2022')
add('birshof-07-hws-sitz birshof-07-hws-vorn birshof-07-hws-bewegen','nacken','aufbau','',note='Allgemeine Halte- und Bewegungskontrolle. Die PIR-Studien belegen diese Einzelübungen nicht.')

for id,asset in [('hantel-beugen-sitz','cdc-biceps-curl'),('huefte-seitlich','cdc-hip-abduction'),('reha-knie-strecken','cdc-knee-extension'),('reha-aufstehen','cdc-squat')]:
    mapping.setdefault(id,{})['catalogMedia']=[asset]
for id in ['pir-nacken','pir-kiefer','pir-beinrueckseite']:
    mapping.setdefault(id,{})['methodTags']=['PIR']
for id in ['birshof-02-kiefer-ruhe','birshof-02-masseter','birshof-02-temporalis']:
    mapping.setdefault(id,{})['methodTags']=['Kieferentspannung']
(ROOT/'src/clinical-mappings.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(mapping)} explicitly curated exercise assignments')
