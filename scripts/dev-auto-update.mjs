import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { inspectUpdate, applyUpdate } from './auto-update.mjs';

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pending = path.join(cwd, 'tmp', 'auto-update-pending.json');
let server;
let stopping = false;
let timer;
let lastNotice = '';
const notice = message => {
  if (message !== lastNotice) console.log(`[Auto-Update] ${message}`);
  lastNotice = message;
};
function startServer() {
  server = spawn(process.execPath, ['server/index.mjs'], { cwd, stdio: 'inherit' });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; clearTimeout(timer); });
  server.on('exit', code => {
    if (!stopping) { clearTimeout(timer); process.exitCode = code || 1; }
  });
}
async function stopServer() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  stopping = true;
  await new Promise(resolve => {
    const force = setTimeout(() => server.kill('SIGKILL'), 10000);
    server.once('exit', () => { clearTimeout(force); resolve(); });
    server.kill('SIGTERM');
  });
}
function npm(args) {
  // npm_execpath is supplied by npm run on Windows, macOS and Linux.
  const cli = process.env.npm_execpath;
  if (!cli) throw new Error('Bitte über npm run dev starten.');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`npm ${args.join(' ')} fehlgeschlagen (${code}).`)));
  });
}
async function check() {
  let update;
  try { update = await inspectUpdate(cwd); }
  catch (error) {
    notice(`GitHub momentan nicht erreichbar oder Git nicht verfügbar. Neuer Versuch in 60 Sekunden. ${error.message.split('\n')[0]}`);
    return;
  }
  if (update.skip) { notice(update.skip); return; }
  if (update.current) { lastNotice = ''; return; }
  notice('Neue Version gefunden. Lokale Vorschau wird aktualisiert …');
  await stopServer();
  try {
    await applyUpdate(cwd, update);
    fs.mkdirSync(path.dirname(pending), { recursive: true });
    fs.writeFileSync(pending, JSON.stringify({ dependencies: update.dependencies }));
    if (update.dependencies) await npm(['ci', '--no-audit', '--no-fund']);
    await npm(['run', 'build']);
    fs.unlinkSync(pending);
  } catch (error) {
    // Do not run partially installed or unverified application code.
    console.error(`[Auto-Update] ${error.message}\nBitte Fehler beheben und npm run dev erneut starten. Lokale Daten wurden nicht zurückgesetzt.`);
    process.exitCode = 1;
    return false;
  }
  stopping = false;
  startServer();
  notice(`Version ${update.target.slice(0, 7)} bereit. Browserseite neu laden.`);
}
async function poll() {
  if (await check() === false) return;
  if (!server) startServer();
  timer = setTimeout(poll, 60000);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  clearTimeout(timer);
  await stopServer();
  process.exit(0);
});
console.log('[Auto-Update] Lokale Vorschau: GitHub-Prüfung beim Start und alle 60 Sekunden. Beenden mit Strg+C.');
if (fs.existsSync(pending)) {
  try {
    notice('Unterbrochene Aktualisierung wird fertiggestellt …');
    if (JSON.parse(fs.readFileSync(pending, 'utf8')).dependencies) await npm(['ci', '--no-audit', '--no-fund']);
    await npm(['run', 'build']);
    fs.unlinkSync(pending);
  } catch (error) {
    console.error(`[Auto-Update] ${error.message}`);
    process.exit(1);
  }
}
await poll();
