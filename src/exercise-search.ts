import type { Exercise } from "./types";

export type ExerciseFilters = {
  search?: string; region?: string; goal?: string; equipment?: string;
  difficulty?: string; position?: string; trainingType?: string; joint?: string;
  muscle?: string; sort?: string; condition?: string; method?: string; brochure?: string;
};
export function findExercises(exercises: Exercise[], filters: ExerciseFilters) {
  return exercises.filter((e) =>
    (!filters.region || e.region === filters.region) &&
    (!filters.goal || e.goal === filters.goal) &&
    (!filters.equipment || e.equipment === filters.equipment) &&
    (!filters.difficulty || e.difficulty === filters.difficulty) &&
    (!filters.position || e.position === filters.position) &&
    (!filters.condition || e.conditionUses.some(use => use.conditionId === filters.condition)) &&
    (!filters.method || e.methodTags.includes(filters.method)) &&
    (!filters.brochure || e.brochureId === filters.brochure) &&
    (!filters.trainingType || e.trainingTypes.includes(filters.trainingType)) &&
    (!filters.joint || e.joints.includes(filters.joint)) &&
    (!filters.muscle || (e.trainingTypes.includes("Kraft") && e.strengthMuscles.includes(filters.muscle))) &&
    [e.title, e.subtitle, e.region, e.equipment, e.position, ...e.tags, ...e.trainingTypes, ...e.joints, ...e.strengthMuscles, ...(e.methodTags || [])]
      .join(" ").toLocaleLowerCase("de").includes((filters.search || "").trim().toLocaleLowerCase("de")),
  ).sort((a, b) => {
    const key = (e: Exercise) => filters.sort === "title" ? e.title
      : filters.sort === "type" ? e.trainingTypes.join(", ") || "\uffff"
      : [...e.joints].sort((x, y) => x.localeCompare(y, "de"))[0] || "\uffff";
    return key(a).localeCompare(key(b), "de") || a.title.localeCompare(b.title, "de");
  });
}
