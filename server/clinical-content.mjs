import fs from "node:fs";
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
export const clinicalLibrary = read("../src/rehab-evidence.json");
export const clinicalMappings = read("../src/clinical-mappings.json");
export const catalogMedia = read("../src/catalog-media.json");
export const rehabExercises = read("./rehab-exercises.json");
