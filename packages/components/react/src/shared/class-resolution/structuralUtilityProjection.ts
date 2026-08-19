import type { ClassNameByElementJSON } from '@kiskadee/core';
import { joinClassNames, normalizeScaleKey } from './classNames.ts';

export function resolveStructuralUtilityProjectionClassName(
  element: ClassNameByElementJSON | undefined,
  projectionKey: string,
  scale: string
): string {
  const bucket = element?.p?.[projectionKey];
  if (!bucket) return '';

  const scaleKey = normalizeScaleKey(scale);
  return joinClassNames(bucket.all, bucket[scaleKey]) ?? '';
}
