import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { randomBytes, createHash } from "node:crypto";
import { openDatabase, uid, iso, transaction } from "../server/db.mjs";
if (fs.existsSync(".env")) process.loadEnvFile(".env");
const rl = createInterface({ input: process.stdin, output: process.stdout });
const name = (
  await rl.question("Name der ersten Praxisadministration: ")
).trim();
const email = (await rl.question("E-Mail-Adresse: ")).trim().toLowerCase();
rl.close();
if (!name || !/^\S+@\S+\.\S+$/.test(email))
  throw new Error("Name und gültige E-Mail erforderlich.");
const db = openDatabase(process.env.DATA_DIR || path.resolve("data/practice"));
if (db.prepare("SELECT id FROM users LIMIT 1").get())
  throw new Error(
    "Initiale Einrichtung bereits erfolgt. Mitarbeiter über die Praxisverwaltung einladen.",
  );
const id = uid(),
  token = randomBytes(32).toString("base64url");
transaction(db, () => {
  db.prepare(
    "INSERT INTO users (id,name,email,role,status,created_at) VALUES (?,?,?,?,?,?)",
  ).run(id, name, email, "admin", "active", iso());
  db.prepare("INSERT INTO invitations VALUES (?,?,?,?,?,?)").run(
    uid(),
    id,
    createHash("sha256").update(token).digest("hex"),
    new Date(Date.now() + 48 * 3600000).toISOString(),
    null,
    id,
  );
});
console.log("Einmalige Einrichtung, gültig für 48 Stunden:");
console.log(
  `${process.env.APP_ORIGIN || "http://localhost:3180"}/?einladung=${token}`,
);
console.log(
  "Link vertraulich behandeln. Das Passwort wird ausschließlich in der App festgelegt.",
);
db.close();
