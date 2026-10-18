import fs from "node:fs";
import path from "node:path";
import {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { DatabaseSync, backup } from "node:sqlite";
if (fs.existsSync(".env")) process.loadEnvFile(".env");
const args = process.argv.slice(2);
export async function createBackup(source, destination, passphrase) {
  if (!passphrase || passphrase.length < 20)
    throw new Error("BACKUP_PASSPHRASE benötigt mindestens 20 Zeichen.");
  const temp = path.join(
    source,
    "snapshot-" + randomBytes(6).toString("hex") + ".sqlite",
  );
  const db = new DatabaseSync(path.join(source, "physio.sqlite"));
  try {
    await backup(db, temp);
    const files = { "physio.sqlite": fs.readFileSync(temp).toString("base64") };
    for (const name of fs.readdirSync(source)) {
      if (name === "session-secret")
        files[name] = fs
          .readFileSync(path.join(source, name))
          .toString("base64");
    }
    if (fs.existsSync(path.join(source, "media")))
      for (const name of fs.readdirSync(path.join(source, "media")))
        files["media/" + name] = fs
          .readFileSync(path.join(source, "media", name))
          .toString("base64");
    const salt = randomBytes(16),
      iv = randomBytes(12),
      key = scryptSync(passphrase, salt, 32);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify({ format: 1, files }), "utf8"),
      cipher.final(),
    ]);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(
      destination,
      Buffer.concat([
        Buffer.from("PHYSIO01"),
        salt,
        iv,
        cipher.getAuthTag(),
        encrypted,
      ]),
      { mode: 0o600 },
    );
  } finally {
    db.close();
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
export function restoreBackup(file, destination, passphrase) {
  const data = fs.readFileSync(file);
  if (data.subarray(0, 8).toString() !== "PHYSIO01")
    throw new Error("Unbekanntes Backupformat.");
  const key = scryptSync(passphrase, data.subarray(8, 24), 32);
  const decipher = createDecipheriv("aes-256-gcm", key, data.subarray(24, 36));
  decipher.setAuthTag(data.subarray(36, 52));
  const payload = JSON.parse(
    Buffer.concat([
      decipher.update(data.subarray(52)),
      decipher.final(),
    ]).toString("utf8"),
  );
  if (payload.format !== 1 || !payload.files?.["physio.sqlite"])
    throw new Error("Ungültiges Backup.");
  if (fs.existsSync(destination) && fs.readdirSync(destination).length)
    throw new Error("Wiederherstellung benötigt ein leeres Zielverzeichnis.");
  const root = path.resolve(destination);
  fs.mkdirSync(root, { recursive: true });
  for (const [name, content] of Object.entries(payload.files)) {
    const target = path.resolve(root, name);
    if (!target.startsWith(root + path.sep))
      throw new Error("Ungültiger Dateipfad.");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(content, "base64"), { mode: 0o600 });
  }
  const db = new DatabaseSync(path.join(root, "physio.sqlite"));
  if (db.prepare("PRAGMA integrity_check").get().integrity_check !== "ok")
    throw new Error("Integritätsprüfung fehlgeschlagen.");
  db.prepare("DELETE FROM http_sessions").run();
  db.close();
}
if (
  import.meta.url === new URL(process.argv[1], "file:///").href ||
  process.argv[1]?.replaceAll("\\", "/").endsWith("/scripts/backup.mjs")
) {
  const restoring = args.includes("--restore");
  const source = process.env.DATA_DIR || path.resolve("data/practice");
  const pass = process.env.BACKUP_PASSPHRASE;
  if (restoring) {
    const file = args[args.indexOf("--restore") + 1],
      target = args[args.indexOf("--restore") + 2];
    if (!file || !target)
      throw new Error("Aufruf: npm run restore -- BACKUPDATEI LEERES_ZIEL");
    restoreBackup(file, target, pass);
    console.log("Backup wiederhergestellt.");
  } else {
    const dest = path.resolve(
      "data/backups",
      `physio-${new Date().toISOString().replaceAll(":", "-")}.enc`,
    );
    await createBackup(source, dest, pass);
    console.log("Verschlüsseltes Backup erstellt:", dest);
  }
}
