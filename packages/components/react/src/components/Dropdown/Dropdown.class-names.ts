import {
  type ClassNameByElementJSON,
  stateActivator as cn,
  type DropdownIntent,
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
  DropdownClassesMap,
  DropdownClassNames,
  DropdownElementName
} from './Dropdown.types.ts';

export const DEFAULT_DROPDOWN_SCALE: ElementSizeValue = 's:md:1';
export const DEFAULT_DROPDOWN_RADIUS: RadiusMode = 'rounded';
export const DEFAULT_DROPDOWN_INTENT: DropdownIntent = 'neutral';

export function resolveDropdownElementClassName(
  element: ClassNameByElementJSON | undefined,
  scale: ElementSizeValue,
  intent: DropdownIntent = DEFAULT_DROPDOWN_INTENT
): string {
  return (
    joinClassNames(
      resolveSchemaElementClassName(element, { intent, emphasis: 'medium' }),
      element?.s?.all,
      element?.s?.[normalizeScaleKey(scale)]
    ) ?? ''
  );
}

export function resolveDropdownClassNames({
  classesMap,
  classNames,
  scale,
  radius,
  shadow
}: {
  classesMap: DropdownClassesMap | undefined;
  classNames: DropdownClassNames;
  scale: ElementSizeValue;
  radius: RadiusMode;
  shadow: boolean | ElementSizeValue;
}): Record<DropdownElementNameWithItems, string> {
  const { e1, e2, e3, e4, e5, e6, e7, e8, e9, e10 } = classesMap ?? {};
  const shadowClass = shadow
    ? resolveEffectBucketClassName(e1?.e?.h, {
        scale: typeof shadow === 'string' ? shadow : undefined
      })
    : '';

  return {
    e1:
      joinClassNames(
        resolveDropdownElementClassName(e1, scale),
        resolveRadiusClassName(e1, scale, radius),
        shadowClass,
        shadowClass ? cn.shadow : undefined,
        classNames.e1,
        'k-ddn-e1',
        'k-trn'
      ) ?? '',
    e2: joinClassNames(resolveRadiusClassName(e2, scale, radius), classNames.e2, 'k-ddn-e2') ?? '',
    e3: joinClassNames(resolveDropdownElementClassName(e3, scale), classNames.e3, 'k-ddn-e3') ?? '',
    e4: joinClassNames(resolveDropdownElementClassName(e4, scale), classNames.e4, 'k-ddn-e4') ?? '',
    e5: joinClassNames(resolveDropdownElementClassName(e5, scale), classNames.e5, 'k-ddn-e5') ?? '',
    e6: joinClassNames(resolveDropdownElementClassName(e6, scale), classNames.e6, 'k-ddn-e6') ?? '',
    e7: joinClassNames(resolveDropdownElementClassName(e7, scale), classNames.e7, 'k-ddn-e7') ?? '',
    e8: joinClassNames(resolveDropdownElementClassName(e8, scale), classNames.e8, 'k-ddn-e8') ?? '',
    e9: joinClassNames(resolveDropdownElementClassName(e9, scale), classNames.e9, 'k-ddn-e9') ?? '',
    e10:
      joinClassNames(resolveDropdownElementClassName(e10, scale), classNames.e10, 'k-ddn-e10') ??
      '',
    items: joinClassNames(e3?.s?.all, e3?.s?.[normalizeScaleKey(scale)], 'k-ddn-x1') ?? ''
  };
}

export function resolveDropdownItemClassName({
  baseClassName,
  element,
  scale,
  intent,
  selected,
  hovered,
  disabled,
  interactive,
  className
}: {
  baseClassName: string;
  element: ClassNameByElementJSON | undefined;
  scale: ElementSizeValue;
  intent: DropdownIntent;
  selected: boolean;
  hovered: boolean;
  disabled: boolean;
  interactive: boolean;
  className?: string;
}): string {
  const projectedState = disabled || selected || hovered;
  return (
    joinClassNames(
      resolveDropdownElementClassName(element, scale, intent),
      baseClassName,
      className,
      interactive ? cn.interactive : undefined,
      interactive && !disabled ? cn.nativeInteraction : undefined,
      disabled ? cn.disabled : undefined,
      !disabled && selected ? cn.selected : undefined,
      !disabled && hovered ? cn.hover : undefined,
      projectedState ? cn.activator : undefined,
      interactive ? 'k-foc' : undefined
    ) ?? ''
  );
}

type DropdownElementNameWithItems = DropdownElementName | 'items';
