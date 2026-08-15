/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from '../Button/Button.tsx';
import { ButtonMenu } from './ButtonMenu.tsx';

function Chevron() {
  return <svg data-testid="chevron" />;
}

const iconFamily = defineIconFamily({
  id: 'test-icons',
  label: 'Test icons',
  glyphs: { 'chevron-down': Chevron }
});

const context: KiskadeeContextValue = {
  classesMap: { button: {}, dropdown: {} },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

function renderButtonMenu(children: ReactNode) {
  return render(
    <KiskadeeContext.Provider value={context}>
      <IconFamilyProvider families={[iconFamily]} family="test-icons">
        {children}
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('ButtonMenu', () => {
  it('renders split action and menu trigger as sibling buttons with independent semantics', async () => {
    const onAction = vi.fn();
    const onTriggerClick = vi.fn();
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Action type="submit" onClick={onAction}>
          <Button.Label>Save</Button.Label>
        </ButtonMenu.Action>
        <ButtonMenu.Trigger aria-label="More save actions" onClick={onTriggerClick} />
        <ButtonMenu.Content>
          <ButtonMenu.Item textValue="Save as copy">
            <ButtonMenu.Label>Save as copy</ButtonMenu.Label>
          </ButtonMenu.Item>
          <ButtonMenu.Item href="/archive" textValue="Open archive">
            <ButtonMenu.Label>Open archive</ButtonMenu.Label>
          </ButtonMenu.Item>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );
    const action = result.getByRole('button', { name: 'Save' });
    const trigger = result.getByRole('button', { name: 'More save actions' });

    expect(action.parentElement).toBe(trigger.parentElement);
    expect(action.querySelector('button')).toBeNull();
    expect(trigger.querySelector('button')).toBeNull();
    expect(action.getAttribute('type')).toBe('submit');
    expect(action.getAttribute('aria-haspopup')).toBeNull();
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');

    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledOnce();
    expect(result.queryByRole('menu')).toBeNull();

    fireEvent.click(trigger);
    expect(onTriggerClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    expect(result.getByRole('menuitem', { name: 'Open archive' }).getAttribute('href')).toBe(
      '/archive'
    );
  });

  it('forwards the styled Button root ref used by overlay anchors', () => {
    let button: HTMLButtonElement | null = null;
    renderButtonMenu(
      <Button
        ref={(node) => {
          button = node;
        }}
      >
        <Button.Label>Standalone</Button.Label>
      </Button>
    );

    expect(button?.tagName).toBe('BUTTON');
  });
});
