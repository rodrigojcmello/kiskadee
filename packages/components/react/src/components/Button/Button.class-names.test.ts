import type { ClassNameByElementJSON, SurfaceContext } from '@kiskadee/core';
import { describe, expect, it, vi } from 'vitest';
import { resolveButtonClassNames } from './Button.class-names.ts';

function createElement(slot: string, includeOnVivid = true): ClassNameByElementJSON {
  return {
    d: `${slot}-base`,
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

function resolve(surfaceContext: SurfaceContext | undefined, includeOnVivid = true) {
  return resolveButtonClassNames({
    e1: createElement('e1', includeOnVivid),
    e2: createElement('e2', includeOnVivid),
    e3: createElement('e3', includeOnVivid),
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
