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
  ['fill-opacity', 'fillOpacity'],
  ['fill-rule', 'fillRule'],
  ['font-family', 'fontFamily'],
  ['font-size', 'fontSize'],
  ['stop-color', 'stopColor'],
  ['stop-opacity', 'stopOpacity'],
  ['stroke-dasharray', 'strokeDasharray'],
  ['stroke-dashoffset', 'strokeDashoffset'],
  ['stroke-linecap', 'strokeLinecap'],
  ['stroke-linejoin', 'strokeLinejoin'],
  ['stroke-miterlimit', 'strokeMiterlimit'],
  ['stroke-opacity', 'strokeOpacity'],
  ['stroke-width', 'strokeWidth'],
  ['text-anchor', 'textAnchor']
]);

export interface IconPresentationMetadata {
  colorBehavior: 'currentColor' | 'fixed' | 'gradient';
  source: string;
}

export interface IconMetadata {
  componentName: string;
  defaultPresentation: string;
  family: string;
  id: string;
  opticalTransform?: OpticalTransform;
  origin: 'kiskadee' | 'third-party';
  presentations: Record<string, IconPresentationMetadata>;
  provenanceUrl?: string;
}

export interface IconManifest {
  formatVersion: 2;
  icons: IconMetadata[];
  sourceContract: 'kiskadee-icon-svg-v2';
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

function renderSvg(svg: string): string {
  const source = toJsxAttributes(svg.trim());

  if (!source.startsWith('<svg ') || !source.endsWith('</svg>')) {
    throw new Error('Canonical icon sources must contain one complete <svg> root.');
  }

  return source.replace(
    /^<svg ([^>]*)>/,
    '<svg width="1em" height="1em" $1 aria-hidden="true" focusable="false" {...props}>'
  );
}

function renderPresentationType(icon: IconMetadata, presentations: string[]): string {
  if (icon.family !== 'social') return '';

  const union = presentations.map((presentation) => `'${presentation}'`).join(' | ');

  return [
    `export type ${icon.componentName}Presentation = ${union};`,
    '',
    `export interface ${icon.componentName}Props extends IconProps {`,
    `  presentation?: ${icon.componentName}Presentation;`,
    '}',
    ''
  ].join('\n');
}

function renderComponent(icon: IconMetadata, presentationSvgs: Map<string, string>): string {
  const presentations = Object.keys(icon.presentations).sort();
  const propsType = icon.family === 'social' ? `${icon.componentName}Props` : 'IconProps';
  const presentationType = renderPresentationType(icon, presentations);
  const importLine = "import type { IconProps } from '../../Icon.types.ts';";

  if (presentations.length === 1) {
    const presentation = presentations[0];
    const svg = presentationSvgs.get(presentation);

    if (!svg) throw new Error(`Missing rendered SVG for ${icon.id}.${presentation}.`);

    const signature =
      icon.family === 'social'
        ? `export function ${icon.componentName}({ presentation: _presentation = '${presentation}', ...props }: ${propsType}) {`
        : `export function ${icon.componentName}(props: ${propsType}) {`;

    return [
      GENERATED_HEADER,
      importLine,
      '',
      presentationType,
      signature,
      '  return (',
      indent(renderSvg(svg), 4),
      '  );',
      '}',
      ''
    ].join('\n');
  }

  const branches = presentations
    .map((presentation) => {
      const svg = presentationSvgs.get(presentation);
      if (!svg) throw new Error(`Missing rendered SVG for ${icon.id}.${presentation}.`);

      return [
        `  if (presentation === '${presentation}') {`,
        '    return (',
        indent(renderSvg(svg), 6),
        '    );',
        '  }'
      ].join('\n');
    })
    .join('\n\n');

  return [
    GENERATED_HEADER,
    importLine,
    '',
    presentationType,
    `export function ${icon.componentName}({`,
    `  presentation = '${icon.defaultPresentation}',`,
    '  ...props',
    `}: ${propsType}) {`,
    branches,
    '',
    '  return null;',
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

function renderFamilyIndex(family: string, icons: IconMetadata[]): string {
  const typeExport =
    family === 'kiskadee' ? "export type { IconProps } from '../../Icon.types.ts';\n" : '';

  return `${GENERATED_HEADER}\n${typeExport}${icons
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
  if (manifest.formatVersion !== 2 || manifest.sourceContract !== 'kiskadee-icon-svg-v2') {
    throw new Error('Unsupported icon manifest contract.');
  }

  const ids = new Set<string>();
  const componentNames = new Set<string>();

  for (const icon of manifest.icons) {
    if (ids.has(icon.id)) throw new Error(`Duplicate icon id "${icon.id}".`);
    if (componentNames.has(icon.componentName)) {
      throw new Error(`Duplicate component name "${icon.componentName}".`);
    }
    if (!(icon.defaultPresentation in icon.presentations)) {
      throw new Error(`${icon.id} has an unknown default presentation.`);
    }
    if (!/^[A-Z][A-Za-z0-9]*Icon$/.test(icon.componentName)) {
      throw new Error(`Invalid icon component name "${icon.componentName}".`);
    }
    if (icon.family === 'social' && !icon.opticalTransform) {
      throw new Error(`${icon.id} must declare an optical transform.`);
    }
    if (icon.family !== 'social' && icon.opticalTransform) {
      throw new Error(`${icon.id} cannot declare a social optical transform.`);
    }
    if (icon.opticalTransform) validateOpticalTransform(icon.opticalTransform);

    ids.add(icon.id);
    componentNames.add(icon.componentName);
  }
}

async function createExpectedOutputs(manifest: IconManifest): Promise<Map<string, string>> {
  const outputs = new Map<string, string>();
  const iconsByFamily = new Map<string, IconMetadata[]>();

  for (const icon of manifest.icons) {
    const familyIcons = iconsByFamily.get(icon.family) ?? [];
    familyIcons.push(icon);
    iconsByFamily.set(icon.family, familyIcons);

    const presentationSvgs = new Map<string, string>();

    for (const [presentation, definition] of Object.entries(icon.presentations)) {
      const assetPath = path.resolve(assetsDir, definition.source);
      const relativeAssetPath = path.relative(assetsDir, assetPath);

      if (relativeAssetPath.startsWith('..') || path.isAbsolute(relativeAssetPath)) {
        throw new Error(`${icon.id}.${presentation} resolves outside the assets directory.`);
      }

      const sourceSvg = await readFile(assetPath, 'utf8');
      const renderedSvg = icon.opticalTransform
        ? applyOpticalTransformToSvg(sourceSvg, icon.opticalTransform)
        : sourceSvg;

      presentationSvgs.set(presentation, renderedSvg);
    }

    outputs.set(
      path.resolve(familiesDir, icon.family, `${icon.componentName}.tsx`),
      renderComponent(icon, presentationSvgs)
    );
  }

  for (const [family, icons] of iconsByFamily) {
    outputs.set(path.resolve(familiesDir, family, 'index.ts'), renderFamilyIndex(family, icons));
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
