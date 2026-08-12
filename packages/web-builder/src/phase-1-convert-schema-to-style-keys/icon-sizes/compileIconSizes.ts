import type {
  BreakpointValue,
  ElementAllSizeValue,
  ElementIconSize,
  ElementSizeValue,
  IconSizeByBreakpoint,
  SchemaIconSizes
} from '@kiskadee/core';

type NumericIconSizeByBreakpoint = Partial<Record<BreakpointValue, number>>;
type NumericIconSizeByComponentScale = Partial<
  Record<ElementSizeValue | ElementAllSizeValue, number | NumericIconSizeByBreakpoint>
>;

export type ExpandedIconSizeScales = {
  boxHeight: NumericIconSizeByComponentScale;
  boxWidth: NumericIconSizeByComponentScale;
};

function resolveIconSize(iconSizes: SchemaIconSizes, size: ElementSizeValue): number {
  const value = iconSizes[size];
  if (value === undefined) {
    throw new Error(`[web-builder] Icon size "${size}" is not defined in global.iconSizes.`);
  }
  return value;
}

/**
 * What
 *     Resolves component-owned icon-size references into square numeric scale maps.
 * Why
 *     The normal scale pipeline must remain the only owner of atomic CSS and responsive classes.
 */
export function expandElementIconSize(
  iconSize: ElementIconSize,
  iconSizes: SchemaIconSizes
): ExpandedIconSizeScales {
  const resolved: NumericIconSizeByComponentScale = {};

  for (const [componentScale, assignment] of Object.entries(iconSize)) {
    if (assignment === undefined) continue;
    const scale = componentScale as ElementSizeValue | ElementAllSizeValue;

    if (typeof assignment === 'string') {
      resolved[scale] = resolveIconSize(iconSizes, assignment as ElementSizeValue);
      continue;
    }

    const byBreakpoint: NumericIconSizeByBreakpoint = {};
    for (const [breakpoint, referencedSize] of Object.entries(
      assignment as IconSizeByBreakpoint
    ) as [BreakpointValue, ElementSizeValue][]) {
      if (referencedSize === undefined) continue;
      byBreakpoint[breakpoint as BreakpointValue] = resolveIconSize(iconSizes, referencedSize);
    }
    resolved[scale] = byBreakpoint;
  }

  return {
    boxWidth: resolved,
    boxHeight: { ...resolved }
  };
}
