/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
  global: {
    components: {
      button: {
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
      },
      card: {
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
                  low: { rest: 'onSubtle' }
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
});
