import {
  type BottomSheetIntent,
  type ClassNameByElementJSON,
  stateActivator as cn,
  type ElementSizeValue,
  type RadiusMode
} from '@kiskadee/core';
import {
  joinClassNames,
  normalizeScaleKey,
  resolveEffectBucketClassName,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type {
  BottomSheetClassesMap,
  BottomSheetClassNames,
  BottomSheetElementName
} from './BottomSheet.types.ts';

export const DEFAULT_BOTTOM_SHEET_SCALE: ElementSizeValue = 's:md:1';
export const DEFAULT_BOTTOM_SHEET_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_BOTTOM_SHEET_INTENT: BottomSheetIntent = 'neutral';

export function resolveBottomSheetElementClassName(
  element: ClassNameByElementJSON | undefined,
  scale: ElementSizeValue,
  intent: BottomSheetIntent = DEFAULT_BOTTOM_SHEET_INTENT
): string {
  return (
    joinClassNames(
      resolveSchemaElementClassName(element, { intent, emphasis: 'medium' }),
      element?.s?.all,
      element?.s?.[normalizeScaleKey(scale)]
    ) ?? ''
  );
}

export function resolveBottomSheetClassNames({
  classesMap,
  classNames,
  scale,
  radius,
  shadow
}: {
  classesMap: BottomSheetClassesMap | undefined;
  classNames: BottomSheetClassNames;
  scale: ElementSizeValue;
  radius: RadiusMode;
  shadow: boolean | ElementSizeValue;
}): Record<BottomSheetElementName, string> {
  const { e1, e2, e3, e4, e5, e6, e7, e12, e14 } = classesMap ?? {};
  const shadowClass = shadow
    ? resolveEffectBucketClassName(e2?.e?.h, {
        scale: typeof shadow === 'string' ? shadow : undefined
      })
    : '';
  const resolve = (element: ClassNameByElementJSON | undefined, className: string | undefined) =>
    joinClassNames(resolveBottomSheetElementClassName(element, scale), className) ?? '';

  return {
    e1: joinClassNames(resolve(e1, classNames.e1), 'k-bsh-e1') ?? '',
    e2:
      joinClassNames(
        resolve(e2, classNames.e2),
        resolveRadiusClassName(e2, scale, radius),
        shadowClass,
        shadowClass ? cn.shadow : undefined,
        'k-bsh-e2'
      ) ?? '',
    e3:
      joinClassNames(
        resolve(e3, classNames.e3),
        resolveRadiusClassName(e3, scale, radius),
        'k-bsh-e3'
      ) ?? '',
    e4: joinClassNames(resolve(e4, classNames.e4), 'k-bsh-e4') ?? '',
    e5: joinClassNames(resolve(e5, classNames.e5), 'k-bsh-e5') ?? '',
    e6: joinClassNames(resolve(e6, classNames.e6), 'k-bsh-e6') ?? '',
    e7: joinClassNames(resolveRadiusClassName(e7, scale, radius), classNames.e7, 'k-bsh-e7') ?? '',
    e8: joinClassNames(classNames.e8, 'k-bsh-e8') ?? '',
    e9: joinClassNames(classNames.e9, 'k-bsh-e9') ?? '',
    e10: joinClassNames(classNames.e10, 'k-bsh-e10') ?? '',
    e11: joinClassNames(classNames.e11, 'k-bsh-e11') ?? '',
    e12: joinClassNames(resolve(e12, classNames.e12), 'k-bsh-e12') ?? '',
    e13: joinClassNames(classNames.e13, 'k-bsh-e13') ?? '',
    e14: joinClassNames(resolve(e14, classNames.e14), 'k-bsh-e14') ?? '',
    e15: joinClassNames(classNames.e15, 'k-bsh-e15') ?? ''
  };
}

export function resolveBottomSheetItemClassName({
  baseClassName,
  element,
  scale,
  intent,
  selected,
  disabled,
  interactive,
  className
}: {
  baseClassName: string;
  element: ClassNameByElementJSON | undefined;
  scale: ElementSizeValue;
  intent: BottomSheetIntent;
  selected: boolean;
  disabled: boolean;
  interactive: boolean;
  className?: string;
}): string {
  const stateClass = disabled ? cn.disabled : selected ? cn.selected : undefined;
  return (
    joinClassNames(
      resolveBottomSheetElementClassName(element, scale, intent),
      baseClassName,
      className,
      interactive ? cn.interactive : undefined,
      interactive && !disabled ? cn.nativeInteraction : undefined,
      stateClass,
      stateClass ? cn.activator : undefined,
      interactive ? 'k-foc' : undefined
    ) ?? ''
  );
}
