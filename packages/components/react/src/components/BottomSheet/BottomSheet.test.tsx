/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
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
  glyphs: { check: Check }
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
        <BottomSheet.VisualProvider>{children}</BottomSheet.VisualProvider>
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
});
