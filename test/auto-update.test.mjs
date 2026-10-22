import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { git, inspectUpdate, applyUpdate } from '../scripts/auto-update.mjs';

async function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'physio-update-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'origin.git');
  const author = path.join(root, 'author');
  const local = path.join(root, 'local');
  await git(root, 'init', '--bare', remote);
  await git(root, 'init', '-b', 'master', author);
  async function commit(dir, message) {
    await git(dir, 'add', '.');
    await git(dir, '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', message);
  }
  fs.writeFileSync(path.join(author, 'app.txt'), 'old');
  fs.writeFileSync(path.join(author, '.gitignore'), 'data/\n.env\n');
  await commit(author, 'initial');
  await git(author, 'remote', 'add', 'origin', remote);
  await git(author, 'push', 'origin', 'master');
  await git(root, 'clone', '-b', 'master', remote, local);
  async function publish(file = 'app.txt') {
    fs.writeFileSync(path.join(author, file), 'new');
    await commit(author, 'update');
    await git(author, 'push', 'origin', 'master');
  }
  return { remote, author, local, commit, publish };
}

test('fast-forward updates preserve ignored local data and detect dependency changes', async t => {
  const f = await fixture(t);
  fs.mkdirSync(path.join(f.local, 'data'));
  fs.writeFileSync(path.join(f.local, 'data', 'practice.db'), 'local data');
  fs.writeFileSync(path.join(f.local, '.env'), 'local config');
  assert.deepEqual(await inspectUpdate(f.local, f.remote), { current: true });
  await f.publish('package-lock.json');
  const update = await inspectUpdate(f.local, f.remote);
  assert.equal(update.dependencies, true);
  await applyUpdate(f.local, update);
  assert.equal(await git(f.local, 'rev-parse', 'HEAD'), update.target);
  assert.equal(fs.readFileSync(path.join(f.local, 'data', 'practice.db'), 'utf8'), 'local data');
  assert.equal(fs.readFileSync(path.join(f.local, '.env'), 'utf8'), 'local config');
});
test('dirty tracked and untracked files block updates', async t => {
  const f = await fixture(t);
  await f.publish();
  fs.writeFileSync(path.join(f.local, 'app.txt'), 'my edit');
  assert.match((await inspectUpdate(f.local, f.remote)).skip, /Lokale Änderungen/);
  await git(f.local, 'restore', 'app.txt');
  fs.writeFileSync(path.join(f.local, 'new.txt'), 'untracked work');
  assert.match((await inspectUpdate(f.local, f.remote)).skip, /Lokale Änderungen/);
});
test('wrong origin, another branch and divergent commits are never overwritten', async t => {
  const f = await fixture(t);
  assert.match((await inspectUpdate(f.local)).skip, /origin/);
  await git(f.local, 'checkout', '-b', 'my-work');
  assert.match((await inspectUpdate(f.local, f.remote)).skip, /master/);
  await git(f.local, 'checkout', 'master');
  fs.writeFileSync(path.join(f.local, 'mine.txt'), 'my commit');
  await f.commit(f.local, 'local');
  await f.publish();
  assert.match((await inspectUpdate(f.local, f.remote)).skip, /Lokale Commits/);
  assert.equal(fs.readFileSync(path.join(f.local, 'mine.txt'), 'utf8'), 'my commit');
});
test('edits made after inspection abort the update', async t => {
  const f = await fixture(t);
  await f.publish();
  const update = await inspectUpdate(f.local, f.remote);
  fs.writeFileSync(path.join(f.local, 'app.txt'), 'edited meanwhile');
  await assert.rejects(applyUpdate(f.local, update), /Update abgebrochen/);
  assert.equal(await git(f.local, 'rev-parse', 'HEAD'), update.before);
});
