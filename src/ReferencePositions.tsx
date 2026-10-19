import type { Exercise } from './types';
import { resolveReferencePose } from './reference-lookup';

export function referencePose(exercise: Exercise) {
  return resolveReferencePose(exercise);
}
export function ReferencePose({ exercise, phase = 0 }: { exercise: Exercise; phase?: number }) {
  const pose = referencePose(exercise);
  if (!pose) return null;
  const frame = pose.fixedFrame ?? (pose.reverse ? (phase ? 0 : 1) : (phase ? 1 : 0));
  const column = pose.column * 2 + frame;
  return <div className="reference-pose" role="img" aria-label={`${exercise.familyTitle || exercise.title}: ${phase ? 'Endstellung' : 'Ausgangsstellung'}, Illustrationsentwurf mit ${exercise.equipment}`} style={{backgroundImage:`url("/api/reference-poses/${encodeURIComponent(exercise.id)}/${pose.atlas}?version=${exercise.version}")`,backgroundPosition:`${column * 100 / 3}% ${pose.row * 50}%`}} />;
}
export function ReferencePositions({ exercise }: { exercise: Exercise }) {
  const pose = referencePose(exercise);
  const base = pose?.scope !== 'variant';
  return <section className="panel reference-guide">
    <h3>{base ? 'Die Bewegung im Überblick' : 'So sieht Ihre Übung aus'}</h3>
    <div className="reference-pair">{[0,1].map(phase => <figure key={phase}><ReferencePose exercise={exercise} phase={phase}/><figcaption>{phase ? '02 / Endstellung' : '01 / Ausgangsstellung'}</figcaption></figure>)}</div>
    <div className="equipment-note"><strong>Hilfsmittel</strong><span>{exercise.equipment}</span></div>
    {base && <p className="reference-source-note">Das Bild zeigt das Grundmuster. Persönliche Bewegungsgrenzen und die gewählte Variante zusätzlich in der Anleitung beachten.</p>}
    <p className="reference-source-note">Illustrationsentwurf · fachliche Prüfung ausstehend</p>
  </section>;
}
