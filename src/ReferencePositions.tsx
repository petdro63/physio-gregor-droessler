import type { Exercise } from './types';
import { resolveReferencePose, type ReferencePoseDefinition } from './reference-lookup';
import { resourceUrl } from './resources';

export function referencePose(exercise: Exercise): ReferencePoseDefinition | undefined {
  return resolveReferencePose(exercise);
}
export function ReferencePose({ exercise, phase = 0 }: { exercise: Exercise; phase?: number }) {
  const pose = referencePose(exercise);
  if (!pose) return null;
  const frame = pose.fixedFrame ?? (pose.reverse ? (phase ? 0 : 1) : (phase ? 1 : 0));
  const column = pose.column * 2 + frame;
  const columns = pose.frameColumns ?? 4, rows = pose.frameRows ?? 3;
  const url = `/api/reference-poses/${encodeURIComponent(exercise.id)}/${pose.atlas}?version=${exercise.version}`;
  const label = `${exercise.familyTitle || exercise.title}: ${phase ? 'Endstellung' : 'Ausgangsstellung'}, Illustrationsentwurf mit ${exercise.equipment}`;
  if (pose.atlas.startsWith('reference-shoulder-rotation-')) {
    // A dedicated, enhanced frame avoids scaling a very narrow CSS sprite.
    return <img className="reference-pose reference-pose-image" src={resourceUrl(`${url}&frame=${frame}`)} alt={label} loading="lazy" decoding="async"/>;
  }
  return <div className="reference-pose" role="img" aria-label={label} style={{backgroundImage:`url("${resourceUrl(url)}")`,backgroundSize:`${columns * 100}% ${rows * 100}%`,backgroundPosition:`${columns > 1 ? column * 100 / (columns - 1) : 0}% ${rows > 1 ? pose.row * 100 / (rows - 1) : 0}%`,aspectRatio:pose.frameAspectRatio ?? 1.125,height:pose.frameAspectRatio ? 'auto' : undefined}} />;
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
