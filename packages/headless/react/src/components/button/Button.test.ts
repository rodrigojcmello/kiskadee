import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Headless Button', () => {
  it('renders native button semantics with default type=button', () => {
    const html = renderToStaticMarkup(h(Button, { label: 'Save' }));

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('<span>Save</span>');
  });

  it('allows overriding button type and forwards aria/disabled attributes', () => {
    const html = renderToStaticMarkup(
      h(Button, {
        label: 'Submit',
        type: 'submit',
        disabled: true,
        'aria-disabled': true,
        'aria-pressed': true,
        'data-testid': 'headless-btn'
      })
    );

    expect(html).toContain('type="submit"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-testid="headless-btn"');
  });

  it('supports unsafeAttrs as an explicit escape hatch for uncommon attributes', () => {
    const html = renderToStaticMarkup(
      h(Button, {
        label: 'Unsafe',
        unsafeAttrs: {
          'qa-anchor': 'headless-button',
          'tracking-id': 'btn-123'
        }
      })
    );

    expect(html).toContain('qa-anchor="headless-button"');
    expect(html).toContain('tracking-id="btn-123"');
  });

  it('applies classNames mapping for root, label and icon in legacy props mode', () => {
    const html = renderToStaticMarkup(
      h(Button, {
        classNames: { e1: 'root-class', e2: 'label-class', e3: 'icon-class' },
        icon: h('svg'),
        label: 'Label'
      })
    );

    expect(html).toContain('class="root-class"');
    expect(html).toContain('<span class="icon-class" aria-hidden="true"><svg></svg></span>');
    expect(html).toContain('<span class="label-class">Label</span>');
  });

  it('lets compound slots append className and preserve explicit aria-hidden in Button.Icon', () => {
    const html = renderToStaticMarkup(
      h(
        Button,
        { classNames: { e2: 'e2-base', e3: 'e3-base' } },
        h(Button.Icon, { className: 'icon-extra', 'aria-hidden': false }, h('svg')),
        h(Button.Label, { className: 'label-extra' }, 'Custom')
      )
    );

    expect(html).toContain('class="e3-base icon-extra"');
    expect(html).toContain('aria-hidden="false"');
    expect(html).toContain('class="e2-base label-extra"');
    expect(html).toContain('>Custom</span>');
  });

  it('prioritizes children over legacy icon/label props', () => {
    const html = renderToStaticMarkup(
      h(Button, { icon: h('svg'), label: 'Legacy' }, h(Button.Label, null, 'Slot Label'))
    );

    expect(html).toContain('Slot Label');
    expect(html).not.toContain('Legacy');
  });

  it('throws when compound slots are rendered outside Button context', () => {
    expect(() => renderToStaticMarkup(h(Button.Label, null, 'Orphan'))).toThrow(
      'Button compound components must be used within a Button'
    );
    expect(() => renderToStaticMarkup(h(Button.Icon, null, 'Orphan'))).toThrow(
      'Button compound components must be used within a Button'
    );
  });
});
