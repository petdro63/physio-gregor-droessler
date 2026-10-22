import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
export const REPOSITORY = 'https://github.com/petdro63/physio-gregor-droessler.git';
export async function git(cwd, ...args) {
  const { stdout } = await exec('git', args, {
    cwd, timeout: 60000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    windowsHide: true,
  });
  return stdout.trim();
}

// Read-only eligibility checks; never stash, reset or discard local work.
export async function inspectUpdate(cwd, expectedRemote = REPOSITORY) {
  if (await git(cwd, 'remote', 'get-url', 'origin') !== expectedRemote)
    return { skip: 'Automatisches Update pausiert: origin ist nicht das erwartete Repository.' };
  if (await git(cwd, 'branch', '--show-current') !== 'master')
    return { skip: 'Automatisches Update pausiert: Nur der Branch master wird aktualisiert.' };
  if (await git(cwd, 'status', '--porcelain'))
    return { skip: 'Automatisches Update pausiert: Lokale Änderungen bleiben erhalten.' };
  await git(cwd, 'fetch', '--no-tags', 'origin', 'master');
  const before = await git(cwd, 'rev-parse', 'HEAD');
  const target = await git(cwd, 'rev-parse', 'FETCH_HEAD');
  if (before === target) return { current: true };
  try { await git(cwd, 'merge-base', '--is-ancestor', before, target); }
  catch { return { skip: 'Automatisches Update pausiert: Lokale Commits weichen von GitHub ab.' }; }
  const files = (await git(cwd, 'diff', '--name-only', before, target)).split('\n');
  return { before, target, dependencies: files.some(f => ['package.json', 'package-lock.json', '.npmrc'].includes(f)) };
}

export async function applyUpdate(cwd, update) {
  // Check again immediately before writing, in case the user edited while fetching.
  if (await git(cwd, 'status', '--porcelain') || await git(cwd, 'rev-parse', 'HEAD') !== update.before)
    throw new Error('Lokale Änderungen während der Prüfung: Update abgebrochen.');
  await git(cwd, 'merge', '--ff-only', update.target);
}
