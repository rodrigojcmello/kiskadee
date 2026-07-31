import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../../..');
const tonalScalePackagePath = path.join(repositoryRoot, 'packages/tonal-scale/package.json');
const generatorSourcePath = path.join(
  repositoryRoot,
  'packages/tonal-scale/src/export/tonal-artifacts.ts'
);
const standaloneGeneratorSourcePath = path.join(
  repositoryRoot,
  'packages/tonal-scale/src/standalone.ts'
);
const presetEvidenceRoot = path.join(repositoryRoot, 'packages/presets/docs/design-systems');

const packageVersion = JSON.parse(fs.readFileSync(tonalScalePackagePath, 'utf8')).version;
const generatorSource = fs.readFileSync(generatorSourcePath, 'utf8');
const standaloneGeneratorSource = fs.readFileSync(standaloneGeneratorSourcePath, 'utf8');
const generatorVersionMatch = generatorSource.match(
  /TONAL_ARTIFACT_GENERATOR\s*=\s*\{[\s\S]*?version:\s*['"]([^'"]+)['"]/
);
const standaloneGeneratorVersionMatch = standaloneGeneratorSource.match(
  /STANDALONE_TONAL_ARTIFACT_GENERATOR\s*=\s*\{[\s\S]*?version:\s*['"]([^'"]+)['"]/
);

const failures = [];

if (!generatorVersionMatch) {
  failures.push(
    `Could not read the exported generator version from ${path.relative(repositoryRoot, generatorSourcePath)}.`
  );
}

if (!standaloneGeneratorVersionMatch) {
  failures.push(
    `Could not read the standalone generator version from ${path.relative(repositoryRoot, standaloneGeneratorSourcePath)}.`
  );
} else if (standaloneGeneratorVersionMatch[1] !== packageVersion) {
  failures.push(
    `Package version ${packageVersion} does not match standalone generator version ${standaloneGeneratorVersionMatch[1]}.`
  );
}

function collectMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

const viewerDocuments = collectMarkdownFiles(presetEvidenceRoot)
  .map((filePath) => ({
    filePath,
    source: fs.readFileSync(filePath, 'utf8')
  }))
  .filter(
    ({ source }) => source.includes('Shared viewer') || source.includes('localhost:3001/?recipe=')
  );

for (const { filePath, source } of viewerDocuments) {
  const relativePath = path.relative(repositoryRoot, filePath);
  const headingMatches = [
    ...source.matchAll(/^### Shared viewer\s+—\s+candidate generator\s+(\d+\.\d+\.\d+)\s*$/gmu)
  ];

  if (headingMatches.length !== 1) {
    failures.push(
      `${relativePath} must contain exactly one "### Shared viewer — candidate generator <version>" heading.`
    );
    continue;
  }

  const documentedVersion = headingMatches[0][1];
  if (documentedVersion !== packageVersion) {
    failures.push(
      `${relativePath} labels its Shared Viewer as ${documentedVersion}; current generator is ${packageVersion}.`
    );
  }
}

if (viewerDocuments.length === 0) {
  failures.push('No preset evidence document with a tonal-scale Shared Viewer was found.');
}

if (failures.length > 0) {
  console.error('Tonal-scale preset documentation audit failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Tonal-scale preset documentation audit passed for package ${packageVersion}.`);
  console.log(`- standalone generator: ${standaloneGeneratorVersionMatch?.[1] ?? 'unavailable'}`);
  console.log(`- multifamily artifact generator: ${generatorVersionMatch?.[1] ?? 'unavailable'}`);
  for (const { filePath } of viewerDocuments) {
    console.log(`- ${path.relative(repositoryRoot, filePath)}`);
  }
}
