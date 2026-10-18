import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import request from "supertest";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { createApp } from "../server/app.mjs";
import { createBackup, restoreBackup } from "../scripts/backup.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "physio-test-"));
  const r = createApp({
    demo: true,
    production: false,
    dataDir: path.join(root, "data"),
  });
  t.after(() => {
    r.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { ...r, root };
}
async function agent(r, role = "admin") {
  const a = request.agent(r.app);
  let s = (await a.get("/api/session")).body;
  await a
    .post("/api/demo")
    .set("X-CSRF-Token", s.csrf)
    .send({ role })
    .expect(200);
  s = (await a.get("/api/session")).body;
  return { a, csrf: s.csrf };
}
const post = (c, url, body) =>
  c.a
    .post("/api" + url)
    .set("X-CSRF-Token", c.csrf)
    .send(body);

test("protected routes require authentication and never expose cross-patient records", async (t) => {
  const r = fixture(t);
  await request(r.app).get("/api/overview").expect(401);
  await request(r.app)
    .get("/api/demo-media/schulterkreisen/movement.mp4")
    .expect(401);
  const p = await agent(r, "patient");
  const o = (await p.a.get("/api/overview?patient=demo-patient-b").expect(200))
    .body;
  assert.equal(o.selectedPatient.id, "demo-patient");
  assert.equal(o.patients.length, 1);
  assert.equal(o.exercises.length, 3);
  await p.a.get("/api/patients/demo-patient-b/export").expect(404);
  await p.a.get("/api/exercises/nacken-drehen").expect(404);
  await post(p, "/patients", {
    name: "Forbidden",
    email: "forbidden@example.invalid",
  }).expect(403);
  await p.a.get("/api/team").expect(403);
});
test("CSRF and cross-origin writes are rejected", async (t) => {
  const r = fixture(t),
    a = await agent(r);
  await a.a
    .post("/api/patients")
    .send({ name: "X", email: "x@example.invalid" })
    .expect(403);
  await a.a
    .post("/api/patients")
    .set("X-CSRF-Token", a.csrf)
    .set("Origin", "https://evil.example")
    .send({ name: "X", email: "x@example.invalid" })
    .expect(403);
});
test("blocking and expiring a patient invalidate sessions and media requests", async (t) => {
  const r = fixture(t),
    admin = await agent(r),
    patient = await agent(r, "patient");
  await patient.a
    .get("/api/demo-media/schulterkreisen/movement.mp4")
    .expect(200);
  await admin.a
    .patch("/api/patients/demo-patient")
    .set("X-CSRF-Token", admin.csrf)
    .send({ status: "blocked", accessUntil: "" })
    .expect(200);
  await patient.a.get("/api/overview").expect(401);
  await patient.a
    .get("/api/demo-media/schulterkreisen/movement.mp4")
    .expect(401);
  r.db
    .prepare(
      "UPDATE users SET status='active',access_until='2000-01-01' WHERE id='demo-patient'",
    )
    .run();
  const expired = await agent(r, "patient");
  await expired.a.get("/api/overview").expect(401);
});
test("invitations are hashed, single-use, expiring, and do not activate an account", async (t) => {
  const r = fixture(t),
    admin = await agent(r);
  const id = (
    await post(admin, "/patients", {
      name: "Test Person",
      email: "test@example.invalid",
    }).expect(201)
  ).body.id;
  const invite = (await post(admin, `/patients/${id}/invite`, {}).expect(200))
    .body;
  const token = new URL(invite.url).searchParams.get("einladung");
  assert.ok(invite.qr.startsWith("data:image/png"));
  assert.notEqual(
    r.db.prepare("SELECT token_hash FROM invitations WHERE user_id=?").get(id)
      .token_hash,
    token,
  );
  const anon = request.agent(r.app),
    csrf = (await anon.get("/api/session")).body.csrf;
  await anon
    .post("/api/invitation/accept")
    .set("X-CSRF-Token", csrf)
    .send({ token, password: "Synthetic-test-password-123" })
    .expect(200);
  await anon
    .post("/api/invitation/accept")
    .set("X-CSRF-Token", csrf)
    .send({ token, password: "Synthetic-test-password-123" })
    .expect(400);
  await anon
    .post("/api/login")
    .set("X-CSRF-Token", csrf)
    .send({
      email: "test@example.invalid",
      password: "Synthetic-test-password-123",
    })
    .expect(401);
  await admin.a
    .patch("/api/patients/" + id)
    .set("X-CSRF-Token", admin.csrf)
    .send({ status: "active", accessUntil: "" })
    .expect(200);
  await anon
    .post("/api/login")
    .set("X-CSRF-Token", csrf)
    .send({
      email: "test@example.invalid",
      password: "Synthetic-test-password-123",
    })
    .expect(200);
  assert.equal((await anon.get("/api/overview")).body.selectedPatient.id, id);
  const later = (await post(admin, `/patients/${id}/invite`, {})).body;
  const laterToken = new URL(later.url).searchParams.get("einladung");
  r.db
    .prepare(
      "UPDATE invitations SET expires_at=? WHERE user_id=? AND used_at IS NULL",
    )
    .run("2000-01-01T00:00:00Z", id);
  await request(r.app)
    .get("/api/invitation?token=" + laterToken)
    .expect(404);
});
test("therapists cannot read or invite patients who are not assigned to them", async (t) => {
  const r = fixture(t),
    therapist = await agent(r, "therapist");
  const o = (await therapist.a.get("/api/overview")).body;
  assert.equal(o.patients.length, 1);
  await post(therapist, "/patients/demo-patient-b/invite", {}).expect(404);
  await therapist.a.get("/api/patients/demo-patient-b/export").expect(404);
  await therapist.a
    .patch("/api/patients/demo-patient")
    .set("X-CSRF-Token", therapist.csrf)
    .send({ status: "blocked", accessUntil: "" })
    .expect(403);
});
test("training history retains original plan and exercise versions", async (t) => {
  const r = fixture(t),
    patient = await agent(r, "patient"),
    admin = await agent(r);
  await post(patient, "/training", {
    planId: "demo-plan",
    planVersion: 1,
    exerciseId: "schulterkreisen",
    outcome: "done",
    pain: 2,
    note: "Synthetischer Eintrag",
  }).expect(201);
  const original = JSON.parse(
    r.db
      .prepare(
        "SELECT payload FROM plan_versions WHERE plan_id='demo-plan' AND version=1",
      )
      .get().payload,
  );
  await post(admin, "/patients/demo-patient/plans", {
    ...original,
    title: "Geänderter Plan",
    items: original.items.map((i) => ({ ...i, reps: 5 })),
  }).expect(200);
  assert.equal(
    r.db.prepare("SELECT plan_version FROM training_sessions").get()
      .plan_version,
    1,
  );
  assert.equal(
    JSON.parse(
      r.db
        .prepare(
          "SELECT payload FROM plan_versions WHERE plan_id='demo-plan' AND version=1",
        )
        .get().payload,
    ).items[0].reps,
    10,
  );
  await post(patient, "/training", {
    planId: "demo-plan",
    planVersion: 1,
    exerciseId: "schulterkreisen",
    outcome: "done",
    pain: null,
    note: "",
  }).expect(409);
  await post(patient, "/training", {
    planId: "demo-plan",
    planVersion: 2,
    exerciseId: "nacken-drehen",
    outcome: "done",
    pain: null,
    note: "",
  }).expect(400);
});
test("drafts, demo content, and incomplete media cannot be published", async (t) => {
  const r = fixture(t),
    admin = await agent(r);
  await post(admin, "/exercises/schulterkreisen/status", {
    status: "published",
  }).expect(422);
  const e = (await admin.a.get("/api/exercises/schulterkreisen")).body;
  const id = (
    await post(admin, "/exercises", {
      ...e,
      title: "Entwurf",
      media: [],
      reviewer: "",
      reviewedAt: "",
    }).expect(201)
  ).body.id;
  await post(admin, `/exercises/${id}/status`, { status: "published" }).expect(
    422,
  );
  const p = await agent(r, "patient");
  await p.a.get("/api/exercises/" + id).expect(404);
});
test("upload verifies file content and checks protected media on every request", async (t) => {
  const r = fixture(t),
    admin = await agent(r);
  const e = (await admin.a.get("/api/exercises/schulterkreisen")).body;
  const id = (
    await post(admin, "/exercises", {
      ...e,
      title: "Uploadtest",
      media: [],
    }).expect(201)
  ).body.id;
  await admin.a
    .post(`/api/exercises/${id}/media`)
    .set("X-CSRF-Token", admin.csrf)
    .attach("file", Buffer.from("<svg/>"), {
      filename: "fake.png",
      contentType: "image/png",
    })
    .expect(400);
  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#e2ebda" },
  })
    .png()
    .toBuffer();
  const uploaded = (
    await admin.a
      .post(`/api/exercises/${id}/media`)
      .set("X-CSRF-Token", admin.csrf)
      .attach("file", png, "photo.png")
      .expect(201)
  ).body;
  await admin.a
    .put("/api/exercises/" + id)
    .set("X-CSRF-Token", admin.csrf)
    .send({ ...e, media: [uploaded.id] })
    .expect(200);
  const response = await admin.a.get("/api/media/" + uploaded.id).expect(200);
  assert.match(response.headers["content-type"], /image\/webp/);
  assert.match(response.headers["cache-control"], /no-store/);
  const p = await agent(r, "patient");
  await p.a.get("/api/media/" + uploaded.id).expect(404);
  await request(r.app)
    .get("/api/media/" + uploaded.id)
    .expect(401);
});
test("PDF export produces a valid document and protects other plans", async (t) => {
  const r = fixture(t),
    p = await agent(r, "patient");
  const response = await p.a.get("/api/plans/demo-plan/pdf").expect(200);
  assert.match(response.headers["content-type"], /application\/pdf/);
  const pdf = await PDFDocument.load(response.body);
  assert.ok(pdf.getPageCount() >= 1);
  const admin = await agent(r),
    original = JSON.parse(
      r.db
        .prepare("SELECT payload FROM plan_versions WHERE plan_id='demo-plan'")
        .get().payload,
    );
  const foreign = (
    await post(admin, "/patients/demo-patient-b/plans", original).expect(200)
  ).body.id;
  await p.a.get("/api/plans/" + foreign + "/pdf").expect(404);
});
test("staff login requires TOTP, encrypts the secret, and rejects code replay", async (t) => {
  const r = fixture(t);
  const password = await bcrypt.hash("Synthetic-admin-password", 4);
  r.db
    .prepare("UPDATE users SET password_hash=? WHERE id='demo-admin'")
    .run(password);
  const a = request.agent(r.app);
  let csrf = (await a.get("/api/session")).body.csrf;
  const login = (
    await a
      .post("/api/login")
      .set("X-CSRF-Token", csrf)
      .send({
        email: "praxis@example.invalid",
        password: "Synthetic-admin-password",
      })
      .expect(200)
  ).body;
  assert.equal(login.mfa, true);
  csrf = login.csrf;
  await a.get("/api/overview").expect(401);
  const enrollment = (await a.get("/api/mfa/enroll").expect(200)).body;
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(enrollment.secret),
    period: 30,
    digits: 6,
  });
  const code = totp.generate();
  await a
    .post("/api/mfa/verify")
    .set("X-CSRF-Token", csrf)
    .send({ code })
    .expect(200);
  await a.get("/api/overview").expect(200);
  assert.notEqual(
    r.db.prepare("SELECT mfa_secret FROM users WHERE id='demo-admin'").get()
      .mfa_secret,
    enrollment.secret,
  );
  const b = request.agent(r.app);
  let bcsrf = (await b.get("/api/session")).body.csrf;
  const l = (
    await b.post("/api/login").set("X-CSRF-Token", bcsrf).send({
      email: "praxis@example.invalid",
      password: "Synthetic-admin-password",
    })
  ).body;
  await b
    .post("/api/mfa/verify")
    .set("X-CSRF-Token", l.csrf)
    .send({ code })
    .expect(401);
});
test("encrypted backup restores database and media and clears active sessions", async (t) => {
  const r = fixture(t);
  await agent(r);
  const media = path.join(r.dir, "media");
  fs.mkdirSync(media, { recursive: true });
  fs.writeFileSync(path.join(media, "test.bin"), "synthetic-media");
  const file = path.join(r.root, "backup.enc"),
    target = path.join(r.root, "restored");
  const pass = randomBytes(24).toString("hex");
  await createBackup(r.dir, file, pass);
  assert.equal(
    fs.readFileSync(file).includes(Buffer.from("Anna Beispiel")),
    false,
  );
  assert.throws(() => restoreBackup(file, target, "wrong-passphrase"));
  restoreBackup(file, target, pass);
  const restored = createApp({
    demo: true,
    production: false,
    dataDir: target,
  });
  assert.equal(
    restored.db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
    4,
  );
  assert.equal(
    restored.db.prepare("SELECT COUNT(*) AS n FROM http_sessions").get().n,
    0,
  );
  assert.equal(
    fs.readFileSync(path.join(target, "media/test.bin"), "utf8"),
    "synthetic-media",
  );
  restored.close();
});
test("production cannot enable the demonstration shortcut", () => {
  assert.throws(
    () => createApp({ demo: true, production: true }),
    /DEMO_MODE=false/,
  );
});

test("publication requires complete original media including timed captions; archive revokes patient access", async (t) => {
  const r = fixture(t),
    admin = await agent(r),
    patient = await agent(r, "patient");
  const source = (await admin.a.get("/api/exercises/schulterkreisen")).body;
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Berlin",
  });
  const payload = {
    ...source,
    title: "Synthetic publication test",
    media: [],
    reviewer: "Synthetic reviewer",
    reviewedAt: today,
    license: "Synthetic test rights",
    transcript: "Synthetic transcript",
  };
  const id = (await post(admin, "/exercises", payload).expect(201)).body.id;
  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#e2ebda" },
  })
    .png()
    .toBuffer();
  const media = [];
  for (let i = 0; i < 2; i++)
    media.push(
      (
        await admin.a
          .post(`/api/exercises/${id}/media`)
          .set("X-CSRF-Token", admin.csrf)
          .attach("file", png, "image.png")
          .expect(201)
      ).body.id,
    );
  media.push(
    (
      await admin.a
        .post(`/api/exercises/${id}/media`)
        .set("X-CSRF-Token", admin.csrf)
        .attach("file", "server/assets/movement.mp4")
        .expect(201)
    ).body.id,
  );
  await admin.a
    .put("/api/exercises/" + id)
    .set("X-CSRF-Token", admin.csrf)
    .send({ ...payload, media })
    .expect(200);
  await post(admin, `/exercises/${id}/status`, { status: "published" }).expect(
    422,
  );
  media.push(
    (
      await admin.a
        .post(`/api/exercises/${id}/media`)
        .set("X-CSRF-Token", admin.csrf)
        .attach("file", "server/assets/captions.vtt")
        .expect(201)
    ).body.id,
  );
  await admin.a
    .put("/api/exercises/" + id)
    .set("X-CSRF-Token", admin.csrf)
    .send({ ...payload, media })
    .expect(200);
  await post(admin, `/exercises/${id}/status`, { status: "published" }).expect(
    200,
  );
  const original = JSON.parse(
    r.db
      .prepare(
        "SELECT payload FROM plan_versions WHERE plan_id='demo-plan' AND version=1",
      )
      .get().payload,
  );
  const version = (await admin.a.get("/api/exercises/" + id)).body.version;
  await post(admin, "/patients/demo-patient/plans", {
    ...original,
    items: [{ ...original.items[0], exerciseId: id, exerciseVersion: version }],
  }).expect(200);
  await patient.a.get("/api/exercises/" + id).expect(200);
  await patient.a.get("/api/media/" + media[3]).expect(200);
  await post(admin, `/exercises/${id}/status`, { status: "archived" }).expect(
    200,
  );
  await patient.a.get("/api/exercises/" + id).expect(404);
  await patient.a.get("/api/media/" + media[0]).expect(404);
  assert.equal(
    (await patient.a.get("/api/overview")).body.plans[0].items.length,
    0,
  );
  await post(patient, "/training", {
    planId: "demo-plan",
    planVersion: 2,
    exerciseId: id,
    outcome: "done",
    pain: null,
    note: "",
  }).expect(400);
});

test("practice mode has no demo identities or anonymous demo entry", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "physio-practice-"));
  const runtime = createApp({ demo: false, production: false, dataDir: root });
  t.after(() => {
    runtime.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const a = request.agent(runtime.app),
    s = (await a.get("/api/session")).body;
  assert.equal(s.demo, false);
  assert.equal(s.user, null);
  assert.equal(
    runtime.db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
    0,
  );
  await a
    .post("/api/demo")
    .set("X-CSRF-Token", s.csrf)
    .send({ role: "admin" })
    .expect(404);
});

test("training is rejected outside prescribed weekdays", async (t) => {
  const r = fixture(t),
    admin = await agent(r),
    patient = await agent(r, "patient");
  const original = JSON.parse(
    r.db
      .prepare(
        "SELECT payload FROM plan_versions WHERE plan_id='demo-plan' AND version=1",
      )
      .get().payload,
  );
  const today = new Date(
    new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }) +
      "T12:00:00",
  ).getDay();
  await post(admin, "/patients/demo-patient/plans", {
    ...original,
    days: [(today + 1) % 7],
  }).expect(200);
  await post(patient, "/training", {
    planId: "demo-plan",
    planVersion: 2,
    exerciseId: "schulterkreisen",
    outcome: "done",
    pain: null,
    note: "",
  }).expect(409);
});

test("external video frame permission stays restricted and production cookies stay secure", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "physio-production-"));
  const prior = process.env.TOTP_ENCRYPTION_KEY;
  let runtime;
  try {
    process.env.TOTP_ENCRYPTION_KEY = randomBytes(32).toString("hex");
    runtime = createApp({ demo: false, production: true, dataDir: root });
  } finally {
    if (prior === undefined) delete process.env.TOTP_ENCRYPTION_KEY;
    else process.env.TOTP_ENCRYPTION_KEY = prior;
  }
  t.after(() => {
    runtime.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const response = await request(runtime.app)
    .get("/api/session")
    .set("X-Forwarded-Proto", "https")
    .expect(200);
  const frameSrc = response.headers["content-security-policy"]
    .split(";")
    .find((d) => d.startsWith("frame-src"));
  assert.equal(frameSrc, "frame-src 'self' https://www.youtube-nocookie.com");
  assert.match(response.headers["set-cookie"][0], /^__Host-physio=/);
  assert.match(
    response.headers["set-cookie"][0],
    /HttpOnly; Secure; SameSite=Strict/,
  );
});
