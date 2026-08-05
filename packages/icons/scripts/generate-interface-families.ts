import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CANONICAL_ICON_NAMES, type CanonicalIconName } from '../src/interface/canonical.ts';

type Direction = 'fixed' | 'mirror' | 'unique';

type FamilyDirectionMetadata = {
  directions?: Partial<Record<CanonicalIconName, Direction>>;
  rtlMappings?: Partial<Record<CanonicalIconName, string>>;
};

type ImportStrategy =
  | 'barrel'
  | 'export-subpath'
  | 'export-subpath-without-icon'
  | 'fluent-headless';

type SvgFamily = FamilyDirectionMetadata & {
  label: string;
  adapter: 'svg';
  package: string;
  importStrategy?: ImportStrategy;
  importSubpathOverrides?: Record<string, string>;
  license: string;
  source: string;
  defaults?: Record<string, unknown>;
  mappings: Record<CanonicalIconName, string>;
};

type FontAwesomeFamily = Omit<SvgFamily, 'adapter' | 'defaults'> & {
  adapter: 'font-awesome';
};

type MaterialSymbolsFamily = Omit<SvgFamily, 'adapter' | 'defaults'> & {
  adapter: 'material-symbols';
};

type Family = SvgFamily | FontAwesomeFamily | MaterialSymbolsFamily;

type InterfaceFamilyMetadata = {
  formatVersion: 1;
  families: Record<string, Family>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const metadataPath = path.resolve(packageRoot, 'metadata/interface-families.json');
const outputDirectory = path.resolve(packageRoot, 'src/interface/families');
const generatedHeader = '// Generated from metadata/interface-families.json. Do not edit manually.';

function variableName(exportName: string): string {
  return `glyph${exportName.replace(/[^A-Za-z0-9_$]/g, '')}`;
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function importModule(family: SvgFamily, exportName: string): string {
  const override = family.importSubpathOverrides?.[exportName];
  if (override) return `${family.package}/${override}`;

  switch (family.importStrategy ?? 'barrel') {
    case 'export-subpath':
      return `${family.package}/${exportName}`;
    case 'export-subpath-without-icon':
      return `${family.package}/${exportName.replace(/Icon$/, '')}`;
    case 'fluent-headless':
      return `${family.package}/headless/svg/${toKebabCase(
        exportName.replace(/(?:Filled|Regular)$/, '')
      )}`;
    default:
      return family.package;
  }
}

function renderImports(family: SvgFamily, exports: readonly string[]): string {
  const exportsByModule = new Map<string, string[]>();

  for (const exportName of exports) {
    const moduleName = importModule(family, exportName);
    const moduleExports = exportsByModule.get(moduleName) ?? [];
    moduleExports.push(exportName);
    exportsByModule.set(moduleName, moduleExports);
  }

  return [...exportsByModule.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([moduleName, moduleExports]) => {
      const sortedExports = moduleExports.sort();
      if (sortedExports.length === 1) {
        return `import { ${sortedExports[0]} } from '${moduleName}';`;
      }
      return `import {\n${sortedExports.map((name) => `  ${name},`).join('\n')}\n} from '${moduleName}';`;
    })
    .join('\n');
}

function renderDefinition(
  family: Family,
  iconName: CanonicalIconName,
  upstreamName: string
): string {
  const glyphExpression =
    family.adapter === 'material-symbols'
      ? `createMaterialSymbolGlyph(${JSON.stringify(upstreamName)})`
      : variableName(upstreamName);
  const direction = family.directions?.[iconName];
  const rtlUpstreamName = family.rtlMappings?.[iconName];
  const rtlGlyphExpression = rtlUpstreamName
    ? family.adapter === 'material-symbols'
      ? `createMaterialSymbolGlyph(${JSON.stringify(rtlUpstreamName)})`
      : variableName(rtlUpstreamName)
    : undefined;
  const value = direction
    ? `{ glyph: ${glyphExpression}, direction: '${direction}'${
        rtlGlyphExpression ? `, rtlGlyph: ${rtlGlyphExpression}` : ''
      } }`
    : glyphExpression;
  return `    ${JSON.stringify(iconName)}: ${value}`;
}

function renderSvgFamily(familyId: string, family: SvgFamily): string {
  const exports = [
    ...new Set([...Object.values(family.mappings), ...Object.values(family.rtlMappings ?? {})])
  ].sort();
  const imports = renderImports(family, exports);
  const defaults = JSON.stringify(family.defaults ?? {});
  const glyphs = exports
    .map((name) => `const ${variableName(name)} = createSvgGlyph(${name}, ${defaults});`)
    .join('\n');
  const definitions = CANONICAL_ICON_NAMES.map((name) =>
    renderDefinition(family, name, family.mappings[name])
  ).join(',\n');

  return `${generatedHeader}
${imports}
import { createSvgGlyph } from '../createSvgGlyph.tsx';
import { defineIconFamily } from '../defineIconFamily.ts';
import type { CompleteCanonicalGlyphMap } from '../types.ts';

${glyphs}

const glyphMap = {
${definitions}
} satisfies CompleteCanonicalGlyphMap;

export const ${toIdentifier(familyId)}IconFamily = defineIconFamily({
  id: ${JSON.stringify(familyId)},
  label: ${JSON.stringify(family.label)},
  glyphs: glyphMap
});
`;
}

function renderFontAwesomeFamily(familyId: string, family: FontAwesomeFamily): string {
  const exports = [
    ...new Set([...Object.values(family.mappings), ...Object.values(family.rtlMappings ?? {})])
  ].sort();
  const imports = renderImports(family, exports);
  const glyphs = exports
    .map((name) => `const ${variableName(name)} = createFontAwesomeGlyph(${name});`)
    .join('\n');
  const definitions = CANONICAL_ICON_NAMES.map((name) =>
    renderDefinition(family, name, family.mappings[name])
  ).join(',\n');

  return `${generatedHeader}
${imports}
import { createFontAwesomeGlyph } from '../createFontAwesomeGlyph.tsx';
import { defineIconFamily } from '../defineIconFamily.ts';
import type { CompleteCanonicalGlyphMap } from '../types.ts';

${glyphs}

const glyphMap = {
${definitions}
} satisfies CompleteCanonicalGlyphMap;

export const ${toIdentifier(familyId)}IconFamily = defineIconFamily({
  id: ${JSON.stringify(familyId)},
  label: ${JSON.stringify(family.label)},
  glyphs: glyphMap
});
`;
}

function renderMaterialFamily(familyId: string, family: MaterialSymbolsFamily): string {
  const ligatures = [
    ...new Set([...Object.values(family.mappings), ...Object.values(family.rtlMappings ?? {})])
  ].sort();
  const definitions = CANONICAL_ICON_NAMES.map((name) =>
    renderDefinition(family, name, family.mappings[name])
  ).join(',\n');

  return `${generatedHeader}
import { defineIconFamily } from '../defineIconFamily.ts';
import {
  createMaterialSymbolGlyph,
  prepareMaterialSymbolsOutlined
} from '../materialSymbols.tsx';
import type { CompleteCanonicalGlyphMap } from '../types.ts';

const materialLigatures = ${JSON.stringify(ligatures)} as const;

const glyphMap = {
${definitions}
} satisfies CompleteCanonicalGlyphMap;

export const ${toIdentifier(familyId)}IconFamily = defineIconFamily({
  id: ${JSON.stringify(familyId)},
  label: ${JSON.stringify(family.label)},
  glyphs: glyphMap,
  prepare: () => prepareMaterialSymbolsOutlined(materialLigatures)
});
`;
}

function toIdentifier(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function assertCoverage(metadata: InterfaceFamilyMetadata): void {
  for (const [familyId, family] of Object.entries(metadata.families)) {
    const mapped = new Set(Object.keys(family.mappings));
    const missing = CANONICAL_ICON_NAMES.filter((name) => !mapped.has(name));
    const unknown = [...mapped].filter(
      (name) => !(CANONICAL_ICON_NAMES as readonly string[]).includes(name)
    );
    if (missing.length > 0 || unknown.length > 0) {
      throw new Error(
        `[icons] ${familyId} coverage mismatch. Missing: ${missing.join(', ') || 'none'}. Unknown: ${
          unknown.join(', ') || 'none'
        }.`
      );
    }

    const directionNames = Object.keys(family.directions ?? {});
    const rtlNames = Object.keys(family.rtlMappings ?? {});
    const unknownDirectionalNames = [...new Set([...directionNames, ...rtlNames])].filter(
      (name) => !(CANONICAL_ICON_NAMES as readonly string[]).includes(name)
    );
    if (unknownDirectionalNames.length > 0) {
      throw new Error(
        `[icons] ${familyId} direction metadata contains unknown names: ${unknownDirectionalNames.join(
          ', '
        )}.`
      );
    }

    for (const name of CANONICAL_ICON_NAMES) {
      const direction = family.directions?.[name];
      const hasRtlGlyph = family.rtlMappings?.[name] !== undefined;
      if (direction === 'unique' && !hasRtlGlyph) {
        throw new Error(`[icons] ${familyId}.${name} requires an RTL glyph mapping.`);
      }
      if (direction !== 'unique' && hasRtlGlyph) {
        throw new Error(
          `[icons] ${familyId}.${name} provides an RTL glyph without direction "unique".`
        );
      }
    }
  }
}

async function writeOrCheckGeneratedFile(
  filePath: string,
  source: string,
  check: boolean
): Promise<void> {
  if (!check) {
    await writeFile(filePath, source, 'utf8');
    return;
  }

  let current: string | undefined;
  try {
    current = await readFile(filePath, 'utf8');
  } catch {
    // A missing generated file is reported below with the same actionable message.
  }

  if (current !== source) {
    throw new Error(
      `[icons] Generated interface family is stale: ${path.relative(packageRoot, filePath)}`
    );
  }
}

export async function generateInterfaceFamilies(options: { check?: boolean } = {}): Promise<void> {
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as InterfaceFamilyMetadata;
  assertCoverage(metadata);
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(
    Object.entries(metadata.families).map(async ([familyId, family]) => {
      const source =
        family.adapter === 'svg'
          ? renderSvgFamily(familyId, family)
          : family.adapter === 'font-awesome'
            ? renderFontAwesomeFamily(familyId, family)
            : renderMaterialFamily(familyId, family);
      await writeOrCheckGeneratedFile(
        path.resolve(outputDirectory, `${familyId}.tsx`),
        source,
        options.check ?? false
      );
    })
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateInterfaceFamilies({ check: process.argv.includes('--check') }).catch((error) => {
    console.error('[icons] Failed to generate interface families:', error);
    process.exitCode = 1;
  });
}
