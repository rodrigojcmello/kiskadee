/** @vitest-environment jsdom */

import { stateActivator as cn } from '@kiskadee/core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import {
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { Badge } from '../Badge/Badge.tsx';
import { Button } from '../Button/Button.tsx';
import { Card, CardAction } from './Card.tsx';

vi.mock('@kiskadee/react-headless', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('../../../../../headless/react/src/components/card/Card.tsx'))
}));

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
    badge: {
      e1: {
        c: {
          s: { attention: { m: 'badge-on-subtle' } },
          v: { attention: { m: 'badge-on-vivid' } }
        }
      }
    },
    button: { e1: {}, e2: {}, e3: {}, e7: badgeRelationClasses },
    card: { e1: {} }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {},
  global: {},
  componentArtifacts: {
    button: {
      component: 'button',
      ...{
        contentSurfaceContext: {
          default: {
            light: {
              onVivid: {
                primary: {
                  high: { rest: 'onSubtle' }
                }
              }
            }
          }
        }
      }
    },
    card: {
      component: 'card',
      ...{
        contentSurfaceContext: {
          default: {
            light: {
              onSubtle: {
                neutral: {
                  medium: {
                    rest: 'onSubtle',
                    selected: 'onVivid',
                    disabled: 'onVivid'
                  },
                  low: { rest: 'onSubtle', selected: 'onVivid' }
                },
                primary: {
                  high: { rest: 'onVivid' }
                }
              },
              onVivid: {
                neutral: {
                  low: { rest: 'onSubtle' }
                },
                primary: {
                  high: { rest: 'onVivid' }
                }
              }
            }
          }
        }
      }
    }
  }
};

function SurfaceProbe({ testId }: { testId: string }) {
  return <output data-testid={testId}>{useSurfaceContext()}</output>;
}

afterEach(cleanup);

describe('Card Surface Context', () => {
  it.each([
    Card,
    CardAction
  ])('keeps clipped content on one root without forwarding the visual prop', (Component) => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Component clipContent data-testid="card">
          <span data-testid="child">Content</span>
        </Component>
      </KiskadeeContext.Provider>
    );
    const card = result.getByTestId('card');

    expect(card.tagName).toBe(Component === Card ? 'DIV' : 'BUTTON');
    expect(card.className).toContain('k-crd-e1a');
    expect(card.hasAttribute('clipContent')).toBe(false);
    expect(card.firstElementChild).toBe(result.getByTestId('child'));
  });

  it('composes recursively through nested Cards, Button, and Badge without forced alternation', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <SurfaceContextProvider value="onSubtle">
          <Card intent="primary" emphasis="high">
            <SurfaceProbe testId="outer-card-surface" />
            <Card intent="neutral" emphasis="low">
              <SurfaceProbe testId="inner-subtle-card-surface" />
              <Card intent="primary" emphasis="high">
                <SurfaceProbe testId="inner-vivid-card-surface" />
                <Button intent="primary" emphasis="high">
                  <Button.Label>Continue</Button.Label>
                  <Button.Badge placement="inline-end">
                    <Badge data-testid="nested-badge">1</Badge>
                  </Button.Badge>
                </Button>
              </Card>
            </Card>
          </Card>
        </SurfaceContextProvider>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('outer-card-surface').textContent).toBe('onVivid');
    expect(result.getByTestId('inner-subtle-card-surface').textContent).toBe('onSubtle');
    expect(result.getByTestId('inner-vivid-card-surface').textContent).toBe('onVivid');
    expect(result.getByTestId('nested-badge').className).toContain('badge-on-subtle');
  });

  it('publishes the resolved uncontrolled selected state from CardAction', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <CardAction defaultControlState={false}>
          <SurfaceProbe testId="action-surface" />
        </CardAction>
      </KiskadeeContext.Provider>
    );
    const action = result.getByRole('button');

    expect(result.container.firstElementChild).toBe(action);
    expect(result.getByTestId('action-surface').textContent).toBe('onSubtle');
    fireEvent.click(action);
    expect(result.getByTestId('action-surface').textContent).toBe('onVivid');
  });

  it('publishes the disabled output for a natively disabled CardAction', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <CardAction disabled>
          <SurfaceProbe testId="disabled-action-surface" />
        </CardAction>
      </KiskadeeContext.Provider>
    );

    expect(result.getByRole<HTMLButtonElement>('button').disabled).toBe(true);
    expect(result.getByTestId('disabled-action-surface').textContent).toBe('onVivid');
  });

  it.each([
    'pending',
    'disabled'
  ] as const)('keeps selected semantics while %s surface and descendants use Rest fallback', (terminal) => {
    const content = (active: boolean) => (
      <KiskadeeContext.Provider value={context}>
        <CardAction
          controlState
          emphasis="low"
          disabled={active && terminal === 'disabled'}
          status={active && terminal === 'pending' ? 'pending' : undefined}
        >
          <SurfaceProbe testId="selected-terminal-surface" />
        </CardAction>
      </KiskadeeContext.Provider>
    );
    const result = render(content(false));
    const action = result.getByRole('button');
    expect(action.classList.contains(cn.selected)).toBe(true);
    expect(result.getByTestId('selected-terminal-surface').textContent).toBe('onVivid');
    result.rerender(content(true));
    expect(action.classList.contains(cn.selected)).toBe(false);
    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(result.getByTestId('selected-terminal-surface').textContent).toBe('onSubtle');
    result.rerender(content(false));
    expect(action.classList.contains(cn.selected)).toBe(true);
    expect(result.getByTestId('selected-terminal-surface').textContent).toBe('onVivid');
  });

  it('lets Headless suppress forced transient classes when CardAction is disabled', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <CardAction disabled status="hover">
          Action
        </CardAction>
      </KiskadeeContext.Provider>
    );
    const action = result.getByRole('button');
    expect(action.classList.contains(cn.disabled)).toBe(true);
    expect(action.classList.contains(cn.hover)).toBe(false);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(false);
  });
});
