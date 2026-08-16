import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Dropdown structural CSS', () => {
  it('consumes asymmetric item padding on the logical inline edges', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const itemRule = css.match(/\.k-ddn-e2\s*\{([^}]*)\}/)?.[1];

    expect(itemRule).toContain('padding-inline-start: var(--k-pdl)');
    expect(itemRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(itemRule).not.toContain('padding-left');
    expect(itemRule).not.toContain('padding-right');
  });

  it('consumes the authored checkmark gap on the logical inline end', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const checkmarkRule = css.match(/\.k-ddn-e10\s*\{([^}]*)\}/)?.[1];

    expect(checkmarkRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(checkmarkRule).not.toContain('padding-right');
  });
});
