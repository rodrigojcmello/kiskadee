import type {
  BreakpointValue,
  ElementAllSizeValue,
  ElementSeparator,
  ElementSizeValue,
  SchemaSeparators,
  SeparatorProfile,
  SeparatorProfilePalettes
} from '@kiskadee/core';

type ExpandedSeparatorWidth = Partial<
  Record<ElementSizeValue | ElementAllSizeValue, number | Partial<Record<BreakpointValue, number>>>
>;

export type ExpandedElementSeparator = {
  scales: {
    boxWidth: ExpandedSeparatorWidth;
  };
  palettes: SeparatorProfilePalettes;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, canonicalize(value[key])])
  );
}

function resolveProfile(
  separators: SchemaSeparators,
  profileId: string,
  expectedPalettes: { identity?: string; profileId?: string }
): SeparatorProfile {
  const profile = separators.profiles[profileId];
  if (!profile) {
    throw new Error(`[web-builder] Separator profile "${profileId}" is not defined.`);
  }

  const paletteIdentity = JSON.stringify(canonicalize(profile.palettes));
  if (expectedPalettes.identity === undefined) {
    expectedPalettes.identity = paletteIdentity;
    expectedPalettes.profileId = profileId;
  } else if (paletteIdentity !== expectedPalettes.identity) {
    throw new Error(
      `[web-builder] Separator profile "${profileId}" does not preserve the palettes from "${expectedPalettes.profileId}".`
    );
  }

  return profile;
}

/**
 * What
 *     Expands an element separator reference into ordinary box-width and box-color schema values.
 * Why
 *     Separator recipes must reuse the atomic scale and palette pipeline without a runtime bucket.
 */
export function expandElementSeparator(
  separator: ElementSeparator,
  separators: SchemaSeparators
): ExpandedElementSeparator {
  const boxWidth: ExpandedSeparatorWidth = {};
  const expectedPalettes: { identity?: string; profileId?: string } = {};
  let palettes: SeparatorProfilePalettes | undefined;

  for (const [componentScale, assignment] of Object.entries(separator)) {
    const scale = componentScale as ElementSizeValue | ElementAllSizeValue;
    if (typeof assignment === 'string') {
      const profile = resolveProfile(separators, assignment, expectedPalettes);
      boxWidth[scale] = profile.scales.boxWidth;
      palettes ??= profile.palettes;
      continue;
    }

    const byBreakpoint: Partial<Record<BreakpointValue, number>> = {};
    for (const [breakpoint, profileId] of Object.entries(assignment) as [
      BreakpointValue,
      string
    ][]) {
      const profile = resolveProfile(separators, profileId, expectedPalettes);
      byBreakpoint[breakpoint] = profile.scales.boxWidth;
      palettes ??= profile.palettes;
    }
    boxWidth[scale] = byBreakpoint;
  }

  if (!palettes) {
    throw new Error('[web-builder] Separator reference must resolve at least one profile.');
  }

  return { scales: { boxWidth }, palettes };
}
