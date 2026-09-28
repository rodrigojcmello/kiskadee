/** @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { createTextFieldComponent } from './TextField.runtime.tsx';
import { textFieldStandardOutlineStructural } from './TextField.structural.ts';

vi.mock('./useTextFieldArtifactConfig.ts', () => ({
  useTextFieldArtifactConfig: () => ({
    textFieldClassesMap: {
      standard: {
        outline: {
          e4: {
            c: {
              s: {
                neutral: { m: 'neutral-paint' },
                error: { m: 'error-paint' },
                warning: { m: 'warning-paint' }
              },
              v: { neutral: { m: 'vivid-paint' } }
            }
          }
        }
      }
    },
    options: {},
    variants: {}
  })
}));

const TestTextField = createTextFieldComponent({
  displayName: 'TestTextField',
  structural: textFieldStandardOutlineStructural,
  layout: 'standard'
});

const context: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

afterEach(cleanup);

describe('styled TextField inputRef', () => {
  it('forwards the native input while retaining the internal TextField behavior', () => {
    const inputRef = createRef<HTMLInputElement>();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <TestTextField id="search-field" inputRef={inputRef} label="Search" defaultValue="Aurora" />
      </KiskadeeContext.Provider>
    );

    expect(inputRef.current).toBe(result.getByLabelText('Search'));
    expect(inputRef.current?.id).toBe('search-field');
    expect(inputRef.current?.value).toBe('Aurora');
  });
});

it.each([
  'disabled',
  'readOnly'
] as const)('uses neutral for %s without discarding validation semantics', (condition) => {
  const props = { [condition]: true };
  const view = (terminal: boolean) => (
    <KiskadeeContext.Provider value={context}>
      <TestTextField
        id="terminal"
        label="Email"
        intent="error"
        validationStatus="error"
        {...(terminal ? props : {})}
      />
    </KiskadeeContext.Provider>
  );
  const result = render(view(true));
  const input = result.getByLabelText('Email');
  expect(input.classList.contains('neutral-paint')).toBe(true);
  expect(input.classList.contains('error-paint')).toBe(false);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  result.rerender(view(false));
  expect(input.classList.contains('error-paint')).toBe(true);
});

it('follows the inherited surface context when it changes', () => {
  const tree = (value: 'onSubtle' | 'onVivid') => (
    <KiskadeeContext.Provider value={context}>
      <SurfaceContextProvider value={value}>
        <TestTextField label="Context field" />
      </SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
  const result = render(tree('onSubtle'));
  expect(result.getByLabelText('Context field').className).toContain('neutral-paint');
  result.rerender(tree('onVivid'));
  expect(result.getByLabelText('Context field').className).toContain('vivid-paint');
  expect(result.getByLabelText('Context field').className).not.toContain('neutral-paint');
});
