import {
  type ClassNameByElementJSON,
  type ElementSizeValue,
  type RadiusMode,
  resolveButtonStackedRadiusMode
} from '@kiskadee/core';

type StackedElements = Partial<Record<'e8' | 'e9' | 'e10', ClassNameByElementJSON>>;

const RADIUS_BUCKETS = { rounded: 'rr', square: 'rs' } as const;

export function supportsStackedButtonSize(
  elements: StackedElements | undefined,
  scale: ElementSizeValue,
  stackedSizes: readonly string[] | undefined,
  radius: RadiusMode
): boolean {
  const key = scale.replace(/^s:/, '');
  if (!stackedSizes?.includes(key)) return false;
  const radiusClasses = elements?.e8?.[RADIUS_BUCKETS[resolveButtonStackedRadiusMode(radius)]];
  if (!radiusClasses?.all && !radiusClasses?.[key]) return false;
  return (['e8', 'e9', 'e10'] as const).every((element) =>
    Boolean(elements?.[element]?.s?.all || elements?.[element]?.s?.[key])
  );
}
