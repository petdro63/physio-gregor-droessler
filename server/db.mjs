import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import session from "express-session";
import { randomUUID } from "node:crypto";
export const iso = () => new Date().toISOString();
export const uid = () => randomUUID();
export function openDatabase(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "physio.sqlite"));
  db.exec(
    "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
  );
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)",
  );
  const migrationsDir = new URL("./migrations/", import.meta.url);
  for (const name of fs
    .readdirSync(migrationsDir)
    .filter((n) => /^\d+.*\.sql$/.test(n))
    .sort()) {
    const id = Number(name.split("-")[0]);
    if (!db.prepare("SELECT 1 FROM schema_migrations WHERE id=?").get(id))
      transaction(db, () => {
        db.exec(fs.readFileSync(new URL(name, migrationsDir), "utf8"));
        db.prepare("INSERT INTO schema_migrations VALUES (?,?)").run(id, iso());
      });
  }
  return db;
}
export function transaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function audit(db, actor, action, target = "") {
  db.prepare("INSERT INTO audit_events VALUES (?,?,?,?,?)").run(
    uid(),
    actor,
    action,
    target,
    iso(),
  );
}
export class SqliteSessionStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;
    this.cleaner = setInterval(
      () =>
        db
          .prepare("DELETE FROM http_sessions WHERE expires < ?")
          .run(Date.now()),
      600000,
    );
    this.cleaner.unref();
  }
  get(sid, cb) {
    try {
      const r = this.db
        .prepare("SELECT data FROM http_sessions WHERE sid=? AND expires>?")
        .get(sid, Date.now());
      cb(null, r ? JSON.parse(r.data) : null);
    } catch (e) {
      cb(e);
    }
  }
  set(sid, value, cb) {
    try {
      this.db
        .prepare("INSERT OR REPLACE INTO http_sessions VALUES (?,?,?)")
        .run(
          sid,
          JSON.stringify(value),
          Date.now() + (value.cookie.maxAge || 3600000),
        );
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }
  destroy(sid, cb) {
    try {
      this.db.prepare("DELETE FROM http_sessions WHERE sid=?").run(sid);
      cb?.();
    } catch (e) {
      cb?.(e);
    }
  }
  close() {
    clearInterval(this.cleaner);
  }
}
