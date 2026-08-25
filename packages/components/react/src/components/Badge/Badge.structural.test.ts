import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Badge structural CSS', () => {
  it('clips only full-bleed artwork so the separation ring can extend beyond the viewport', () => {
    const css = sass.compile(new URL('./Badge.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const markRule = css.match(/\.k-bdg-e3\s*\{([^}]*)\}/)?.[1] ?? '';
    const artworkRule = css.match(/\.k-bdg-e3 > :not\(\.k-bdg-e6\)\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(markRule).not.toContain('overflow: hidden');
    expect(artworkRule).toContain('border-radius: inherit');
    expect(artworkRule).toContain('overflow: hidden');
  });
});
