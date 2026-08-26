import {
  type BadgeEmphasis,
  type BadgeIntent,
  type BadgeScale,
  type ClassNameByElementJSON,
  stateActivator as cn,
  type RadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import {
  joinClassNames,
  resolveEffectBucketClassName,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { BadgeClassNames } from './Badge.types.ts';

export const DEFAULT_BADGE_INTENT: BadgeIntent = 'attention';
export const DEFAULT_BADGE_EMPHASIS: BadgeEmphasis = 'medium';
export const DEFAULT_BADGE_SCALE: BadgeScale = 's:md:1';
export const DEFAULT_BADGE_RADIUS: Extract<RadiusMode, 'square' | 'rounded' | 'pill'> = 'pill';

export function resolveBadgeClassNames({
  elements,
  className,
  classNames,
  intent,
  emphasis,
  scale,
  radius,
  shadow,
  surfaceContext
}: {
  elements: Partial<Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6', ClassNameByElementJSON>>;
  className?: string;
  classNames: BadgeClassNames;
  intent: BadgeIntent;
  emphasis: BadgeEmphasis;
  scale: BadgeScale;
  radius: Extract<RadiusMode, 'square' | 'rounded' | 'pill'>;
  shadow: boolean;
  surfaceContext: SurfaceContext;
}): BadgeClassNames {
  const resolve = (element: ClassNameByElementJSON | undefined) =>
    resolveSchemaElementClassName(element, { intent, emphasis, scale, surfaceContext });
  const ringClassName = resolve(elements.e6);
  const resolveShadow = (element: ClassNameByElementJSON | undefined) =>
    shadow ? resolveEffectBucketClassName(element?.e?.h) : '';
  const e1Shadow = resolveShadow(elements.e1);
  const e3Shadow = resolveShadow(elements.e3);
  const e5Shadow = resolveShadow(elements.e5);

  return {
    e1:
      joinClassNames(
        resolve(elements.e1),
        resolveRadiusClassName(elements.e1, scale, radius),
        e1Shadow,
        e1Shadow ? cn.shadow : undefined,
        classNames.e1,
        className,
        'k-bdg',
        'k-bdg-e1'
      ) ?? '',
    e2: joinClassNames(resolve(elements.e2), classNames.e2, 'k-bdg-e2') ?? '',
    e3:
      joinClassNames(
        resolve(elements.e3),
        resolveRadiusClassName(elements.e3, scale, 'pill'),
        e3Shadow,
        e3Shadow ? cn.shadow : undefined,
        classNames.e3,
        className,
        'k-bdg',
        'k-bdg-e3'
      ) ?? '',
    e4: joinClassNames(resolve(elements.e4), classNames.e4, 'k-bdg-e4') ?? '',
    e5:
      joinClassNames(
        resolve(elements.e5),
        resolveRadiusClassName(elements.e5, scale, 'pill'),
        e5Shadow,
        e5Shadow ? cn.shadow : undefined,
        classNames.e5,
        className,
        'k-bdg',
        'k-bdg-e5'
      ) ?? '',
    e6: ringClassName
      ? joinClassNames(
          ringClassName,
          resolveRadiusClassName(elements.e6, scale, radius),
          classNames.e6,
          'k-bdg-e6'
        )
      : undefined
  };
}
