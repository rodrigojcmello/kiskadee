import type { ClassNameByElementJSON } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveButtonClassNames } from './Button.class-names.ts';
import type { ButtonStatus } from './Button.types.ts';

function resolveShadow({
  shadow = true,
  status = 'rest',
  element = {
    e: { h: { all: 'rest-shadow hover-shadow terminal-shadow', 'lg:1': 'fixed-shadow' } }
  }
}: {
  shadow?: boolean;
  status?: ButtonStatus;
  element?: ClassNameByElementJSON;
} = {}) {
  return resolveButtonClassNames({
    e1: element,
    e2: undefined,
    e3: undefined,
    classNames: {},
    status,
    controlState: true,
    scale: 's:lg:1',
    shadow,
    radius: undefined,
    radiusEffect: false,
    emphasis: 'medium',
    intent: 'neutral',
    surfaceContext: 'onSubtle',
    globalRadius: undefined
  }).e1.split(/\s+/);
}

describe('Button shadow recipe activation', () => {
  it('uses the state recipe without borrowing a fixed elevation from button size', () => {
    const classes = resolveShadow();
    expect(classes).toContain('rest-shadow');
    expect(classes).toContain('hover-shadow');
    expect(classes).toContain('-e');
    expect(classes).not.toContain('fixed-shadow');
  });

  it.each([
    'pending',
    'disabled'
  ] as const)('prevents native shadow changes during %s', (status) => {
    const classes = resolveShadow({ status });
    expect(classes).toContain('terminal-shadow');
    expect(classes).toContain(status === 'pending' ? '-g' : '-d');
    expect(classes).toContain('-a');
    expect(classes).not.toContain('-n');
  });

  it('never activates unsupported or explicitly disabled shadow', () => {
    expect(resolveShadow({ element: {} })).not.toContain('-e');
    const disabled = resolveShadow({ shadow: false });
    expect(disabled).not.toContain('-e');
    expect(disabled).not.toContain('rest-shadow');
  });
});
