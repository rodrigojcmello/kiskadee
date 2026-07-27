import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon.tsx';

describe('Headless Icon', () => {
  it('exposes labelled image semantics for a meaningful glyph', () => {
    const html = renderToStaticMarkup(
      h(Icon, { label: 'Share', classNames: { e1: 'glyph' } }, h('svg', { 'aria-hidden': true }))
    );

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Share"');
    expect(html).toContain('class="glyph"');
    expect(html).not.toContain('aria-hidden="true"><svg');
  });

  it('removes decorative glyphs from the accessibility tree', () => {
    const html = renderToStaticMarkup(h(Icon, { decorative: true, className: 'extra' }, h('svg')));

    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
    expect(html).not.toContain('aria-label=');
    expect(html).toContain('class="extra"');
  });

  it('merges the e1 class and forwards native/data/unsafe attributes', () => {
    const html = renderToStaticMarkup(
      h(
        Icon,
        {
          decorative: true,
          classNames: { e1: 'base' },
          className: 'custom',
          title: 'Decoration',
          'data-testid': 'icon',
          unsafeAttrs: { 'tracking-id': 'icon-1' }
        },
        h('svg')
      )
    );

    expect(html).toContain('class="base custom"');
    expect(html).toContain('title="Decoration"');
    expect(html).toContain('data-testid="icon"');
    expect(html).toContain('tracking-id="icon-1"');
  });
});
