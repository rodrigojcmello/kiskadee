import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Chip structural CSS', () => {
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
