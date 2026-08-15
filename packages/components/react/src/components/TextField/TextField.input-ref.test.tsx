/** @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { createTextFieldComponent } from './TextField.runtime.tsx';
import { textFieldStandardOutlineStructural } from './TextField.structural.ts';

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
