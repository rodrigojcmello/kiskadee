/** @vitest-environment jsdom */

import type { ColorVariant } from '@kiskadee/core';
import { act, createContext, createElement, useContext, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ButtonColorVariantControls,
  getButtonColorVariantSupport
} from './ButtonColorVariantControls';
import { SurfaceContextComparison } from './ButtonSurfaceContextComparison';

const mockSurfaceContext = createContext<'onSubtle' | 'onVivid' | undefined>(undefined);

const artifact = vi.hoisted(() => ({
  context: 'onVivid' as 'onSubtle' | 'onVivid',
  theme: 'light',
  classes: {} as any,
  colorVariants: undefined as any
}));
vi.mock('@kiskadee/react-components/button', () => ({
  Button: Object.assign(
    ({ children, toggle, controlState, selectionEmphasis, intent, onClick }: any) => (
      <button
        type="button"
        aria-pressed={toggle ? controlState : undefined}
        onClick={onClick}
        data-selection-emphasis={selectionEmphasis}
        data-intent={intent}
      >
        {children}
      </button>
    ),
    { Label: ({ children }: any) => <span>{children}</span> }
  ),
  useButtonArtifactConfig: () => ({
    buttonClassesMap: artifact.classes,
    colorVariants: artifact.colorVariants
  })
}));
vi.mock('@/hooks/use-button-color-variants', () => ({
  useButtonColorVariants: () => artifact.colorVariants
}));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ segment: 'default', theme: artifact.theme }),
  useSurfaceContext: () => useContext(mockSurfaceContext) ?? artifact.context
}));
vi.mock('@kiskadee/react-components/card', () => ({
  Card: ({ children }: any) => (
    <mockSurfaceContext.Provider value="onVivid">
      <article data-surface="onVivid">{children}</article>
    </mockSurfaceContext.Provider>
  )
}));
vi.mock('@kiskadee/react-components/layout', () => ({
  Layout: ({ children }: any) => <div>{children}</div>
}));
vi.mock('@kiskadee/react-components/smooth-text', () => ({
  SmoothText: ({ children }: any) => <span>{children}</span>
}));
vi.mock('@kiskadee/react-components/text', () => ({
  Text: ({ as = 'span', children, id }: any) => createElement(as, { id }, children)
}));
vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({ children, context }: any) => (
    <mockSurfaceContext.Provider value={context}>
      <article data-surface={context}>{children}</article>
    </mockSurfaceContext.Provider>
  )
}));
vi.mock('@/components/ShowcaseDisplayPreferences', () => ({
  useShowcaseDisplayPreferences: () => ({ showDescriptions: true })
}));
vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({})
}));
vi.mock('@kiskadee/react-components/select', () => ({
  Select: ({ label, value, onValueChange, options, size, sequential, loop }: any) => (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      data-size={size}
      data-sequential={sequential}
      data-loop={loop}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}));
vi.mock('@kiskadee/react-components/switch', () => ({
  Switch: ({ label, controlState, onControlStateChange, disabled }: any) => (
    <label>
      {label}
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        aria-checked={controlState}
        checked={controlState}
        disabled={disabled}
        onChange={(event) => onControlStateChange(event.target.checked)}
      />
    </label>
  )
}));

function Harness() {
  const [colorVariant, setColorVariant] = useState<ColorVariant>('standard');
  return (
    <ButtonColorVariantControls
      colorVariant={colorVariant}
      onColorVariantChange={setColorVariant}
    />
  );
}
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  artifact.colorVariants = undefined;
  artifact.context = 'onVivid';
  artifact.theme = 'light';
});
function render(comparison = false) {
  if (!root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  act(() =>
    root?.render(
      comparison ? (
        <SurfaceContextComparison
          fontName="Test font"
          onVividSupported
          radius="rounded"
          scale="s:md:1"
          surfaceContext="onSubtle"
          textAlign="center"
        />
      ) : (
        <Harness />
      )
    )
  );
}
function change(value: string) {
  act(() => {
    const control = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Color variant"]'
    )!;
    control.value = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
function publish() {
  artifact.colorVariants = { alternative: { 'default.light': { onVivid: { primary: ['high'] } } } };
}
describe('Button color variant controls', () => {
  it('discovers availability from metadata without class maps and limits it to the active coordinate', () => {
    publish();
    const input = {
      colorVariants: artifact.colorVariants,
      segment: 'default',
      theme: 'light',
      contexts: ['onVivid'] as const
    };
    expect(getButtonColorVariantSupport(input)).toBe(true);
    expect(getButtonColorVariantSupport({ ...input, contexts: ['onSubtle'] })).toBe(false);
    expect(getButtonColorVariantSupport({ ...input, theme: 'dark' })).toBe(false);
    expect(getButtonColorVariantSupport({ ...input, emphases: ['low'] })).toBe(false);
    expect(getButtonColorVariantSupport({ ...input, colorVariants: undefined })).toBe(false);
  });
  it('uses one Small looping sequential control and restores requested Alternative when coverage returns', () => {
    publish();
    render();
    expect(container.querySelectorAll('select')).toHaveLength(1);
    const control = container.querySelector<HTMLSelectElement>('select')!;
    expect(control.dataset.size).toBe('sm');
    expect(control.dataset.sequential).toBe('true');
    expect(control.dataset.loop).toBe('true');
    change('alternative');
    expect(control.value).toBe('alternative');
    artifact.theme = 'dark';
    render();
    expect(control.value).toBe('standard');
    artifact.theme = 'light';
    render();
    expect(control.value).toBe('alternative');
  });
  it('keeps all eight comparison buttons Standard and passive even when Alt is available', () => {
    publish();
    render(true);
    expect(container.querySelector('[role="switch"]')).toBeNull();
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons).toHaveLength(8);
    act(() => {
      for (const button of buttons) button.click();
    });
    for (const button of buttons) {
      expect(button.dataset.intent).toBe('primary');
      expect(button.getAttribute('aria-pressed')).toBeNull();
      expect(button.dataset.selectionEmphasis).toBeUndefined();
    }
  });
});
