import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Button structural CSS', () => {
  it('anchors a passive indicator to the real border box without reserving layout space', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const host = css.match(/\.k-btn-e1k\s*\{([^}]*)\}/)?.[1];
    const indicator = css.match(/\.k-btn > \.k-btn-e11\s*\{([^}]*)\}/)?.[1];
    const outside = css.match(/\.k-btn > \.k-btn-e11a\s*\{([^}]*)\}/)?.[1];
    expect(host).toContain('overflow: visible');
    expect(host).not.toMatch(/(?:padding|margin|height|block-size):/);
    expect(indicator).toContain('position: absolute');
    expect(indicator).toContain('inset-inline: calc(var(--k-bdw) * -1)');
    expect(indicator).toContain('margin-inline: auto');
    expect(indicator).toContain('pointer-events: none');
    expect(indicator).toContain('inline-size: var(--k-bxw)');
    expect(indicator).toContain(
      'max-inline-size: max(0px, 100% + var(--k-bdw) * 2 - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(indicator).toContain('block-size: var(--k-bxh)');
    expect(indicator).toContain('border-radius: var(--k-bdr)');
    expect(indicator).toContain('inset-block-end: calc(var(--k-mgb) - var(--k-bdw))');
    expect(outside).toContain(
      'inset-block-end: calc((var(--k-bdw) + var(--k-mgt) + var(--k-bxh)) * -1)'
    );
  });

  it('clips feedback on an independent viewport without overriding progress, Badge or focus geometry', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const feedback = sass.compile(
      new URL(
        './effects/activation-feedback/ButtonActivationFeedback.structural.scss',
        import.meta.url
      ).pathname
    ).css;
    const viewport = css.match(/\.k-btn > \.k-btn-x6\s*\{([^}]*)\}/)?.[1];
    expect(viewport).toContain('inset: calc(var(--k-bdw) * -1)');
    expect(viewport).toContain('border-radius: inherit');
    expect(viewport).toContain('overflow: var(--k-af-overflow)');
    expect(viewport).toContain('clip-path: var(--k-af-clip)');
    expect(viewport).toContain('position: absolute');
    expect(css).toContain('.k-btn-x3 > .k-btn.k-btn-e1a:not(.k-btn-e1k)');
    expect(css).toContain(':not(:is(.k-btn-x1, .k-btn-x4, .k-btn-x6, .k-btn-e11))');
    expect(feedback).toContain('.k-btn-e1a:not(.k-btn-e1k):focus-visible');
    expect(feedback).toContain('.k-btn-e1a:not(.k-btn-e1k).-f.-k.-a');
    expect(feedback).toContain('.k-btn-e1a > .k-btn-x6::after');
    expect(feedback).toContain(':not(:is(.k-btn-x1, .k-btn-x4, .k-btn-x6, .k-btn-e11))');
    expect(feedback).not.toContain('.k-btn-e1a::after');
  });

  it('aligns overlays to borderless connected seams and ignores decoration in disclosure-only content', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const startEdge = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn > :is\(\.k-btn-e11, \.k-btn-x6\)\s*\{([^}]*)\}/
    )?.[1];
    const endEdge = css.match(
      /\.k-btn-x3a > \.k-btn:has\(\+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn\) > :is\(\.k-btn-e11, \.k-btn-x6\)\s*\{([^}]*)\}/
    )?.[1];
    expect(startEdge).toContain('inset-inline-start: 0');
    expect(endEdge).toContain('inset-inline-end: 0');
    const oneSeamBudget = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn > \.k-btn-e11,[^{]+\{([^}]*)\}/
    )?.[1];
    const twoSeamBudget = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn:has\(\+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn\) > \.k-btn-e11\s*\{([^}]*)\}/
    )?.[1];
    expect(oneSeamBudget).toContain(
      'max-inline-size: max(0px, 100% + var(--k-bdw) - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(twoSeamBudget).toContain(
      'max-inline-size: max(0px, 100% - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(css).toMatch(
      /\.k-btn:not\(:has\(> :not\(:is\(\.k-btn-e5, \.k-btn-x1, \.k-btn-x4, \.k-btn-x6, \.k-btn-e11\)\)\)\) > \.k-btn-e5\s*\{[^}]*margin-inline-start: 0;[^}]*padding-inline-start: 0;/
    );
    expect(css).not.toContain('.k-btn-e5:only-child');
  });

  it('normalizes intrinsic media and direct font glyphs using the authored icon viewport', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const slot = css.match(/^\.k-btn-e3\s*\{([^}]*)\}/m)?.[1];
    expect(slot).toContain('font-size: var(--k-bxh)');
    expect(slot).toContain('line-height: 1');
    expect(css).toMatch(
      /\.k-btn-e3 > picture > img\s*\{[^}]*block-size: 100%[^}]*inline-size: 100%/
    );
    expect(css).toMatch(/\.k-btn-e3 > picture > img\s*\{[^}]*object-fit: contain/);
    expect(css).toMatch(/\.k-btn-e3 > i\s*\{[^}]*font-size: inherit/);
  });

  it('anchors every external Badge corner using the host radius and logical axes', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    for (const block of ['start', 'end']) {
      for (const inline of ['start', 'end']) {
        const selector = `.k-btn-x4-block-${block}-inline-${inline}`;
        const rule = css.slice(css.indexOf(`${selector} {`)).split('}')[0];
        expect(rule).toContain(`inset-block-${block}: calc(var(--k-bdr, 0px)`);
        expect(rule).toContain(`inset-inline-${inline}: calc(var(--k-bdr, 0px)`);
        expect(css).toContain(`${selector}:dir(rtl)`);
      }
    }
  });

  it('keeps inline Badge relations neutral in the Button block axis', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const relationRule = css.match(/\.k-btn-e7\s*\{([^}]*)\}/)?.[1] ?? '';
    const inlineStartRule = css.match(/\.k-btn-e7-inline-start\s*\{([^}]*)\}/)?.[1] ?? '';
    const inlineEndRule = css.match(/\.k-btn-e7-inline-end\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(relationRule).toContain('align-items: center');
    expect(relationRule).toContain('align-self: center');
    expect(relationRule).toContain('block-size: 0');
    expect(relationRule).toContain('display: inline-flex');
    expect(relationRule).toContain('flex: none');
    expect(relationRule).toContain('min-block-size: 0');
    expect(relationRule).toContain('overflow: visible');
    expect(relationRule).toContain('pointer-events: none');
    expect(relationRule).not.toContain('position: absolute');
    expect(relationRule).not.toContain('max-block-size');
    expect(relationRule).not.toContain('inline-size: 0');
    expect(inlineStartRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(inlineEndRule).toContain('padding-inline-start: var(--k-pdl)');
  });

  it('removes the empty balancing track from edge-icon Buttons with an inline Badge', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const leadingRule =
      css.match(
        /\.k-btn-e1e\.k-btn-e1f:has\(> \.k-btn-e3\):has\(> \.k-btn-x5\):not\(:has\(> \.k-btn-e5\)\)\s*\{([^}]*)\}/
      )?.[1] ?? '';
    const trailingRule =
      css.match(
        /\.k-btn-e1e\.k-btn-e1g:has\(> \.k-btn-e3\):has\(> \.k-btn-x5\):not\(:has\(> \.k-btn-e5\)\)\s*\{([^}]*)\}/
      )?.[1] ?? '';

    expect(leadingRule).toContain('grid-template-columns: max-content max-content');
    expect(trailingRule).toContain('grid-template-columns: max-content max-content');
  });

  it('keeps the authored group divider above Button interaction surfaces', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];

    expect(dividerRule).toContain('z-index: 4');
    expect(css).not.toContain('.k-btn:hover + .k-btn-e6a:has(+ .k-btn)::before');
    expect(css).not.toContain('.k-btn-e6a:has(+ .k-btn:hover)::before');
    expect(css).not.toContain('.k-btn.-p.-a + .k-btn-e6a:has(+ .k-btn)::before');
    expect(css).not.toContain('.k-btn-e6a:has(+ .k-btn.-p.-a)::before');
  });

  it('raises interaction and focus painting without displacing the divider', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toContain('.k-btn-x3 > .k-btn:hover');
    expect(css).toContain('.k-btn-x3 > .k-btn:active');
    expect(css).toContain('.k-btn-x3 > .k-btn.-h.-a');
    expect(css).toContain('.k-btn-x3 > .k-btn.-p.-a');
    expect(css).toContain('.k-btn-x3 > .k-btn.-s.-a');
    expect(css).not.toContain('.k-btn-x3:not(.k-btn-x3a) > .k-btn:hover');

    const interactiveRule = css.match(/\.k-btn-x3 > \.k-btn:hover,[^{]+\{([^}]*)\}/)?.[1];
    const focusRule = css.match(/\.k-btn-x3 > \.k-btn:focus-visible,[^{]+\{([^}]*)\}/)?.[1];
    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];

    expect(interactiveRule).toContain('z-index: 2');
    expect(focusRule).toContain('z-index: 3');
    expect(dividerRule).toContain('z-index: 4');
  });

  it('hides group seams adjoining any selected member without depending on its paint or changing geometry', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const omittedSeam = css.match(
      /\.k-btn-x3a > \.k-btn\.-s\.-a \+ \.k-btn-x3b \+ \.k-btn-e6a,\s*\.k-btn-x3a > \.k-btn-e6a:has\(\+ \.k-btn\.-s\.-a\)\s*\{([^}]*)\}/
    )?.[1];

    expect(omittedSeam?.trim()).toBe('visibility: hidden;');
    expect(css).not.toMatch(/\.k-btn-e6b[^{}]*\{[^}]*visibility: hidden/);
  });

  it('overlays authored divider paint without reserving a gap through the Group surface', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];
    const dividerPaintRule = css.match(/\.k-btn-e6a::before\s*\{([^}]*)\}/)?.[1];
    const activeTrackRule = css.match(
      /\.k-btn-x3 > \.k-btn \+ \.k-btn-x3b \+ \.k-btn-e6a:has\(\+ \.k-btn\)\s*\{([^}]*)\}/
    )?.[1];
    const startRule = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn\s*\{([^}]*)\}/
    )?.[1];
    const endRule = css.match(
      /\.k-btn-x3a > \.k-btn:has\(\+ \.k-btn-x3b \+ \.k-btn-e6a \+ \.k-btn\)\s*\{([^}]*)\}/
    )?.[1];
    const borderCollapseRule = css.match(
      /\.k-btn-x3:not\(\.k-btn-x3a\) > \.k-btn \+ \.k-btn\s*\{([^}]*)\}/
    )?.[1];

    expect(dividerRule).toContain('position: absolute');
    expect(dividerRule).toContain('inset-block: 0');
    expect(dividerRule).toContain('inset-inline-start: 0');
    expect(dividerRule).toContain('display: none');
    expect(activeTrackRule).toContain('display: block');
    expect(dividerRule).toContain('inline-size: 0');
    expect(dividerRule).not.toContain('flex:');
    expect(dividerPaintRule).toContain('position: absolute');
    expect(dividerPaintRule).toContain('inline-size: var(--k-bxw)');
    expect(dividerPaintRule).toContain('block-size: var(--k-bxh)');
    expect(dividerRule).toContain('pointer-events: none');
    expect(startRule).toContain('border-inline-start-width: 0');
    expect(startRule).toContain('padding-inline-start: var(--k-pdl)');
    expect(endRule).toContain('border-inline-end-width: 0');
    expect(endRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(startRule).toContain('margin-inline-start: calc(var(--k-bxw) * -1)');
    expect(endRule).not.toContain('margin-inline-end:');
    expect(dividerPaintRule).toContain('inset-inline-start: calc(var(--k-bxw) * -1)');
    expect(borderCollapseRule).toContain('margin-inline-start: calc(var(--k-bdw) * -1)');
  });

  it('shares intrinsic grid columns with passive perimeter segments without clipping the Group', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const frame = css.match(/\.k-btn-x3 > \.k-btn-x3b\s*\{([^}]*)\}/)?.[1];
    const group = css.match(/\.k-btn-x3\s*\{([^}]*)\}/)?.[1];
    const framedGroup = css.match(/\.k-btn-x3a\s*\{([^}]*)\}/)?.[1];
    expect(framedGroup).toContain('display: inline-grid');
    expect(framedGroup).toContain('grid-auto-columns: max-content');
    expect(framedGroup).toContain('grid-auto-flow: column');
    expect(framedGroup).toContain('grid-template-rows: auto');
    expect(frame).toContain('position: absolute');
    expect(frame).toContain('inset: 0');
    expect(frame).toContain('box-sizing: border-box');
    expect(frame).toContain('pointer-events: none');
    expect(frame).toContain('z-index: 4');
    expect(frame).not.toMatch(/(?:padding|margin|height|width|block-size|inline-size):/);
    expect(group).not.toMatch(/overflow: (?:hidden|clip)/);
    expect(group).not.toContain('clip-path:');
  });

  it('removes only promoted member perimeter paint and trims the adjacent overlap in LTR and RTL', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const promoted = css.match(/\.k-btn-x3a > \.k-btn-e1l \+ \.k-btn-x3b\s*\{([^}]*)\}/)?.[1];
    const preceding = css.match(
      /\.k-btn-x3b:has\(\+ \.k-btn-e6a \+ \.k-btn-e1l\)\s*\{([^}]*)\}/
    )?.[1];
    const precedingRtl = css.match(
      /\.k-btn-x3b:has\(\+ \.k-btn-e6a \+ \.k-btn-e1l\):dir\(rtl\)\s*\{([^}]*)\}/
    )?.[1];
    expect(promoted).toContain('visibility: hidden');
    expect(promoted).not.toMatch(/display|margin|padding|z-index/);
    expect(preceding).toContain('clip-path: inset(0 var(--k-bxw) 0 0)');
    expect(precedingRtl).toContain('clip-path: inset(0 0 0 var(--k-bxw))');
    expect(preceding).not.toMatch(/width|margin|padding|z-index/);
    expect(css).not.toMatch(/\.k-btn-e1l\s*\{[^}]*z-index/);
  });
});
