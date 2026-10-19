import library from "./rehab-evidence.json" with { type: "json" };
import type { Exercise } from "./types";

export function suggestExercises(exercises: Exercise[], conditionId: string, phaseId: string, variantId = "") {
  const condition = library.conditions.find(c => c.id === conditionId);
  if (!condition || !condition.phases.some(p => p.id === phaseId)) return [];
  if (condition.variants.length && !condition.variants.some(v => v.id === variantId)) return [];
  return exercises.filter(e => e.status !== "archived" && e.conditionUses.some(use =>
    use.conditionId === conditionId && use.phases.includes(phaseId) &&
    (!condition.variants.length || use.variants.includes(variantId)),
  )).sort((a,b) => Number(a.requiresSupervision)-Number(b.requiresSupervision) || a.title.localeCompare(b.title,"de"));
}
