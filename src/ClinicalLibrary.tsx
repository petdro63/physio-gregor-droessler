import { useState } from "react";
import { ArrowRight, BookOpen, Leaf } from "lucide-react";
import library from "./rehab-evidence.json" with { type: "json" };
import { suggestExercises } from "./condition-search";
import type { ConditionUse, Exercise } from "./types";

export function EvidenceCard({ id }: { id: string }) {
  const evidence = library.evidence.find(e => e.id === id);
  if (!evidence) return null;
  return <article className="evidence-card">
    <span className="eyebrow">{evidence.scope} · {evidence.year}</span>
    <h3><a href={evidence.url} target="_blank" rel="noopener noreferrer">{evidence.title}</a></h3>
    <p>{evidence.design}</p><p>{evidence.summary}</p>
    <p className="evidence-limit"><strong>Einordnung:</strong> {evidence.limitations}</p>
  </article>;
}

function ClinicalExerciseList({ exercises, onSelect }: { exercises: Exercise[]; onSelect: (e: Exercise) => void }) {
  return <div className="clinical-exercise-list">{exercises.map(e => <button type="button" className="clinical-exercise" key={e.id} onClick={() => onSelect(e)}>
    <BookOpen size={22}/><div><strong>{e.title}</strong><span>{e.trainingTypes.join(" · ")} · {e.position} · {e.equipment}</span><small>{e.requiresSupervision ? "Nur nach persönlicher Anleitung" : "Individuelle Eignung und Dosierung prüfen"} · {e.status === "published" ? "Freigegeben" : "Fachliche Freigabe ausstehend"}</small></div><ArrowRight size={18}/>
  </button>)}</div>;
}

export function ConditionLibrary({ exercises, onSelect }: { exercises: Exercise[]; onSelect: (e: Exercise) => void }) {
  const [conditionId, setConditionId] = useState(""), [phase, setPhase] = useState(""), [variant, setVariant] = useState("");
  const condition = library.conditions.find(c => c.id === conditionId);
  const suggested = suggestExercises(exercises,conditionId,phase,variant);
  const selectionComplete = !!condition && !!phase && (!condition.variants.length || !!variant);
  return <>
    <div className="page-heading"><div><div className="eyebrow">REHA INDIVIDUELL PLANEN</div><h1>Krankheitsbilder & Evidenz</h1><p>Passende Übungsfamilien finden und die Forschung dazu einordnen.</p></div></div>
    <section className="panel clinical-selection"><div className="form-grid">
      <label>Krankheitsbild<select value={conditionId} onChange={e => {setConditionId(e.target.value);setPhase("");setVariant("");}}><option value="">Bitte auswählen …</option>{library.conditions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      {condition && <label>Reha-Phase<select value={phase} onChange={e => setPhase(e.target.value)}><option value="">Phase bewusst auswählen …</option>{condition.phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
      {!!condition?.variants.length && <label>Behandlungsvariante<select value={variant} onChange={e => setVariant(e.target.value)}><option value="">Variante auswählen …</option>{condition.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>}
    </div><p>Die Auswahl erzeugt Vorschläge für das Praxisteam. Sie ersetzt weder Befund noch OP-Protokoll und weist Patienten keine Übungen automatisch zu.</p></section>
    {condition && <>
      <section className="panel"><h2>{condition.name}</h2><p>{condition.summary}</p><div className="notice">{condition.precautions}</div></section>
      <div className="section-heading"><h2>Übungsvorschläge {selectionComplete ? `(${suggested.length})` : ""}</h2></div>
      {!selectionComplete ? <p className="notice">Bitte Phase{condition.variants.length ? " und Behandlungsvariante" : ""} auswählen.</p> : suggested.length ? <>
        <p>Redaktionelle Zuordnung zu einer Übungsfamilie. Der Studienbezug gilt meist für ein Programm oder Verfahren, nicht für diese konkrete Übung.</p>
        <ClinicalExerciseList exercises={suggested} onSelect={onSelect}/>
      </> : <p className="notice">Für diese Auswahl sind derzeit keine geeigneten Einträge in Ihrer zugänglichen Bibliothek hinterlegt.</p>}
      <h2 className="clinical-section-title">Studien und Leitlinien</h2><div className="evidence-grid">{condition.evidenceIds.map(id => <EvidenceCard id={id} key={id}/>)}</div>
    </>}
    <p className="media-credit">Recherche-Stand: {library.reviewedOn.split("-").reverse().join(".")}. Die Übersicht ist keine vollständige Leitlinienrecherche.</p>
  </>;
}

export function RelaxationPage({ exercises, onSelect, staff }: { exercises: Exercise[]; onSelect: (e: Exercise) => void; staff: boolean }) {
  const relaxation = exercises.filter(e => e.trainingTypes.includes("Entspannung") || e.methodTags.includes("PIR"));
  return <>
    <div className="page-heading"><div><div className="eyebrow">RUHE UND BEWEGUNG</div><h1>Entspannung</h1><p>Atmung, Kieferentspannung und postisometrische Relaxation.</p></div><Leaf size={32}/></div>
    <section className="panel"><h2>Postisometrische Relaxation (PIR)</h2><p>Bei PIR folgt auf eine geringe Muskelanspannung ohne sichtbare Bewegung eine vollständige Entspannungsphase. Erst danach wird die Position bei Bedarf behutsam angepasst. Kraft, Dauer, Richtung und Wiederholungen legt die behandelnde Fachperson fest.</p><ol className="pir-sequence"><li><strong>Position finden</strong><span>Bequem und ohne erzwungenen Endbereich.</span></li><li><strong>Sanft anspannen</strong><span>Geringer Gegenhalt, keine Bewegung und kein Pressen.</span></li><li><strong>Vollständig lösen</strong><span>Ruhig weiteratmen; nicht aktiv nachdrücken.</span></li><li><strong>Neu beurteilen</strong><span>Weitere Bewegung nur im persönlich angeleiteten Umfang.</span></li></ol><div className="notice">PIR vor dem eigenständigen Üben persönlich zeigen lassen. Bei Schwindel, neuen ausstrahlenden Beschwerden oder Schmerzverstärkung beenden. Für frische Operationen gelten die persönlichen Nachbehandlungsvorgaben.</div></section>
    <h2>{staff ? "Übungen und angeleitete Verfahrensbeispiele" : "Entspannungsübungen aus Ihrem freigegebenen Bereich"}</h2>
    {relaxation.length ? <ClinicalExerciseList exercises={relaxation} onSelect={onSelect}/> : <p className="notice">Hier erscheinen Ihre zugewiesenen und freigegebenen Entspannungsübungen. Ihr Praxisteam kann passende Inhalte ergänzen.</p>}
    <details className="panel"><summary>Was ist für PIR untersucht?</summary><p>Die Datenlage zu unspezifischen Nackenschmerzen lässt sich nicht pauschal auf Kiefer, Beinrückseite oder postoperative Situationen übertragen.</p><EvidenceCard id="pir-neck-2023"/><EvidenceCard id="pir-rct-2022"/></details>
  </>;
}

export function ClinicalAssignmentFields({ uses, onChange }: { uses: ConditionUse[]; onChange: (uses: ConditionUse[]) => void }) {
  const update = (index: number, patch: Partial<ConditionUse>) => onChange(uses.map((use,i) => i===index ? {...use,...patch} : use));
  return <fieldset className="clinical-assignment-fields"><legend>Krankheitsbezogene Zuordnungen</legend><p>Nur fachlich passende Phasen wählen. Studienbezug bedeutet keine Prüfung der Einzelübung.</p>
    {uses.map((use,index) => {
      const condition = library.conditions.find(c => c.id===use.conditionId);
      if (!condition) return null;
      return <section className="condition-use-editor" key={index}><h4>{condition.name}</h4><div className="classification-options">
        {condition.phases.map(p => <label key={p.id}><input type="checkbox" checked={use.phases.includes(p.id)} onChange={e => update(index,{phases:e.target.checked ? [...use.phases,p.id] : use.phases.filter(x => x!==p.id)})}/>{p.name}</label>)}
        {condition.variants.map(v => <label key={v.id}><input type="checkbox" checked={use.variants.includes(v.id)} onChange={e => update(index,{variants:e.target.checked ? [...use.variants,v.id] : use.variants.filter(x => x!==v.id)})}/>{v.name}</label>)}
      </div><label>Individuelle Einordnung<textarea value={use.note} onChange={e => update(index,{note:e.target.value})}/></label><button type="button" className="text-button" onClick={() => onChange(uses.filter((_,i) => i!==index))}>Zuordnung entfernen</button></section>;
    })}
    <label>Krankheitsbild ergänzen<select value="" onChange={e => { if(e.target.value) onChange([...uses,{conditionId:e.target.value,phases:[],variants:[],evidenceIds:[],note:""}]); }}><option value="">Auswählen …</option>{library.conditions.filter(c => !uses.some(u => u.conditionId===c.id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  </fieldset>;
}
