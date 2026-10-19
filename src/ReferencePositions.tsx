import type { Exercise } from './types';
import poses from './reference-poses.json';

export function referencePose(exercise: Exercise) {
  return poses.find(p => p.familyId === exercise.familyId);
}
export function ReferencePose({ exercise, phase = 0 }: { exercise: Exercise; phase?: number }) {
  const pose = referencePose(exercise);
  if (!pose) return null;
  const column = pose.column * 2 + (phase ? 1 : 0);
  return <div className="reference-pose" role="img" aria-label={`${exercise.familyTitle}: ${phase ? 'Endstellung' : 'Ausgangsstellung'} des Grundmusters, Illustrationsentwurf`} style={{backgroundImage:`url("/api/reference-poses/${encodeURIComponent(exercise.id)}/${pose.atlas}?version=${exercise.version}")`,backgroundPosition:`${column * 100 / 3}% ${pose.row * 50}%`}} />;
}
export function ReferencePositions({ exercise }: { exercise: Exercise }) {
  return <section className="panel reference-guide">
    <h3>Ausgangs- und Endstellung des Grundmusters</h3>
    <div className="reference-pair">{[0,1].map(phase => <figure key={phase}><ReferencePose exercise={exercise} phase={phase}/><figcaption>{phase ? 'Endstellung' : 'Ausgangsstellung'} des Grundmusters</figcaption></figure>)}</div>
    <p>Illustrationsentwurf des Grundmusters. Hilfsmittel, einseitige Ausführung und Haltepositionen der gewählten Variante sind zusätzlich anhand der Anleitung zu prüfen.</p>
    <p><strong>Diese Variante:</strong> {exercise.variantLabel}</p><p>{exercise.start}</p><p>{exercise.end}</p>
  </section>;
}
