/** @vitest-environment jsdom */
import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ContentSurfaceContextMap
} from '@kiskadee/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { Button } from './Button.tsx';
import type { ButtonClassesMap, ButtonProps } from './Button.types.ts';

const paint = (name: string): ClassNameByElementJSON['c'] => ({
  v: {
    s: {
      primary: { h: `${name}-primary-high`, l: `${name}-primary-low` },
      neutral: { h: `${name}-neutral-high`, l: `${name}-neutral-low` }
    },
    a: { primary: { h: `${name}-primary-high-alt`, l: `${name}-primary-low-alt` } }
  }
});
function fixture(
  alternative = true,
  coverage: ComponentEmphasis[] = ['high', 'low']
): KiskadeeContextValue {
  const map: ButtonClassesMap = {
    e1: {
      d: 'root-decoration',
      s: { 'md:1': 'root-size' },
      rr: { 'md:1': 'root-radius' },
      c: paint('root')
    },
    e2: { c: paint('label') },
    e3: { c: paint('icon') },
    e11: {
      s: { all: 'line-size' },
      rr: { all: 'line-radius' },
      c: {
        v: {
          s: {
            primary: { h: 'indicator-high', l: 'indicator-low' },
            neutral: { h: 'indicator-neutral', l: 'indicator-neutral-low' }
          }
        }
      }
    },
    selectionRest: {
      e1: { c: paint('normal-root') },
      e2: { c: paint('normal-label') },
      e3: { c: paint('normal-icon') }
    }
  };
  const outputs: ContentSurfaceContextMap = {
    default: {
      light: {
        onVivid: {
          standard: {
            primary: { high: { rest: 'onSubtle' }, low: { rest: 'onVivid' } },
            neutral: { high: { rest: 'onSubtle' }, low: { rest: 'onVivid' } }
          },
          alternative: {
            primary: { high: { rest: 'onSubtle' }, low: { rest: 'onVivid', selected: 'onSubtle' } }
          }
        }
      }
    }
  };
  return {
    classesMap: { button: map },
    segment: 'default',
    theme: 'light',
    designSystem: 'variant-test',
    setSegment() {},
    setTheme() {},
    setDesignSystem() {},
    componentArtifacts: {
      button: {
        formatVersion: 3,
        component: 'button',
        contentSurfaceContext: outputs,
        capabilities: alternative
          ? {
              colorVariants: {
                alternative: { 'default.light': { onVivid: { primary: coverage } } }
              }
            }
          : {},
        indicator: { sizesByRadius: { rounded: ['md:1'] } }
      }
    }
  };
}
function Probe() {
  return <span data-testid="context">{useSurfaceContext()}</span>;
}
function Demo(props: ButtonProps) {
  return (
    <Button
      data-testid="button"
      size="md"
      radius="rounded"
      intent="neutral"
      emphasis="low"
      surfaceContext="onVivid"
      toggle
      {...props}
    >
      <Button.Icon>
        <svg />
      </Button.Icon>
      <Button.Label>
        Example
        <Probe />
      </Button.Label>
    </Button>
  );
}
afterEach(cleanup);
describe('qualified Button intentions', () => {
  it('keeps the effective base variant when an explicit selection intent is unavailable', () => {
    const value = fixture(true, ['high']);
    render(
      <KiskadeeContext.Provider value={value}>
        <Demo
          intent="primary-alt"
          selectionIntent="positive"
          selectionEmphasis="medium"
          controlState
        />
      </KiskadeeContext.Provider>
    );
    const button = screen.getByTestId('button');
    expect(button.className).toContain('normal-root-primary-high');
    expect(button.className).not.toContain('alt');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('uses one normalized fallback intent for an invalid Group intent and its members', () => {
    render(
      <KiskadeeContext.Provider value={fixture()}>
        <Button.Group
          intent={'primary-alt-alt' as ButtonProps['intent']}
          emphasis="low"
          surfaceContext="onVivid"
          size="md"
          radius="rounded"
        >
          <Button>Member</Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    expect(screen.getByRole('button', { name: 'Member' }).className).toContain('root-neutral-low');
  });

  it('uses the variant in the surfaced icon domain during strong selection', () => {
    const value = fixture();
    const map = value.classesMap.button as ButtonClassesMap;
    const region: ClassNameByElementJSON = {
      s: { 'md:1': 'region-geometry' },
      c: {
        v: { s: { neutral: { m: 'region-standard' } }, a: { neutral: { m: 'region-alternative' } } }
      }
    };
    map.e4 = region;
    map.selectionRest!.e4 = region;
    render(
      <KiskadeeContext.Provider value={value}>
        <Demo
          controlState
          selectionIntent="primary-alt"
          selectionEmphasis="medium"
          iconTreatment="surface"
        />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('normal-root-primary-high-alt');
    expect(screen.getByTestId('button').querySelector('.k-btn-e4')?.className).toContain(
      'region-alternative'
    );
  });
  it('uses an alternative at Rest through intent and falls back to the same standard intention', () => {
    const view = render(
      <KiskadeeContext.Provider value={fixture()}>
        <Demo intent="primary-alt" />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('root-primary-low-alt');
    view.rerender(
      <KiskadeeContext.Provider value={fixture(false)}>
        <Demo intent="primary-alt" />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('root-primary-low');
    expect(screen.getByTestId('button').className).not.toContain('alt');
  });
  it.each([
    'lowest',
    'low',
    'medium',
    'high'
  ] as const)('resolves selected-only Alternative with %s selection emphasis', (level) => {
    const value = fixture();
    const view = render(
      <KiskadeeContext.Provider value={value}>
        <Demo selectionIntent="primary-alt" selectionEmphasis={level} controlState={false} />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('root-neutral-low');
    view.rerender(
      <KiskadeeContext.Provider value={value}>
        <Demo selectionIntent="primary-alt" selectionEmphasis={level} controlState />
      </KiskadeeContext.Provider>
    );
    const button = screen.getByTestId('button');
    expect(button.className).toContain(
      level === 'medium' || level === 'high'
        ? 'normal-root-primary-high-alt'
        : 'root-primary-low-alt'
    );
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.querySelector('.k-btn-e11') !== null).toBe(level === 'low' || level === 'high');
    expect(screen.getByTestId('context').textContent).toBe('onSubtle');
    expect(button.className).toContain('root-size');
  });
  it('recognizes a different variant of the same intention', () => {
    render(
      <KiskadeeContext.Provider value={fixture()}>
        <Demo
          intent="primary"
          selectionIntent="primary-alt"
          selectionEmphasis="medium"
          controlState
        />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('normal-root-primary-high-alt');
  });
  it('removes only the qualifier when the selected alternative is missing', () => {
    render(
      <KiskadeeContext.Provider value={fixture(false)}>
        <Demo selectionIntent="primary-alt" selectionEmphasis="medium" controlState />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('normal-root-primary-high');
    expect(screen.getByTestId('button').className).not.toContain('neutral');
    expect(screen.getByTestId('button').getAttribute('aria-pressed')).toBe('true');
  });
  it('inherits the qualified Group base while keeping member selection local', () => {
    render(
      <KiskadeeContext.Provider value={fixture()}>
        <Button.Group
          intent="primary-alt"
          emphasis="low"
          surfaceContext="onVivid"
          size="md"
          radius="rounded"
        >
          <Button>Base</Button>
          <Button controlState selectionIntent="primary" selectionEmphasis="medium">
            Selected
          </Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    expect(screen.getByRole('button', { name: 'Base' }).className).toContain(
      'root-primary-low-alt'
    );
    expect(screen.getByRole('button', { name: 'Selected' }).className).toContain(
      'normal-root-primary-high'
    );
    expect(screen.getByRole('button', { name: 'Selected' }).className).not.toContain('alt');
  });
  it.each([
    'primary',
    'neutral'
  ] as const)('falls back the complete requested intent when an alternative part is missing from %s', (base) => {
    const value = fixture();
    delete (value.classesMap.button as ButtonClassesMap).e2!.c!.v!.a;
    render(
      <KiskadeeContext.Provider value={value}>
        <Demo intent={base} selectionIntent="primary-alt" controlState selectionEmphasis="low" />
      </KiskadeeContext.Provider>
    );
    expect(screen.getByTestId('button').className).toContain('root-primary-low');
    expect(screen.getByTestId('button').className).not.toContain('alt');
    expect(screen.getByTestId('button').getAttribute('aria-pressed')).toBe('true');
  });
});
