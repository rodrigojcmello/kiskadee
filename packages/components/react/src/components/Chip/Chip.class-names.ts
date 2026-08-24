import type {
  ChipEmphasis,
  ChipIntent,
  ChipScale,
  ClassNameByElementJSON,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import {
  joinClassNames,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { ChipClassNames } from './Chip.types.ts';

export const DEFAULT_CHIP_INTENT: ChipIntent = 'neutral';
export const DEFAULT_CHIP_EMPHASIS: ChipEmphasis = 'medium';
export const DEFAULT_CHIP_SCALE: ChipScale = 's:md:1';
export const DEFAULT_CHIP_RADIUS: Extract<RadiusMode, 'rounded' | 'pill'> = 'rounded';

export function resolveChipClassNames({
  elements,
  className,
  classNames,
  intent,
  emphasis,
  scale,
  radius,
  surfaceContext
}: {
  elements: Partial<Record<ChipElementName, ClassNameByElementJSON>>;
  className?: string;
  classNames: ChipClassNames;
  intent: ChipIntent;
  emphasis: ChipEmphasis;
  scale: ChipScale;
  radius: Extract<RadiusMode, 'rounded' | 'pill'>;
  surfaceContext: SurfaceContext;
}): Required<ChipClassNames> {
  const resolve = (element: ClassNameByElementJSON | undefined) =>
    resolveSchemaElementClassName(element, { intent, emphasis, scale, surfaceContext });

  return {
    e1: joinClassNames(resolve(elements.e1), classNames.e1, className, 'k-chp', 'k-chp-e1') ?? '',
    e2:
      joinClassNames(
        resolve(elements.e2),
        resolveRadiusClassName(elements.e2, scale, radius),
        classNames.e2,
        'k-chp-e2'
      ) ?? '',
    e3: joinClassNames(resolve(elements.e3), classNames.e3, 'k-chp-e3') ?? '',
    e4: joinClassNames(resolve(elements.e4), classNames.e4, 'k-chp-e4') ?? '',
    e5:
      joinClassNames(
        resolve(elements.e5),
        resolveRadiusClassName(elements.e5, scale, radius),
        classNames.e5,
        'k-chp-e5'
      ) ?? '',
    e6: joinClassNames(resolve(elements.e6), classNames.e6, 'k-chp-e6') ?? '',
    e7: joinClassNames(resolve(elements.e7), classNames.e7, 'k-chp-e7') ?? ''
  };
}

type ChipElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';
