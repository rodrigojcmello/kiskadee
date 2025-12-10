import {
  type ClassNameByElementJSON,
  stateActivator as cn,
  type ElementSizeValue,
  type EmphasisVariant,
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
  /** Marks this button as a semantic toggle (Following vs. Follow). */
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
  /**
   * Emphasis variant (tone) for the button colors.
   * When provided, selects only classes for the specified tone (soft or solid).
   * If not provided or if tone metadata is not available, uses all palette classes.
   */
  tone?: EmphasisVariant;
  /** Semantic color family to use across ALL elements (e1, e2, e3, ...). Default is 'neutral'. */
  semantic?: string;
};

// Build a single space-separated class string from flattened d and color classes (sizes handled in e1)
// Selects color classes based on tone: soft (f), solid (d), or unique (u)
// Assumes semantic-aware map in `c`; no legacy flat format for performance.
function collectStr(
  el: ClassNameByElementJSON | undefined,
  tone: EmphasisVariant | undefined = 'soft',
  semantic: string | undefined = 'neutral'
): string {
  if (!el) return '';
  let out = '';
  if (el.d) out = el.d;

  const c = el.c as Record<string, import('@kiskadee/core').ColorClasses> | undefined;
  const bySem = c ? c[semantic] : undefined;

  if (bySem) {
    let color = '';
    if (tone === 'soft' && bySem.f) color = bySem.f;
    else if (tone === 'solid' && bySem.d) color = bySem.d;
    else if (!tone) color = bySem.d ?? bySem.f ?? bySem.u ?? '';
    else if (!color && bySem.u) color = bySem.u; // last resort within the same semantic

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
    tone,
    semantic = 'neutral',
    tabIndex,
    label,
    ...restProps
  } = props;
  const {
    // e1 (root), e2 (label), e3 (icon)
    classesMap: { button: { e1, e2, e3 } = {} }
  } = useKiskadee();

  // Note: We always apply 's:all' and a size-specific scale.
  // If no `scale` prop is passed, we default to the median 's:md:1' so the button never renders without a scale.

  const computed = useMemo<NonNullable<HeadlessButtonProps['classNames']>>(() => {
    const el1 = collectStr(e1, tone, semantic);
    const el2 = collectStr(e2, tone, semantic);
    const el3 = collectStr(e3, tone, semantic);

    // Include scales for e1 (root) and e2 (label)
    const sAllE1 = e1?.s?.['s:all'] ?? '';
    const sScaleE1 = e1?.s?.[scale] ?? '';
    const sAllE2 = e2?.s?.['s:all'] ?? '';
    const sScaleE2 = e2?.s?.[scale] ?? '';

    // Effects base classes (from Phase 5 `e`) — unified string.
    // We append them unconditionally; activation is governed by forced state classes or native pseudos in CSS.
    const e1Effects = e1?.e ?? '';
    const selected = controlState ? (e1?.cs ?? '') : '';

    const e1Base =
      (el1 ? `${el1}` : '') +
      (sAllE1 ? ` ${sAllE1}` : '') +
      (classNames.e1 ? ` ${classNames.e1}` : '') +
      (sScaleE1 ? ` ${sScaleE1}` : '') +
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
    tone,
    semantic,
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
