import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Chip structural CSS', () => {
  it('keeps Badge relations neutral in the Chip block axis', () => {
    const css = sass.compile(new URL('./Chip.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const relationRule = css.match(/\.k-chp-e7\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(relationRule).toContain('align-items: center');
    expect(relationRule).toContain('align-self: center');
    expect(relationRule).toContain('block-size: 0');
    expect(relationRule).toContain('display: inline-flex');
    expect(relationRule).toContain('flex: 0 0 auto');
    expect(relationRule).toContain('min-block-size: 0');
    expect(relationRule).toContain('overflow: visible');
    expect(relationRule).not.toContain('position: absolute');
    expect(relationRule).not.toContain('max-block-size');
    expect(relationRule).not.toContain('inline-size: 0');
  });

  it('collapses only the primary inline-end padding beside Remove', () => {
    const css = sass.compile(new URL('./Chip.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const compoundRule =
      css.match(/\.k-chp-e1:has\(> \.k-chp-e5\) > \.k-chp-e2\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(compoundRule).toContain('padding-inline-end: 0');
    expect(compoundRule).not.toContain('padding-inline-start');
  });
});
