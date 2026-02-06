import {
  type ButtonIntent,
  type ClassNameByElementJSON,
  componentEmphasisBuckets,
  type RadiusMode,
  stateActivator as cn,
  type ComponentEmphasis,
  type ElementSizeValue,
  type StateActivatorKeys
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { memo, useMemo } from 'react';
import './Button.scss';
import { useKiskadee } from '../contexts/KiskadeeContext';

export type ButtonStatus = Exclude<StateActivatorKeys, 'selected' | 'shadow'>;
export type ButtonProps = HeadlessButtonProps & {
  /** Force Kiskadee visual/interaction state on the root element (e1). Excludes 'selected' and 'shadow'. */
  status?: ButtonStatus;
  /** Marks this button as an intent toggle (Following vs. Follow). */
  toggle?: boolean;
  /** Semantic control state (selected/active/checked). When true, selected styles are applied. */
  controlState?: boolean;
  /**
   * Force size/scale for the root element (e1).
   * If not provided, Button defaults to the median scale 's:md:1'.
   */
  scale?: ElementSizeValue;
  /** Enable elevation/shadow visuals. When true, adds the shadow activation class. */
  shadow?: boolean;
  /** Border radius mode. Uses schema radius scales for rounded/pill/square. */
  radius?: RadiusMode;
  /** Enable border-radius effects (animated corners). */
  radiusEffect?: boolean;
  /**
   * Emphasis level for the button colors.
   * When provided, selects only classes for the specified emphasis (high/medium/low/lowest).
   * If not provided or if emphasis metadata is not available, uses all palette classes.
   */
  emphasis?: ComponentEmphasis;
  /** Semantic color family to use across ALL elements (e1, e2, e3, ...). Default is 'neutral'. */
  intent?: ButtonIntent;
};

// Build a single space-separated class string from flattened d and color classes (sizes handled in e1)
// Selects color classes based on emphasis: high (h), medium (m), low (l), lowest (ll), or unique (u)
// Assumes an intent-aware map in `c`; no legacy flat format for performance.
function collectStr(
  el: ClassNameByElementJSON | undefined,
  emphasis: ComponentEmphasis | undefined = 'medium',
  intent: ButtonIntent | undefined = 'neutral'
): string {
  if (!el) return '';
  let out = '';
  if (el.d) out = el.d;

  const c = el.c as Record<ButtonIntent, import('@kiskadee/core').ColorClasses> | undefined;
  const bySem = c ? c[intent] : undefined;

  if (bySem) {
    let color = '';
    const bucket = emphasis ? componentEmphasisBuckets[emphasis] : undefined;
    if (bucket && (bySem as Record<string, string | undefined>)[bucket]) {
      color = (bySem as Record<string, string | undefined>)[bucket] ?? '';
    } else if (!emphasis) {
      color = bySem.h ?? bySem.m ?? bySem.l ?? bySem.ll ?? '';
    }

    if (color) out = out ? `${out} ${color}` : color;
  }

  return out;
}

function Button(props: ButtonProps) {
  const {
    classNames = {},
    status = 'rest',
    toggle,
    controlState,
    scale = 's:md:1',
    disabled,
    shadow = false,
    radius,
    radiusEffect = false,
    emphasis,
    intent = 'neutral',
    tabIndex,
    label,
    ...restProps
  } = props;
  const {
    // e1 (root), e2 (label), e3 (icon)
    classesMap: { button: { e1, e2, e3 } = {} },
    global
  } = useKiskadee();

  // Note: We always apply 's:all' and a size-specific scale.
  // If no `scale` prop is passed, we default to the median 's:md:1' so the button never renders without a scale.

  const computed = useMemo<NonNullable<HeadlessButtonProps['classNames']>>(() => {
    const el1 = collectStr(e1, emphasis, intent);
    const el2 = collectStr(e2, emphasis, intent);
    const el3 = collectStr(e3, emphasis, intent);

    const normalizeScaleKey = (k: string) => (k.startsWith('s:') ? k.slice(2) : k);

    // Include scales for e1 (root) and e2 (label).
    // Note: In core.kiskadee.json we store size keys without the "s:" prefix (e.g. "s:md:1" -> "md:1").
    const scaleKey = normalizeScaleKey(scale);
    const sAllE1 = e1?.s?.['all'] ?? '';
    const sScaleE1 = e1?.s?.[scaleKey] ?? '';
    const sAllE2 = e2?.s?.['all'] ?? '';
    const sScaleE2 = e2?.s?.[scaleKey] ?? '';

    const radiusMode = radius ?? global?.radius ?? 'rounded';
    const rAllE1 =
      radiusMode === 'rounded'
        ? (e1?.r?.['all'] ?? '')
        : radiusMode === 'pill'
          ? (e1?.rp?.['all'] ?? '')
          : (e1?.rs?.['all'] ?? '');
    const rScaleE1 =
      radiusMode === 'rounded'
        ? (e1?.r?.[scaleKey] ?? '')
        : radiusMode === 'pill'
          ? (e1?.rp?.[scaleKey] ?? '')
          : (e1?.rs?.[scaleKey] ?? '');

    // Effects buckets (from Phase 5 `e`) — opt-in at component level.
    // We only append the buckets requested by props.
    const e = e1?.e;
    const shadowEffects = shadow ? (e?.h ?? '') : '';
    const radiusEffects = radiusEffect
      ? radiusMode === 'rounded'
        ? (e?.rr ?? '')
        : radiusMode === 'pill'
          ? (e?.rp ?? '')
          : ''
      : '';
    const e1Effects = `${shadowEffects}${shadowEffects && radiusEffects ? ' ' : ''}${radiusEffects}`;
    const selected = controlState ? (e1?.l ?? '') : '';

    const e1Base =
      (el1 ? `${el1}` : '') +
      (sAllE1 ? ` ${sAllE1}` : '') +
      (classNames.e1 ? ` ${classNames.e1}` : '') +
      (sScaleE1 ? ` ${sScaleE1}` : '') +
      (rAllE1 ? ` ${rAllE1}` : '') +
      (rScaleE1 ? ` ${rScaleE1}` : '') +
      (e1Effects ? ` ${e1Effects}` : '') +
      (selected ? ` ${selected}` : '');

    const e2Base =
      (el2 ? `${el2}` : '') +
      (sAllE2 ? ` ${sAllE2}` : '') +
      (classNames.e2 ? ` ${classNames.e2}` : '') +
      (sScaleE2 ? ` ${sScaleE2}` : '');

    const e3Base = (el3 || '') + (classNames.e3 ? (el3 ? ' ' : '') + classNames.e3 : '');

    // Forced activation classes (status + selected) built via direct concatenation
    let activation = '';
    if (status !== 'rest') {
      const forced = cn[status];
      if (forced) activation += ` ${forced}`;
    }
    if (controlState) activation += ` ${cn.selected}`;
    if (activation) activation += ` ${cn.activator}`;

    // Shadow activation flag (does not imply activator -a)
    const shadowFlag = shadow ? ` ${cn.shadow}` : '';

    return {
      e1: `${e1Base} ${cn.interactive}${shadowFlag}${activation} k-btn k-state`,
      e2: e2Base,
      e3: e3Base
    };
  }, [
    e1,
    e2,
    e3,
    status,
    controlState,
    scale,
    shadow,
    radius,
    radiusEffect,
    global?.radius,
    emphasis,
    intent,
    classNames.e1,
    classNames.e2,
    classNames.e3
  ]);

  // Map Kiskadee status to native/ARIA attributes
  const ariaDisabled = restProps['aria-disabled'];
  let isDisabled: boolean | undefined;
  if (disabled !== undefined) {
    // Always respect the consumer-provided `disabled` prop
    isDisabled = disabled;
  } else if (status === 'disabled') {
    // If aria-disabled is explicitly true, keep the element interactive
    isDisabled = ariaDisabled === true ? undefined : true;
  } else {
    isDisabled = undefined;
  }

  const ariaPressed =
    restProps['aria-pressed'] ?? (toggle ? (controlState === true ? true : undefined) : undefined);

  return (
    <HeadlessButton
      {...restProps}
      label={label}
      disabled={isDisabled}
      aria-disabled={ariaDisabled}
      aria-pressed={ariaPressed}
      classNames={computed}
      // Safari (macOS and iOS) requires tabIndex to support focus
      tabIndex={tabIndex ?? 0}
    />
  );
}

const MemoButton = memo(Button);
const CompoundButton = Object.assign(MemoButton, {
  Label: HeadlessButton.Label,
  Icon: HeadlessButton.Icon
});
export { CompoundButton as Button };
