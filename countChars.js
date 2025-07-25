// File: scripts/countChars.js
// #!/usr/bin/env node
/**
 * Count characters in every file that Git does NOT ignore (.gitignore honored).
 * Skips binary-ish files AND anything in the manual skip list (e.g. package-lock.json).
 *
 * Run:  node scripts/countChars.js
 * Or:   chmod +x scripts/countChars.js && ./scripts/countChars.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------
// 1) CONFIG: add any filenames or globs you want to skip here
// ---------------------------------------------
const SKIP_FILES = new Set([
  'package-lock.json',  // npm lockfile
  // 'yarn.lock',
  // 'pnpm-lock.yaml',
  // add more as needed
]);

// If you want to skip by extension or directory, expand this helper:
function shouldSkip(relPath) {
  const base = path.basename(relPath);
  if (SKIP_FILES.has(base)) return true;

  // Example: skip everything in scripts/tmp/
  // if (relPath.startsWith('scripts/tmp/')) return true;

  return false;
}

// ---------------------------------------------
// 2) Helpers
// ---------------------------------------------
function die(msg, code = 1) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(code);
}

// Rudimentary binary check: look for NUL bytes in the first chunk
function looksBinary(buffer) {
  const len = Math.min(buffer.length, 8000);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

// Count Unicode characters (code points, not UTF-16 units)
function countChars(str) {
  return [...str].length;
}

// ---------------------------------------------
// 3) Ensure we're in a Git repo
// ---------------------------------------------
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch {
  die('Not inside a Git repository (or Git not installed).');
}

// ---------------------------------------------
// 4) Ask Git for files that are NOT ignored
//    --others   : untracked but not ignored
//    --cached   : tracked
//    --exclude-standard : apply .gitignore, .git/info/exclude & global ignores
// ---------------------------------------------
let fileListBuf;
try {
  fileListBuf = execSync('git ls-files -z --others --cached --exclude-standard', {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (err) {
  die(`git ls-files failed: ${err.message}`);
}

const files = fileListBuf.toString('utf8').split('\0').filter(Boolean);

// ---------------------------------------------
// 5) Iterate & count
// ---------------------------------------------
let totalChars = 0;
const rows = [];
const skipped = [];

for (const relPath of files) {
  if (shouldSkip(relPath)) {
    skipped.push({ file: relPath, reason: 'manual skip list' });
    continue;
  }

  const absPath = path.resolve(process.cwd(), relPath);

  let stat;
  try {
    stat = fs.statSync(absPath);
  } catch (e) {
    skipped.push({ file: relPath, reason: `stat error: ${e.message}` });
    continue;
  }

  if (!stat.isFile()) continue;

  let buf;
  try {
    buf = fs.readFileSync(absPath);
  } catch (e) {
    skipped.push({ file: relPath, reason: `read error: ${e.message}` });
    continue;
  }

  if (looksBinary(buf)) {
    skipped.push({ file: relPath, reason: 'binary' });
    continue;
  }

  const text = buf.toString('utf8');
  const charCount = countChars(text);
  totalChars += charCount;

  rows.push({ file: relPath, chars: charCount });
}

// Sort rows by character count descending (largest first)
rows.sort((a, b) => b.chars - a.chars);

// ---------------------------------------------
// 6) Output
// ---------------------------------------------
const maxFileLen = Math.max(...rows.map(r => r.file.length), 'File'.length);
const headerFile = 'File'.padEnd(maxFileLen, ' ');
const headerChars = 'Chars';

console.log('\nCharacter count (Unicode code points) per file:\n');
console.log(`${headerFile}  ${headerChars}`);
console.log(`${'-'.repeat(maxFileLen)}  ${'-'.repeat(headerChars.length)}`);

for (const r of rows) {
  console.log(`${r.file.padEnd(maxFileLen, ' ')}  ${r.chars}`);
}

console.log('\n---------------------------------------------');
console.log(`TOTAL CHARACTERS (all text files): ${totalChars}`);
console.log('---------------------------------------------\n');

if (skipped.length) {
  console.log('Skipped files:');
  for (const s of skipped) {
    console.log(`  - ${s.file} (${s.reason})`);
  }
  console.log('');
}
