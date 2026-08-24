/** @vitest-environment jsdom */

import { DEFAULT_ESSENTIAL_ICONS, defineIconFamily } from '@kiskadee/icons/interface';
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { EssentialIconProvider } from '../../shared/contexts/EssentialIconContext.tsx';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { BottomSheet } from './BottomSheet.tsx';

function Check() {
  return <svg />;
}

const iconFamily = defineIconFamily({
  id: 'bottom-sheet-test-icons',
  label: 'BottomSheet test icons',
  glyphs: { check: Check, 'radio-selected': Check, close: Check }
});

const intentClasses = {
  c: {
    s: {
      neutral: { m: 'slot-neutral' },
      destructive: { m: 'slot-destructive' }
    }
  }
};

const context: KiskadeeContextValue = {
  classesMap: {
    bottomSheet: {
      e12: { s: { all: 'group-separator' } },
      e8: intentClasses,
      e9: intentClasses,
      e10: intentClasses,
      e11: intentClasses,
      e13: intentClasses,
      e15: intentClasses
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

function renderBottomSheetVisual(children: ReactNode) {
  return render(
    <KiskadeeContext.Provider value={context}>
      <IconFamilyProvider families={[iconFamily]} family="bottom-sheet-test-icons">
        <EssentialIconProvider icons={DEFAULT_ESSENTIAL_ICONS}>
          <BottomSheet.VisualProvider>{children}</BottomSheet.VisualProvider>
        </EssentialIconProvider>
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('styled BottomSheet', () => {
  it('resolves nested item slots with only the active item intent', () => {
    const result = renderBottomSheetVisual(
      <BottomSheet.Item intent="destructive">
        <BottomSheet.Checkmark data-testid="checkmark" />
        <BottomSheet.Icon data-testid="icon">
          <svg />
        </BottomSheet.Icon>
        <BottomSheet.Label data-testid="label">Delete</BottomSheet.Label>
        <BottomSheet.Description data-testid="description">
          Cannot be undone
        </BottomSheet.Description>
        <BottomSheet.EndText data-testid="end-text">Del</BottomSheet.EndText>
        <BottomSheet.Trailing data-testid="trailing">
          <svg />
        </BottomSheet.Trailing>
      </BottomSheet.Item>
    );

    for (const testId of ['checkmark', 'icon', 'label', 'description', 'end-text', 'trailing']) {
      const className = result.getByTestId(testId).className;
      expect(className).toContain('slot-destructive');
      expect(className).not.toContain('slot-neutral');
    }
  });

  it('applies the shared visible focus treatment to focusable titles', () => {
    const result = renderBottomSheetVisual(<BottomSheet.Title>Actions</BottomSheet.Title>);

    expect(result.getByRole('heading', { name: 'Actions' }).className).toContain('k-foc');
  });

  it('renders one automatic boundary per group when group separators are enabled', () => {
    const result = renderBottomSheetVisual(
      <BottomSheet.Page>
        <BottomSheet.Group>
          <BottomSheet.Item>First</BottomSheet.Item>
        </BottomSheet.Group>
        <BottomSheet.Group>
          <BottomSheet.Item>Second</BottomSheet.Item>
        </BottomSheet.Group>
      </BottomSheet.Page>
    );

    expect(result.getAllByRole('separator')).toHaveLength(2);
  });

  it('omits automatic group boundaries when group separators are disabled', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <BottomSheet.VisualProvider groupSeparators={false}>
          <BottomSheet.Page>
            <BottomSheet.Group>
              <BottomSheet.Item>First</BottomSheet.Item>
            </BottomSheet.Group>
            <BottomSheet.Group>
              <BottomSheet.Item>Second</BottomSheet.Item>
            </BottomSheet.Group>
          </BottomSheet.Page>
        </BottomSheet.VisualProvider>
      </KiskadeeContext.Provider>
    );

    expect(result.queryByRole('separator')).toBeNull();
  });
});
