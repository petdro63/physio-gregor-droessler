import { z } from 'zod';
import clinicalLibrary from './rehab-evidence.json' with {type:'json'};
import catalogMedia from './catalog-media.json' with {type:'json'};
import taxonomy from './exercise-taxonomy.json' with {type:'json'};
const TIME_ZONE = 'Europe/Berlin';
export const text = z.string().trim().max(5000);
export const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const birthDate = z.union([z.iso.date().refine(
  (value) => value >= "0001-01-01" && value <= new Date().toLocaleDateString("sv-SE", { timeZone: TIME_ZONE }),
  "Das Geburtsdatum darf nicht in der Zukunft liegen.",
), z.literal(""), z.null()]);
const conditionUseSchema = z.object({
  conditionId: z.enum(clinicalLibrary.conditions.map(c => c.id)),
  phases: z.array(text.min(1).max(80)).min(1).max(12),
  variants: z.array(text.min(1).max(80)).max(8).default([]),
  evidenceIds: z.array(z.enum(clinicalLibrary.evidence.map(e => e.id))).max(20).default([]),
  note: text,
}).refine(use => {
  const condition = clinicalLibrary.conditions.find(c => c.id === use.conditionId);
  if (!condition) return false;
  return use.phases.every(p => condition.phases.some(phase => phase.id === p)) &&
    use.variants.every(v => condition.variants.some(variant => variant.id === v)) &&
    use.evidenceIds.every(id => condition.evidenceIds.includes(id)) &&
    (!condition.variants.length || use.variants.length > 0);
}, "Krankheitsbild, Phase und Behandlungsvariante müssen zusammenpassen.");
export const exerciseSchema = z.object({
  conditionUses: z.array(conditionUseSchema).max(30).default([]),
  methodTags: z.array(text.max(80)).max(12).default([]),
  catalogMedia: z.array(z.enum(catalogMedia.map(m => m.id))).max(6).default([]),
  requiresSupervision: z.boolean().default(false),
  brochureId: text.max(80).default(""),
  trainingTypes: z.array(z.enum(taxonomy.trainingTypes)).max(5).default([]),
  joints: z.array(z.enum(taxonomy.joints)).max(20).default([]),
  strengthMuscles: z.array(z.enum(taxonomy.muscles)).max(30).default([]),
  sources: z.array(z.object({ title: text.min(1), url: z.url().refine(value => value.startsWith("https://"), "HTTPS-Quelle erforderlich.") })).max(10).default([]),
  title: text.min(2),
  region: text.min(1),
  goal: text.min(1),
  position: text,
  equipment: text,
  subtitle: text,
  start: text.min(1),
  end: text.default(""),
  familyId: text.max(150).default(""),
  familyTitle: text.default(""),
  variantLabel: text.default(""),
  sourceNote: text.default(""),
  steps: z.array(text.min(1)).min(1).max(30),
  breathing: text,
  mistakes: text,
  precautions: text,
  easier: text,
  harder: text,
  difficulty: z.enum(["Leicht", "Mittel", "Anspruchsvoll"]),
  duration: z.number().int().min(1).max(120),
  dosageMode: z.enum(['repetitions','hold']).default('repetitions'),
  defaultHoldSeconds: z.number().int().min(1).max(600).default(20),
  author: text,
  reviewer: text,
  reviewedAt: z.union([date, z.literal("")]),
  license: text,
  licenseUntil: z.union([date, z.literal("")]),
  transcript: text,
  tags: z.array(text).max(30),
  media: z.array(z.string().uuid()).max(20),
});
export const planSchema = z
  .object({
    title: text.min(1),
    focus: text,
    note: text,
    start: date,
    end: date,
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    items: z
      .array(
        z.object({
          exerciseId: text,
          exerciseVersion: z.number().int().positive(),
          sets: z.number().int().min(1).max(20),
          reps: z.number().int().min(1).max(200),
          hold: z.number().int().min(0).max(600),
          pause: z.number().int().min(0).max(600),
          side: text,
          resistance: text,
          note: text,
        }),
      )
      .min(1)
      .max(30),
  })
  .refine((p) => p.end >= p.start, {
    message: "Das Enddatum muss nach dem Beginn liegen.",
  });
