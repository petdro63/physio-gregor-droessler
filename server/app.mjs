import express from "express";
import session from "express-session";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import {
  randomBytes,
  createHash,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import {
  openDatabase,
  SqliteSessionStore,
  iso,
  uid,
  transaction,
  audit,
} from "./db.mjs";
import { classifyExercise, seedResearchDrafts, resetExerciseListToDeadlifts, renameWideSquats, correctSingleLegBridgeSide, taxonomy } from "./exercise-catalog.mjs";
import { clinicalLibrary, catalogMedia } from "./clinical-content.mjs";
import { seed, coverage } from "./seed.mjs";
import { VERSION, VERSION_DATE, TIME_ZONE } from "./version.mjs";
import { makePlanPdf } from "./pdf.mjs";
import { resolveReferencePose } from '../src/reference-lookup.ts';

const hash = (value) => createHash("sha256").update(value).digest("hex");
const text = z.string().trim().max(5000);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const birthDate = z.union([z.iso.date().refine(
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
  return use.phases.every(p => condition.phases.some(phase => phase.id === p)) &&
    use.variants.every(v => condition.variants.some(variant => variant.id === v)) &&
    use.evidenceIds.every(id => condition.evidenceIds.includes(id)) &&
    (!condition.variants.length || use.variants.length > 0);
}, "Krankheitsbild, Phase und Behandlungsvariante müssen zusammenpassen.");
const exerciseSchema = z.object({
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
const planSchema = z
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
const defaultSettings = {
  name: "Physiopraxis Gregor Drößler",
  city: "Leinefelde",
  phone: "",
  email: "",
  address: "",
  hours: "",
  imprint: "",
  privacy: "",
  message: "",
  replyInfo:
    "Rückmeldungen werden beim nächsten Praxistermin besprochen. Es erfolgt keine laufende Überwachung.",
  catalogEnabled: false,
};
export function createApp(options = {}) {
  const demo = options.demo ?? process.env.DEMO_MODE !== "false";
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  if (production && demo)
    throw new Error("Produktionsbetrieb erfordert DEMO_MODE=false.");
  const dir =
    options.dataDir ||
    process.env.DATA_DIR ||
    path.resolve(demo ? "data/demo" : "data/practice");
  const db = openDatabase(dir);
  if (demo) { seed(db); seedResearchDrafts(db); }
  else if (!db.prepare("SELECT id FROM settings WHERE id='practice'").get())
    db.prepare("INSERT INTO settings VALUES (?,?)").run(
      "practice",
      JSON.stringify(defaultSettings),
    );
  resetExerciseListToDeadlifts(db);
  renameWideSquats(db);
  correctSingleLegBridgeSide(db);
  const mediaDir = path.join(dir, "media");
  fs.mkdirSync(mediaDir, { recursive: true });
  const secretFile = path.join(dir, "session-secret");
  if (!fs.existsSync(secretFile))
    fs.writeFileSync(secretFile, randomBytes(48).toString("hex"), {
      mode: 0o600,
    });
  const sessionSecret = fs.readFileSync(secretFile, "utf8");
  if (
    production &&
    !/^[0-9a-f]{64}$/i.test(process.env.TOTP_ENCRYPTION_KEY || "")
  )
    throw new Error("TOTP_ENCRYPTION_KEY fehlt oder ist ungültig.");
  const encryptionKey = process.env.TOTP_ENCRYPTION_KEY
    ? Buffer.from(process.env.TOTP_ENCRYPTION_KEY, "hex")
    : createHash("sha256").update(sessionSecret).digest();
  function encrypt(secret) {
    const iv = randomBytes(12);
    const c = createCipheriv("aes-256-gcm", encryptionKey, iv);
    return [
      iv.toString("hex"),
      c.update(secret, "utf8", "hex") + c.final("hex"),
      c.getAuthTag().toString("hex"),
    ].join(".");
  }
  function decrypt(value) {
    const [iv, data, tag] = value.split(".");
    const c = createDecipheriv(
      "aes-256-gcm",
      encryptionKey,
      Buffer.from(iv, "hex"),
    );
    c.setAuthTag(Buffer.from(tag, "hex"));
    return c.update(data, "hex", "utf8") + c.final("utf8");
  }
  const store = new SqliteSessionStore(db);
  const app = express();
  app.disable("x-powered-by");
  if (production) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: production
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "blob:"],
              mediaSrc: ["'self'", "blob:"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              frameSrc: ["'self'", "https://www.youtube-nocookie.com"],
            },
          }
        : false,
    }),
  );
  app.use(express.json({ limit: "150kb" }));
  app.use(
    session({
      store,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: production ? "__Host-physio" : "physio",
      cookie: {
        httpOnly: true,
        secure: production,
        sameSite: "strict",
        maxAge: 3600000,
      },
    }),
  );
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    req.session.csrf ||= randomBytes(24).toString("hex");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const token = req.get("X-CSRF-Token") || "";
      const origin = req.get("Origin");
      if (
        origin &&
        origin !==
          (process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`)
      )
        return res
          .status(403)
          .json({ error: "Diese Anfrage stammt nicht von der App." });
      if (
        !/^[a-f0-9]{48}$/.test(token) ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrf))
      )
        return res
          .status(403)
          .json({ error: "Sitzung abgelaufen. Bitte neu laden." });
    }
    next();
  });
  const fail = (status, message) =>
    Object.assign(new Error(message), { status });
  const practice = () =>
    JSON.parse(
      db.prepare("SELECT payload FROM settings WHERE id='practice'").get()
        .payload,
    );
  const safeUser = (u) =>
    u
      ? {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          accessUntil: u.access_until,
          birthDate: u.birth_date ?? null,
          mfaEnabled: !!u.mfa_secret,
        }
      : null;
  const active = (u) =>
    u?.status === "active" &&
    (!u.access_until ||
      u.access_until >=
        new Date().toLocaleDateString("sv-SE", { timeZone: TIME_ZONE }));
  function authenticate(req, res, next) {
    const u = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(req.session.userId || "");
    if (!active(u)) {
      req.session.userId = null;
      return res.status(401).json({
        error:
          "Bitte anmelden. Ihr Zugang muss von der Praxis freigeschaltet sein.",
      });
    }
    req.user = u;
    next();
  }
  const staff = (req, res, next) =>
    req.user.role === "patient"
      ? res.status(403).json({ error: "Nur für das Praxisteam." })
      : next();
  const admin = (req, res, next) =>
    req.user.role !== "admin"
      ? res.status(403).json({ error: "Nur für die Praxisadministration." })
      : next();
  function canPatient(user, id) {
    return (
      user.role === "admin" ||
      (user.role === "patient" && user.id === id) ||
      (user.role === "therapist" &&
        !!db
          .prepare(
            "SELECT 1 FROM assignments WHERE therapist_id=? AND patient_id=?",
          )
          .get(user.id, id))
    );
  }
  function checkPatient(user, id) {
    const p = db
      .prepare("SELECT * FROM users WHERE id=? AND role='patient'")
      .get(id);
    if (!p || !canPatient(user, id)) throw fail(404, "Patient nicht gefunden.");
    return p;
  }
  function getExercise(id, version) {
    const row = db.prepare("SELECT * FROM exercises WHERE id=?").get(id);
    if (!row) return null;
    const v = version || row.current_version;
    const r = db
      .prepare(
        "SELECT * FROM exercise_versions WHERE exercise_id=? AND version=?",
      )
      .get(id, v);
    return r
      ? {
          ...classifyExercise(JSON.parse(r.payload), id),
          id,
          version: v,
          status: row.status,
          mediaDetails: JSON.parse(r.payload)
            .media.map((id) =>
              db.prepare("SELECT id,kind FROM media WHERE id=?").get(id),
            )
            .filter(Boolean),
        }
      : null;
  }
  function getPlans(patient) {
    return db
      .prepare("SELECT * FROM plans WHERE patient_id=?")
      .all(patient)
      .map((row) => ({
        ...JSON.parse(
          db
            .prepare(
              "SELECT payload FROM plan_versions WHERE plan_id=? AND version=?",
            )
            .get(row.id, row.current_version).payload,
        ),
        id: row.id,
        version: row.current_version,
        status: row.status,
        patientId: row.patient_id,
        therapistId: row.therapist_id,
      }));
  }
  function canExercise(user, id, version) {
    const e = getExercise(id, version);
    if (!e) return false;
    if (user.role !== "patient") return true;
    if (
      e.status === "archived" ||
      (e.licenseUntil &&
        e.licenseUntil <
          new Date().toLocaleDateString("sv-SE", { timeZone: TIME_ZONE }))
    )
      return false;
    if (e.status === "demo" && !demo) return false;
    if (practice().catalogEnabled && e.status === "published") return true;
    return getPlans(user.id).some(
      (p) =>
        p.status === "active" &&
        p.items.some(
          (i) =>
            i.exerciseId === id &&
            (!version || i.exerciseVersion === Number(version)),
        ),
    );
  }
  function hydratePlan(p, user) {
    return {
      ...p,
      therapistName:
        db.prepare("SELECT name FROM users WHERE id=?").get(p.therapistId)
          ?.name || "Praxisteam",
      items: p.items
        .filter((i) => canExercise(user, i.exerciseId, i.exerciseVersion))
        .map((i) => ({
          ...i,
          exercise: getExercise(i.exerciseId, i.exerciseVersion),
        })),
    };
  }
  const limiter = rateLimit({
    windowMs: 15 * 60000,
    limit: 15,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
    },
  });
  app.get("/api/session", (req, res) => {
    const user = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(req.session.userId || "");
    res.json({
      csrf: req.session.csrf,
      user: active(user) ? safeUser(user) : null,
      demo,
      version: VERSION,
      date: VERSION_DATE,
      practice: practice(),
    });
  });
  app.post("/api/demo", limiter, (req, res, next) => {
    if (!demo) return res.status(404).end();
    const role = z.enum(["patient", "admin", "therapist"]).parse(req.body.role);
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = `demo-${role}`;
      req.session.csrf = randomBytes(24).toString("hex");
      req.session.save((err) => (err ? next(err) : res.json({ ok: true })));
    });
  });
  app.post("/api/login", limiter, async (req, res, next) => {
    try {
      const { email, password } = z
        .object({ email: z.email().max(254), password: z.string().max(128) })
        .parse(req.body);
      const u = db
        .prepare("SELECT * FROM users WHERE email=?")
        .get(email.toLowerCase());
      const valid = await bcrypt.compare(
        password,
        u?.password_hash ||
          "$2b$12$wseu8QkPjq7WOOJhX8mmjeutWbUGbR.WsJxCWzNxnw1IjE7oKt1dK",
      );
      if (!u || !valid || !active(u))
        throw fail(
          401,
          "Anmeldung nicht möglich. Bitte Zugangsdaten und Freischaltung prüfen.",
        );
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.csrf = randomBytes(24).toString("hex");
        if (u.role === "patient") req.session.userId = u.id;
        else {
          req.session.pendingUser = u.id;
          req.session.pendingSince = Date.now();
        }
        audit(db, u.id, "login");
        req.session.save((err) =>
          err
            ? next(err)
            : res.json({
                mfa: u.role !== "patient",
                enroll: u.role !== "patient" && !u.mfa_secret,
                csrf: req.session.csrf,
              }),
        );
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/logout", (req, res, next) =>
    req.session.destroy((e) => (e ? next(e) : res.json({ ok: true }))),
  );
  function pending(req) {
    const u = db
      .prepare("SELECT * FROM users WHERE id=?")
      .get(req.session.pendingUser || "");
    if (
      !u ||
      !active(u) ||
      Date.now() - (req.session.pendingSince || 0) > 300000
    )
      throw fail(401, "Anmeldung bitte erneut beginnen.");
    return u;
  }
  app.get("/api/mfa/enroll", async (req, res, next) => {
    try {
      const u = pending(req);
      if (u.mfa_secret)
        throw fail(409, "Zwei-Faktor-Anmeldung bereits eingerichtet.");
      req.session.enrollmentSecret ||= new OTPAuth.Secret({ size: 20 }).base32;
      const totp = new OTPAuth.TOTP({
        issuer: "Physio Gregor Drößler",
        label: u.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(req.session.enrollmentSecret),
      });
      res.json({
        qr: await QRCode.toDataURL(totp.toString()),
        secret: req.session.enrollmentSecret,
      });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/mfa/verify", limiter, (req, res, next) => {
    try {
      const u = pending(req);
      const token = z
        .string()
        .regex(/^\d{6}$/)
        .parse(req.body.code);
      const secret = u.mfa_secret
        ? decrypt(u.mfa_secret)
        : req.session.enrollmentSecret;
      if (!secret) throw fail(400, "Zwei-Faktor-Einrichtung bitte starten.");
      const t = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(secret),
        period: 30,
        digits: 6,
      });
      const delta = t.validate({ token, window: 1 });
      const counter = Math.floor(Date.now() / 30000) + (delta || 0);
      if (
        delta === null ||
        (u.mfa_counter !== null && counter <= u.mfa_counter)
      )
        throw fail(401, "Code ungültig oder bereits verwendet.");
      db.prepare("UPDATE users SET mfa_secret=?,mfa_counter=? WHERE id=?").run(
        u.mfa_secret || encrypt(secret),
        counter,
        u.id,
      );
      req.session.userId = u.id;
      delete req.session.pendingUser;
      delete req.session.enrollmentSecret;
      audit(db, u.id, "mfa_verified");
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/invitation", (req, res) => {
    const token = String(req.query.token || "");
    const row = db
      .prepare(
        "SELECT i.*,u.name FROM invitations i JOIN users u ON u.id=i.user_id WHERE token_hash=? AND used_at IS NULL AND expires_at>?",
      )
      .get(hash(token), iso());
    if (!row)
      return res
        .status(404)
        .json({ error: "Einladung ungültig oder abgelaufen." });
    res.json({ name: row.name, expires: row.expires_at });
  });
  app.post("/api/invitation/accept", limiter, async (req, res, next) => {
    try {
      const input = z
        .object({
          token: z.string().min(20).max(200),
          password: z
            .string()
            .min(12)
            .max(72)
            .refine((v) => Buffer.byteLength(v, "utf8") <= 72),
        })
        .parse(req.body);
      const password = await bcrypt.hash(input.password, 12);
      transaction(db, () => {
        const row = db
          .prepare(
            "SELECT * FROM invitations WHERE token_hash=? AND used_at IS NULL AND expires_at>?",
          )
          .get(hash(input.token), iso());
        if (!row) throw fail(400, "Einladung ungültig oder bereits verwendet.");
        db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(
          password,
          row.user_id,
        );
        db.prepare("UPDATE invitations SET used_at=? WHERE id=?").run(
          iso(),
          row.id,
        );
        audit(db, row.user_id, "invitation_accepted");
      });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  app.use("/api", authenticate);
  app.get("/api/overview", (req, res) => {
    const patientId =
      req.user.role === "patient"
        ? req.user.id
        : String(req.query.patient || "demo-patient");
    const patients = db
      .prepare(
        "SELECT * FROM users WHERE role='patient' ORDER BY created_at DESC",
      )
      .all()
      .filter((p) => canPatient(req.user, p.id))
      .map(safeUser);
    const selected = patients.find((p) => p.id === patientId) || patients[0];
    const plans = selected
      ? getPlans(selected.id).map((p) => hydratePlan(p, req.user))
      : [];
    const exercises = db
      .prepare("SELECT e.id FROM exercises e WHERE NOT EXISTS (SELECT 1 FROM exercise_list_removals r WHERE r.exercise_id=e.id) ORDER BY e.rowid")
      .all()
      .filter((e) => canExercise(req.user, e.id))
      .map((e) => getExercise(e.id));
    const history = selected
      ? db
          .prepare(
            "SELECT * FROM training_sessions WHERE patient_id=? ORDER BY created_at DESC LIMIT 300",
          )
          .all(selected.id)
      : [];
    res.json({
      patients,
      selectedPatient: selected || null,
      plans,
      exercises,
      history,
      coverage: coverage.map(([key, name]) => ({
        key,
        name,
        count: exercises.filter((e) => e.region === key).length,
        published: exercises.filter(
          (e) => e.region === key && e.status === "published",
        ).length,
      })),
      practice: practice(),
    });
  });
  app.get("/api/exercises/:id", (req, res) => {
    const version = req.query.version ? Number(req.query.version) : undefined;
    if (!canExercise(req.user, req.params.id, version))
      return res.status(404).json({ error: "Übung nicht gefunden." });
    res.json(getExercise(req.params.id, version));
  });
  app.post("/api/patients", staff, async (req, res, next) => {
    try {
      const data = z
        .object({ name: text.min(2).max(100), email: z.email().max(254), birthDate: birthDate.optional() })
        .parse(req.body);
      const id = uid();
      transaction(db, () => {
        db.prepare(
          "INSERT INTO users (id,name,email,role,status,created_at,birth_date) VALUES (?,?,?,?,?,?,?)",
        ).run(
          id,
          data.name,
          data.email.toLowerCase(),
          "patient",
          "invited",
          iso(),
          data.birthDate || null,
        );
        db.prepare("INSERT INTO assignments VALUES (?,?)").run(req.user.id, id);
        audit(db, req.user.id, "patient_created", id);
      });
      res.status(201).json({ id });
    } catch (e) {
      next(e);
    }
  });
  app.patch("/api/patients/:id/profile", staff, (req, res, next) => {
    try {
      checkPatient(req.user, req.params.id);
      const data = z.object({ birthDate }).parse(req.body);
      transaction(db, () => {
        db.prepare("UPDATE users SET birth_date=? WHERE id=?").run(data.birthDate || null, req.params.id);
        audit(db, req.user.id, "patient_profile_updated", req.params.id);
      });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/patients/:id/invite", staff, async (req, res, next) => {
    try {
      checkPatient(req.user, req.params.id);
      const token = randomBytes(32).toString("base64url");
      const expires = new Date(Date.now() + 48 * 3600000).toISOString();
      transaction(db, () => {
        db.prepare(
          "DELETE FROM invitations WHERE user_id=? AND used_at IS NULL",
        ).run(req.params.id);
        db.prepare("INSERT INTO invitations VALUES (?,?,?,?,?,?)").run(
          uid(),
          req.params.id,
          hash(token),
          expires,
          null,
          req.user.id,
        );
        audit(db, req.user.id, "invitation_created", req.params.id);
      });
      const url = `${process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`}/?einladung=${token}`;
      res.json({ url, expires, qr: await QRCode.toDataURL(url) });
    } catch (e) {
      next(e);
    }
  });
  app.patch("/api/patients/:id", admin, (req, res, next) => {
    try {
      checkPatient(req.user, req.params.id);
      const d = z
        .object({
          status: z.enum(["active", "blocked", "archived", "invited"]),
          accessUntil: z.union([date, z.literal("")]),
        })
        .parse(req.body);
      transaction(db, () => {
        db.prepare("UPDATE users SET status=?,access_until=? WHERE id=?").run(
          d.status,
          d.accessUntil || null,
          req.params.id,
        );
        if (d.status !== "active") {
          for (const s of db
            .prepare("SELECT sid,data FROM http_sessions")
            .all()) {
            if (JSON.parse(s.data).userId === req.params.id)
              db.prepare("DELETE FROM http_sessions WHERE sid=?").run(s.sid);
          }
        }
        audit(db, req.user.id, "access_" + d.status, req.params.id);
      });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/exercises", staff, (req, res, next) => {
    try {
      const p = exerciseSchema.parse(req.body);
      if (p.media.length)
        throw fail(400, "Neue Übung zunächst ohne Medien anlegen.");
      const id = uid();
      transaction(db, () => {
        db.prepare("INSERT INTO exercises VALUES (?,?,?,?)").run(
          id,
          1,
          "draft",
          req.user.id,
        );
        db.prepare("INSERT INTO exercise_versions VALUES (?,?,?,?)").run(
          id,
          1,
          JSON.stringify(p),
          iso(),
        );
        audit(db, req.user.id, "exercise_created", id);
      });
      res.status(201).json({ id });
    } catch (e) {
      next(e);
    }
  });
  app.put("/api/exercises/:id", staff, (req, res, next) => {
    try {
      const e = getExercise(req.params.id);
      if (!e) throw fail(404, "Übung nicht gefunden.");
      const p = exerciseSchema.parse(req.body);
      for (const id of p.media) {
        if (
          !db
            .prepare("SELECT id FROM media WHERE id=? AND exercise_id=?")
            .get(id, e.id)
        )
          throw fail(400, "Medium gehört nicht zu dieser Übung.");
      }
      const version = e.version + 1;
      transaction(db, () => {
        db.prepare("INSERT INTO exercise_versions VALUES (?,?,?,?)").run(
          e.id,
          version,
          JSON.stringify({ ...p, demo: false }),
          iso(),
        );
        db.prepare(
          "UPDATE exercises SET current_version=?,status='draft' WHERE id=?",
        ).run(version, e.id);
        audit(db, req.user.id, "exercise_updated", e.id);
      });
      res.json({ version });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/exercises/:id/status", staff, (req, res, next) => {
    try {
      const status = z
        .enum(["draft", "review", "published", "archived"])
        .parse(req.body.status);
      const e = getExercise(req.params.id);
      if (!e) throw fail(404, "Übung nicht gefunden.");
      if (status === "published") {
        if (req.user.role !== "admin")
          throw fail(403, "Freigabe durch Praxisadministration erforderlich.");
        const media = e.media
          .map((id) =>
            db
              .prepare("SELECT * FROM media WHERE id=? AND exercise_id=?")
              .get(id, e.id),
          )
          .filter(Boolean);
        const licensedAssets = catalogMedia.filter(asset => e.catalogMedia.includes(asset.id));
        const licensedImages = licensedAssets.reduce((count, asset) => count + asset.files.filter(file => file.endsWith(".png")).length, 0);
        if (
          e.demo ||
          !e.reviewer ||
          !e.reviewedAt ||
          !e.license ||
          !e.precautions ||
          !e.transcript ||
          media.filter((m) => m.kind === "image").length + licensedImages < 2 ||
          (!media.some((m) => m.kind === "video") && !licensedAssets.some(asset => asset.files.includes("video.mp4"))) ||
          (!media.some((m) => m.kind === "captions") && !licensedAssets.some(asset => asset.files.includes("captions.vtt")))
        )
          throw fail(
            422,
            "Für die Freigabe fehlen geprüfte Inhalte, mindestens zwei Bilder, Video, Untertitel, Transkript oder Rechteangaben.",
          );
        if (
          e.licenseUntil &&
          e.licenseUntil < new Date().toISOString().slice(0, 10)
        )
          throw fail(422, "Medienlizenz abgelaufen.");
      }
      db.prepare("UPDATE exercises SET status=? WHERE id=?").run(status, e.id);
      audit(db, req.user.id, "exercise_" + status, e.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  });
  app.post(
    "/api/exercises/:id/media",
    staff,
    upload.single("file"),
    async (req, res, next) => {
      try {
        const e = getExercise(req.params.id);
        if (!e) throw fail(404, "Übung nicht gefunden.");
        if (!req.file) throw fail(400, "Bitte eine Datei auswählen.");
        const captions =
          req.file.originalname.toLowerCase().endsWith(".vtt") &&
          req.file.buffer.length < 100000 &&
          /^WEBVTT[\s\S]*\d{2}:\d{2}[.:][\d.]+ --> \d{2}:\d{2}[.:][\d.]+/.test(
            req.file.buffer.toString("utf8"),
          );
        const detected = captions
          ? { mime: "text/vtt", ext: "vtt" }
          : await fileTypeFromBuffer(req.file.buffer);
        const mime = detected?.mime;
        if (
          ![
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/webm",
            "text/vtt",
          ].includes(mime)
        )
          throw fail(
            400,
            "Erlaubt sind JPEG, PNG, WebP, MP4, WebM und VTT-Untertitel.",
          );
        const id = uid(),
          kind = mime.startsWith("image/")
            ? "image"
            : mime === "text/vtt"
              ? "captions"
              : "video";
        const buffer =
          kind === "image"
            ? await sharp(req.file.buffer, { limitInputPixels: 25000000 })
                .rotate()
                .resize({ width: 1600, withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer()
            : req.file.buffer;
        const ext = kind === "image" ? "webp" : detected.ext;
        const filename = id + "." + ext;
        fs.writeFileSync(path.join(mediaDir, filename), buffer);
        try {
          transaction(db, () => {
            db.prepare("INSERT INTO media VALUES (?,?,?,?,?,?,?,?)").run(
              id,
              e.id,
              kind,
              filename,
              kind === "image" ? "image/webp" : mime,
              buffer.length,
              req.file.originalname.slice(0, 200),
              iso(),
            );
          });
        } catch (err) {
          fs.unlinkSync(path.join(mediaDir, filename));
          throw err;
        }
        audit(db, req.user.id, "media_uploaded", e.id);
        res.status(201).json({ id, kind });
      } catch (e) {
        next(e);
      }
    },
  );
  app.get("/api/media/:id", (req, res, next) => {
    try {
      const m = db.prepare("SELECT * FROM media WHERE id=?").get(req.params.id);
      if (!m) throw fail(404, "Medium nicht gefunden.");
      const versions = db
        .prepare(
          "SELECT version,payload FROM exercise_versions WHERE exercise_id=?",
        )
        .all(m.exercise_id);
      const allowed = versions.some(
        (v) =>
          JSON.parse(v.payload).media.includes(m.id) &&
          canExercise(req.user, m.exercise_id, v.version),
      );
      if (!allowed) throw fail(404, "Medium nicht gefunden.");
      res.set("Content-Type", m.mime);
      res.sendFile(path.join(mediaDir, m.filename));
    } catch (e) {
      next(e);
    }
  });
  app.get('/api/reference-poses/:id/:atlas', (req, res, next) => {
    try {
      const version = req.query.version ? Number(req.query.version) : undefined;
      if (version !== undefined && (!Number.isInteger(version) || version < 1)) throw fail(404, 'Bild nicht gefunden.');
      if (!canExercise(req.user, req.params.id, version)) throw fail(404, 'Bild nicht gefunden.');
      const exercise = getExercise(req.params.id, version);
      const pose = exercise && resolveReferencePose(exercise);
      if (!pose || pose.atlas !== req.params.atlas) throw fail(404, 'Bild nicht gefunden.');
      res.sendFile(path.resolve('server/assets/reference', pose.atlas + (pose.atlas === 'reference-neck-rotation-seated' ? '.svg' : '.png')));
    } catch (error) { next(error); }
  });
  app.get("/api/catalog-media/:id/:asset/:file", (req, res, next) => {
    try {
      const version = req.query.version ? Number(req.query.version) : undefined;
      if (version !== undefined && (!Number.isInteger(version) || version < 1)) throw fail(404, "Medium nicht gefunden.");
      if (!canExercise(req.user, req.params.id, version)) throw fail(404, "Medium nicht gefunden.");
      const exercise = getExercise(req.params.id, version);
      const asset = catalogMedia.find(m => m.id === req.params.asset);
      if (!exercise || !asset || !exercise.catalogMedia.includes(asset.id) || !asset.files.includes(req.params.file)) throw fail(404, "Medium nicht gefunden.");
      res.sendFile(path.resolve("server/assets/catalog", asset.id, req.params.file));
    } catch (error) { next(error); }
  });
  app.get("/api/demo-media/:id/:file", (req, res, next) => {
    try {
      if (!demo || !canExercise(req.user, req.params.id))
        throw fail(404, "Medium nicht gefunden.");
      const allowedFiles = ["movement.mp4", "captions.vtt"];
      if (req.params.id === "knie-strecken")
        allowedFiles.push(
          "knie-strecken-de-voice.wav",
          "knie-avatar-de.mp4",
          "knie-avatar-de.vtt",
          "knie-avatar-de-poster.jpg",
        );
      if (!allowedFiles.includes(req.params.file))
        throw fail(404, "Medium nicht gefunden.");
      res.sendFile(path.resolve("server/assets", req.params.file));
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/patients/:id/plans", staff, (req, res, next) => {
    try {
      checkPatient(req.user, req.params.id);
      const p = planSchema.parse(req.body);
      for (const i of p.items) {
        const e = getExercise(i.exerciseId, i.exerciseVersion);
        if (e?.dosageMode === 'hold' && i.hold < 1)
          throw fail(400, 'Für Halteübungen muss eine Haltedauer in Sekunden angegeben werden.');
        if (
          !e ||
          (e.status !== "published" && !(demo && e.status === "demo")) ||
          db
            .prepare("SELECT current_version FROM exercises WHERE id=?")
            .get(i.exerciseId).current_version !== i.exerciseVersion
        )
          throw fail(
            422,
            "Nur aktuelle, freigegebene Übungen können zugewiesen werden.",
          );
      }
      const previous = getPlans(req.params.id).find(
        (x) => x.status === "active",
      );
      const id = previous?.id || uid();
      const version = previous ? previous.version + 1 : 1;
      transaction(db, () => {
        if (!previous)
          db.prepare("INSERT INTO plans VALUES (?,?,?,?,?)").run(
            id,
            req.params.id,
            req.user.id,
            version,
            "active",
          );
        else
          db.prepare(
            "UPDATE plans SET current_version=?,therapist_id=? WHERE id=?",
          ).run(version, req.user.id, id);
        db.prepare("INSERT INTO plan_versions VALUES (?,?,?,?)").run(
          id,
          version,
          JSON.stringify(p),
          iso(),
        );
        audit(db, req.user.id, "plan_saved", id);
      });
      res.json({ id, version });
    } catch (e) {
      next(e);
    }
  });
  app.patch("/api/plans/:id", staff, (req, res, next) => {
    try {
      const p = db.prepare("SELECT * FROM plans WHERE id=?").get(req.params.id);
      if (!p) throw fail(404, "Plan nicht gefunden.");
      checkPatient(req.user, p.patient_id);
      const status = z
        .enum(["active", "paused", "archived"])
        .parse(req.body.status);
      db.prepare("UPDATE plans SET status=? WHERE id=?").run(status, p.id);
      audit(db, req.user.id, "plan_" + status, p.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/training", (req, res, next) => {
    try {
      if (req.user.role !== "patient")
        throw fail(403, "Nur Patienten können ihr Training dokumentieren.");
      const d = z
        .object({
          planId: text,
          planVersion: z.number().int().positive(),
          exerciseId: text,
          outcome: z.enum(["done", "skipped"]),
          pain: z.number().int().min(0).max(10).nullable(),
          note: text.max(1000),
        })
        .parse(req.body);
      const p = getPlans(req.user.id).find(
        (p) =>
          p.id === d.planId &&
          p.version === d.planVersion &&
          p.status === "active",
      );
      const today = new Date().toLocaleDateString("sv-SE", {
        timeZone: TIME_ZONE,
      });
      if (
        !p ||
        p.start > today ||
        p.end < today ||
        !p.days.includes(new Date(today + "T12:00:00").getDay())
      )
        throw fail(409, "Dieser Plan ist nicht aktiv. Bitte neu laden.");
      const item = p.items.find((i) => i.exerciseId === d.exerciseId);
      if (
        !item ||
        !canExercise(req.user, item.exerciseId, item.exerciseVersion)
      )
        throw fail(
          400,
          "Übung nicht im Trainingsplan oder nicht mehr verfügbar.",
        );
      const id = uid();
      db.prepare(
        "INSERT INTO training_sessions VALUES (?,?,?,?,?,?,?,?,?,?)",
      ).run(
        id,
        req.user.id,
        p.id,
        p.version,
        item.exerciseId,
        item.exerciseVersion,
        d.outcome,
        d.pain,
        d.note,
        iso(),
      );
      res.status(201).json({ id });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/patients/:id/export", (req, res, next) => {
    try {
      checkPatient(req.user, req.params.id);
      const profile = safeUser(
        db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id),
      );
      res
        .set("Content-Disposition", 'attachment; filename="meine-daten.json"')
        .json({
          profile,
          plans: db
            .prepare(
              "SELECT pv.* FROM plan_versions pv JOIN plans p ON p.id=pv.plan_id WHERE p.patient_id=?",
            )
            .all(req.params.id),
          training: db
            .prepare("SELECT * FROM training_sessions WHERE patient_id=?")
            .all(req.params.id),
        });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/plans/:id/pdf", async (req, res, next) => {
    try {
      const p = db.prepare("SELECT * FROM plans WHERE id=?").get(req.params.id);
      if (!p) throw fail(404, "Plan nicht gefunden.");
      const patient = checkPatient(req.user, p.patient_id);
      const plan = hydratePlan(
        getPlans(patient.id).find((x) => x.id === p.id),
        req.user,
      );
      const bytes = await makePlanPdf(
        plan,
        patient,
        practice(),
        demo,
        db,
        mediaDir,
      );
      res
        .type("pdf")
        .set(
          "Content-Disposition",
          'attachment; filename="mein-uebungsplan.pdf"',
        )
        .send(Buffer.from(bytes));
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/audit", admin, (req, res) =>
    res.json(
      db
        .prepare(
          "SELECT a.*,u.name AS actor FROM audit_events a LEFT JOIN users u ON u.id=a.actor_id ORDER BY created_at DESC LIMIT 100",
        )
        .all(),
    ),
  );
  app.put("/api/settings", admin, (req, res, next) => {
    try {
      const schema = z.object(
        Object.fromEntries(
          Object.keys(defaultSettings).map((k) => [
            k,
            k === "catalogEnabled" ? z.boolean() : text,
          ]),
        ),
      );
      const p = schema.parse(req.body);
      db.prepare("UPDATE settings SET payload=? WHERE id='practice'").run(
        JSON.stringify(p),
      );
      audit(db, req.user.id, "settings_updated", "practice");
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/team", admin, (req, res) =>
    res.json(
      db
        .prepare("SELECT * FROM users WHERE role!='patient'")
        .all()
        .map(safeUser),
    ),
  );
  app.post("/api/team", admin, async (req, res, next) => {
    try {
      const d = z
        .object({
          name: text.min(2).max(100),
          email: z.email().max(254),
          role: z.enum(["admin", "therapist"]),
        })
        .parse(req.body);
      const id = uid();
      db.prepare(
        "INSERT INTO users (id,name,email,role,status,created_at) VALUES (?,?,?,?,?,?)",
      ).run(id, d.name, d.email.toLowerCase(), d.role, "active", iso());
      const token = randomBytes(32).toString("base64url");
      db.prepare("INSERT INTO invitations VALUES (?,?,?,?,?,?)").run(
        uid(),
        id,
        hash(token),
        new Date(Date.now() + 48 * 3600000).toISOString(),
        null,
        req.user.id,
      );
      audit(db, req.user.id, "team_created", id);
      res.status(201).json({
        id,
        url: `${process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`}/?einladung=${token}`,
      });
    } catch (e) {
      next(e);
    }
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Nicht gefunden." }),
  );
  app.use((err, req, res, next) => {
    const status =
      err.status ||
      (err instanceof z.ZodError
        ? 400
        : err.code === "SQLITE_ERROR" ||
            String(err.message).includes("UNIQUE constraint")
          ? 409
          : err.code === "LIMIT_FILE_SIZE"
            ? 413
            : 500);
    res.status(status).json({
      error:
        status === 500
          ? "Die Anfrage konnte nicht verarbeitet werden."
          : err instanceof z.ZodError
            ? "Bitte die Eingaben prüfen."
            : status === 409
              ? "Dieser Eintrag existiert bereits oder wurde verändert."
              : err.message,
    });
    if (status === 500) console.error("Request failed:", err.message);
  });
  return {
    app,
    db,
    dir,
    close: () => {
      store.close();
      db.close();
    },
  };
}
