import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webBuilderRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(webBuilderRoot, '..', '..');

const targets = [
  path.resolve(webBuilderRoot, 'build'),
  path.resolve(repoRoot, 'packages', 'showcase', 'public', 'build'),
  path.resolve(repoRoot, 'packages', 'showcase', 'registry', 'generated')
];

for (const target of targets) {
  await rm(target, { recursive: true, force: true });
}

console.log('[web-builder] Generated artifacts cleaned');
