import registry from './reference-poses.json' with { type: 'json' };

export type ReferencePoseDefinition = {
  familyId?: string;
  exerciseIds?: string[];
  equipment?: string[];
  suffixes?: string[];
  atlas: string;
  column: number;
  row: number;
  scope?: 'base' | 'variant';
  reverse?: boolean;
  fixedFrame?: number;
};
type PoseExercise = { id: string; familyId?: string; equipment: string };
export const referenceRegistry = registry as ReferencePoseDefinition[];

export function resolveReferencePose(exercise: PoseExercise) {
  const exact = referenceRegistry.find(p => p.exerciseIds?.includes(exercise.id) && p.equipment?.includes(exercise.equipment));
  if (exact) return exact;
  return referenceRegistry.find(p => {
    if (!p.familyId || p.familyId !== exercise.familyId) return false;
    if (p.suffixes && !p.suffixes.some(s => exercise.id.endsWith('-' + s))) return false;
    const equipment = p.equipment || (p.atlas === 'reference-ball' ? ['Pezziball'] : ['Ohne Zusatzgerät','Kein Hilfsmittel','Stuhl']);
    return equipment.includes(exercise.equipment);
  });
}
