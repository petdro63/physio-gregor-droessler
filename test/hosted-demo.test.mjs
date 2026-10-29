import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createHostedDemoAccess } from '../server/hosted-demo.mjs';
import { createApp } from '../server/app.mjs';
import { VERSION, VERSION_DATE } from '../server/version.mjs';

const password = 'Only-for-isolated-tests!';
const config = {
  username: 'demo-test',
  passwordHash: bcrypt.hashSync(password, 10),
  origin: 'https://training.example.invalid',
};

test('hosted demo refuses missing credentials, weak hashes, and non-HTTPS origins', () => {
  for (const invalid of [
    {username:''}, {passwordHash:''}, {passwordHash:password},
    {passwordHash:config.passwordHash.replace('$10$', '$04$')},
    {origin:'http://training.example.invalid'}, {origin:config.origin + '/path'},
  ]) assert.throws(() => createHostedDemoAccess({...config, ...invalid}), /HOSTED_DEMO/);
});

test('the demo gate protects all paths and never issues a session before authentication', async () => {
  const app = express();
  app.use(createHostedDemoAccess(config));
  app.use((_req, res) => res.json({protected:true}));
  for (const route of ['/', '/api/session', '/api/demo', '/assets/app.js', '/sw.js', '/api/demo-media/example/video.mp4']) {
    const res = await request(app).get(route).expect(401);
    assert.match(res.headers['www-authenticate'], /^Basic /);
    assert.equal(res.headers['set-cookie'], undefined);
    assert.equal(res.headers['cache-control'], 'private, no-store');
  }
  await request(app).get('/').auth(config.username, 'wrong').expect(401);
  await request(app).get('/').set('Authorization', 'Basic !!!!').expect(401);
  await request(app).get('/').auth(config.username, password).expect(200);
  // A successful cached login must not allow a different header to pass.
  await request(app).get('/assets/app.js').auth(config.username, password).expect(200);
  await request(app).get('/').expect(401);
  await request(app).get('/').auth('another-user', password).expect(401);
  await request(app).get('/').auth(config.username, 'wrong').expect(401);
});

test('failed internet demo logins are rate limited', async () => {
  const app = express();
  app.use(createHostedDemoAccess(config));
  app.get('/', (_req, res) => res.send('protected'));
  for (let i = 0; i < 30; i++) await request(app).get('/').expect(401);
  const blocked = await request(app).get('/').expect(429);
  assert(blocked.headers['retry-after']);
  assert.match(blocked.headers['www-authenticate'], /^Basic /);
});

test('explicit hosted demo retains CSRF, secure cookies, role checks, version, and isolated demo data', async t => {
  const prior = {...process.env};
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'physio-hosted-demo-'));
  const cwd = process.cwd();
  let runtime;
  t.after(() => {
    runtime?.close();
    fs.rmSync(root, {recursive:true, force:true});
    for (const key of Object.keys(process.env)) if (!(key in prior)) delete process.env[key];
    Object.assign(process.env, prior);
  });
  try {
    process.env.HOSTED_DEMO = 'true';
    process.env.DEMO_ACCESS_USER = config.username;
    process.env.DEMO_ACCESS_PASSWORD_HASH = config.passwordHash;
    process.env.APP_ORIGIN = config.origin;
    process.env.TOTP_ENCRYPTION_KEY = randomBytes(32).toString('hex');
    delete process.env.DATA_DIR;
    process.chdir(root);
    assert.throws(() => createApp({demo:false, production:true}), /DEMO_MODE=true/);
    assert.throws(() => createApp({demo:true, production:false}), /Produktionsmodus/);
    assert.throws(() => createApp({demo:true, production:true, dataDir:path.join(root,'practice')}), /DATA_DIR/);
    runtime = createApp({demo:true, production:true});
  } finally {
    process.chdir(cwd);
  }
  runtime.app.get('/', (_req,res) => res.send('Built demo frontend'));
  await request(runtime.app).get('/').expect(401);
  await request(runtime.app).get('/api/session').expect(401);
  const session = await request(runtime.app).get('/api/session')
    .auth(config.username,password).set('X-Forwarded-Proto','https').expect(200);
  assert.equal(session.body.demo,true);
  assert.equal(session.body.version,VERSION);
  assert.equal(session.body.date,VERSION_DATE);
  assert.match(session.headers['set-cookie'][0], /^__Host-physio=.*HttpOnly; Secure; SameSite=Strict/);
  assert.match(session.headers['content-security-policy'], /default-src 'self'/);
  const cookie = session.headers['set-cookie'][0].split(';')[0];
  const login = () => request(runtime.app).post('/api/demo')
    .auth(config.username,password).set('X-Forwarded-Proto','https')
    .set('Cookie',cookie).set('X-CSRF-Token',session.body.csrf);
  await login().set('Origin','https://another.example.invalid').send({role:'admin'}).expect(403);
  await request(runtime.app).post('/api/demo').auth(config.username,password)
    .set('Cookie',cookie).send({role:'admin'}).expect(403);
  const authenticated = await login().set('Origin',config.origin).send({role:'admin'}).expect(200);
  const adminCookie = authenticated.headers['set-cookie'][0].split(';')[0];
  await request(runtime.app).get('/api/overview').set('Cookie',adminCookie).expect(401);
  await request(runtime.app).get('/api/overview').auth(config.username,password)
    .set('Cookie',adminCookie).set('X-Forwarded-Proto','https').expect(200);
  assert(fs.existsSync(path.join(root,'data/demo/physio.sqlite')));
  assert(!fs.existsSync(path.join(root,'data/practice')));
});
