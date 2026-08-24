import type {
  BadgeEmphasis,
  BadgeIntent,
  BadgeScale,
  ClassNameByElementJSON,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import {
  joinClassNames,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { BadgeClassNames } from './Badge.types.ts';

export const DEFAULT_BADGE_INTENT: BadgeIntent = 'neutral';
export const DEFAULT_BADGE_EMPHASIS: BadgeEmphasis = 'medium';
export const DEFAULT_BADGE_SCALE: BadgeScale = 's:md:1';
export const DEFAULT_BADGE_RADIUS: Extract<RadiusMode, 'rounded' | 'pill'> = 'pill';

export function resolveBadgeClassNames({
  elements,
  className,
  classNames,
  intent,
  emphasis,
  scale,
  radius,
  surfaceContext
}: {
  elements: Partial<Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5', ClassNameByElementJSON>>;
  className?: string;
  classNames: BadgeClassNames;
  intent: BadgeIntent;
  emphasis: BadgeEmphasis;
  scale: BadgeScale;
  radius: Extract<RadiusMode, 'rounded' | 'pill'>;
  surfaceContext: SurfaceContext;
}): Required<BadgeClassNames> {
  const resolve = (element: ClassNameByElementJSON | undefined) =>
    resolveSchemaElementClassName(element, { intent, emphasis, scale, surfaceContext });

  return {
    e1:
      joinClassNames(
        resolve(elements.e1),
        resolveRadiusClassName(elements.e1, scale, radius),
        classNames.e1,
        className,
        'k-bdg',
        'k-bdg-e1'
      ) ?? '',
    e2: joinClassNames(resolve(elements.e2), classNames.e2, 'k-bdg-e2') ?? '',
    e3: joinClassNames(resolve(elements.e3), classNames.e3, 'k-bdg-e3') ?? '',
    e4: joinClassNames(resolve(elements.e4), classNames.e4, 'k-bdg-e4') ?? '',
    e5:
      joinClassNames(
        resolve(elements.e5),
        resolveRadiusClassName(elements.e5, scale, 'pill'),
        classNames.e5,
        className,
        'k-bdg',
        'k-bdg-e5'
      ) ?? ''
  };
}
