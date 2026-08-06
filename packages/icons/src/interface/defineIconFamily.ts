import type { IconName } from './canonical.ts';
import type {
  DefinedIconFamily,
  IconFamilyCatalogEntry,
  IconFamilyDefinitionInput,
  IconFamilyFallbackEntry,
  IconFamilyVariant,
  IconFamilyVariantId,
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

function assertIconFamilyVariantId(familyId: string, variantId: string): void {
  if (!ICON_FAMILY_ID_PATTERN.test(variantId)) {
    throw new Error(
      `[kiskadee/icons] Icon family "${familyId}" variant id "${variantId}" must use lowercase kebab-case.`
    );
  }
}

function assertIconFamilyVariantLabel(familyId: string, variantId: string, label: string): void {
  if (label.trim().length === 0) {
    throw new Error(
      `[kiskadee/icons] Icon family "${familyId}" variant "${variantId}" requires a label.`
    );
  }
}

function freezeVariant(
  familyId: string,
  variantId: IconFamilyVariantId,
  variant: Omit<IconFamilyVariant, 'id'>
): IconFamilyVariant {
  assertIconFamilyVariantId(familyId, variantId);
  assertIconFamilyVariantLabel(familyId, variantId, variant.label);
  return Object.freeze({
    ...variant,
    id: variantId,
    glyphs: Object.freeze({ ...variant.glyphs }),
    ...(variant.rendererProps ? { rendererProps: Object.freeze({ ...variant.rendererProps }) } : {})
  });
}

export function defineIconFamily(definition: IconFamilyDefinitionInput): DefinedIconFamily {
  assertIconFamilyId(definition.id);
  assertIconFamilyLabel(definition.id, definition.label);

  if ('glyphs' in definition) {
    const regular = freezeVariant(definition.id, 'regular', {
      label: 'Regular',
      glyphs: definition.glyphs,
      ...(definition.prepare ? { prepare: definition.prepare } : {})
    });
    return Object.freeze({
      id: definition.id,
      label: definition.label,
      defaultVariant: regular.id,
      variants: Object.freeze({ [regular.id]: regular })
    });
  }

  const variants = Object.fromEntries(
    Object.entries(definition.variants).map(([variantId, variant]) => [
      variantId,
      freezeVariant(definition.id, variantId, variant)
    ])
  );
  if (Object.keys(variants).length === 0) {
    throw new Error(`[kiskadee/icons] Icon family "${definition.id}" requires a variant.`);
  }
  assertIconFamilyVariantId(definition.id, definition.defaultVariant);
  if (!Object.hasOwn(variants, definition.defaultVariant)) {
    throw new Error(
      `[kiskadee/icons] Icon family "${definition.id}" default variant "${definition.defaultVariant}" is not defined.`
    );
  }

  return Object.freeze({
    id: definition.id,
    label: definition.label,
    defaultVariant: definition.defaultVariant,
    variants: Object.freeze(variants)
  });
}

export function defineIconFamilyCatalogEntry(
  entry: Omit<IconFamilyCatalogEntry, 'kind'>
): IconFamilyCatalogEntry {
  assertIconFamilyId(entry.id);
  assertIconFamilyLabel(entry.id, entry.label);
  assertIconFamilyVariantId(entry.id, entry.defaultVariant);
  const variantIds = new Set<string>();
  const variants = entry.variants.map((variant) => {
    assertIconFamilyVariantId(entry.id, variant.id);
    assertIconFamilyVariantLabel(entry.id, variant.id, variant.label);
    if (variantIds.has(variant.id)) {
      throw new Error(
        `[kiskadee/icons] Icon family "${entry.id}" catalog variant "${variant.id}" was registered more than once.`
      );
    }
    variantIds.add(variant.id);
    return Object.freeze({ ...variant });
  });
  if (!variantIds.has(entry.defaultVariant)) {
    throw new Error(
      `[kiskadee/icons] Icon family "${entry.id}" catalog default variant "${entry.defaultVariant}" is not registered.`
    );
  }
  return Object.freeze({
    kind: 'family',
    ...entry,
    variants: Object.freeze(variants)
  });
}

export function defineIconFamilyFallback(
  entry: Omit<IconFamilyFallbackEntry, 'kind'>
): IconFamilyFallbackEntry {
  assertIconFamilyId(entry.id);
  assertIconFamilyId(entry.fallbackTo);
  if (entry.fallbackVariant) {
    assertIconFamilyVariantId(entry.fallbackTo, entry.fallbackVariant);
  }
  assertIconFamilyLabel(entry.id, entry.label);
  return Object.freeze({ kind: 'fallback', ...entry });
}

export function resolveIconFamilyVariant(
  family: DefinedIconFamily,
  variantId: IconFamilyVariantId = family.defaultVariant
): IconFamilyVariant | undefined {
  return family.variants[variantId];
}

export function resolveIconGlyph(
  family: DefinedIconFamily,
  name: IconName,
  variantId?: IconFamilyVariantId
): ResolvedIconGlyph | undefined {
  const variant = resolveIconFamilyVariant(family, variantId);
  const definition = variant?.glyphs[name] as IconGlyphDefinition | undefined;
  if (!definition) return undefined;

  if (
    typeof definition !== 'object' ||
    definition === null ||
    !Object.hasOwn(definition, 'glyph')
  ) {
    return {
      direction: 'fixed',
      glyph: definition as IconGlyphRenderer,
      name,
      ...(variant?.rendererProps ? { rendererProps: variant.rendererProps } : {})
    };
  }

  return {
    direction: definition.direction ?? 'fixed',
    glyph: definition.glyph,
    name,
    ...(variant?.rendererProps ? { rendererProps: variant.rendererProps } : {}),
    ...(definition.rtlGlyph ? { rtlGlyph: definition.rtlGlyph } : {})
  };
}
