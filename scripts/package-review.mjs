import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import yazl from 'yazl';
import yauzl from 'yauzl';

const root = resolve('.');
const zipPath = resolve(root, 'engines-of-independence-v09-review.zip');
const requiredFiles = [
  '.gitignore',
  'LICENSE',
  'NOTICE.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'BUILD_RECEIPT_ENGINES_OF_INDEPENDENCE_V09.md',
  'BUILD_LOG_ENGINES_OF_INDEPENDENCE_V09.txt'
];
const requiredDirs = ['.github', 'docs', 'scripts', 'src'];
const requiredScreenshots = [
  'output/playwright/engines-v09-title.png',
  'output/playwright/engines-v09-board.png',
  'output/playwright/engines-v09-first-ledger.png',
  'output/playwright/engines-v09-policy-pressure.png',
  'output/playwright/engines-v09-ending.png'
];

const files = [
  ...requiredDirs.flatMap((dir) => collectFiles(resolve(root, dir))),
  ...requiredFiles.map((file) => resolve(root, file)).filter(existsSync),
  ...requiredScreenshots.map((file) => resolve(root, file)).filter(existsSync)
];

if (!files.length) {
  throw new Error('No files selected for package.');
}

const entries = files.map((file) => ({
  file,
  entry: toEntryName(file)
}));

for (const { entry } of entries) {
  validateEntryName(entry);
}

const zip = new yazl.ZipFile();
for (const { file, entry } of entries.sort((a, b) => a.entry.localeCompare(b.entry))) {
  zip.addFile(file, entry);
}

await new Promise((resolveWrite, rejectWrite) => {
  zip.outputStream
    .pipe(createWriteStream(zipPath))
    .on('close', resolveWrite)
    .on('error', rejectWrite);
  zip.end();
});

const verify = await inspectZip(zipPath);
const hash = await sha256(zipPath);

if (verify.backslashPaths !== 0) {
  throw new Error(`Package contains ${verify.backslashPaths} backslash path(s).`);
}

console.log(`Package: ${zipPath}`);
console.log(`Entries: ${verify.entryCount}`);
console.log(`Backslash paths: ${verify.backslashPaths}`);
console.log(`SHA-256: ${hash}`);

function collectFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      out.push(...collectFiles(path));
    } else if (stat.isFile()) {
      out.push(path);
    }
  }
  return out;
}

function toEntryName(file) {
  const rel = relative(root, file).split(sep).join('/');
  validateEntryName(rel);
  return rel;
}

function validateEntryName(entry) {
  const lower = entry.toLowerCase();
  if (!entry || entry.includes('\\')) {
    throw new Error(`Invalid backslash path in package entry: ${entry}`);
  }
  if (entry.startsWith('/') || /^[a-z]:/i.test(entry)) {
    throw new Error(`Absolute path in package entry: ${entry}`);
  }
  if (entry.split('/').includes('..')) {
    throw new Error(`Traversal path in package entry: ${entry}`);
  }
  const parts = lower.split('/');
  const forbidden = new Set([
    'node_modules',
    'dist',
    '.git',
    '.vite',
    '.playwright-cli',
    'coverage',
    'cache',
    '.cache',
    'tmp',
    '.tmp',
    'temp',
    '.temp'
  ]);
  if (parts.some((part) => forbidden.has(part))) {
    throw new Error(`Forbidden folder in package entry: ${entry}`);
  }
  if (lower.endsWith('.zip') && basename(lower) !== 'engines-of-independence-v09-review.zip') {
    throw new Error(`Old ZIP included in package entry: ${entry}`);
  }
}

function inspectZip(path) {
  return new Promise((resolveInspect, rejectInspect) => {
    yauzl.open(path, { lazyEntries: true }, (error, archive) => {
      if (error) {
        rejectInspect(error);
        return;
      }
      let entryCount = 0;
      let backslashPaths = 0;
      archive.readEntry();
      archive.on('entry', (entry) => {
        entryCount += 1;
        if (entry.fileName.includes('\\')) {
          backslashPaths += 1;
        }
        validateEntryName(entry.fileName.replace(/\/$/, ''));
        archive.readEntry();
      });
      archive.on('end', () => resolveInspect({ entryCount, backslashPaths }));
      archive.on('error', rejectInspect);
    });
  });
}

async function sha256(path) {
  const hash = createHash('sha256');
  await new Promise((resolveHash, rejectHash) => {
    createReadStream(path)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', resolveHash)
      .on('error', rejectHash);
  });
  return hash.digest('hex');
}
