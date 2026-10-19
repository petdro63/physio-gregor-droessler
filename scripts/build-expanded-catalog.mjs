import fs from 'node:fs';

// These are editorial exercise drafts, not automatically prescribed protocols.
// A family has one movement task; forms change the contraction, support or load.
const sources = {
  shoulder: { title: 'AAOS · Shoulder conditioning (Grundmuster)', url: 'https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/' },
  elbow: { title: 'NHS Dynamic Health · Elbow pain (Grundmuster)', url: 'https://www.dynamichealth.nhs.uk/help-and-advice/elbow-pain/' },
  wrist: { title: 'NHS Kent · Wrist strength (Grundmuster)', url: 'https://www.kentcht.nhs.uk/leaflet/wrist-strength/' },
  hip: { title: 'AAOS · Hip conditioning (Grundmuster)', url: 'https://www.orthoinfo.org/recovery/hip-conditioning-program/' },
  knee: { title: 'AAOS · Knee conditioning (Grundmuster)', url: 'https://www.orthoinfo.org/recovery/knee-conditioning-program/' },
  ankle: { title: 'AAOS · Foot and ankle conditioning (Grundmuster)', url: 'https://www.orthoinfo.org/recovery/foot-and-ankle-conditioning-program/' },
  ball: { title: 'NHS · Gym ball exercise guide', url: 'https://www.kentmedwaymentalhealth.nhs.uk/media/2612/km1237-physiotherapy-gym-ball-exercise-guide.pdf' },
};
const taxonomy = JSON.parse(fs.readFileSync('src/exercise-taxonomy.json','utf8'));
const muscles = {
  deltoid:'Deltamuskel (M. deltoideus)', rotator:'Schulteraußenrotatoren (M. infraspinatus / M. teres minor)',
  internal:'Schulterinnenrotatoren (M. subscapularis)', chest:'Brustmuskel (M. pectoralis major)',
  serratus:'Vorderer Sägemuskel (M. serratus anterior)', back:'Breiter Rückenmuskel (M. latissimus dorsi)',
  rhomboid:'Rautenmuskeln (Mm. rhomboidei)', trapezius:'Kapuzenmuskel (M. trapezius)',
  biceps:'Bizeps (M. biceps brachii)', brachialis:'Armbeuger (M. brachialis)', triceps:'Trizeps (M. triceps brachii)',
  wristflex:'Handgelenkbeuger', wristext:'Handgelenkstrecker', radial:'Radiale Handgelenkmuskulatur', ulnar:'Ulnare Handgelenkmuskulatur',
  pronator:'Unterarmpronatoren', supinator:'Unterarmsupinatoren',
  glute:'Großer Gesäßmuskel (M. gluteus maximus)', abduct:'Seitliche Gesäßmuskeln (M. gluteus medius / minimus)',
  adduct:'Hüftadduktoren', flexor:'Hüftbeuger (M. iliopsoas)', quad:'Vorderer Oberschenkel (M. quadriceps femoris)',
  ham:'Hinterer Oberschenkel (ischiocrurale Muskulatur)', calf:'Wadenmuskulatur (M. gastrocnemius / soleus)',
  tibial:'Vorderer Schienbeinmuskel (M. tibialis anterior)', peroneal:'Fußaußenrandheber (Mm. fibulares)',
  posttib:'Hinterer Schienbeinmuskel (M. tibialis posterior)', foot:'Kurze Fußmuskulatur',
};
for (const muscle of Object.values(muscles)) if (!taxonomy.muscles.includes(muscle)) taxonomy.muscles.push(muscle);

// Position and force direction belong to the family, never inferred from its name.
// open: only families with an accessible distal segment and no compulsory device.
const forms = {
  push: [
    ['schulterbreit','Mit schulterbreiter Handauflage','Kraft','Stabile Stützfläche','Hände schulterbreit auflegen und den beschriebenen Ablauf gegen das eigene Körpergewicht ausführen.'],
    ['eng','Mit etwas engerer Handauflage','Kraft','Stabile Stützfläche','Hände etwas enger als schulterbreit auflegen, Ellenbogen körpernah führen und den beschriebenen Ablauf durchführen. Keine extreme Diamantstellung wählen.'],
    ['breit','Mit etwas breiterer Handauflage','Kraft','Stabile Stützfläche','Hände etwas breiter als schulterbreit auflegen; Ellenbogen nicht seitlich maximal abspreizen. Den beschriebenen Ablauf durchführen.'],
    ['entlastet','Mit geringerem Körperhebel','Kraft','Stabile Stützfläche','Körper näher an die Stützfläche bringen, sodass weniger Gewicht auf den Händen liegt. Den beschriebenen Ablauf mit diesem kürzeren Hebel durchführen.'],
    ['versetzt','Mit leicht versetzter Handauflage','Kraft','Stabile Stützfläche','Eine Hand etwas höher als die andere platzieren und den beschriebenen Ablauf ausführen. Brustkorb dabei gerade zur Stützfläche halten.'],
    ['isometrisch','Isometrisch in Mittelstellung','Kraft','Stabile Stützfläche','In mittlerer Ellenbogenbeugung das Körpergewicht ohne Bewegung halten. Nicht in die Schultern einsinken.'],
    ['exzentrisch','Mit gebremster Annäherung','Kraft','Therapeutische Anleitung','Den Körper durch Ellenbogenbeugung langsam zur Stützfläche führen. Beim Wegdrücken nimmt die Therapeutin oder der Therapeut einen Teil der Last ab.'],
    ['assistiert','Mit therapeutischer Entlastung','Mobilisation','Therapeutische Anleitung','Die Therapeutin oder der Therapeut entlastet den Rumpf persönlich; Ellenbogen aktiv beugen und strecken, ohne das volle Körpergewicht zu tragen.'],
  ],
  open: [
    ['aktiv','Aktiv ohne Zusatzwiderstand','Mobilisation','Ohne Zusatzgerät','Den beschriebenen Bewegungsweg ohne zusätzlichen Widerstand ausführen.','Die beschriebene Endstellung aktiv erreichen.'],
    ['assistiert','Mit eigener Hand unterstützt','Mobilisation','Eigene Hand','Mit der anderen Hand das bewegte Segment unterstützen; nur führen, nicht in die Endstellung drücken.','Die beschriebene Endstellung unterstützt erreichen.'],
    ['isometrisch','Isometrisch gegen eigene Hand','Kraft','Eigene Hand','Die andere Hand distal am bewegten Segment anlegen. Sanft in die beschriebene Bewegungsrichtung drücken und mit der Hand jede Bewegung verhindern.','Die Ausgangsstellung bleibt während der Anspannung unverändert. Danach vollständig lösen.'],
    ['selbstwiderstand','Dynamisch gegen eigene Hand','Kraft','Eigene Hand','Die andere Hand distal anlegen und der beschriebenen Bewegung einen leichten, gleichmäßigen Gegenwiderstand geben.','Die beschriebene Endstellung mit leichtem Gegenwiderstand erreichen.'],
    ['band','Dynamisch mit Theraband','Kraft','Theraband','Theraband distal am bewegten Segment sicher anlegen. Den Anker gegenüber der beschriebenen Bewegungsrichtung befestigen und die Bewegung gegen den Bandzug ausführen. Band nicht um Hals oder Finger wickeln.','Die beschriebene Endstellung gegen den Bandzug erreichen.'],
    ['band-exzentrisch','Exzentrisch mit Theraband','Kraft','Theraband','Band wie bei der Widerstandsvariante befestigen. Mit der anderen Hand in die beschriebene Endstellung helfen; anschließend die Rückbewegung zum Start gegen den Bandzug langsam abbremsen.','Nach der gebremsten Rückbewegung ist die Ausgangsstellung wieder erreicht.'],
    ['band-isometrisch','Isometrisch gegen Theraband','Kraft','Theraband','Band entgegen der Bewegungsrichtung sicher befestigen. In mittlerer freigegebener Stellung den Bandzug ohne Bewegung halten; Gelenk nicht verriegeln.','Die gewählte mittlere Gelenkstellung bleibt unverändert; danach den Bandzug geführt lösen.'],
    ['gefuehrt','Mit flächiger therapeutischer Führung','Mobilisation','Therapeutische Anleitung','Die Therapeutin oder der Therapeut unterstützt das Segment flächig und führt die beschriebene aktive Bewegung. Keine zusätzlichen Hebel oder endgradigen Druckkräfte einsetzen.','Die beschriebene Endstellung mit persönlicher Führung erreichen.'],
  ],
  gravity: [
    ['dynamisch','Dynamisch gegen Schwerkraft','Kraft','Ohne Zusatzgerät','Die beschriebene Bewegung gegen das eigene Segmentgewicht ausführen und aktiv zurückführen.','Die beschriebene Endstellung erreichen.'],
    ['assistiert','Mit therapeutischer Unterstützung','Mobilisation','Therapeutische Anleitung','Die Therapeutin oder der Therapeut unterstützt das bewegte Segment und nimmt einen Teil seines Gewichts ab. Den beschriebenen Weg selbst aktiv mitbewegen.','Die beschriebene Endstellung unterstützt erreichen.'],
    ['isometrisch','Isometrisch in Mittelstellung','Kraft','Ohne Zusatzgerät','Nur bis zur mittleren freigegebenen Stellung bewegen und diese gegen das Segmentgewicht ohne Ausweichbewegung halten.','Die mittlere Gelenkstellung bleibt während der Anspannung unverändert.'],
    ['exzentrisch','Mit gebremster Absenkphase','Kraft','Therapeutische Anleitung','Das Segment mit persönlicher Unterstützung in die beschriebene Endstellung bringen lassen; die Rückbewegung zum Start dann selbst gegen die Schwerkraft abbremsen.','Nach der kontrollierten Absenkphase ist die Ausgangsstellung wieder erreicht.'],
    ['manschette','Mit leichter Gewichtsmanschette','Kraft','Gewichtsmanschette','Eine therapeutisch festgelegte leichte Gewichtsmanschette am distalen Segment sicher schließen. Den beschriebenen Weg gegen das Zusatzgewicht ausführen.','Die beschriebene Endstellung mit Zusatzgewicht erreichen.'],
    ['manschette-exzentrisch','Exzentrisch mit Gewichtsmanschette','Kraft','Gewichtsmanschette','Manschette sicher schließen. Mit persönlicher Hilfe in die beschriebene Endstellung gelangen; anschließend nur die Rückbewegung gegen das Zusatzgewicht selbst abbremsen.','Nach der gebremsten Absenkphase ist die Ausgangsstellung wieder erreicht.'],
    ['manuell','Mit therapeutischem Gegenwiderstand','Kraft','Therapeutische Anleitung','Die Therapeutin oder der Therapeut gibt distal einen leichten Gegenwiderstand entgegen der beschriebenen Bewegungsrichtung. Den Weg selbst aktiv ausführen.','Die beschriebene Endstellung mit dosiertem Gegenwiderstand erreichen.'],
    ['widerstand-halten','Gegenwiderstand in Mittelstellung halten','Kraft','Therapeutische Anleitung','Eine mittlere freigegebene Stellung einnehmen. Den flächigen leichten Gegenwiderstand der Therapeutin oder des Therapeuten ohne Bewegung ausgleichen.','Die gewählte Mittelstellung bleibt erhalten; danach die Spannung lösen.'],
  ],
  functional: [
    ['frei','Dynamische Grundform','Kraft','Ohne Zusatzgerät','Den beschriebenen Ablauf mit dem eigenen Körpergewicht ausführen.','Die beschriebene Endstellung erreichen.'],
    ['unterstuetzt','Mit zusätzlicher Handunterstützung','Kraft','Stabile Haltemöglichkeit','Zusätzlich an einer belastbaren Haltemöglichkeit festhalten und einen Teil des Körpergewichts über die Arme entlasten. Den beschriebenen Bewegungsweg ausführen.','Die beschriebene Endstellung mit zusätzlicher Handunterstützung erreichen.'],
    ['gefuehrt','Mit persönlicher Bewegungshilfe','Mobilisation','Therapeutische Anleitung','Die Therapeutin oder der Therapeut unterstützt die Bewegung und übernimmt einen Teil der Last; den beschriebenen Ablauf aktiv mitgestalten.','Die beschriebene Endstellung mit persönlicher Hilfe erreichen.'],
    ['isometrisch','Isometrisch in Mittelstellung','Kraft','Ohne Zusatzgerät','Nur in die mittlere freigegebene Stellung des beschriebenen Weges gehen und dort das Körpergewicht ohne Bewegung halten.','Die Mittelstellung bleibt während der Anspannung unverändert.'],
    ['exzentrisch','Mit betonter Absenkphase','Kraft','Stabile Haltemöglichkeit','Die Absenkphase des beschriebenen Ablaufs selbst langsam abbremsen; für die anhebende Phase mit den Händen an einer stabilen Haltemöglichkeit deutlich entlasten.','Die Absenkstellung ist erreicht; danach mit Handhilfe in die Ausgangsstellung zurückkehren.'],
    ['lastnah','Mit körpernahem Zusatzgewicht','Kraft','Gewichtsweste','Nur nach Freigabe eine sicher geschlossene leichte Gewichtsweste anlegen und den beschriebenen Weg ausführen.','Die beschriebene Endstellung mit körpernahem Zusatzgewicht erreichen.'],
    ['last-halten','Isometrisch mit Zusatzgewicht','Kraft','Gewichtsweste','Mit freigegebener leichter Gewichtsweste nur bis zur mittleren Stellung bewegen und dort das Körpergewicht ohne Bewegung halten.','Die Mittelstellung bleibt unter Zusatzlast unverändert; danach kontrolliert zurückkehren.'],
    ['manuell','Mit dosierter manueller Gegenkraft','Kraft','Therapeutische Anleitung','Die Therapeutin oder der Therapeut gibt am Rumpf eine flächige Gegenkraft entgegen der anhebenden Bewegungsphase; den beschriebenen Ablauf kontrolliert ausführen.','Die beschriebene Endstellung mit manueller Gegenkraft erreichen.'],
  ],
  balance: [
    ['beidhaendig','Mit beidseitigem Handkontakt','Koordination','Stabile Haltemöglichkeit','Den beschriebenen Gleichgewichtsablauf mit beiden Händen an einer stabilen Haltemöglichkeit durchführen.'],
    ['einhaendig','Mit einseitigem Handkontakt','Koordination','Stabile Haltemöglichkeit','Den beschriebenen Ablauf mit einer Hand an einer stabilen Haltemöglichkeit durchführen.'],
    ['fingerkontakt','Mit leichtem Fingerkontakt','Koordination','Stabile Haltemöglichkeit','Eine stabile Haltemöglichkeit mit den Fingerspitzen berühren und den beschriebenen Ablauf kontrollieren.'],
    ['ohnehand','Ohne Handkontakt mit Sicherung','Koordination','Therapeutische Sicherung','Den beschriebenen Ablauf ohne Handkontakt ausführen; die Therapeutin oder der Therapeut sichert direkt gegen Stürze.'],
    ['blickwechsel','Mit horizontalem Blickwechsel','Koordination','Therapeutische Sicherung','Den beschriebenen Ablauf mit Sicherung durchführen und dabei den Blick langsam zwischen zwei seitlichen Markierungen wechseln lassen. Kopfbewegung nur bei guter Verträglichkeit.'],
    ['reichen','Mit Reichaufgabe','Koordination','Therapeutische Sicherung','Den beschriebenen Ablauf mit Sicherung durchführen und zusätzlich mit einer Hand eine nahe Markierung erreichen.'],
    ['gegenstand','Mit leichter Gegenstandsübergabe','Koordination','Weicher Ball','Mit Sicherung einen weichen Ball vor dem Körper von einer Hand in die andere geben, während der beschriebene Ablauf kontrolliert wird.'],
    ['reaktion','Mit angekündigtem Richtungssignal','Koordination','Therapeutische Sicherung','Die Therapeutin oder der Therapeut kündigt ein Richtungssignal an; darauf den beschriebenen Ablauf beginnen oder stoppen. Direkt gegen Stürze sichern.'],
  ],
};

// id | title | position | start | action | end | cue | muscle keys | form profile
const groups = {
shoulder: { joint:'Schultergelenk', region:'Schulter', rows: `
flex-stand|Armheben nach vorn im Stand|Im Stand|Hüftbreit stehen, Arme locker seitlich, Daumen nach vorn.|Einen Arm mit gestrecktem Ellenbogen nach vorn bis zur freigegebenen Höhe anheben.|Arm zeigt nach vorn; Rumpf bleibt aufrecht.|Schulter nicht hochziehen und kein Hohlkreuz bilden.|deltoid|open
flex-sitz|Armheben nach vorn im Sitz|Im Sitzen|Auf stabilem Stuhl sitzen, Füße aufstellen, Arm seitlich ablegen.|Einen Arm nach vorn anheben und den Rumpf ruhig halten.|Arm ist vor dem Körper angehoben.|Nicht aus dem Rücken Schwung holen.|deltoid|open
flex-ruecken|Armheben in Rückenlage|In Rückenlage|Auf dem Rücken liegen, Knie aufstellen, Arm neben dem Körper.|Den Arm mit nach oben gerichtetem Daumen in Richtung Kopf führen; nur im freigegebenen Bereich.|Arm ist in Richtung Kopf angehoben.|Rippen nicht nach oben ausweichen lassen.|deltoid|open
scaption-stand|Armheben in der Schulterblattebene|Im Stand|Aufrecht stehen, Arm etwas vor der Körperseite, Daumen nach oben.|Den Arm schräg nach vorn außen bis zur vereinbarten Höhe heben.|Arm steht schräg vor dem Körper.|Kein Einklemmen oder Hochziehen der Schulter zulassen.|deltoid|open
scaption-sitz|Schräges Armheben im Sitz|Im Sitzen|Aufrecht sitzen, Arm seitlich, Daumen nach oben.|Den Arm in der Schulterblattebene schräg nach vorn außen führen.|Arm ist schräg angehoben, Kopf bleibt aufrecht.|Rumpf nicht zur Gegenseite neigen.|deltoid|open
abduktion-stand|Seitliches Armheben im Stand|Im Stand|Hüftbreit stehen, Arm seitlich, Daumen nach oben.|Den Arm seitlich bis zur individuell freigegebenen Höhe anheben.|Arm ist seitlich angehoben.|Nicht über Schmerzen oder vorgegebene Grenzen hinausheben.|deltoid|open
abduktion-sitz|Seitliches Armheben im Sitz|Im Sitzen|Aufrecht sitzen, Arm neben dem Körper.|Den Arm mit nach oben gerichtetem Daumen seitlich anheben.|Arm steht seitlich vom Rumpf ab.|Becken und Brustkorb nicht seitlich verschieben.|deltoid|open
extension-stand|Arm nach hinten führen|Im Stand|Aufrecht stehen, Arm neben dem Körper, Handfläche nach innen.|Den gestreckten Arm nur wenig hinter den Rumpf führen.|Arm steht leicht hinter dem Rumpf.|Nicht den Oberkörper nach vorn kippen.|back|open
extension-bauch|Armheben nach hinten in Bauchlage|In Bauchlage|Auf dem Bauch liegen, Stirn weich ablegen, Arm neben dem Rumpf.|Den gestreckten Arm wenige Zentimeter von der Unterlage abheben.|Arm schwebt neben dem Körper.|Schultervorderseite nicht schmerzhaft belasten.|back|gravity
aussen-stand|Außenrotation am Körper im Stand|Im Stand|Aufrecht stehen, Ellenbogen seitlich am Rumpf 90 Grad beugen, Hand nach vorn.|Unterarm nach außen drehen, Ellenbogen am Körper belassen.|Hand steht weiter außen, Ellenbogen bleibt angelegt.|Keine Rumpfdrehung als Ersatzbewegung.|rotator|open
aussen-sitz|Außenrotation am Körper im Sitz|Im Sitzen|Aufrecht sitzen, Ellenbogen am Rumpf, Unterarm nach vorn.|Den Unterarm nach außen führen ohne den Ellenbogen abzuheben.|Unterarm ist nach außen gedreht.|Handgelenk gerade halten.|rotator|open
aussen-seite|Außenrotation in Seitenlage|In Seitenlage|Auf der Gegenseite liegen, oberer Ellenbogen am Rumpf gebeugt, Unterarm vor dem Bauch.|Den oberen Unterarm zur Decke drehen.|Unterarm ist angehoben, Ellenbogen bleibt am Körper.|Nicht mit dem Rumpf nach hinten rollen.|rotator|gravity
innen-stand|Innenrotation am Körper im Stand|Im Stand|Aufrecht stehen, Ellenbogen am Rumpf beugen, Unterarm etwas nach außen richten.|Unterarm zum Bauch drehen, Ellenbogen seitlich stabil halten.|Unterarm liegt vor dem Bauch.|Nicht die Schulter nach vorn schieben.|internal|open
innen-sitz|Innenrotation am Körper im Sitz|Im Sitzen|Aufrecht sitzen, Ellenbogen am Rumpf gebeugt, Hand etwas außen.|Die Hand zum Bauch führen, Oberarm ruhig halten.|Unterarm steht vor dem Bauch.|Nicht aus dem Handgelenk abknicken.|internal|open
innen-seite|Innenrotation in Seitenlage|In Seitenlage|Auf der Übungsseite liegen, unterer Arm bequem vorlagern, Ellenbogen beugen; Schulter nicht einklemmen.|Den unteren Unterarm vom Boden in Richtung Bauch anheben.|Unterarm ist angehoben.|Nur bei beschwerdefreier Lagerung der unteren Schulter.|internal|gravity
horizontal-ruecken|Arm zur Körpermitte in Rückenlage|In Rückenlage|Auf dem Rücken liegen, Arm seitlich im freigegebenen Winkel ablegen.|Den Arm mit leicht gebeugtem Ellenbogen vor den Brustkorb führen.|Arm steht vor dem Brustkorb.|Nicht den Oberkörper mitdrehen.|chest|open
horizontal-sitz|Horizontales Heranführen im Sitz|Im Sitzen|Aufrecht sitzen, Arm nach vorn und etwas außen anheben, Ellenbogen leicht beugen.|Den Arm vor dem Brustkorb zur Mitte führen.|Hand steht vor der Körpermitte.|Nur in freigegebener Armhöhe arbeiten.|chest|open
oeffnen-sitz|Horizontales Öffnen im Sitz|Im Sitzen|Aufrecht sitzen, Arm vor den Brustkorb anheben, Ellenbogen leicht beugen.|Den Arm in gleicher Höhe nach außen öffnen.|Arm zeigt seitlich nach außen.|Kein Nach-hinten-Reißen und kein Hohlkreuz.|deltoid,rhomboid|open
oeffnen-bauch|Seitliches Armheben in Bauchlage|In Bauchlage|Auf dem Bauch liegen, Stirn ablegen, Arm seitlich in freigegebenem Winkel, Daumen nach oben.|Den Arm etwas von der Unterlage abheben.|Arm schwebt seitlich über der Unterlage.|Nacken entspannt und Bewegung klein halten.|deltoid,rhomboid|gravity
rudern-stand|Ruderbewegung im Stand|Im Stand|Aufrecht stehen, Ellenbogen leicht gebeugt, Hände vor dem Rumpf.|Ellenbogen körpernah nach hinten ziehen und Schulterblätter kontrolliert zusammenführen.|Ellenbogen stehen neben dem Rumpf.|Schultern nicht zu den Ohren ziehen.|back,rhomboid|open
rudern-sitz|Ruderbewegung im Sitz|Im Sitzen|Aufrecht sitzen, Arme nach vorn ausrichten, Ellenbogen weich.|Ellenbogen seitlich am Körper nach hinten führen.|Oberarme stehen neben dem Rumpf.|Nicht mit dem Oberkörper zurückschaukeln.|back,rhomboid|open
serratus-ruecken|Zur Decke reichen in Rückenlage|In Rückenlage|Auf dem Rücken liegen, Arm senkrecht zur Decke, Ellenbogen locker gestreckt.|Die Hand wenige Zentimeter zur Decke schieben; das Schulterblatt löst sich leicht.|Hand steht höher, Brustkorb bleibt ruhig.|Nicht den Kopf anheben oder den Ellenbogen beugen.|serratus|open
reich-sitz|Nach vorn reichen im Sitz|Im Sitzen|Aufrecht sitzen, einen Arm in verträglicher Höhe nach vorn richten.|Mit der Hand nach vorn reichen und das Schulterblatt am Brustkorb gleiten lassen.|Hand ist weiter vorn, Rumpf bleibt aufrecht.|Nicht den ganzen Oberkörper nach vorn fallen lassen.|serratus|open
ball-rollen-vor|Pezziball nach vorn rollen|Im Sitzen|Auf festem Stuhl sitzen, Unterarme auf einem gesicherten Pezziball vor dem Körper ablegen.|Den Ball mit den Unterarmen nach vorn rollen und den Armwinkel vergrößern.|Ball steht weiter vorn, Arme sind länger.|Ball sichern; nicht mit Körpergewicht auf den Ball fallen.|deltoid|ball
ball-rollen-seit|Pezziball seitlich rollen|Im Sitzen|Auf festem Stuhl sitzen, einen Unterarm auf dem gesicherten Pezziball seitlich vor dem Körper lagern.|Den Ball sanft seitlich nach außen rollen und den Arm mitführen.|Arm und Ball stehen weiter außen.|Rumpf nicht zur Gegenseite verlagern.|deltoid|ball
` },
elbow: { joint:'Ellenbogengelenk', region:'Ellenbogen', rows: `
beugen-sitz-sup|Ellenbogenbeugen im Sitz mit Handfläche oben|Im Sitzen|Aufrecht sitzen, Oberarm am Körper, Handfläche nach vorn oben.|Den Ellenbogen beugen und die Hand zur Schulter führen.|Ellenbogen ist gebeugt, Oberarm bleibt am Körper.|Nicht mit der Schulter nach vorn ausweichen.|biceps,brachialis|open
beugen-stand-sup|Ellenbogenbeugen im Stand mit Handfläche oben|Im Stand|Aufrecht stehen, Arm neben dem Körper, Handfläche nach vorn.|Ellenbogen beugen und Hand in Richtung Schulter bewegen.|Unterarm ist angehoben.|Kein Schwung aus Hüfte oder Rücken.|biceps,brachialis|open
beugen-sitz-neutral|Hammerbewegung im Sitz|Im Sitzen|Sitzen, Oberarm am Körper, Daumen nach vorn oben richten.|Den Ellenbogen mit unveränderter Daumenstellung beugen.|Unterarm ist angehoben, Daumen bleibt oben.|Handgelenk nicht zur Seite abknicken.|brachialis,biceps|open
beugen-stand-neutral|Hammerbewegung im Stand|Im Stand|Hüftbreit stehen, Oberarm seitlich, Daumen nach vorn.|Den Ellenbogen beugen und den Unterarm mit Daumen oben anheben.|Ellenbogen ist gebeugt.|Schulter nicht hochziehen.|brachialis,biceps|open
beugen-sitz-pron|Ellenbogenbeugen im Sitz mit Handfläche unten|Im Sitzen|Sitzen, Oberarm am Körper, Handrücken nach vorn richten.|Ellenbogen beugen, Handfläche zeigt beim Anheben nach unten.|Unterarm ist angehoben, Handfläche unten.|Handgelenk in einer Linie mit dem Unterarm halten.|brachialis|open
beugen-stand-pron|Ellenbogenbeugen im Stand mit Handfläche unten|Im Stand|Stehen, Arm neben dem Körper, Handrücken nach vorn.|Den Unterarm anheben und die Unterarmdrehung beibehalten.|Ellenbogen ist gebeugt, Handfläche unten.|Rumpf ruhig halten.|brachialis|open
beugen-tisch-sup|Ellenbogenbeugen auf dem Tisch, Handfläche oben|Im Sitzen|Am Tisch sitzen, Oberarm und Unterarm bequem ablegen, Handfläche oben.|Hand auf der Tischfläche zur Schulter gleiten lassen.|Ellenbogen ist stärker gebeugt.|Schulter nicht nach oben ziehen.|biceps,brachialis|open
beugen-tisch-neutral|Ellenbogenbeugen auf der Kleinfingerkante|Im Sitzen|Seitlich am Tisch sitzen, Arm ablegen, Hand auf der Kleinfingerkante lagern.|Hand über die Tischfläche zum Körper gleiten lassen.|Ellenbogen ist gebeugt, Daumen bleibt oben.|Tischhöhe so wählen, dass die Schulter entspannt bleibt.|brachialis|open
beugen-ruecken|Ellenbogenbeugen in Rückenlage|In Rückenlage|Auf dem Rücken liegen, Oberarm neben dem Körper, Handfläche oben.|Unterarm vom Boden lösen und Hand Richtung Schulter führen.|Unterarm ist angehoben.|Oberarm nicht abheben.|biceps,brachialis|open
beugen-schulter-vor|Ellenbogenbeugen mit vorgelagertem Oberarm|Im Sitzen|Sitzen, Oberarm auf einem Polster vor dem Körper ablegen, Handfläche oben.|Den Ellenbogen beugen und die Hand zum Gesicht führen.|Unterarm steht aufgerichtet.|Oberarm auf dem Polster lassen.|biceps,brachialis|open
strecken-sitz|Ellenbogenstrecken im Sitz|Im Sitzen|Sitzen, Oberarm am Körper, Ellenbogen gebeugt, Hand neutral.|Den Ellenbogen langsam strecken, ohne ihn zu verriegeln.|Arm hängt länger neben dem Körper.|Nicht über die natürliche Streckgrenze drücken.|triceps|open
strecken-stand|Ellenbogenstrecken im Stand|Im Stand|Aufrecht stehen, Ellenbogen am Rumpf gebeugt, Hand nach vorn.|Unterarm nach unten führen und Ellenbogen strecken.|Arm steht nahezu gestreckt neben dem Körper.|Schulter und Oberarm nicht nach hinten schieben.|triceps|open
strecken-tisch|Ellenbogenstrecken auf dem Tisch|Im Sitzen|Sitzen, Arm auf der Tischfläche ablegen, Ellenbogen gebeugt.|Hand nach vorn gleiten lassen und Ellenbogen strecken.|Arm liegt länger auf der Tischfläche.|Nicht in eine schmerzhafte Endstellung schieben.|triceps|open
strecken-ruecken|Ellenbogenstrecken mit senkrechtem Oberarm|In Rückenlage|Auf dem Rücken liegen, Oberarm senkrecht halten, Ellenbogen beugen, Hand oberhalb der Stirn.|Unterarm zur Decke strecken, Oberarm ruhig halten.|Arm ist annähernd senkrecht gestreckt.|Hand nicht unkontrolliert zum Gesicht fallen lassen.|triceps|gravity
strecken-vorneige|Ellenbogenstrecken in leichter Vorneige|Im Stand|Mit einer Hand am Tisch abstützen, Rumpf leicht vornehmen, Übungsoberarm neben dem Rumpf, Ellenbogen gebeugt.|Unterarm nach hinten strecken und Oberarm ruhig halten.|Ellenbogen ist nahezu gestreckt.|Rücken nicht rund machen und nicht schwingen.|triceps|gravity
strecken-seite|Ellenbogenstrecken in Seitenlage|In Seitenlage|Auf der Gegenseite liegen, oberen Oberarm auf einem Polster vor dem Rumpf ablegen, Ellenbogen beugen.|Ellenbogen strecken und Hand auf dem Polster vorwärts führen.|Arm ist länger auf dem Polster abgelegt.|Schulter entspannt lassen.|triceps|open
beugen-seite|Ellenbogenbeugen in Seitenlage|In Seitenlage|Auf der Gegenseite liegen, oberen Arm auf einem Polster vor dem Rumpf ablegen, Handfläche nach oben.|Hand auf dem Polster zum Gesicht führen und Ellenbogen beugen.|Ellenbogen ist gebeugt.|Den Oberarm nicht über die Unterlage ziehen.|biceps,brachialis|open
beugen-oberarm-seit|Ellenbogenbeugen mit seitlich gelagertem Oberarm|Im Sitzen|Seitlich am Tisch sitzen, Oberarm bequem seitlich auf Polster ablegen, Unterarm nach außen.|Den Ellenbogen beugen und die Hand zum Körper führen.|Unterarm steht näher am Körper.|Schulterwinkel nur nach Freigabe wählen.|biceps,brachialis|open
strecken-oberarm-seit|Ellenbogenstrecken mit seitlich gelagertem Oberarm|Im Sitzen|Oberarm seitlich auf Tischpolster lagern, Ellenbogen gebeugt, Hand neutral.|Den Unterarm auf der Unterlage nach außen strecken.|Ellenbogen ist nahezu gestreckt.|Nicht auf den Ellenbogen drücken.|triceps|open
beugen-oberarm-hoch|Ellenbogenbeugen mit angehobenem Oberarm|In Rückenlage|Auf dem Rücken liegen, Oberarm senkrecht halten, Ellenbogen zunächst nahezu gestreckt.|Ellenbogen beugen und die Hand langsam Richtung Stirn führen.|Ellenbogen ist gebeugt, Oberarm bleibt senkrecht.|Bewegung vor dem Gesicht sichern.|biceps,brachialis|open
strecken-ueberkopf|Ellenbogenstrecken über Kopf|Im Sitzen|Sitzen, Oberarm im freigegebenen Bereich über Kopf halten, Ellenbogen beugen.|Den Ellenbogen nach oben strecken, Oberarm möglichst ruhig halten.|Arm ist nach oben länger ausgerichtet.|Nur bei freigegebener Schulterbeweglichkeit; nicht ins Hohlkreuz gehen.|triceps|gravity
wanddruecken|Ellenbogenstrecken an der Wand|Im Stand|Hände etwa schulterbreit an eine Wand legen, Füße etwas zurück, Ellenbogen leicht beugen.|Die Wand wegdrücken und Ellenbogen kontrolliert strecken.|Arme sind fast gestreckt, Körper bleibt in einer Linie.|Nicht in die Ellenbogen durchhängen.|triceps,chest|functional
tischdruecken|Ellenbogenstrecken am hohen Tisch|Im Stand|Hände auf einen gegen Verrutschen gesicherten hohen Tisch stützen, Füße zurück, Ellenbogen beugen.|Den Tisch wegdrücken und Ellenbogen strecken.|Arme sind fast gestreckt.|Keine instabilen Tische benutzen.|triceps,chest|functional
kniewand|Ellenbogenstrecken im Kniestütz an der Wand|Im Kniestand|Auf gepolsterter Matte knien und Hände vor sich an eine Wand legen, Ellenbogen leicht gebeugt.|Mit den Händen von der Wand wegdrücken und Ellenbogen strecken.|Ellenbogen sind fast gestreckt.|Knie polstern und nicht mit dem Kopf vorstoßen.|triceps,chest|functional
ball-tisch|Pezziball mit den Unterarmen wegrollen|Im Sitzen|Sitzen, Oberarme am Körper, Unterarme auf gesichertem Pezziball vor dem Stuhl, Ellenbogen gebeugt.|Ball nach vorn rollen und dabei die Ellenbogen langsam strecken.|Unterarme sind länger nach vorn ausgerichtet.|Keinen starken Druck auf die Ellenbogenspitzen geben.|triceps|ball
` },
wrist: { joint:'Handgelenk', region:'Hand / Handgelenk', rows: `
beugen-tisch|Handgelenkbeugen mit Handfläche oben|Im Sitzen|Unterarm auf Tisch lagern, Handfläche oben, Hand frei über der Kante.|Hand aus dem Handgelenk nach oben zur Unterarmseite beugen.|Hand ist zur Beugeseite angehoben.|Unterarm bleibt liegen, Finger locker lassen.|wristflex|open
strecken-tisch|Handgelenkstrecken mit Handfläche unten|Im Sitzen|Unterarm auf Tisch lagern, Handfläche unten, Hand über der Kante.|Handrücken aus dem Handgelenk anheben.|Hand ist in Streckrichtung angehoben.|Ellenbogen und Unterarm bleiben auf der Unterlage.|wristext|open
radial-tisch|Hand zur Daumenseite neigen|Im Sitzen|Unterarm mit Handfläche unten auflegen, Hand frei über Kante, Handgelenk neutral.|Hand seitlich zur Daumenseite führen.|Hand steht zur Daumenseite versetzt.|Unterarm nicht drehen.|radial|open
ulnar-tisch|Hand zur Kleinfingerseite neigen|Im Sitzen|Unterarm mit Handfläche unten lagern, Handgelenk gerade, Hand über der Tischkante.|Hand seitlich zur Kleinfingerseite bewegen.|Hand steht zur Kleinfingerseite versetzt.|Nicht mit dem Unterarm ausweichen.|ulnar|open
beugen-kante|Handgelenkbeugen auf der Kleinfingerkante|Im Sitzen|Unterarm auf Kleinfingerkante lagern, Daumen oben, Hand frei über Kante.|Die Hand zur Handflächenseite bewegen.|Hand steht zur Beugeseite versetzt.|Daumen bleibt oben und Unterarm ruhig.|wristflex|open
strecken-kante|Handgelenkstrecken auf der Kleinfingerkante|Im Sitzen|Unterarm auf Kleinfingerkante lagern, Daumen oben, Handgelenk gerade.|Die Hand zur Handrückenseite bewegen.|Hand steht zur Streckseite versetzt.|Nicht die Finger statt des Handgelenks bewegen.|wristext|open
radial-kante|Daumenseitiges Anheben auf der Handkante|Im Sitzen|Unterarm auf Kleinfingerkante lagern, Hand über Kante.|Hand aus dem Handgelenk in Richtung Daumen anheben.|Daumenseite der Hand ist angehoben.|Unterarmdrehung vermeiden.|radial|open
ulnar-kante|Kleinfingerseitiges Absenken auf der Handkante|Im Sitzen|Unterarm auf Kleinfingerkante lagern, Hand neutral über der Kante.|Hand zur Kleinfingerseite absenken.|Hand ist zur Kleinfingerseite geneigt.|Bewegungsweg kontrollieren, nicht fallen lassen.|ulnar|open
beugen-oberschenkel|Handgelenkbeugen auf dem Oberschenkel|Im Sitzen|Unterarm auf Oberschenkel, Handfläche oben, Hand frei vor dem Knie.|Hand zur Handflächenseite beugen.|Hand ist in Beugerichtung angehoben.|Unterarm stabil auflegen.|wristflex|open
strecken-oberschenkel|Handgelenkstrecken auf dem Oberschenkel|Im Sitzen|Unterarm mit Handfläche unten auf Oberschenkel ablegen, Hand vor dem Knie frei.|Handrücken anheben und Handgelenk strecken.|Handrücken steht höher.|Schulter locker lassen.|wristext|open
radial-oberschenkel|Daumenseitige Bewegung auf dem Oberschenkel|Im Sitzen|Unterarm mit Handfläche unten auf Oberschenkel lagern, Hand vor dem Knie.|Hand zur Daumenseite bewegen.|Hand steht daumenseitig versetzt.|Nicht den ganzen Arm nach außen ziehen.|radial|open
ulnar-oberschenkel|Kleinfingerseitige Bewegung auf dem Oberschenkel|Im Sitzen|Unterarm auf Oberschenkel ablegen, Handfläche unten, Hand frei.|Hand zur Kleinfingerseite bewegen.|Hand steht kleinfingerseitig versetzt.|Schulter und Ellenbogen nicht verschieben.|ulnar|open
beugen-ellenbogen-lang|Handgelenkbeugen mit lang gelagertem Ellenbogen|Im Sitzen|Arm auf langem Tischpolster mit fast gestrecktem Ellenbogen ablegen, Handfläche oben, Hand frei.|Handgelenk zur Handfläche beugen.|Hand steht in Beugerichtung.|Ellenbogen nicht durchdrücken.|wristflex|open
strecken-ellenbogen-lang|Handgelenkstrecken mit lang gelagertem Ellenbogen|Im Sitzen|Arm mit fast gestrecktem Ellenbogen auf Tischpolster, Handfläche unten, Hand über Kante.|Handrücken zum Unterarm anheben.|Handgelenk ist gestreckt.|Nicht über die Finger hochziehen.|wristext|open
radial-ellenbogen-lang|Daumenseitige Bewegung bei langem Ellenbogen|Im Sitzen|Arm mit nahezu gestrecktem Ellenbogen lagern, Handfläche unten, Hand frei.|Hand zur Daumenseite führen.|Hand steht daumenseitig versetzt.|Ellenbogenposition beibehalten.|radial|open
ulnar-ellenbogen-lang|Kleinfingerseitige Bewegung bei langem Ellenbogen|Im Sitzen|Arm mit nahezu gestrecktem Ellenbogen lagern, Handfläche unten, Hand über Kante.|Hand zur Kleinfingerseite führen.|Hand steht kleinfingerseitig versetzt.|Nicht den Unterarm verschieben.|ulnar|open
beugen-stand|Handgelenkbeugen im Stand am Tisch|Im Stand|Vor hohem Tisch stehen, Unterarm mit Handfläche oben vollständig auflegen, Hand frei.|Handgelenk zur Handflächenseite beugen.|Hand ist zur Beugeseite angehoben.|Tischhöhe so wählen, dass der Rücken aufrecht bleibt.|wristflex|open
strecken-stand|Handgelenkstrecken im Stand am Tisch|Im Stand|Vor hohem Tisch stehen, Unterarm mit Handfläche unten ablegen, Hand über Kante.|Handrücken anheben.|Handgelenk steht in Streckrichtung.|Nicht auf die Tischkante drücken.|wristext|open
radial-stand|Daumenseitige Handbewegung im Stand|Im Stand|Vor hohem Tisch stehen, Unterarm mit Handfläche unten ablegen, Hand frei.|Hand zur Daumenseite bewegen.|Hand ist daumenseitig ausgerichtet.|Becken und Schulter nicht mitdrehen.|radial|open
ulnar-stand|Kleinfingerseitige Handbewegung im Stand|Im Stand|Unterarm im Stand auf hohem Tisch lagern, Handfläche unten, Hand frei.|Hand zur Kleinfingerseite führen.|Hand ist kleinfingerseitig ausgerichtet.|Nicht die Finger seitlich spreizen statt das Handgelenk zu bewegen.|ulnar|open
diagonal-ein|Diagonal zur Daumenseite aufrichten|Im Sitzen|Unterarm auf Kleinfingerkante bequem ablegen, Hand leicht zur Kleinfinger-Beugeseite ausrichten.|Hand diagonal nach oben zur Daumen-Streckseite führen, wie beim Anheben eines kleinen Wurfpfeils.|Hand ist daumenseitig leicht gestreckt.|Keine ruckartige Wurfbewegung.|radial,wristext|open
diagonal-aus|Diagonal zur Kleinfingerseite absenken|Im Sitzen|Unterarm auf Kleinfingerkante lagern, Hand leicht zur Daumen-Streckseite ausrichten.|Hand diagonal zur Kleinfinger-Beugeseite führen.|Hand ist kleinfingerseitig leicht gebeugt.|Nicht mit dem ganzen Arm werfen.|ulnar,wristflex|open
beugen-faust|Handgelenkbeugen mit lockerer Faust|Im Sitzen|Unterarm mit Handfläche oben lagern, Hand frei; Finger zu einer lockeren Faust schließen.|Handgelenk beugen, ohne die Faust stark zu pressen.|Hand ist gebeugt, Faust bleibt locker.|Kein maximaler Faustschluss.|wristflex|open
strecken-faust|Handgelenkstrecken mit lockerer Faust|Im Sitzen|Unterarm mit Handfläche unten lagern, Hand frei; Finger locker zur Faust schließen.|Handrücken anheben, Faust locker halten.|Handgelenk ist gestreckt.|Finger nicht verkrampfen.|wristext|open
radial-faust|Daumenseitige Bewegung mit lockerer Faust|Im Sitzen|Unterarm mit Handfläche unten ablegen, Hand frei, Finger locker schließen.|Handgelenk zur Daumenseite bewegen.|Hand steht daumenseitig versetzt.|Keine feste Klemmung des Daumens in der Faust.|radial|open
` },
hip: { joint:'Hüftgelenk', region:'Hüfte', rows: `
flex-stand|Hüftbeugen im gesicherten Stand|Im Stand|Aufrecht stehen, mit einer Hand sicher festhalten, Übungsfuß am Boden.|Ein Knie nach vorn anheben und Becken waagerecht halten.|Oberschenkel ist nach vorn angehoben.|Nicht nach hinten lehnen.|flexor|gravity
flex-sitz|Hüftbeugen im Sitz|Im Sitzen|Auf festem Stuhl sitzen, beide Füße aufstellen.|Ein Knie anheben, ohne das Becken nach hinten zu rollen.|Ein Fuß ist vom Boden gelöst.|Oberkörper bleibt aufrecht.|flexor|gravity
flex-ruecken|Hüftbeugen mit langem Bein|In Rückenlage|Auf dem Rücken liegen, Übungsbein lang ablegen, anderes Knie aufstellen.|Das lange Bein nur so weit anheben, wie das Becken stabil bleibt.|Langes Bein ist angehoben.|Kein Hohlkreuz und kein gestrecktes Knie erzwingen.|flexor,quad|gravity
flex-seite|Hüftbeugen in Seitenlage|In Seitenlage|Auf Gegenseite liegen, oberes Bein auf glatter Unterlage vorlagern.|Das obere Knie nach vorn führen, ohne den Rumpf einzudrehen.|Hüfte ist gebeugt, Becken bleibt gestapelt.|Nicht mit dem Rücken rund werden.|flexor|open
ext-stand|Hüftstrecken im Stand|Im Stand|Festhalten, aufrecht stehen, Knie weich.|Ein Bein mit langem Knie etwas nach hinten führen.|Bein steht leicht hinter dem Körper.|Bewegung aus der Hüfte, nicht dem Hohlkreuz.|glute|open
ext-bauch|Hüftstrecken in Bauchlage|In Bauchlage|Auf dem Bauch liegen, Becken weich polstern, Übungsbein lang.|Das lange Bein etwas von der Unterlage anheben.|Oberschenkel schwebt leicht.|Becken nicht anheben oder verdrehen.|glute,ham|gravity
ext-bauch-gebeugt|Hüftstrecken mit gebeugtem Knie|In Bauchlage|Auf dem Bauch liegen, Übungsknie bequem beugen.|Den Oberschenkel wenige Zentimeter anheben und den Kniewinkel beibehalten.|Oberschenkel ist leicht angehoben.|Kein Hohlkreuz; Kniebeugung nur nach Freigabe.|glute|gravity
abd-stand|Seitliches Beinheben im Stand|Im Stand|Aufrecht stehen und an stabilem Stuhl festhalten.|Ein langes Bein zur Seite führen, Fußspitze bleibt nach vorn.|Bein steht seitlich vom Körper.|Becken nicht hochziehen.|abduct|open
abd-seite|Seitliches Beinheben in Seitenlage|In Seitenlage|Auf Gegenseite liegen, unteres Knie leicht beugen, oberes Bein lang.|Oberes Bein seitlich nach oben anheben.|Oberes Bein schwebt seitlich.|Nicht nach hinten rollen oder die Fußspitze hochdrehen.|abduct|gravity
abd-ruecken|Bein seitlich gleiten lassen|In Rückenlage|Auf dem Rücken liegen, langes Bein auf glatter Unterlage.|Das lange Bein seitlich nach außen schieben.|Bein liegt weiter außen.|Becken bleibt gerade und Fuß zeigt zur Decke.|abduct|open
add-stand|Bein zur Mitte führen im Stand|Im Stand|Festhalten, Übungsbein etwas seitlich abstellen.|Bein zur Körpermitte führen, ohne über das Standbein zu kreuzen.|Fuß steht wieder nahe der Mittellinie.|Kein Schwung und kein Verdrehen des Beckens.|adduct|open
add-seite|Unteres Bein anheben in Seitenlage|In Seitenlage|Auf Übungsseite liegen, oberes Bein vor dem Körper sicher aufstellen, unteres Bein lang.|Das untere lange Bein leicht anheben.|Unteres Bein schwebt über der Matte.|Becken nicht nach hinten kippen.|adduct|gravity
add-ruecken|Bein zur Mitte gleiten lassen|In Rückenlage|Auf dem Rücken liegen, Übungsbein leicht nach außen lagern.|Das lange Bein auf glatter Unterlage zur Körpermitte schieben.|Bein liegt wieder körpernah.|Keine erzwungene Kreuzbewegung.|adduct|open
aussen-sitz|Hüftaußenrotation im Sitz|Im Sitzen|Auf festem Stuhl sitzen, Knie etwa rechtwinklig, Oberschenkel ruhig halten.|Den Fuß nach innen führen; der Oberschenkel dreht sich im Hüftgelenk nach außen.|Unterschenkel steht etwas zur Mitte.|Knie nicht seitlich verschieben; Fußbewegung und Hüftrotation unterscheiden.|glute|open
innen-sitz|Hüftinnenrotation im Sitz|Im Sitzen|Sitzen, Knie gebeugt, Oberschenkel ruhig ausrichten.|Den Fuß nach außen führen; der Oberschenkel dreht im Hüftgelenk nach innen.|Unterschenkel steht etwas außen.|Nicht das Becken drehen; nach TEP nur mit ausdrücklicher Freigabe.|abduct|open
muschel|Muschelbewegung in Seitenlage|In Seitenlage|Auf Gegenseite liegen, Hüften und Knie leicht beugen, Füße aufeinander.|Oberes Knie öffnen, Füße zusammenlassen.|Oberes Knie ist angehoben.|Becken nicht nach hinten rollen.|abduct,glute|gravity
reverse-muschel|Fußheben bei geschlossenen Knien|In Seitenlage|Auf Gegenseite liegen, Knie leicht beugen und aufeinander lagern.|Oberen Fuß anheben, Knie in Kontakt lassen.|Oberer Fuß ist angehoben.|Becken bleibt ruhig; keine erzwungene Rotation.|abduct|gravity
bruecke|Beckenheben mit beiden Füßen|In Rückenlage|Auf dem Rücken liegen, Füße hüftbreit aufstellen.|Becken anheben, bis Rumpf und Oberschenkel eine bequeme Linie bilden.|Becken ist angehoben.|Nicht überstrecken oder in den Nacken drücken.|glute,ham|functional
bruecke-versetzt|Beckenheben mit versetzten Füßen|In Rückenlage|Rückenlage, Füße aufstellen, einen Fuß etwas weiter nach vorn setzen.|Becken bei gleichmäßigem Druck über die Füße anheben.|Becken steht angehoben und waagerecht.|Keine einseitige Beckenrotation.|glute,ham|functional
aufstehen|Vom Stuhl aufstehen mit Hüftstreckung|Im Sitzen|Auf festem gesichertem Stuhl sitzen, Füße unter die Knie stellen.|Rumpf aus der Hüfte vornehmen und kontrolliert aufstehen.|Aufrechter Stand, Hüfte gestreckt.|Nicht mit Schwung hochspringen.|glute,quad|functional
kniebeuge|Hüftbetonte Kniebeuge|Im Stand|Hüftbreit stehen, sichere Haltemöglichkeit bereithalten.|Hüfte nach hinten führen und Knie im freigegebenen Bereich beugen; dann wieder aufrichten.|Aufrechter Stand ist wieder erreicht.|Knie folgen den Fußrichtungen, Rücken bleibt lang.|glute,quad|functional
schritt-hoch|Niedrige Stufe hinaufsteigen|Im Stand|Vor einer niedrigen rutschfesten Stufe stehen, Geländer bereithalten.|Übungsfuß auf die Stufe stellen und den Körper über das vordere Bein anheben.|Beide Füße stehen auf der Stufe.|Knie und Fußspitze gleich ausrichten.|glute,quad|functional
seit-schritt|Seitliches Aufsteigen|Im Stand|Seitlich neben niedriger rutschfester Stufe stehen und sichern.|Seitlichen Fuß aufsetzen und den Körper kontrolliert auf die Stufe anheben.|Beide Füße stehen auf der Stufe.|Becken nicht seitlich absacken lassen.|abduct,quad|functional
ball-bruecke|Beckenheben mit Unterschenkeln auf Pezziball|In Rückenlage|Rückenlage, Unterschenkel auf gesichertem Pezziball, Ball gegen Wegrollen sichern.|Becken kontrolliert anheben, Ballposition halten.|Becken ist angehoben, Ball bleibt stabil.|Nur mit persönlicher Sicherung; nicht ins Hohlkreuz drücken.|glute,ham|ballstrength
ball-wand|Hüftstreckung aus der Pezziball-Wandkniebeuge|Im Stand|Mit Rücken an gesichertem Pezziball an der Wand stehen, Füße vor dem Körper.|Hüfte und Knie etwas beugen, dann über beide Füße wieder aufrichten.|Aufrechter Stand, Ball bleibt an der Wand.|Ball und Füße gegen Wegrutschen sichern.|glute,quad|ballstrength
` },
knee: { joint:'Kniegelenk', region:'Knie', rows: `
streck-sitz|Kniestrecken im Sitz|Im Sitzen|Auf festem Stuhl sitzen, Oberschenkel aufliegen lassen, Knie gebeugt.|Unterschenkel nach vorn anheben und Knie bis zur freigegebenen Grenze strecken.|Unterschenkel steht weiter vorn, Knie ist gestreckt.|Nach Kreuzbandrekonstruktion Winkel und Zusatzlast ausdrücklich freigeben lassen.|quad|gravity
streck-rolle|Kniestrecken über einer Rolle|In Rückenlage|Rückenlage, Polsterrolle unter dem Knie, Ferse auf der Matte.|Knie strecken und Ferse anheben; Knie bleibt auf der Rolle.|Unterschenkel ist angehoben.|Nicht die gesamte Hüfte anheben.|quad|gravity
streck-seite|Kniestrecken in Seitenlage|In Seitenlage|Auf Gegenseite liegen, oberes Bein auf glatter Unterlage lagern, Knie gebeugt.|Oberes Knie auf der Unterlage langsam strecken.|Oberes Bein liegt länger ausgestreckt.|Becken nicht mitdrehen.|quad|open
beug-sitz|Kniebeugen als Fersengleiten im Sitz|Im Sitzen|Auf Stuhl sitzen, Übungsfuß etwas vor dem Knie aufstellen.|Ferse auf glattem Boden zum Stuhl ziehen.|Knie ist stärker gebeugt.|Nicht unter den Stuhl erzwingen.|ham|open
beug-ruecken|Fersengleiten in Rückenlage|In Rückenlage|Rückenlage, Übungsbein lang auf glatter Unterlage.|Ferse Richtung Gesäß ziehen und Knie beugen.|Knie ist gebeugt, Fuß bleibt auf der Unterlage.|Keine schmerzhafte Beugung erzwingen.|ham|open
beug-stand|Kniebeugen im gesicherten Stand|Im Stand|Stehen und festhalten, Oberschenkel parallel ausrichten.|Eine Ferse nach hinten Richtung Gesäß führen und Knie beugen.|Unterschenkel ist nach hinten angehoben.|Knie nicht nach vorn schieben, Hüfte ruhig halten.|ham|gravity
beug-bauch|Kniebeugen in Bauchlage|In Bauchlage|Bauchlage, Beine lang, Becken bequem ablegen.|Ein Knie beugen und Ferse in Richtung Gesäß anheben.|Unterschenkel ist nach oben angehoben.|Nicht mit der Hüfte hochkommen.|ham|gravity
beug-seite|Kniebeugen in Seitenlage|In Seitenlage|Auf Gegenseite liegen, oberes Bein auf glatter Unterlage lang lagern.|Oberes Knie beugen und Ferse nach hinten gleiten lassen.|Oberes Knie ist gebeugt.|Nicht das Becken zurückdrehen.|ham|open
aufstehen-hoch|Aufstehen von hohem Stuhl|Im Sitzen|Auf hohem festem Stuhl sitzen, Füße gleichmäßig aufstellen.|Über beide Füße aufstehen und die Knie kontrolliert strecken.|Aufrechter Stand.|Knie nicht nach innen fallen lassen.|quad,glute|functional
aufstehen-normal|Aufstehen von normalem Stuhl|Im Sitzen|Auf normal hohem gesichertem Stuhl sitzen, Füße unter die Knie.|Rumpf etwas vornehmen und kontrolliert aufstehen.|Aufrechter Stand mit weichen Knien.|Stuhl gegen Verrutschen sichern.|quad,glute|functional
mini-squat|Kleine Kniebeuge|Im Stand|Hüftbreit stehen, Haltemöglichkeit erreichbar.|Knie und Hüften nur leicht beugen, anschließend aufrichten.|Aufrechter Stand ist wieder erreicht.|Kniescheiben folgen den Fußspitzen.|quad,glute|functional
squat-breit|Kniebeuge in breiterer Fußstellung|Im Stand|Etwas breiter als hüftbreit stehen, Fußspitzen leicht nach außen.|Knie und Hüften im freigegebenen Bereich beugen und wieder strecken.|Aufrechter Stand.|Nicht die Knie nach innen drehen.|quad,glute,adduct|functional
split-squat|Kniebeuge im Schrittstand|Im Stand|Im gesicherten Schrittstand stehen, beide Füße am Boden.|Beide Knie etwas beugen, Körper senkrecht absenken und wieder anheben.|Schrittstand mit nahezu gestreckten Knien.|Vorderes Knie stabil über dem Fuß halten.|quad,glute|functional
step-vor|Vorwärts auf niedrige Stufe steigen|Im Stand|Vor niedriger rutschfester Stufe stehen, Geländer bereithalten.|Vorderen Fuß aufsetzen und Körper über dieses Bein hochdrücken.|Beide Füße auf der Stufe.|Nicht über das hintere Bein hochspringen.|quad,glute|functional
step-seit|Seitwärts auf niedrige Stufe steigen|Im Stand|Seitlich zur Stufe stehen und an Geländer sichern.|Seitlichen Fuß aufsetzen und Körper auf die Stufe anheben.|Beide Füße stehen auf der Stufe.|Knie bleibt in Fußrichtung ausgerichtet.|quad,abduct|functional
step-runter|Vorwärts von niedriger Stufe absteigen|Im Stand|Auf niedriger Stufe stehen, Geländer bereithalten.|Ein Bein nach vorn zum Boden führen und Standknie kontrolliert beugen.|Vorderer Fuß berührt den Boden, Standknie ist gebeugt.|Becken waagerecht halten; keine ruckartige Absenkung.|quad|functional
step-seit-runter|Seitliches Absenken von niedriger Stufe|Im Stand|Seitlich am Rand einer niedrigen Stufe stehen und sichern.|Freien Fuß seitlich zum Boden führen, Standknie kontrolliert beugen.|Freier Fuß berührt seitlich den Boden.|Standknie nicht nach innen fallen lassen.|quad,abduct|functional
wand-squat|Kleine Wandkniebeuge|Im Stand|Rücken an glatte Wand lehnen, Füße etwas vor den Körper setzen.|An der Wand etwas absenken und wieder hochschieben.|Aufrechter Stand mit Rücken an der Wand.|Nur freigegebene Beugetiefe wählen.|quad,glute|functional
bruecke-fersen|Beckenheben mit Fersendruck|In Rückenlage|Rückenlage, Füße aufstellen und Fersen bewusst belasten.|Becken anheben und über die Fersen stabil halten.|Becken ist angehoben.|Füße nicht wegrutschen lassen.|ham,glute|functional
einbein-sitz|Aufstehen mit versetzter Fußstellung|Im Sitzen|Auf hohem Stuhl sitzen, Übungsfuß körpernäher, anderer Fuß etwas weiter vorn.|Mehr Last über den körpernahen Fuß übernehmen und aufstehen.|Aufrechter Stand.|Lastverteilung therapeutisch prüfen; nicht nach innen knicken.|quad,glute|functional
ball-wandsquat|Kleine Kniebeuge mit Pezziball an der Wand|Im Stand|Rücken an gesicherten Pezziball an der Wand lehnen, Füße vorlagern.|Mit dem Ball an der Wand etwas absenken und wieder aufrichten.|Aufrechter Stand mit stabilem Ballkontakt.|Ball gegen seitliches Wegrollen sichern.|quad,glute|ballstrength
ball-beug|Fersen zum Körper auf Pezziball rollen|In Rückenlage|Rückenlage, Fersen auf gesichertem Pezziball, Becken am Boden.|Ball mit den Fersen zum Körper ziehen und Knie beugen.|Knie sind gebeugt, Ball näher am Körper.|Becken am Boden lassen und Ball sichern.|ham|ballstrength
ball-streck|Pezziball mit Fersen wegrollen|In Rückenlage|Rückenlage, Fersen auf gesichertem Ball, Knie leicht gebeugt, Becken am Boden.|Ball mit den Fersen wegrollen und Knie kontrolliert strecken.|Beine sind länger, Knie nicht verriegelt.|Keine Überstreckung erzwingen.|quad|ball
gewicht-vor|Gewichtsverlagerung im Schrittstand|Im Stand|Gesicherten Schrittstand einnehmen, beide Füße am Boden.|Gewicht kontrolliert auf das vordere Bein verlagern und zurücknehmen.|Gewicht ist wieder gleichmäßig verteilt.|Knie über dem Fuß führen.|quad|balance
einbein|Standbeinkontrolle auf festem Boden|Im Stand|Vor Haltemöglichkeit stehen, einen Fuß etwas vom Boden lösen.|Becken waagerecht und Standknie leicht gebeugt halten.|Gesicherter Einbeinstand.|Standknie weder durchdrücken noch nach innen kippen.|quad,abduct|balance
` },
ankle: { joint:'Sprunggelenk', region:'Fuß / Sprunggelenk', rows: `
heben-sitz|Fußheben im Sitz|Im Sitzen|Sitzen, Ferse am Boden, Fuß locker aufgestellt.|Vorfuß und Zehen zum Schienbein anheben.|Vorfuß ist angehoben, Ferse bleibt unten.|Nicht das ganze Bein anheben.|tibial|open
senken-sitz|Fußsenken im Sitz mit freier Ferse|Im Sitzen|Sitzen, Unterschenkel bequem auf Polster lagern, Fuß frei.|Fuß vom Körper weg strecken, ohne die Zehen einzukrallen.|Fuß steht in Senkrichtung.|Bewegung aus dem Sprunggelenk ausführen.|calf|open
heben-ruecken|Fußheben in Rückenlage|In Rückenlage|Rückenlage, Unterschenkel auf Polster, Fuß frei.|Fußspitze zum Schienbein ziehen.|Fuß ist angezogen.|Knie und Hüfte nicht mitbewegen.|tibial|open
senken-ruecken|Fußsenken in Rückenlage|In Rückenlage|Rückenlage, Unterschenkel auf Polster, Fuß frei.|Fuß vom Schienbein weg ausrichten.|Fuß ist nach vorn gestreckt.|Zehen locker lassen.|calf|open
heben-lang|Fußheben im Langsitz|Im Langsitz|Mit gestütztem Rücken sitzen, Knie bequem lang, Ferse auflegen.|Vorfuß zum Schienbein ziehen.|Fuß steht aufgerichtet.|Nicht am Knie durchdrücken.|tibial|open
senken-lang|Fußsenken im Langsitz|Im Langsitz|Langsitz mit gestütztem Rücken, Ferse auflegen.|Fuß kontrolliert vom Körper weg bewegen.|Fuß steht in Senkrichtung.|Kein Verkrampfen der Zehen.|calf|open
innen-sitz|Fuß nach innen führen im Sitz|Im Sitzen|Unterschenkel bequem lagern, Fuß frei und gerade.|Vorfuß sanft nach innen führen, Ferse möglichst ruhig halten.|Fuß steht etwas nach innen.|Knie nicht mitdrehen und nicht gewaltsam umknicken.|posttib|open
aussen-sitz|Fuß nach außen führen im Sitz|Im Sitzen|Unterschenkel lagern, Fuß frei und neutral.|Vorfuß sanft nach außen führen.|Fuß steht etwas nach außen.|Bewegung klein halten; Unterschenkel bleibt ruhig.|peroneal|open
innen-lang|Fußinnenführung im Langsitz|Im Langsitz|Langsitz, Ferse bequem auflegen, Knie nicht verriegeln.|Vorfuß nach innen führen.|Fuß steht leicht nach innen.|Hüfte nicht als Ersatz drehen.|posttib|open
aussen-lang|Fußaußenführung im Langsitz|Im Langsitz|Langsitz, Ferse bequem auflegen, Fuß neutral.|Vorfuß nach außen führen.|Fuß steht leicht nach außen.|Nicht mit dem ganzen Bein ausweichen.|peroneal|open
innen-ruecken|Fußinnenführung in Rückenlage|In Rückenlage|Rückenlage, Unterschenkel auf Polster, Fuß frei.|Vorfuß leicht nach innen führen.|Fuß ist leicht nach innen ausgerichtet.|Keine forcierte Umknickposition.|posttib|open
aussen-ruecken|Fußaußenführung in Rückenlage|In Rückenlage|Rückenlage, Unterschenkel auf Polster, Fuß frei.|Vorfuß leicht nach außen führen.|Fuß ist leicht nach außen ausgerichtet.|Knie bleibt nach oben gerichtet.|peroneal|open
ferse-stand|Fersenheben mit langen Knien|Im Stand|Hüftbreit stehen und festhalten, Knie weich gestreckt.|Beide Fersen anheben und über die Großzehenballen stabilisieren.|Beide Fersen sind angehoben.|Nicht über die Fußaußenkanten kippen.|calf|functional
ferse-gebeugt|Fersenheben mit gebeugten Knien|Im Stand|Festhalten, beide Knie leicht beugen, Füße parallel.|Bei konstant gebeugten Knien die Fersen anheben.|Fersen sind angehoben, Knie bleiben gebeugt.|Knieposition nicht während des Hebens verändern.|calf|functional
ferse-sitz|Fersenheben im Sitz|Im Sitzen|Auf festem Stuhl sitzen, Füße unter den Knien aufstellen.|Fersen anheben, Vorfüße am Boden belassen.|Beide Fersen sind angehoben.|Nicht mit den Zehen krallen.|calf|gravity
vorfuss-stand|Vorfußheben im gesicherten Stand|Im Stand|Festhalten, auf beiden Fersen und Vorfüßen stehen.|Beide Vorfüße anheben, Fersen belastet lassen.|Vorfüße stehen höher.|Nicht mit dem Oberkörper nach hinten fallen.|tibial|functional
ferse-versetzt|Fersenheben mit versetzter Fußstellung|Im Stand|Festhalten, Füße leicht versetzt aufstellen.|Beide Fersen anheben und kontrolliert über den Vorfüßen stabilisieren.|Fersen sind angehoben.|Lastverteilung vorab festlegen.|calf|functional
ferse-einbein|Fersenheben auf einem Bein|Im Stand|Festhalten, Gewicht auf ein Bein verlagern, anderen Fuß lösen.|Standferse kontrolliert anheben.|Ferse des Standbeins ist angehoben.|Nur bei sicherer Vollbelastung und ausreichender Kraft.|calf|functional
vorfuss-sitz-knie-lang|Vorfußheben mit vorgestelltem Bein|Im Sitzen|Sitzen, ein Bein nach vorn stellen, Ferse am Boden.|Vorfuß zum Schienbein ziehen.|Vorfuß ist angehoben.|Knie nicht durchdrücken.|tibial|open
kurzer-fuss|Fußgewölbe im Sitz aufrichten|Im Sitzen|Sitzen, Fußsohle flächig aufstellen, Zehen lang lassen.|Großzehenballen gedanklich zur Ferse ziehen und das Gewölbe leicht anheben.|Längsgewölbe ist etwas höher, Zehen bleiben lang.|Nicht die Zehen einkrallen.|foot|foot
kurzer-fuss-stand|Fußgewölbe im Stand aufrichten|Im Stand|Mit Sicherung stehen, Ferse sowie Groß- und Kleinzehenballen belasten.|Fußgewölbe anheben, ohne die Zehen zu krallen.|Gewölbe ist aktiv aufgerichtet.|Nicht auf den Außenrand rollen.|foot,posttib|foot
gewicht-vor|Gewicht vor und zurück verlagern|Im Stand|Vor Haltemöglichkeit stehen, Füße parallel.|Gewicht zwischen Fersen und Vorfüßen verlagern, Sohlen möglichst in Kontakt lassen.|Gewicht steht wieder über der Fußmitte.|Nicht aus der Hüfte weit nach vorn knicken.|calf,tibial|balance
gewicht-seit|Gewicht seitlich verlagern|Im Stand|Gesichert hüftbreit stehen.|Gewicht langsam von einem Fuß auf den anderen verlagern.|Gewicht ist wieder in der Mitte.|Fußkanten nicht unkontrolliert belasten.|peroneal,posttib|balance
tandem|Fußkontrolle im Tandemstand|Im Stand|Mit Sicherung einen Fuß unmittelbar vor den anderen stellen.|Tandemstellung kontrollieren und beide Füße gleichmäßig stabilisieren.|Ruhiger Tandemstand.|Nicht ohne Sicherung beginnen.|foot,calf|balance
einbein|Sprunggelenkkontrolle im Einbeinstand|Im Stand|Vor Haltemöglichkeit stehen, Gewicht auf ein Bein verlagern.|Anderen Fuß lösen und Standfuß über drei Kontaktpunkten ruhig halten.|Gesicherter Einbeinstand.|Keine unkontrollierten Umknickbewegungen.|foot,peroneal|balance
` },
};

// Ball profiles retain the actual ball in every form. Support, movement direction
// and contraction change, but no weight or band is added to unstable ball tasks.
forms.ball = [
 ['beidarm','Mit beidseitigem Kontakt','Mobilisation','Pezziball','Den gesicherten Ball mit beiden Armen beziehungsweise Beinen führen.'],
 ['einseitig','Mit einseitiger Führung und Sicherung','Mobilisation','Pezziball','Den gesicherten Ball nur mit der Übungsseite führen; die Therapeutin oder der Therapeut stabilisiert den Ball seitlich.'],
 ['assistiert','Mit therapeutischer Bewegungshilfe','Mobilisation','Pezziball','Die Therapeutin oder der Therapeut führt den Ball mit; nur den angenehm möglichen Anteil aktiv übernehmen.'],
 ['isometrisch','Ball in Mittelstellung halten','Kraft','Pezziball','Ball in die mittlere freigegebene Stellung führen und dort ohne weitere Bewegung aktiv stabilisieren.'],
 ['zurueck','Rückweg mit eigener Führung','Mobilisation','Pezziball','Mit persönlicher Hilfe in die beschriebene Endstellung gehen, anschließend den Ball selbst aktiv zum Start zurückführen.'],
 ['bogen-innen','Mit flachem Bogen zur Mitte','Mobilisation','Pezziball','Den gesicherten Ball auf dem beschriebenen Weg zusätzlich in einem kleinen Bogen zur Körpermitte führen, ohne zu kreuzen.'],
 ['bogen-aussen','Mit flachem Bogen nach außen','Mobilisation','Pezziball','Den gesicherten Ball auf dem beschriebenen Weg zusätzlich in einem kleinen Bogen nach außen führen.'],
 ['ziel','Mit markiertem Bewegungsziel','Koordination','Pezziball','Eine therapeutisch festgelegte nahe Zielmarkierung mit dem gesicherten Ball erreichen und anschließend zum Start zurückführen.'],
];
forms.ballstrength = [
 ['dynamisch','Dynamisch mit gesichertem Ball','Kraft','Pezziball','Den beschriebenen Ablauf gegen das eigene Körper- oder Segmentgewicht ausführen; den Ball persönlich gegen Wegrollen sichern.'],
 ['assistiert','Mit entlastender Bewegungshilfe','Mobilisation','Pezziball','Den Ball sichern; die Therapeutin oder der Therapeut nimmt einen Teil des Segment- oder Körpergewichts ab und unterstützt den beschriebenen Weg.'],
 ['isometrisch','Mit Halten in Mittelstellung','Kraft','Pezziball','Nur in die mittlere freigegebene Stellung gehen und dort Körper und gesicherten Ball ruhig halten.'],
 ['exzentrisch','Mit kontrollierter Rückführung','Kraft','Pezziball','Mit persönlicher Unterstützung in die beschriebene Endstellung gehen, danach den Rückweg selbst gegen die Schwerkraft beziehungsweise den Ballwiderstand abbremsen.'],
 ['handkontakt','Mit zusätzlicher Handstabilisierung','Kraft','Pezziball','Eine zusätzliche sichere Handauflage zur seitlichen Stabilisierung verwenden und den beschriebenen Weg ausführen; der Ball bleibt persönlich gesichert.'],
 ['manuell','Mit therapeutischer Gegenkraft','Kraft','Pezziball','Die Therapeutin oder der Therapeut gibt eine flächige leichte Gegenkraft gegen die beschriebene aktive Bewegungsrichtung und sichert den Ball.'],
 ['signal','Mit Start-Stopp-Signal','Koordination','Pezziball','Den gesicherten Bewegungsablauf nach einem angekündigten Startsignal beginnen und in einer sicheren Mittelstellung auf Stoppsignal ruhig kontrollieren.'],
 ['ziel','Mit sichtbarem Bewegungsziel','Koordination','Pezziball','Eine kleine sichtbare Zielmarkierung für den beschriebenen Weg festlegen und mit persönlicher Ballsicherung gezielt erreichen.'],
];
forms.foot = [
 ['aktiv','Aktiv ohne Zusatzhilfe','Kraft','Ohne Zusatzgerät','Die beschriebene Gewölbeaktivierung selbst ausführen und wieder lösen.'],
 ['tastkontakt','Mit taktilem Orientierungspunkt','Kraft','Therapeutische Anleitung','Die Therapeutin oder der Therapeut berührt das innere Gewölbe leicht als Orientierung; den Fuß aktiv von diesem Punkt weg aufrichten.'],
 ['spiegel','Mit Spiegelkontrolle','Koordination','Spiegel','Die beschriebene Bewegung im Spiegel kontrollieren und Ferse sowie beide Fußballen am Boden lassen.'],
 ['zehen-lang','Mit bewusst verlängerten Zehen','Kraft','Ohne Zusatzgerät','Vor der Aktivierung die Zehen lang ablegen; beim Gewölbeaufbau darf sich kein Zehengelenk einkrallen.'],
 ['grosszehe','Mit zusätzlicher Großzehenkontrolle','Koordination','Ohne Zusatzgerät','Beim Gewölbeaufbau die Großzehenkuppe bewusst am Boden halten, ohne sie einzukrallen.'],
 ['kleinzehe','Mit zusätzlicher Außenballenkontrolle','Koordination','Ohne Zusatzgerät','Beim Gewölbeaufbau den Kleinzehenballen bewusst am Boden belassen, ohne auf den Außenrand zu kippen.'],
 ['druck','Gegen leichte manuelle Gewölbekraft','Kraft','Therapeutische Anleitung','Die Therapeutin oder der Therapeut gibt flächig eine sehr leichte Kraft gegen die Gewölbeaufrichtung; aktiv gegenhalten, ohne die Zehen zu krallen.'],
 ['wechsel','Mit Wechsel zwischen aktiv und locker','Koordination','Therapeutische Anleitung','Auf angekündigtes Signal zwischen aktiv aufgerichtetem Gewölbe und vollständig lockerem Fuß wechseln; drei Bodenkontakte erhalten.'],
];

const entries = [], families = [];
const warning = 'Redaktioneller Variantenentwurf, noch nicht fachlich freigegeben. Keine automatische Eignung nach Operation, bei Prothese oder akuter Verletzung. Belastung, Winkel und Dosierung individuell prüfen; bei neuen oder zunehmenden Beschwerden abbrechen.';
for (const [groupId, group] of Object.entries(groups)) {
  const rows = group.rows.trim().split('\n').map(line=>line.split('|'));
  if (rows.length !== 25) throw new Error(`${groupId}: expected 25 families, got ${rows.length}`);
  for (const [slug,title,position,start,action,end,cue,muscleKeys,profile] of rows) {
    const familyId = `${groupId}-${slug}`;
    const variants = forms[groupId === 'elbow' && profile === 'functional' ? 'push' : profile];
    if (!variants || variants.length !== 8) throw new Error(`Invalid profile ${profile}`);
    families.push({id:familyId,title,joint:group.joint,variants:variants.length});
    for (const [formId,label,type,baseEquipment,baseInstruction,result] of variants) {
      const lowerLimb = ['hip','knee','ankle'].includes(groupId);
      const equipment = lowerLimb && baseEquipment === 'Eigene Hand' ? 'Therapeutische Anleitung' : baseEquipment;
      const instruction = lowerLimb ? baseInstruction.replaceAll('die andere Hand','die therapeutisch führende Hand').replaceAll('Die andere Hand','Die Therapeutin oder der Therapeut soll die Hand').replaceAll('Mit der anderen Hand','Mit persönlicher therapeutischer Unterstützung') : baseInstruction;
      const actualLabel = lowerLimb ? label.replace('eigene Hand','therapeutische Hand').replace('eigener Hand','therapeutischer Hand') : label;
      const isometric = formId.includes('isometrisch') || ['widerstand-halten','last-halten'].includes(formId);
      const eccentric = formId.includes('exzentrisch');
      const final = isometric ? (result || 'Die individuell gewählte Mittelstellung bleibt unverändert; anschließend die Spannung lösen.')
        : eccentric ? (result || 'Nach dem kontrollierten Rückweg ist die Ausgangsstellung wieder erreicht.')
        : `${end}${result ? ' ' + result : ''}`;
      const id = `katalog-${familyId}-${formId}`;
      const source = sources[profile.startsWith('ball') ? 'ball' : groupId];
      const rootInstruction = isometric ? `Bewegungsrichtung zur Orientierung: ${action} Bei dieser Variante bleibt das Gelenk während der eigentlichen Anspannung jedoch in der beschriebenen Haltestellung.` : `Grundbewegung: ${action}`;
      entries.push({
        id, title:`${title} · ${actualLabel}`, subtitle:`${actualLabel} · ${position}`, region:group.region,
        goal: {Kraft:'Kräftigung',Mobilisation:'Beweglichkeit',Koordination:'Bewegungskontrolle'}[type],
        position, equipment, trainingTypes:[type], joints:[group.joint],
        strengthMuscles:type === 'Kraft' ? muscleKeys.split(',').map(key=>muscles[key]) : [],
        start, end:final, steps:[rootInstruction,instruction,`Endstellung: ${final}`,'Anschließend kontrolliert in die Ausgangsstellung zurückkehren und vollständig lösen. Dosierung nach individuellem Plan.'],
        mistakes:cue, precautions:warning + (profile.startsWith('ball') ? ' Pezziball nur mit sicherer Größe, rutschfestem Boden und persönlicher Sicherung nutzen.' : ''),
        requiresSupervision:true, familyId, familyTitle:title, variantLabel:actualLabel,
        sources:[source], sourceNote:'Die verlinkte Quelle erläutert verwandte Grundmuster. Lagerung, Hilfsmittel und Kontraktionsvariante sind eigene redaktionelle Übertragungen; für diese konkrete Variante ist keine eigenständige Studie hinterlegt.',
        conditionUses:[], methodTags:[], catalogMedia:[],
        difficulty: ['manschette','manschette-exzentrisch','lastnah','last-halten','ohnehand','reaktion'].includes(formId) ? 'Anspruchsvoll' : type === 'Mobilisation' ? 'Leicht' : 'Mittel',
      });
    }
  }
}
if (new Set(entries.map(e=>e.id)).size !== 1200 || entries.some(e=>e.strengthMuscles.includes(undefined))) throw new Error('Invalid catalog');
fs.writeFileSync('server/expanded-exercises.json', JSON.stringify(entries,null,2)+'\n');
fs.writeFileSync('src/catalog-families.json', JSON.stringify(families,null,2)+'\n');
fs.writeFileSync('src/exercise-taxonomy.json', JSON.stringify(taxonomy,null,2)+'\n');
console.log(`${families.length} Grundmuster, ${entries.length} Variantenentwürfe, 200 je Gelenk.`);
