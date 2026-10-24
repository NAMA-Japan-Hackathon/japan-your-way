import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedRemote = 'https://github.com/NAMA-Japan-Hackathon/japan-your-way.git';
const dryRun = process.argv.includes('--dry-run');
const lock = path.join(root, '.github-sync.lock');
const split = (s) => s.split('\0').filter(Boolean);
function run(command, args, { allowFailure = false, binary = false } = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: binary ? undefined : 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) throw new Error(`${command} failed: ${String(result.stderr || result.stdout || '').trim()}`);
  return result;
}
const git = (...args) => run('git', args).stdout;
const files = () => [...new Set([...split(git('diff', '--name-only', '-z', 'HEAD')), ...split(git('ls-files', '--others', '--exclude-standard', '-z'))])];
function fingerprint() {
  const hash = createHash('sha256').update(git('status', '--porcelain=v1', '-z'));
  hash.update(run('git', ['diff', '--binary', 'HEAD'], { binary: true }).stdout);
  for (const name of split(git('ls-files', '--others', '--exclude-standard', '-z')).sort()) {
    const file = path.join(root, name);
    hash.update(name);
    if (lstatSync(file).isSymbolicLink()) throw new Error(`Review the new symlink before publishing: ${name}`);
    hash.update(readFileSync(file));
  }
  return hash.digest('hex');
}
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /https?:\/\/[^\s/]+:[^\s/@]+@/,
];
function inspect(name, data) {
  if (/(^|\/)(\.env(?:\..*)?|credentials|id_rsa|id_ed25519)$|\.(pem|key|p12|pfx)$/i.test(name)) {
    throw new Error(`Private configuration needs review before publishing: ${name}`);
  }
  if (!data.subarray(0, 8192).includes(0) && patterns.some((p) => p.test(data.toString('utf8')))) {
    throw new Error(`Potential credential in ${name}; no content was printed. Review before publishing.`);
  }
}
function scan() {
  for (const name of split(git('ls-files', '--cached', '--others', '--exclude-standard', '-z'))) {
    const file = path.join(root, name);
    if (!existsSync(file)) continue;
    if (lstatSync(file).isSymbolicLink()) throw new Error(`Review the symlink before publishing: ${name}`);
    inspect(name, readFileSync(file));
  }
  const objects = git('rev-list', '--objects', 'github/main..HEAD').trim().split('\n').filter(Boolean);
  for (const entry of objects) {
    const space = entry.indexOf(' ');
    if (space < 0) continue;
    const oid = entry.slice(0, space), name = entry.slice(space + 1);
    if (git('cat-file', '-t', oid).trim() === 'blob') inspect(name, run('git', ['cat-file', 'blob', oid], { binary: true }).stdout);
  }
}

if (existsSync(lock)) {
  console.log('Sync already running; no changes made.');
  process.exit(0);
}
mkdirSync(lock);
try {
  if (git('branch', '--show-current').trim() !== 'main') throw new Error('Automatic sync only publishes main; the current branch was left unchanged.');
  if (git('remote', 'get-url', 'github').trim() !== expectedRemote) throw new Error('The GitHub destination changed; review it before publishing.');
  if (split(git('diff', '--name-only', '--diff-filter=U', '-z')).length) throw new Error('Resolve the merge conflict before automatic sync.');
  if (git('diff', '--cached', '--name-only').trim()) {
    console.log('Staged work belongs to the current editing session; waiting for it to finish.');
    process.exitCode = 0;
  } else {
    run('git', ['fetch', '--quiet', 'github', 'main']);
    if (run('git', ['merge-base', '--is-ancestor', 'github/main', 'HEAD'], { allowFailure: true }).status !== 0) {
      throw new Error('GitHub has changes that are not in this checkout; reconcile them before syncing. No force push was attempted.');
    }
    const changed = files();
    const ahead = Number(git('rev-list', '--count', 'github/main..HEAD').trim());
    const busy = changed.some((name) => existsSync(path.join(root, name)) && Date.now() - lstatSync(path.join(root, name)).mtimeMs < 90000);
    if (!changed.length && !ahead) console.log('Already synchronized.');
    else if (busy && !dryRun) console.log('Recent edits detected; waiting for 90 seconds of quiet.');
    else {
      scan();
      if (dryRun) console.log(`Ready: ${changed.length} changed files and ${ahead} unpushed commits. No commit or push performed.`);
      else {
        const before = fingerprint();
        if (changed.some((name) => /\.(?:tsx?|jsx?|mjs|css)$/.test(name) || /(?:^|\/)(?:package(?:-lock)?\.json)$/.test(name))) {
          run('npm', ['test']);
          run('npm', ['run', 'build']);
        }
        if (fingerprint() !== before) throw new Error('Files changed during checks; waiting for the next sync instead of publishing a moving snapshot.');
        if (changed.length) {
          run('git', ['diff', '--check']);
          run('git', ['add', '--all', '--', '.']);
          run('git', ['commit', '-m', 'Update Japan, Your Way']);
        }
        run('git', ['push', 'github', 'HEAD:main']);
        console.log('Published project updates to NAMA-Japan-Hackathon/japan-your-way.');
      }
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rmSync(lock, { recursive: true, force: true });
}
