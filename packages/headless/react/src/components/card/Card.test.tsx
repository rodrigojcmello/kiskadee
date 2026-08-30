/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CardAction } from './Card.tsx';

afterEach(cleanup);

describe('CardAction', () => {
  it('exposes its resolved uncontrolled control state to render children', () => {
    const result = render(
      <CardAction defaultControlState={false}>
        {({ controlState }) => (controlState ? 'selected' : 'rest')}
      </CardAction>
    );
    const action = result.getByRole('button');

    expect(action.getAttribute('aria-pressed')).toBe('false');
    expect(action.textContent).toBe('rest');

    fireEvent.click(action);

    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(action.textContent).toBe('selected');
  });
});
