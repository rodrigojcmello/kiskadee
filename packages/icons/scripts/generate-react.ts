import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  applyOpticalTransformToSvg,
  type OpticalTransform,
  validateOpticalTransform
} from './icon-optical.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(packageRoot, 'assets');
const manifestPath = path.resolve(packageRoot, 'metadata/icons.json');
const familiesDir = path.resolve(packageRoot, 'src/families');

const GENERATED_HEADER =
  '// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.';

const JSX_ATTRIBUTES = new Map([
  ['class', 'className'],
  ['clip-path', 'clipPath'],
  ['clip-rule', 'clipRule'],
  ['color-interpolation-filters', 'colorInterpolationFilters'],
  ['enable-background', 'enableBackground'],
  ['fill-opacity', 'fillOpacity'],
  ['fill-rule', 'fillRule'],
  ['font-family', 'fontFamily'],
  ['font-size', 'fontSize'],
  ['flood-opacity', 'floodOpacity'],
  ['stop-color', 'stopColor'],
  ['stop-opacity', 'stopOpacity'],
  ['stroke-dasharray', 'strokeDasharray'],
  ['stroke-dashoffset', 'strokeDashoffset'],
  ['stroke-linecap', 'strokeLinecap'],
  ['stroke-linejoin', 'strokeLinejoin'],
  ['stroke-miterlimit', 'strokeMiterlimit'],
  ['stroke-opacity', 'strokeOpacity'],
  ['stroke-width', 'strokeWidth'],
  ['text-anchor', 'textAnchor'],
  ['xml:space', 'xmlSpace'],
  ['xmlns:xlink', 'xmlnsXlink']
]);

export interface IconPresentationMetadata {
  colorBehavior: 'adaptive' | 'currentColor' | 'fixed' | 'gradient';
  source: string;
}

export interface IconConstructionMetadata {
  defaultPresentation: string;
  opticalTransform: OpticalTransform;
  presentations: Record<string, IconPresentationMetadata>;
}

export interface IconMetadata {
  componentName: string;
  constructions: Record<string, IconConstructionMetadata>;
  defaultConstruction: string;
  family: string;
  id: string;
  origin: 'third-party';
  provenanceUrl?: string;
}

export interface IconFamilyMetadata {
  kind: 'brand';
  license: string;
  origin: 'third-party';
  provenanceDocument?: string;
  provenanceUrl?: string;
}

export interface IconManifest {
  families: Record<string, IconFamilyMetadata>;
  formatVersion: 4;
  icons: IconMetadata[];
  sourceContract: 'kiskadee-icon-svg-v4';
}

interface GenerateOptions {
  check?: boolean;
}

function toJsxAttributes(svg: string): string {
  let result = svg;

  for (const [svgAttribute, jsxAttribute] of JSX_ATTRIBUTES) {
    result = result.replaceAll(`${svgAttribute}=`, `${jsxAttribute}=`);
  }

  return result;
}

function normalizeSvgSource(svg: string): string {
  return svg
    .trim()
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function renderSvg(svg: string): string {
  const source = toJsxAttributes(normalizeSvgSource(svg)).replace(/^<!--[\s\S]*?-->\s*/, '');

  if (!source.startsWith('<svg') || !source.endsWith('</svg>')) {
    throw new Error('Canonical icon sources must contain one complete <svg> root.');
  }

  return source.replace(/^<svg\s+([\s\S]*?)>/, (_root, rawAttributes: string) => {
    const attributes = rawAttributes.replace(/\b(?:className|height|width)="[^"]*"\s*/g, '').trim();

    return `<svg width="1em" height="1em" ${attributes} aria-hidden="true" focusable="false" {...props}>`;
  });
}

function renderStringUnion(values: string[]): string {
  return values.map((value) => `'${value}'`).join(' | ');
}

function renderIconTypes(icon: IconMetadata): string {
  const constructions = Object.entries(icon.constructions).sort(([left], [right]) =>
    left.localeCompare(right)
  );
  const constructionType = `export type ${icon.componentName}Construction = ${renderStringUnion(
    constructions.map(([construction]) => construction)
  )};`;
  const presentationNames = [
    ...new Set(constructions.flatMap(([, construction]) => Object.keys(construction.presentations)))
  ].sort();
  const presentationType = `export type ${
    icon.componentName
  }Presentation = ${renderStringUnion(presentationNames)};`;
  const propsBranches = constructions.map(([constructionName, construction]) => {
    const constructionProperty =
      constructionName === icon.defaultConstruction
        ? `construction?: '${constructionName}';`
        : `construction: '${constructionName}';`;

    return [
      '  | {',
      `      ${constructionProperty}`,
      `      presentation?: ${renderStringUnion(Object.keys(construction.presentations).sort())};`,
      '    }'
    ].join('\n');
  });

  return [
    constructionType,
    presentationType,
    '',
    `export type ${icon.componentName}Props = IconProps & (`,
    ...propsBranches,
    ');',
    ''
  ].join('\n');
}

function renderComponent(icon: IconMetadata, renderedSvgs: Map<string, string>): string {
  const propsType = `${icon.componentName}Props`;
  const iconTypes = renderIconTypes(icon);
  const importLine = "import type { IconProps } from '../../Icon.types.ts';";
  const constructionDefaults = Object.fromEntries(
    Object.entries(icon.constructions).map(([name, construction]) => [
      name,
      construction.defaultPresentation
    ])
  );
  const branches = Object.entries(icon.constructions)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([construction, definition]) =>
      Object.keys(definition.presentations)
        .sort()
        .map((presentation) => {
          const key = `${construction}.${presentation}`;
          const svg = renderedSvgs.get(key);
          if (!svg) throw new Error(`Missing rendered SVG for ${icon.id}.${key}.`);

          return [
            `  if (resolvedConstruction === '${construction}' && resolvedPresentation === '${presentation}') {`,
            '    return (',
            indent(renderSvg(svg), 6),
            '    );',
            '  }'
          ].join('\n');
        })
    )
    .join('\n\n');

  return [
    GENERATED_HEADER,
    importLine,
    '',
    iconTypes,
    `const DEFAULT_PRESENTATIONS: Record<${icon.componentName}Construction, ${icon.componentName}Presentation> = ${JSON.stringify(
      constructionDefaults
    )};`,
    '',
    `export function ${icon.componentName}({`,
    `  construction = '${icon.defaultConstruction}',`,
    '  presentation,',
    '  ...props',
    `}: ${propsType}) {`,
    `  const resolvedConstruction = construction as ${icon.componentName}Construction;`,
    '  const resolvedPresentation =',
    `    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];`,
    '',
    branches,
    '',
    '  throw new Error(',
    `    \`Unsupported ${icon.componentName} construction/presentation: \${resolvedConstruction}.\${String(resolvedPresentation)}\``,
    '  );',
    '}',
    ''
  ].join('\n');
}

function indent(value: string, spaces: number): string {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function renderFamilyIndex(icons: IconMetadata[]): string {
  return `${GENERATED_HEADER}\n${icons
    .sort((a, b) => a.componentName.localeCompare(b.componentName))
    .map((icon) => `export { ${icon.componentName} } from './${icon.componentName}.tsx';`)
    .join('\n')}\n`;
}

async function readManifest(): Promise<IconManifest> {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as IconManifest;
  validateIconManifest(manifest);

  return manifest;
}

export function validateIconManifest(manifest: IconManifest): void {
  if (manifest.formatVersion !== 4 || manifest.sourceContract !== 'kiskadee-icon-svg-v4') {
    throw new Error('Unsupported icon manifest contract.');
  }
  if (
    Object.keys(manifest.families).length !== 1 ||
    !manifest.families.social ||
    manifest.families.social.kind !== 'brand'
  ) {
    throw new Error('The icon manifest must describe only the social brand family.');
  }

  const ids = new Set<string>();
  const componentNames = new Set<string>();

  for (const icon of manifest.icons) {
    const familyId = `${icon.family}:${icon.id}`;
    const familyComponentName = `${icon.family}:${icon.componentName}`;

    if (ids.has(familyId)) {
      throw new Error(`Duplicate icon id "${icon.id}" in family "${icon.family}".`);
    }
    if (componentNames.has(familyComponentName)) {
      throw new Error(
        `Duplicate component name "${icon.componentName}" in family "${icon.family}".`
      );
    }
    if (!(icon.defaultConstruction in icon.constructions)) {
      throw new Error(`${icon.id} has an unknown default construction.`);
    }
    if (!/^[A-Z][A-Za-z0-9]*Icon$/.test(icon.componentName)) {
      throw new Error(`Invalid icon component name "${icon.componentName}".`);
    }
    if (icon.family !== 'social') {
      throw new Error(`Unsupported icon family "${icon.family}".`);
    }
    if (Object.keys(icon.constructions).length === 0) {
      throw new Error(`${icon.id} must declare at least one construction.`);
    }

    for (const [constructionName, construction] of Object.entries(icon.constructions)) {
      if (!(construction.defaultPresentation in construction.presentations)) {
        throw new Error(`${icon.id}.${constructionName} has an unknown default presentation.`);
      }
      if (Object.keys(construction.presentations).length === 0) {
        throw new Error(`${icon.id}.${constructionName} must declare at least one presentation.`);
      }
      if (!construction.opticalTransform) {
        throw new Error(`${icon.id}.${constructionName} must declare an optical transform.`);
      }
      validateOpticalTransform(construction.opticalTransform);
    }

    ids.add(familyId);
    componentNames.add(familyComponentName);
  }
}

async function createExpectedOutputs(manifest: IconManifest): Promise<Map<string, string>> {
  const outputs = new Map<string, string>();
  const iconsByFamily = new Map<string, IconMetadata[]>();

  for (const icon of manifest.icons) {
    const familyIcons = iconsByFamily.get(icon.family) ?? [];
    familyIcons.push(icon);
    iconsByFamily.set(icon.family, familyIcons);

    const renderedSvgs = new Map<string, string>();

    for (const [constructionName, construction] of Object.entries(icon.constructions)) {
      for (const [presentation, definition] of Object.entries(construction.presentations)) {
        const assetPath = path.resolve(assetsDir, definition.source);
        const relativeAssetPath = path.relative(assetsDir, assetPath);

        if (relativeAssetPath.startsWith('..') || path.isAbsolute(relativeAssetPath)) {
          throw new Error(
            `${icon.id}.${constructionName}.${presentation} resolves outside the assets directory.`
          );
        }

        const sourceSvg = await readFile(assetPath, 'utf8');
        const renderedSvg = applyOpticalTransformToSvg(sourceSvg, construction.opticalTransform);

        renderedSvgs.set(`${constructionName}.${presentation}`, renderedSvg);
      }
    }

    outputs.set(
      path.resolve(familiesDir, icon.family, `${icon.componentName}.tsx`),
      renderComponent(icon, renderedSvgs)
    );
  }

  for (const [family, icons] of iconsByFamily) {
    outputs.set(path.resolve(familiesDir, family, 'index.ts'), renderFamilyIndex(icons));
  }

  return outputs;
}

async function findGeneratedFiles(): Promise<string[]> {
  const files: string[] = [];

  for (const familyEntry of await readdir(familiesDir, { withFileTypes: true })) {
    if (!familyEntry.isDirectory()) continue;

    const familyPath = path.resolve(familiesDir, familyEntry.name);
    for (const fileEntry of await readdir(familyPath, { withFileTypes: true })) {
      if (!fileEntry.isFile()) continue;
      if (!(fileEntry.name.endsWith('Icon.tsx') || fileEntry.name === 'index.ts')) continue;
      files.push(path.resolve(familyPath, fileEntry.name));
    }
  }

  return files.sort();
}

async function assertGeneratedOutputs(outputs: Map<string, string>): Promise<void> {
  const mismatches: string[] = [];

  for (const [filePath, expected] of outputs) {
    const actual = await readFile(filePath, 'utf8').catch(() => null);
    if (actual !== expected) mismatches.push(path.relative(packageRoot, filePath));
  }

  for (const filePath of await findGeneratedFiles()) {
    if (!outputs.has(filePath)) mismatches.push(path.relative(packageRoot, filePath));
  }

  if (mismatches.length > 0) {
    throw new Error(
      `Generated React icons are stale:\n${[...new Set(mismatches)]
        .sort()
        .map((filePath) => `- ${filePath}`)
        .join('\n')}`
    );
  }
}

async function writeGeneratedOutputs(outputs: Map<string, string>): Promise<void> {
  const expectedFiles = new Set(outputs.keys());

  for (const filePath of await findGeneratedFiles()) {
    if (!expectedFiles.has(filePath)) await rm(filePath);
  }

  for (const [filePath, content] of outputs) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }
}

/**
 * What
 *     Generates the React adapter from canonical SVG assets and their manifest.
 * Why
 *     React remains a public consumer format without becoming the icon source of truth.
 */
export async function generateReactComponents(options: GenerateOptions = {}): Promise<void> {
  const manifest = await readManifest();
  const outputs = await createExpectedOutputs(manifest);

  if (options.check) {
    await assertGeneratedOutputs(outputs);
    return;
  }

  await writeGeneratedOutputs(outputs);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateReactComponents({ check: process.argv.includes('--check') }).catch((error) => {
    console.error('[icons] Failed to generate React icons:', error);
    process.exitCode = 1;
  });
}
