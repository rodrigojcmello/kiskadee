import type { IconName } from './canonical.ts';
import type {
  DefinedIconFamily,
  IconFamilyCatalogEntry,
  IconFamilyFallbackEntry,
  IconGlyphDefinition,
  IconGlyphRenderer,
  ResolvedIconGlyph
} from './types.ts';

const ICON_FAMILY_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function assertIconFamilyId(id: string): void {
  if (!ICON_FAMILY_ID_PATTERN.test(id)) {
    throw new Error(`[kiskadee/icons] Icon family id "${id}" must use lowercase kebab-case.`);
  }
}

function assertIconFamilyLabel(id: string, label: string): void {
  if (label.trim().length === 0) {
    throw new Error(`[kiskadee/icons] Icon family "${id}" requires a label.`);
  }
}

export function defineIconFamily(definition: DefinedIconFamily): DefinedIconFamily {
  assertIconFamilyId(definition.id);
  assertIconFamilyLabel(definition.id, definition.label);
  return Object.freeze({
    ...definition,
    glyphs: Object.freeze({ ...definition.glyphs })
  });
}

export function defineIconFamilyCatalogEntry(
  entry: Omit<IconFamilyCatalogEntry, 'kind'>
): IconFamilyCatalogEntry {
  assertIconFamilyId(entry.id);
  assertIconFamilyLabel(entry.id, entry.label);
  return Object.freeze({ kind: 'family', ...entry });
}

export function defineIconFamilyFallback(
  entry: Omit<IconFamilyFallbackEntry, 'kind'>
): IconFamilyFallbackEntry {
  assertIconFamilyId(entry.id);
  assertIconFamilyId(entry.fallbackTo);
  assertIconFamilyLabel(entry.id, entry.label);
  return Object.freeze({ kind: 'fallback', ...entry });
}

export function resolveIconGlyph(
  family: DefinedIconFamily,
  name: IconName
): ResolvedIconGlyph | undefined {
  const definition = family.glyphs[name] as IconGlyphDefinition | undefined;
  if (!definition) return undefined;

  if (
    typeof definition !== 'object' ||
    definition === null ||
    !Object.hasOwn(definition, 'glyph')
  ) {
    return { direction: 'fixed', glyph: definition as IconGlyphRenderer, name };
  }

  return {
    direction: definition.direction ?? 'fixed',
    glyph: definition.glyph,
    name,
    ...(definition.rtlGlyph ? { rtlGlyph: definition.rtlGlyph } : {})
  };
}
