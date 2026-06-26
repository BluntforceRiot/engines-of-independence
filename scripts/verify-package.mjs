import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import yauzl from 'yauzl';

const root = resolve('.');
const zipPath = resolve(root, process.argv[2] ?? 'engines-of-independence-v09-review.zip');
const reportPath = resolve(root, process.argv[3] ?? 'PACKAGE_VERIFY_ENGINES_OF_INDEPENDENCE_V09.md');
const extractDir = await mkdtemp(join(tmpdir(), 'engines-v09-extract-'));
const commandResults = [];

try {
  const inspection = await inspectZip(zipPath);
  await extractZip(zipPath, extractDir);

  for (const command of [
    'npm ci',
    'npm run typecheck',
    'npm run test:sim',
    'npm run build',
    'npm audit --audit-level=moderate'
  ]) {
    commandResults.push(run(command, extractDir));
  }

  const hash = await sha256(zipPath);
  const report = buildReport({ hash, ...inspection, extractDir, commandResults });
  await writeFile(reportPath, report, 'utf8');

  console.log(`Package verification passed: ${zipPath}`);
  console.log(`Entries: ${inspection.entryCount}`);
  console.log(`Backslash paths: ${inspection.backslashPaths}`);
  console.log(`SHA-256: ${hash}`);
  console.log(`Report: ${reportPath}`);
} finally {
  await rm(extractDir, { recursive: true, force: true });
}

function run(command, cwd) {
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}\n${output}`);
  }
  return { command, status: result.status, output };
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

function extractZip(path, destination) {
  return new Promise((resolveExtract, rejectExtract) => {
    yauzl.open(path, { lazyEntries: true }, (error, archive) => {
      if (error) {
        rejectExtract(error);
        return;
      }
      archive.readEntry();
      archive.on('entry', async (entry) => {
        try {
          const cleanName = entry.fileName.replace(/\/$/, '');
          validateEntryName(cleanName);
          const target = resolve(destination, entry.fileName);
          if (!target.startsWith(`${destination}${sep}`) && target !== destination) {
            throw new Error(`Entry escapes extraction directory: ${entry.fileName}`);
          }
          if (entry.fileName.endsWith('/')) {
            await mkdir(target, { recursive: true });
            archive.readEntry();
            return;
          }
          await mkdir(dirname(target), { recursive: true });
          archive.openReadStream(entry, async (streamError, readStream) => {
            if (streamError) {
              rejectExtract(streamError);
              return;
            }
            try {
              await pipeline(readStream, createWriteStream(target));
              archive.readEntry();
            } catch (writeError) {
              rejectExtract(writeError);
            }
          });
        } catch (entryError) {
          rejectExtract(entryError);
        }
      });
      archive.on('end', resolveExtract);
      archive.on('error', rejectExtract);
    });
  });
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
  if (lower.endsWith('.zip')) {
    throw new Error(`ZIP file nested inside package: ${entry}`);
  }
  if (basename(lower).startsWith('build_log_engines_of_independence_v01')) {
    throw new Error(`Old build log included: ${entry}`);
  }
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

function buildReport({ hash, entryCount, backslashPaths, extractDir: verifiedExtractDir, commandResults: results }) {
  return [
    '# Engines of Independence v0.9 Package Verification',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Archive',
    '',
    `- ZIP: ${zipPath}`,
    `- SHA-256: ${hash}`,
    `- Entry count: ${entryCount}`,
    `- Backslash paths: ${backslashPaths}`,
    '- Absolute paths: 0',
    '- Traversal paths: 0',
    '- Forbidden dependency/build/cache/git/temp paths: 0',
    '',
    '## Exact Extracted-ZIP Verification',
    '',
    `Extracted to temporary folder: ${verifiedExtractDir}`,
    '',
    ...results.flatMap((result) => [
      `### ${result.command}`,
      '',
      `Exit code: ${result.status}`,
      '',
      '~~~text',
      result.output,
      '~~~',
      ''
    ]),
    '## Result',
    '',
    'PASS. The extracted package installed, typechecked, ran simulation smoke tests, built, and audited with 0 moderate-or-higher vulnerabilities.'
  ].join('\n');
}
