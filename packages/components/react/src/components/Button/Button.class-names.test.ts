import type {
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ClassNameByElementJSON,
  SurfaceContext
} from '@kiskadee/core';
import { describe, expect, it, vi } from 'vitest';
import {
  resolveButtonClassNames,
  resolveButtonGroupFrameClassName,
  supportsButtonStackedLayout
} from './Button.class-names.ts';

describe('Button Group Rest frame', () => {
  const frame: ClassNameByElementJSON = {
    d: 'frame-border-style',
    s: { all: 'frame-border-width', 'md:1': 'frame-medium-border' },
    rr: { 'md:1': 'frame-rounded' },
    rs: { 'md:1': 'frame-square' },
    c: {
      s: { neutral: { m: 'frame-border-rest frame-bottom-rest', h: 'frame-high-rest' } },
      v: { neutral: { m: 'frame-vivid-rest' } }
    }
  };
  const resolveFrame = (element: ClassNameByElementJSON | undefined = frame) =>
    resolveButtonGroupFrameClassName({
      element,
      scale: 's:md:1',
      radius: 'rounded',
      intent: 'neutral',
      emphasis: 'medium',
      surfaceContext: 'onSubtle'
    });

  it('consumes only the published frame at the effective size and palette', () => {
    expect(resolveFrame()).toBe(
      'frame-border-style frame-border-width frame-medium-border frame-rounded frame-border-rest frame-bottom-rest'
    );
    expect(
      resolveButtonGroupFrameClassName({
        element: frame,
        scale: 'md:1',
        radius: undefined,
        globalRadius: 'square',
        intent: 'neutral',
        emphasis: 'medium',
        surfaceContext: 'onVivid'
      })
    ).toBe(
      'frame-border-style frame-border-width frame-medium-border frame-square frame-vivid-rest'
    );
  });

  it('requires complete frame geometry, radius and paint without fallback', () => {
    for (const element of [
      {},
      { ...frame, d: undefined },
      { ...frame, s: undefined },
      { ...frame, rr: undefined },
      { ...frame, c: undefined },
      { ...frame, c: { s: { neutral: { h: 'another-emphasis' } } } }
    ]) {
      expect(resolveFrame(element)).toBeUndefined();
    }
    expect(
      resolveButtonGroupFrameClassName({ element: frame, scale: 'lg:1', radius: 'rounded' })
    ).toBeUndefined();
  });
});

function createElement(slot: string, includeOnVivid = true): ClassNameByElementJSON {
  return {
    ...(slot === 'e2' ? { p: { lh: { 'md:1': 'label-height-token' } } } : {}),
    ...(slot === 'e8' ? { rr: { all: 'stacked-rounded' } } : {}),
    d: `${slot}-base`,
    s: {
      all: `${slot}-scale-all`,
      'md:1': `${slot}-scale-medium`
    },
    c: {
      s: {
        primary: { h: `${slot}-on-subtle-high` }
      },
      ...(includeOnVivid
        ? {
            v: {
              primary: { h: `${slot}-on-vivid-high` }
            }
          }
        : {})
    }
  };
}

function resolve(
  surfaceContext: SurfaceContext | undefined,
  includeOnVivid = true,
  iconLayout?: ButtonIconLayout,
  iconPlacement?: ButtonIconPlacement,
  iconSurfaceCorners?: ButtonIconSurfaceCorners,
  iconTreatment?: ButtonIconTreatment
) {
  return resolveButtonClassNames({
    e1: createElement('e1', includeOnVivid),
    e2: createElement('e2', includeOnVivid),
    e3: createElement('e3', includeOnVivid),
    e4: createElement('e4', includeOnVivid),
    classNames: {},
    status: 'rest',
    controlState: undefined,
    scale: undefined,
    shadow: false,
    radius: undefined,
    radiusEffect: false,
    emphasis: 'high',
    intent: 'primary',
    surfaceContext,
    iconLayout,
    iconPlacement,
    iconSurfaceCorners,
    iconTreatment,
    globalRadius: undefined
  });
}

describe('Button surface context class resolution', () => {
  it.each([
    'onSubtle',
    'onVivid'
  ] as const)('replaces stacked geometry while retaining %s colors, states and radius ownership', (surfaceContext) => {
    const e8 = { ...createElement('e8'), rr: { 'md:1': 'stacked-rounded-radius' } };
    const classes = resolveButtonClassNames({
      e1: { ...createElement('e1'), rp: { 'md:1': 'horizontal-pill-radius' } },
      e2: createElement('e2'),
      e3: createElement('e3'),
      e8,
      e9: createElement('e9'),
      e10: createElement('e10'),
      classNames: {},
      status: 'pressed',
      controlState: true,
      scale: 's:md:1',
      shadow: false,
      radius: 'pill',
      radiusEffect: false,
      emphasis: 'high',
      intent: 'primary',
      surfaceContext,
      iconLayout: 'stacked',
      globalRadius: undefined
    });
    const contextName = surfaceContext === 'onVivid' ? 'on-vivid' : 'on-subtle';
    expect(classes.e1).toContain(`e1-${contextName}-high`);
    expect(classes.e1).toContain('e1-base');
    expect(classes.e1).toContain('e8-scale-all');
    expect(classes.e1).toContain('e8-scale-medium');
    expect(classes.e1).toContain('stacked-rounded-radius');
    expect(classes.e1).toContain('-p');
    expect(classes.e1).toContain('-s');
    expect(classes.e1).not.toContain('horizontal-pill-radius');
    expect(classes.e1).not.toContain('e1-scale');
    expect(classes.e2).toContain(`e2-${contextName}-high`);
    expect(classes.e2).toContain('e9-base');
    expect(classes.e2).toContain('e9-scale-medium');
    expect(classes.e2).not.toContain('e2-base');
    expect(classes.e2).not.toContain('e2-scale');
    expect(classes.e3).toContain(`e3-${contextName}-high`);
    expect(classes.e3).toContain('e10-scale-medium');
    expect(classes.e3).not.toContain('e3-scale');
    expect(classes.e3).not.toContain('label-height-token');
    expect(classes.e3).not.toContain('k-btn-e3a');
  });

  it('requires every stacked role at the effective size and accepts size-independent recipes', () => {
    const elements = {
      e8: createElement('e8'),
      e9: createElement('e9'),
      e10: createElement('e10')
    };
    expect(supportsButtonStackedLayout(elements, 's:md:1')).toBe(true);
    expect(supportsButtonStackedLayout({ ...elements, e9: undefined }, 's:md:1')).toBe(false);
    expect(
      supportsButtonStackedLayout({ ...elements, e10: { s: { 'sm:1': 'small-only' } } }, 's:md:1')
    ).toBe(false);
    expect(
      supportsButtonStackedLayout(
        {
          e8: { s: { all: 'root' }, rr: { all: 'rounded' } },
          e9: { s: { all: 'label' } },
          e10: { s: { all: 'icon' } }
        },
        's:sm:1'
      )
    ).toBe(true);
  });

  it('requires the requested stacked radius class at the effective size', () => {
    const elements = {
      e8: { s: { all: 'root' }, rp: { 'md:1': 'pill' }, rs: { all: 'square-zero' } },
      e9: { s: { all: 'label' } },
      e10: { s: { all: 'icon' } }
    };
    expect(supportsButtonStackedLayout(elements, 's:md:1', 'rounded')).toBe(false);
    expect(supportsButtonStackedLayout(elements, 's:md:1', 'pill')).toBe(false);
    expect(supportsButtonStackedLayout(elements, 's:sm:1', 'pill')).toBe(false);
    expect(supportsButtonStackedLayout(elements, 's:sm:1', 'square')).toBe(true);
  });
  it('uses the label height projection on plain icons without copying typography or resizing surfaced icons', () => {
    const plain = resolve(undefined);
    expect(plain.e3).toContain('label-height-token');
    expect(plain.e3).toContain('k-btn-e3a');
    expect(plain.e3).not.toContain('e2-scale-medium');
    const surfaced = resolve(undefined, true, undefined, undefined, undefined, 'surface');
    expect(surfaced.e3).not.toContain('label-height-token');
    expect(surfaced.e3).not.toContain('k-btn-e3a');
  });

  it('uses onSubtle colors when the prop is omitted', () => {
    const classes = resolve(undefined);

    expect(classes.e1).toContain('e1-on-subtle-high');
    expect(classes.e2).toContain('e2-on-subtle-high');
    expect(classes.e3).toContain('e3-on-subtle-high');
    expect(classes.e1).not.toContain('onVivid');
  });

  it('uses onVivid colors across every Button element', () => {
    const classes = resolve('onVivid');

    expect(classes.e1).toContain('e1-on-vivid-high');
    expect(classes.e2).toContain('e2-on-vivid-high');
    expect(classes.e3).toContain('e3-on-vivid-high');
    expect(classes.e1).not.toContain('on-subtle-high');
  });

  it('applies schema scale and structural classes to the icon slot', () => {
    const classes = resolve(undefined);

    expect(classes.e1).toContain('k-btn-e1d');
    expect(classes.e1).toContain('k-btn-e1f');
    expect(classes.e2).toContain('k-btn-e2');
    expect(classes.e3).toContain('e3-scale-all');
    expect(classes.e3).toContain('e3-scale-medium');
    expect(classes.e3).toContain('k-btn-e3');
    expect(classes.e3).toContain('k-btn-e3a');
  });

  it('resolves edge and trailing icon composition independently', () => {
    const classes = resolve(undefined, true, 'edge', 'trailing');

    expect(classes.e1).toContain('k-btn-e1e');
    expect(classes.e1).toContain('k-btn-e1g');
    expect(classes.e1).not.toContain('k-btn-e1d');
    expect(classes.e1).not.toContain('k-btn-e1f');
  });

  it('flattens label-facing surfaced corners only for the edge policy', () => {
    const surfacedDefault = resolve(undefined, true, undefined, undefined, undefined, 'surface');
    const surfacedEdge = resolve(undefined, true, undefined, undefined, 'edge', 'surface');
    const surfacedAll = resolve(undefined, true, undefined, undefined, 'all', 'surface');

    expect(surfacedDefault.e1).toContain('k-btn-e1i');
    expect(surfacedEdge.e1).toContain('k-btn-e1i');
    expect(surfacedAll.e1).not.toContain('k-btn-e1i');
  });

  it('does not borrow label geometry when the preset has no e3 scale', () => {
    const classes = resolveButtonClassNames({
      e1: createElement('e1'),
      e2: createElement('e2'),
      e3: undefined,
      classNames: {},
      status: 'rest',
      controlState: undefined,
      scale: undefined,
      shadow: false,
      radius: undefined,
      radiusEffect: false,
      emphasis: 'high',
      intent: 'primary',
      surfaceContext: undefined,
      globalRadius: undefined
    });

    expect(classes.e3).toContain('k-btn-e3');
    expect(classes.e3).not.toContain('k-btn-e3a');
    expect(classes.e3).not.toContain('e2-scale-all');
    expect(classes.e3).not.toContain('e2-scale-medium');
  });

  it('keeps structural classes but never falls back to onSubtle colors when onVivid is absent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const classes = resolve('onVivid', false);

    expect(classes.e1).toContain('e1-base');
    expect(classes.e2).toContain('e2-base');
    expect(classes.e3).toContain('e3-base');
    expect(classes.e1).not.toContain('on-subtle-high');
    expect(classes.e2).not.toContain('on-subtle-high');
    expect(classes.e3).not.toContain('on-subtle-high');
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
