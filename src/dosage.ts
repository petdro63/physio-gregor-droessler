type DosageExercise = { dosageMode?: 'repetitions' | 'hold'; defaultHoldSeconds?: number };
type DosageItem = { sets: number; reps: number; hold: number; exercise: DosageExercise };

export function defaultPlanDosage(exercise: DosageExercise) {
  return { sets: 2, reps: exercise.dosageMode === 'hold' ? 1 : 10,
    hold: exercise.dosageMode === 'hold' ? (exercise.defaultHoldSeconds || 20) : 0, pause: 30 };
}

export function dosageLabel(item: DosageItem, short = false) {
  return item.exercise.dosageMode === 'hold'
    ? `${item.sets} Sätze × ${item.hold} Sekunden halten`
    : `${item.sets} Sätze × ${item.reps} ${short ? 'Wdh.' : 'Wiederholungen'}`;
}
