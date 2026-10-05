import { describe, expect, it } from 'vitest';
import { resolveCardClassNames } from './Card.class-names.ts';

const base = {
  e1: {
    d: 'solid',
    s: { 'md:1': 'width' },
    e: { h: 'shadow' },
    c: { s: { neutral: { m: 'surface states' } } },
    b: { s: { neutral: { m: { on: 'border-on', off: 'border-off', adaptive: false } } } }
  },
  className: undefined,
  classNames: {},
  radius: undefined,
  shadow: undefined,
  emphasis: 'medium' as const,
  intent: 'neutral' as const,
  surfaceContext: 'onSubtle' as const,
  globalRadius: undefined,
  action: false
};

describe('Card and CardAction border', () => {
  it.each([false, true])('selects border independently of shadow for action=%s', (action) => {
    for (const border of [undefined, 'adaptive', true, false] as const) {
      for (const shadow of [false, true]) {
        const classes = resolveCardClassNames({ ...base, action, border, shadow }).classNames.e1;
        expect(classes).toContain(border === true ? 'border-on' : 'border-off');
        expect(classes).toContain('width');
        expect(classes).toContain('surface states');
        expect(classes?.split(' ').includes('shadow')).toBe(shadow);
        expect(classes?.split(' ').includes('k-crd-b')).toBe(
          action ? border === false : border !== true
        );
      }
    }
  });

  it.each([false, true])('separates the preset default from adaptive for action=%s', (action) => {
    const input = { ...base, action };
    const on = {
      ...base.e1,
      b: { s: { neutral: { m: { on: 'on', off: 'off', adaptive: true } } } }
    };
    expect(resolveCardClassNames({ ...input, e1: on }).classNames.e1).toContain('on');
    expect(
      resolveCardClassNames({ ...input, e1: on, borderDefaultMode: 'never' }).classNames.e1
    ).toContain('off');
    expect(
      resolveCardClassNames({ ...input, e1: on, borderDefaultMode: 'never', border: 'adaptive' })
        .classNames.e1
    ).toContain('on');
    expect(
      resolveCardClassNames({ ...input, borderDefaultMode: 'always' }).classNames.e1
    ).toContain('border-on');
    expect(
      resolveCardClassNames({ ...input, borderDefaultMode: 'always', border: 'adaptive' })
        .classNames.e1
    ).toContain('border-off');
    expect(resolveCardClassNames({ ...input, border: true }).classNames.e1).toContain('border-on');
    expect(resolveCardClassNames({ ...input, borderDefaultMode: 'never' }).classNames.e1).toContain(
      'k-crd-b'
    );
  });

  it('preserves legacy recipes without inventing a border capability', () => {
    const e1 = { ...base.e1, b: undefined };
    const normal = resolveCardClassNames({ ...base, e1 }).classNames.e1;
    expect(resolveCardClassNames({ ...base, e1, border: true }).classNames.e1).toBe(normal);
    expect(resolveCardClassNames({ ...base, e1, border: false }).classNames.e1).toContain(
      'k-crd-b'
    );
  });

  it('uses the complementary surface color with its authored base-intent border', () => {
    const e1 = {
      ...base.e1,
      c: { s: { neutralComplementary: { m: 'complementary-surface' } } },
      b: { s: { neutral: { m: { on: 'neutral-border', off: 'no-border', adaptive: true } } } }
    };
    const classes = resolveCardClassNames({
      ...base,
      e1,
      intent: 'neutralComplementary'
    }).classNames.e1;

    expect(classes).toContain('complementary-surface');
    expect(classes).toContain('neutral-border');
    expect(() =>
      resolveCardClassNames({ ...base, e1, intent: 'neutralComplementary', action: true })
    ).toThrow('CardAction does not support complementary surface intents.');
  });
});
