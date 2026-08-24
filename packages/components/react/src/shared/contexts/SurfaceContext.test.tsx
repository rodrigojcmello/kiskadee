/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveContentSurfaceContext,
  SurfaceContextProvider,
  useSurfaceContext
} from './SurfaceContext.tsx';

afterEach(cleanup);

function Probe({ explicit }: { explicit?: 'onSubtle' | 'onVivid' }) {
  return <output data-testid="surface">{useSurfaceContext(explicit)}</output>;
}

const map = {
  default: {
    light: {
      onSubtle: {
        primary: {
          high: {
            rest: 'onVivid' as const,
            selected: 'inherit' as const,
            pending: 'onSubtle' as const,
            disabled: 'onVivid' as const
          }
        }
      }
    }
  }
};

describe('SurfaceContext', () => {
  it('uses onSubtle by default, the nearest Provider, and then an explicit override', () => {
    const baseline = render(<Probe />);
    expect(baseline.getByTestId('surface').textContent).toBe('onSubtle');
    baseline.unmount();

    render(
      <SurfaceContextProvider value="onVivid">
        <Probe />
        <Probe explicit="onSubtle" />
      </SurfaceContextProvider>
    );
    expect(screen.getAllByTestId('surface').map((node) => node.textContent)).toEqual([
      'onVivid',
      'onSubtle'
    ]);
  });

  it('resolves sparse outputs with disabled > pending > selected > rest precedence', () => {
    const base = {
      map,
      segment: 'default',
      theme: 'light' as const,
      consumedSurfaceContext: 'onSubtle' as const,
      intent: 'primary',
      emphasis: 'high' as const
    };
    expect(resolveContentSurfaceContext(base)).toBe('onVivid');
    expect(resolveContentSurfaceContext({ ...base, selected: true })).toBe('onSubtle');
    expect(resolveContentSurfaceContext({ ...base, selected: true, pending: true })).toBe(
      'onSubtle'
    );
    expect(
      resolveContentSurfaceContext({
        ...base,
        selected: true,
        pending: true,
        disabled: true
      })
    ).toBe('onVivid');
  });

  it('preserves the received context when the map branch is absent', () => {
    expect(
      resolveContentSurfaceContext({
        map,
        segment: 'default',
        theme: 'dark',
        consumedSurfaceContext: 'onVivid',
        intent: 'primary',
        emphasis: 'high'
      })
    ).toBe('onVivid');
  });
});
