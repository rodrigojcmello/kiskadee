import { describe, expect, it } from 'vitest';
import { resolveIconClassNames } from './Icon.class-names.ts';

const e1 = {
  d: 'glyph-decoration',
  s: {
    'sm:2': 'glyph-12',
    'md:1': 'glyph-20',
    'lg:4': 'glyph-48'
  },
  c: {
    s: {
      neutral: { m: 'neutral-on-subtle' },
      primary: { m: 'primary-on-subtle' }
    },
    v: {
      neutral: { m: 'neutral-on-vivid' },
      primary: { m: 'primary-on-vivid' }
    }
  }
};

describe('Icon class-name resolver', () => {
  it.each([
    'onSubtle',
    'onVivid'
  ] as const)('omits only palette classes when inheriting in %s', (surfaceContext) => {
    const classes = resolveIconClassNames({
      e1,
      classNames: { e1: 'custom' },
      foreground: 'inherit',
      scale: 's:lg:4',
      surfaceContext
    });
    expect(classes.e1).toBe('glyph-decoration glyph-48 custom k-icn k-icn-e1');
  });

  it('resolves the default 20px neutral/onSubtle medium branch', () => {
    const classes = resolveIconClassNames({ e1, classNames: {} });

    expect(classes.e1).toContain('glyph-decoration');
    expect(classes.e1).toContain('glyph-20');
    expect(classes.e1).toContain('neutral-on-subtle');
    expect(classes.e1).toContain('k-icn');
    expect(classes.e1).toContain('k-icn-e1');
  });

  it('resolves size, intent and onVivid without exposing state or emphasis options', () => {
    const classes = resolveIconClassNames({
      e1,
      classNames: { e1: 'consumer-class' },
      scale: 's:lg:4',
      intent: 'primary',
      surfaceContext: 'onVivid'
    });

    expect(classes.e1).toContain('glyph-48');
    expect(classes.e1).toContain('primary-on-vivid');
    expect(classes.e1).toContain('consumer-class');
    expect(classes.e1).not.toContain('primary-on-subtle');
  });

  it('keeps structural and consumer classes when generated artifacts are unavailable', () => {
    expect(resolveIconClassNames({ e1: undefined, classNames: { e1: 'custom' } })).toEqual({
      e1: 'custom k-icn k-icn-e1'
    });
  });
});
