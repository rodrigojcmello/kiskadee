/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { Badge } from '../Badge/Badge.tsx';
import { Button } from './Button.tsx';

const badgeRelationClasses = {
  d: 'button-badge-relation',
  s: {
    'sm:1': 'button-badge-relation-small',
    'md:1': 'button-badge-relation-medium',
    'lg:1': 'button-badge-relation-large'
  }
};

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
          s: { attention: { m: 'badge-on-subtle' } },
          v: { attention: { m: 'badge-on-vivid' } }
        }
      }
    },
    button: { e1: {}, e2: {}, e3: {}, e7: badgeRelationClasses }
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
              },
              onVivid: {
                neutral: {
                  medium: { rest: 'onSubtle', disabled: 'onVivid' }
                }
              }
            }
          }
        }
      }
    }
  }
};

const inlineContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    ...context.classesMap,
    button: {
      e1: {},
      e2: {},
      e3: {},
      e7: badgeRelationClasses
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

  it('groups logical inline placements next to the label without enabling overlay geometry', () => {
    render(
      <KiskadeeContext.Provider value={inlineContext}>
        <Button>
          <Button.Badge placement="inline-end">
            <Badge>New</Badge>
          </Button.Badge>
          <Button.Label>Messages</Button.Label>
          <Button.Badge placement="inline-start">
            <Badge>12</Badge>
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    const button = screen.getByRole('button', { name: /Messages/ });
    const group = button.querySelector('.k-btn-x5');
    const relationElements = group?.querySelectorAll('.k-btn-e7');

    expect(button.className.split(' ')).not.toContain('k-btn-e1j');
    expect(group).toBeTruthy();
    expect(relationElements).toHaveLength(2);
    expect(group?.textContent).toBe('12MessagesNew');
    expect(relationElements?.[0]?.className).toContain('k-btn-e7-inline-start');
    expect(relationElements?.[1]?.className).toContain('k-btn-e7-inline-end');
    expect(relationElements?.[0]?.className).toContain('button-badge-relation-medium');
  });

  it('omits an inline Badge when the active preset has no relation slot', () => {
    render(
      <KiskadeeContext.Provider value={context}>
        <Button>
          <Button.Label>Messages</Button.Label>
          <Button.Badge placement="inline-end">
            <Badge>New</Badge>
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    expect(screen.queryByText('New')).toBeNull();
  });

  it('preserves inline Badge composition with RTL, disabled, icon, disclosure, and Large scale', () => {
    render(
      <KiskadeeContext.Provider value={inlineContext}>
        <Button dir="rtl" disabled iconLayout="edge" scale="s:lg:1">
          <Button.Icon>
            <svg aria-hidden="true" />
          </Button.Icon>
          <Button.Label>Notifications</Button.Label>
          <Button.Badge placement="inline-end">
            <Badge>12</Badge>
          </Button.Badge>
          <Button.Disclosure>
            <svg aria-hidden="true" />
          </Button.Disclosure>
        </Button>
      </KiskadeeContext.Provider>
    );

    const button = screen.getByRole<HTMLButtonElement>('button');
    const relation = button.querySelector('.k-btn-e7-inline-end');

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('dir')).toBe('rtl');
    expect(button.querySelector('.k-btn-x5')).toBeTruthy();
    expect(button.querySelector('.k-btn-e3')).toBeTruthy();
    expect(button.querySelector('.k-btn-e5')).toBeTruthy();
    expect(relation?.className).toContain('button-badge-relation-large');
  });

  it('uses the consumed surface for overlays and the produced surface for inline Badges', () => {
    const result = render(
      <KiskadeeContext.Provider value={surfacedContext}>
        <Button>
          <Button.Label>Enabled</Button.Label>
          <Button.Badge>
            <Badge data-testid="overlay-badge">3</Badge>
          </Button.Badge>
          <Button.Badge placement="inline-end">
            <Badge data-testid="inline-badge">4</Badge>
          </Button.Badge>
        </Button>
        <Button disabled>
          <Button.Label>Disabled</Button.Label>
          <Button.Badge placement="inline-end">
            <Badge data-testid="disabled-inline-badge">5</Badge>
          </Button.Badge>
        </Button>
        <Button>
          <Button.Label>Explicit</Button.Label>
          <Button.Badge>
            <Badge data-testid="explicit-overlay-badge" surfaceContext="onVivid">
              6
            </Badge>
          </Button.Badge>
        </Button>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('overlay-badge').className).toContain('badge-on-subtle');
    expect(result.getByTestId('inline-badge').className).toContain('badge-on-vivid');
    expect(result.getByTestId('disabled-inline-badge').className).toContain('badge-on-subtle');
    expect(result.getByTestId('explicit-overlay-badge').className).toContain('badge-on-vivid');
  });

  it('keeps an overlay on the consumed vivid surface instead of hardcoding onSubtle', () => {
    const result = render(
      <KiskadeeContext.Provider value={surfacedContext}>
        <SurfaceContextProvider value="onVivid">
          <Button>
            <Button.Label>Vivid host</Button.Label>
            <Button.Badge>
              <Badge data-testid="vivid-overlay-badge">3</Badge>
            </Button.Badge>
            <Button.Badge placement="inline-end">
              <Badge data-testid="subtle-inline-badge">4</Badge>
            </Button.Badge>
          </Button>
        </SurfaceContextProvider>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('vivid-overlay-badge').className).toContain('badge-on-vivid');
    expect(result.getByTestId('subtle-inline-badge').className).toContain('badge-on-subtle');
  });
});
