import type { ClassNameByElementJSON, SurfaceContext } from '@kiskadee/core';
import { describe, expect, it, vi } from 'vitest';
import { resolveButtonClassNames } from './Button.class-names.ts';

function createElement(slot: string, includeInverse = true): ClassNameByElementJSON {
  return {
    d: `${slot}-base`,
    c: {
      d: {
        primary: { h: `${slot}-default-high` }
      },
      ...(includeInverse
        ? {
            i: {
              primary: { h: `${slot}-inverse-high` }
            }
          }
        : {})
    }
  };
}

function resolve(surfaceContext: SurfaceContext | undefined, includeInverse = true) {
  return resolveButtonClassNames({
    e1: createElement('e1', includeInverse),
    e2: createElement('e2', includeInverse),
    e3: createElement('e3', includeInverse),
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
    globalRadius: undefined
  });
}

describe('Button surface context class resolution', () => {
  it('uses default colors when the prop is omitted', () => {
    const classes = resolve(undefined);

    expect(classes.e1).toContain('e1-default-high');
    expect(classes.e2).toContain('e2-default-high');
    expect(classes.e3).toContain('e3-default-high');
    expect(classes.e1).not.toContain('inverse');
  });

  it('uses inverse colors across every Button element', () => {
    const classes = resolve('inverse');

    expect(classes.e1).toContain('e1-inverse-high');
    expect(classes.e2).toContain('e2-inverse-high');
    expect(classes.e3).toContain('e3-inverse-high');
    expect(classes.e1).not.toContain('default-high');
  });

  it('keeps structural classes but never falls back to default colors when inverse is absent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const classes = resolve('inverse', false);

    expect(classes.e1).toContain('e1-base');
    expect(classes.e2).toContain('e2-base');
    expect(classes.e3).toContain('e3-base');
    expect(classes.e1).not.toContain('default-high');
    expect(classes.e2).not.toContain('default-high');
    expect(classes.e3).not.toContain('default-high');
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
