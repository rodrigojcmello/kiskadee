import { describe, expect, it } from 'vitest';
import { resolveCardClassNames } from './Card.class-names.ts';

const base = {
  e1: {
    d: 'solid',
    s: { 'md:1': 'width padding' },
    e: { h: 'shadow' },
    c: { s: { neutral: { m: 'surface states' } } },
    b: { s: { neutral: { m: { on: 'border-on', off: 'border-off', default: false } } } }
  },
  className: undefined,
  classNames: {},
  status: 'rest' as const,
  radius: undefined,
  shadow: undefined,
  emphasis: 'medium' as const,
  intent: 'neutral' as const,
  surfaceContext: 'onSubtle' as const,
  globalRadius: undefined,
  action: false
};

describe('static Card border', () => {
  it.each([
    undefined,
    true,
    false
  ])('selects the recipe for border=%s independently of shadow', (border) => {
    for (const shadow of [false, true]) {
      const classes = resolveCardClassNames({ ...base, border, shadow }).classNames.e1;
      expect(classes).toContain(border ? 'border-on' : 'border-off');
      expect(classes).toContain('width padding');
      expect(classes).toContain('surface states');
      expect(classes?.split(' ').includes('shadow')).toBe(shadow);
    }
  });

  it('follows a changed preset default and does not override CardAction', () => {
    const on = {
      ...base.e1,
      b: { s: { neutral: { m: { on: 'on', off: 'off', default: true } } } }
    };
    expect(resolveCardClassNames({ ...base, e1: on }).classNames.e1).toContain('on');
    expect(resolveCardClassNames({ ...base, border: true, action: true }).classNames.e1).toContain(
      'border-off'
    );
    expect(
      resolveCardClassNames({
        ...base,
        action: true,
        shadow: true,
        preserveBorderWithShadow: false
      }).classNames.e1
    ).toContain('k-crd-b');
  });

  it('preserves legacy recipes without inventing a border capability', () => {
    const e1 = { ...base.e1, b: undefined };
    const normal = resolveCardClassNames({ ...base, e1 }).classNames.e1;
    expect(resolveCardClassNames({ ...base, e1, border: true }).classNames.e1).toBe(normal);
    expect(resolveCardClassNames({ ...base, e1, border: false }).classNames.e1).toContain(
      'k-crd-b'
    );
  });
});
