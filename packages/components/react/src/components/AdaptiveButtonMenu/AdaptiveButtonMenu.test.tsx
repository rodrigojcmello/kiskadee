/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { AdaptiveButtonMenu } from './AdaptiveButtonMenu.tsx';

function Glyph() {
  return <svg />;
}

const iconFamily = defineIconFamily({
  id: 'adaptive-test-icons',
  label: 'Adaptive test icons',
  glyphs: {
    check: Glyph,
    'chevron-down': Glyph,
    'chevron-end': Glyph,
    'chevron-left': Glyph,
    close: Glyph
  }
});

const tree = {
  id: 'actions',
  title: 'Actions',
  items: [
    {
      type: 'submenu' as const,
      id: 'advanced',
      label: 'Advanced',
      items: [
        { type: 'item' as const, id: 'inspect', label: 'Inspect' },
        {
          type: 'radio-group' as const,
          id: 'density',
          label: 'Density',
          defaultValue: 'comfortable',
          items: [
            {
              type: 'radio' as const,
              id: 'comfortable',
              label: 'Comfortable',
              value: 'comfortable'
            },
            { type: 'radio' as const, id: 'compact', label: 'Compact', value: 'compact' }
          ]
        }
      ]
    }
  ]
};

function context(compact: boolean): KiskadeeContextValue {
  return {
    classesMap: { button: {}, bottomSheet: {}, dropdown: {} },
    designSystem: 'test',
    segment: 'default',
    theme: 'light',
    layoutEnvironment: { isCompactViewport: compact },
    setDesignSystem: () => {},
    setSegment: () => {},
    setTheme: () => {}
  };
}

function Example({ compact }: { compact: boolean }) {
  return (
    <KiskadeeContext.Provider value={context(compact)}>
      <IconFamilyProvider families={[iconFamily]} family="adaptive-test-icons">
        <AdaptiveButtonMenu.Root tree={tree}>
          <AdaptiveButtonMenu.Trigger>Actions</AdaptiveButtonMenu.Trigger>
        </AdaptiveButtonMenu.Root>
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('AdaptiveButtonMenu', () => {
  it('turns submenus into navigable BottomSheet pages', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));

    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();
    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    expect(result.getByRole('heading', { name: 'Advanced' })).toBeTruthy();

    fireEvent.click(result.getByRole('button', { name: 'Back to Actions' }));
    expect(result.getByRole('heading', { name: 'Actions' })).toBeTruthy();
  });

  it('freezes the active presenter until close and switches while closed', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();

    result.rerender(<Example compact={false} />);
    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();

    fireEvent.click(result.getByRole('button', { name: 'Close' }));
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    expect(result.getByRole('menu', { name: 'Actions' })).toBeTruthy();
  });

  it('preserves uncontrolled radio state when a page unmounts and reopens', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    fireEvent.click(result.getByRole('radio', { name: 'Compact' }));

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    expect(result.getByRole('radio', { name: 'Compact' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });
});
