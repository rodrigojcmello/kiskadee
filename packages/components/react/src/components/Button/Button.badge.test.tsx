/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Badge } from '../Badge/Badge.tsx';
import { Button } from './Button.tsx';

const context: KiskadeeContextValue = {
  classesMap: {
    badge: {},
    button: { e1: {}, e2: {}, e3: {} }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

const surfacedContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    badge: {
      e1: {
        c: {
          s: { neutral: { m: 'badge-on-subtle' } },
          v: { neutral: { m: 'badge-on-vivid' } }
        }
      }
    },
    button: { e1: {}, e2: {}, e3: {} }
  },
  global: {
    components: {
      button: {
        contentSurfaceContext: {
          default: {
            light: {
              onSubtle: {
                neutral: {
                  medium: { rest: 'onVivid', disabled: 'onSubtle' }
                }
              }
            }
          }
        }
      }
    }
  }
};

afterEach(cleanup);

describe('Button.Badge', () => {
  it('anchors passive Badge content without reusing surfaced-icon geometry', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button>
          <Button.Label>Inbox</Button.Label>
          <Button.Badge placement="block-end-inline-start">
            <Badge.Dot aria-label="New notification" />
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    const button = screen.getByRole('button', { name: /Inbox/ });
    const overlay = screen.getByLabelText('New notification').parentElement;
    expect(button.className.split(' ')).toContain('k-btn-e1j');
    expect(button.className.split(' ')).not.toContain('k-btn-e1h');
    expect(overlay?.className).toContain('k-btn-x4-block-end-inline-start');
  });

  it('detects Badge and Label slots nested in transparent Fragments', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button>
          <Fragment key="content">
            <Button.Label>Inbox</Button.Label>
            <Button.Badge>
              <Badge.Dot aria-label="New notification" />
            </Button.Badge>
          </Fragment>
        </Button>
      </KiskadeeContext.Provider>
    );

    const button = screen.getByRole('button', { name: /Inbox/ });
    expect(button.className.split(' ')).toContain('k-btn-e1j');
  });

  it('keeps a Badge visible when the host Button is disabled', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button disabled>
          <Button.Label>Inbox</Button.Label>
          <Button.Badge>
            <Badge>3</Badge>
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Inbox/ }).disabled).toBe(true);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('publishes the authored Button surface to Badge and honors the disabled override', () => {
    const result = render(
      <KiskadeeContext.Provider value={surfacedContext}>
        <Button>
          <Button.Label>Enabled</Button.Label>
          <Button.Badge>
            <Badge data-testid="enabled-badge">3</Badge>
          </Button.Badge>
        </Button>
        <Button disabled>
          <Button.Label>Disabled</Button.Label>
          <Button.Badge>
            <Badge data-testid="disabled-badge">4</Badge>
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('enabled-badge').className).toContain('badge-on-vivid');
    expect(result.getByTestId('disabled-badge').className).toContain('badge-on-subtle');
  });
});
