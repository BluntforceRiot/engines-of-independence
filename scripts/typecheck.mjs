import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['src/scripts', 'scripts'];
const files = roots.flatMap((root) => collectJavaScript(root));

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

console.log(`Syntax check passed for ${files.length} JavaScript modules.`);

function collectJavaScript(root) {
  const entries = readdirSync(root);
  const files = [];

  for (const entry of entries) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectJavaScript(path));
    } else if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
      files.push(relative(process.cwd(), path));
    }
  }

  return files;
}
