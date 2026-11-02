/** @vitest-environment jsdom */
import type { ComponentResourceArtifact } from '@kiskadee/web-builder/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@/test-utils/react';
import { useButtonCompositionControls } from './ButtonCompositionControls';

const fixture = vi.hoisted(() => ({
  theme: 'light',
  metadata: undefined as ComponentResourceArtifact | undefined
}));
vi.mock('@kiskadee/react-components/resources', () => ({
  useKiskadee: () => ({ segment: 'default', theme: fixture.theme })
}));
vi.mock('@/hooks/use-button-color-variants', () => ({
  useButtonColorVariantMetadata: () => fixture.metadata
}));
afterEach(() => {
  cleanup();
  fixture.theme = 'light';
  fixture.metadata = undefined;
});
const metadata = () =>
  ({
    capabilities: {
      colorVariants: {
        standard: {
          'default.light': {
            onSubtle: { primary: ['high'], neutral: ['low'] },
            onVivid: { primary: ['high'], neutral: ['low'] }
          }
        },
        alternative: { 'default.light': { onVivid: { primary: ['high'] } } }
      }
    }
  }) as unknown as ComponentResourceArtifact;

describe('qualified intent composition choices', () => {
  it('falls back to the same selection intent when Alternative is unavailable', () => {
    fixture.metadata = metadata();
    const view = renderHook(
      ({ context }) =>
        useButtonCompositionControls(
          undefined,
          { intent: 'neutral', selectionIntent: 'primary-alt', selectionEmphasis: 'medium' },
          context
        ),
      { initialProps: { context: 'onVivid' as 'onVivid' | 'onSubtle' } }
    );
    expect(view.result.current.buttonProps().selectionIntent).toBe('primary-alt');
    view.rerender({ context: 'onSubtle' });
    expect(view.result.current.controls.selectionIntent).toBe('primary');
    expect(view.result.current.buttonProps()).toMatchObject({
      intent: 'neutral',
      selectionIntent: 'primary'
    });
    view.rerender({ context: 'onVivid' });
    expect(view.result.current.buttonProps().selectionIntent).toBe('primary-alt');
  });

  it('discovers Alternative before classes load and evaluates strong selection at High', () => {
    fixture.metadata = metadata();
    const view = renderHook(() => useButtonCompositionControls(undefined, {}, 'onVivid'), {
      initialProps: undefined
    });
    expect(view.result.current.controls.intentOptions.map((option) => option.value)).not.toContain(
      'primary-alt'
    );
    act(() => view.result.current.controls.onSelectionEmphasisChange('medium'));
    expect(
      view.result.current.controls.selectionIntentOptions.map((option) => option.value)
    ).toContain('primary-alt');
    act(() => view.result.current.controls.onSelectionIntentChange('primary-alt'));
    expect(view.result.current.buttonProps().selectionIntent).toBe('primary-alt');
    act(() => view.result.current.controls.onEmphasisChange('high'));
    expect(view.result.current.controls.intentOptions.map((option) => option.value)).toContain(
      'primary-alt'
    );
  });

  it('preserves Original and Same as button as a complete intent and variant pair', () => {
    fixture.metadata = metadata();
    const view = renderHook(
      () =>
        useButtonCompositionControls(
          undefined,
          { intent: 'original', selectionIntent: 'same' },
          'onVivid'
        ),
      { initialProps: undefined }
    );
    expect(view.result.current.buttonProps('primary-alt')).toMatchObject({
      intent: 'primary-alt',
      selectionIntent: 'primary-alt'
    });
  });

  it('keeps requested qualified choices through temporarily unsupported context or theme', () => {
    fixture.metadata = metadata();
    const view = renderHook(
      ({ context }) =>
        useButtonCompositionControls(
          undefined,
          { emphasis: 'high', selectionIntent: 'same' },
          context
        ),
      { initialProps: { context: 'onVivid' as 'onVivid' | 'onSubtle' } }
    );
    act(() => view.result.current.controls.onIntentChange('primary-alt'));
    expect(view.result.current.buttonProps()).toMatchObject({
      intent: 'primary-alt',
      selectionIntent: 'primary-alt'
    });
    view.rerender({ context: 'onSubtle' });
    expect(view.result.current.buttonProps()).toMatchObject({
      intent: 'primary',
      selectionIntent: 'primary'
    });
    view.rerender({ context: 'onVivid' });
    expect(view.result.current.buttonProps().intent).toBe('primary-alt');
    fixture.theme = 'dark';
    view.rerender({ context: 'onVivid' });
    expect(view.result.current.controls.intentOptions.map((option) => option.value)).not.toContain(
      'primary-alt'
    );
  });
});
