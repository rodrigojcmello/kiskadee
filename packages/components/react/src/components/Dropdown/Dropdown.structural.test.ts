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
    expect(itemRule).toContain('appearance: none');
    expect(itemRule).toContain('border: 0');
    expect(itemRule).not.toContain('padding-left');
    expect(itemRule).not.toContain('padding-right');
  });

  it('consumes the authored checkmark gap on the logical inline end', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const checkmarkRule = css.match(/\.k-ddn-e10\s*\{([^}]*)\}/)?.[1];

    expect(checkmarkRule).toContain('box-sizing: content-box');
    expect(checkmarkRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(checkmarkRule).not.toContain('padding-right');
  });

  it('keeps the authored leading-icon gap outside the icon viewport', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const iconRule = css.match(/^\.k-ddn-e3\s*\{([^}]*)\}/m)?.[1];

    expect(iconRule).toContain('margin-inline-end: var(--k-pdr)');
    expect(iconRule).not.toContain('padding-inline-end');
  });

  it('consumes label insets only on unoccupied logical edges', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toMatch(
      /data-layout=independent[^}]*not\(:has\([^}]*\.k-ddn-e3[^}]*\.k-ddn-e10[^}]*padding-inline-start: var\(--k-pdl\)/s
    );
    expect(css).toMatch(
      /data-layout=independent[^}]*not\(:has\([^}]*\.k-ddn-e6[^}]*\.k-ddn-e8[^}]*padding-inline-end: var\(--k-pdr\)/s
    );
    expect(css).toMatch(
      /data-layout=columns[^}]*not\(:has\([^}]*\.k-ddn-e3[^}]*\.k-ddn-e10[^}]*padding-inline-start: var\(--k-pdl\)/s
    );
    expect(css).toMatch(
      /data-layout=columns[^}]*not\(:has\([^}]*\.k-ddn-e6[^}]*\.k-ddn-e8[^}]*padding-inline-end: var\(--k-pdr\)/s
    );
  });

  it('keeps projected empty leading tracks aligned across independent groups', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toMatch(
      /data-layout=independent[^}]*:has\([^}]*\.k-ddn-e10[^}]*\.k-ddn-x2[^}]*not\(:has\([^}]*\.k-ddn-e10[^}]*\.k-ddn-x7[^}]*inline-size: var\(--k-bxw\)[^}]*margin-inline-end: var\(--k-pdr\)/s
    );
    expect(css).toMatch(
      /data-layout=independent[^}]*:has\([^}]*\.k-ddn-e3[^}]*\.k-ddn-x2[^}]*not\(:has\([^}]*\.k-ddn-e3[^}]*\.k-ddn-x6[^}]*inline-size: var\(--k-bxw\)[^}]*margin-inline-end: var\(--k-pdr\)/s
    );
  });

  it('applies the group-label CSC margin only when the collection has no leading track', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toMatch(
      /\.k-ddn-x1:not\(:has\([^}]*\.k-ddn-e3[^}]*\.k-ddn-e10[^}]*\.k-ddn-x2[^}]*> \.k-ddn-e9\s*\{[^}]*margin-inline-start: var\(--k-mgl\)/s
    );
  });

  it('keeps overlays above application chrome and fills the scroll shell width', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const positionerRule = css.match(/\.k-ddn\s*\{([^}]*)\}/)?.[1];
    const scrollShellRule = css.match(/\.k-ddn-x3\s*\{([^}]*)\}/)?.[1];
    const scrollViewportRule = css.match(/\.k-ddn-x4\s*\{([^}]*)\}/)?.[1];

    expect(positionerRule).toContain('z-index: 2147483647');
    expect(scrollShellRule).toContain('inline-size: 100%');
    expect(scrollShellRule).not.toContain('inline-size: max-content');
    expect(scrollViewportRule).toContain('inline-size: 100%');
  });

  it('does not duplicate padding for a semantic group nested in a visual group', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const nestedGroupRule = css.match(/\.k-ddn-x2 > \.k-ddn-x2\s*\{([^}]*)\}/)?.[1];

    expect(nestedGroupRule).toContain('padding: 0');
    expect(css).toContain(
      '.k-ddn-x1[data-layout=independent]:has(.k-ddn-e2 > .k-ddn-e10) .k-ddn-x2'
    );
  });

  it('keeps scroll affordances out of pointer hit-testing', () => {
    const css = sass.compile(new URL('./Dropdown.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const affordanceRule = css.match(/\.k-ddn-e11\s*\{([^}]*)\}/)?.[1];
    const activeAffordanceRule = css.match(/\.k-ddn-e11\[data-active=true\]\s*\{([^}]*)\}/)?.[1];

    expect(affordanceRule).toContain('pointer-events: none');
    expect(activeAffordanceRule).toContain('pointer-events: auto');
  });
});
