/** @vitest-environment jsdom */

import { cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { Card } from '../Card/Card.tsx';
import { Container } from './Container.tsx';

const context: KiskadeeContextValue = {
  classesMap: {
    card: { e1: { c: { s: { primary: { h: 'card-primary-high' } } } } },
    container: {
      e1: {
        c: {
          s: {
            neutral: { m: 'container-on-subtle', ll: 'transparent-on-subtle' },
            neutralComplementary: { m: 'container-complementary' }
          },
          v: { neutral: { m: 'container-on-vivid', ll: 'transparent-on-vivid' } }
        }
      }
    }
  },
  componentArtifacts: {
    card: {
      component: 'card',
      contentSurfaceContext: {
        default: { light: { onSubtle: { primary: { high: { rest: 'onVivid' } } } } }
      }
    },
    container: {
      component: 'container',
      contentSurfaceContext: {
        default: {
          light: {
            onSubtle: {
              neutral: { medium: { rest: 'onSubtle' }, lowest: { rest: 'inherit' } },
              neutralComplementary: { medium: { rest: 'onSubtle' } }
            },
            onVivid: {
              neutral: { medium: { rest: 'onSubtle' }, lowest: { rest: 'inherit' } }
            }
          },
          dark: { onSubtle: { neutral: { medium: { rest: 'onVivid' } } } },
          darker: { onSubtle: { neutral: { medium: { rest: 'onSubtle' } } } }
        }
      }
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

function SurfaceProbe() {
  return <output data-testid="surface">{useSurfaceContext()}</output>;
}

afterEach(cleanup);

describe('Container', () => {
  it('renders one passive root with the generated surface class and forwards HTML props and ref', () => {
    const ref = createRef<HTMLDivElement>();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Container ref={ref} id="area" data-testid="container" className="consumer-class">
          <SurfaceProbe />
        </Container>
      </KiskadeeContext.Provider>
    );
    const root = result.getByTestId('container');

    expect(root).toBe(ref.current);
    expect(root.tagName).toBe('DIV');
    expect(root.className).toContain('container-on-subtle');
    expect(root.className).toContain('consumer-class');
    expect(root.getAttribute('id')).toBe('area');
    expect(root.hasAttribute('intent')).toBe(false);
    expect(root.hasAttribute('emphasis')).toBe(false);
    expect(root.hasAttribute('surfaceContext')).toBe(false);
    expect(result.container.firstElementChild).toBe(root);
    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
  });

  it('consumes the Card surface and republishes its own context without an extra wrapper', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Card intent="primary" emphasis="high" data-testid="card">
          <Container data-testid="container">
            <SurfaceProbe />
          </Container>
        </Card>
      </KiskadeeContext.Provider>
    );
    const card = result.getByTestId('card');
    const container = result.getByTestId('container');

    expect(card.tagName).toBe('DIV');
    expect(card.firstElementChild).toBe(container);
    expect(container.className).toContain('container-on-vivid');
    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
  });

  it('resolves a complementary surface through its own generated palette class', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Container intent="neutralComplementary" data-testid="container">
          <SurfaceProbe />
        </Container>
      </KiskadeeContext.Provider>
    );

    expect(result.getByTestId('container').className).toContain('container-complementary');
    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
  });

  it('inherits through a transparent Container and honors an explicit input override', () => {
    const renderRegion = (surfaceContext?: 'onSubtle') => (
      <KiskadeeContext.Provider value={context}>
        <Card intent="primary" emphasis="high">
          <Container emphasis="lowest" surfaceContext={surfaceContext} data-testid="container">
            <SurfaceProbe />
          </Container>
        </Card>
      </KiskadeeContext.Provider>
    );
    const result = render(renderRegion());

    expect(result.getByTestId('container').className).toContain('transparent-on-vivid');
    expect(result.getByTestId('surface').textContent).toBe('onVivid');
    result.rerender(renderRegion('onSubtle'));
    expect(result.getByTestId('container').className).toContain('transparent-on-subtle');
    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
  });

  it('selects the preset-authored output for light, dark, and darker', () => {
    const renderWithTheme = (theme: KiskadeeContextValue['theme']) => (
      <KiskadeeContext.Provider value={{ ...context, theme }}>
        <Container>
          <SurfaceProbe />
        </Container>
      </KiskadeeContext.Provider>
    );
    const result = render(renderWithTheme('light'));

    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
    result.rerender(renderWithTheme('dark'));
    expect(result.getByTestId('surface').textContent).toBe('onVivid');
    result.rerender(renderWithTheme('darker'));
    expect(result.getByTestId('surface').textContent).toBe('onSubtle');
  });
});
