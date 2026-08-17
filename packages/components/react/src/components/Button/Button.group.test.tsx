/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, Fragment, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';

const buttonClassMap = {
  e1: {
    d: 'button-base',
    e: {
      h: 'button-rest-shadow',
      rp: 'button-radius-effect-pill'
    },
    s: {
      all: 'button-scale-all',
      'sm:1': 'button-scale-small',
      'lg:1': 'button-scale-large'
    },
    rp: {
      'lg:1': 'button-pill-large'
    },
    c: {
      s: {
        neutral: { h: 'button-neutral-high', l: 'button-neutral-low' },
        primary: { h: 'button-primary-high' }
      },
      v: {
        primary: { h: 'button-primary-vivid-high' }
      }
    }
  },
  e2: {
    d: 'button-label',
    c: {
      s: {
        neutral: { h: 'label-neutral-high', l: 'label-neutral-low' },
        primary: { h: 'label-primary-high' }
      },
      v: {
        primary: { h: 'label-primary-vivid-high' }
      }
    }
  },
  e5: {
    d: 'button-disclosure',
    s: { all: 'disclosure-scale' },
    c: {
      s: { neutral: { h: 'disclosure-neutral' } },
      v: { primary: { h: 'disclosure-primary-vivid' } }
    }
  },
  e6: {
    d: 'button-divider',
    s: { all: 'divider-scale-all', 'lg:1': 'divider-scale-large' },
    c: {
      s: { neutral: { m: 'divider-neutral-medium' } },
      v: { primary: { h: 'divider-primary-vivid-high' } }
    }
  }
};

function createContext(options?: {
  groupDivider?: boolean;
  disclosureDivider?: boolean;
  dividerPaint?: 'default' | 'primary-only';
  withDivider?: boolean;
  withShadow?: boolean;
}): KiskadeeContextValue {
  const withDivider = options?.withDivider ?? true;
  const withShadow = options?.withShadow ?? true;

  return {
    classesMap: {
      button: {
        ...buttonClassMap,
        e1: {
          ...buttonClassMap.e1,
          e: withShadow ? buttonClassMap.e1.e : undefined
        },
        e6: withDivider
          ? {
              ...buttonClassMap.e6,
              c:
                options?.dividerPaint === 'primary-only'
                  ? { s: { primary: { h: 'divider-primary-high' } } }
                  : buttonClassMap.e6.c
            }
          : undefined
      }
    },
    designSystem: 'button-group-test',
    segment: 'default',
    theme: 'light',
    setDesignSystem: () => {},
    setSegment: () => {},
    setTheme: () => {},
    global: {
      components: {
        button: {
          options: {
            groupDivider: options?.groupDivider,
            disclosureDivider: options?.disclosureDivider
          }
        }
      }
    }
  };
}

function renderWithContext(children: ReactNode, context = createContext()) {
  return render(<KiskadeeContext.Provider value={context}>{children}</KiskadeeContext.Provider>);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Button.Group', () => {
  it('owns the shared visual tuple and applies the Rest shadow only to the wrapper', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ref = createRef<HTMLDivElement>();
    const onFirst = vi.fn();
    const onSecond = vi.fn();

    renderWithContext(
      <Button.Group
        ref={ref}
        className="author-group"
        data-testid="group"
        scale="s:lg:1"
        radius="pill"
        emphasis="high"
        intent="primary"
        surfaceContext="onVivid"
        shadow
      >
        <Button
          scale="s:sm:1"
          radius="square"
          emphasis="low"
          intent="neutral"
          surfaceContext="onSubtle"
          shadow
          radiusEffect
          onClick={onFirst}
        >
          First
        </Button>
        <Button onClick={onSecond}>Second</Button>
      </Button.Group>
    );

    const group = screen.getByTestId('group');
    const buttons = screen.getAllByRole('button');

    expect(ref.current).toBe(group);
    expect(group.hasAttribute('role')).toBe(false);
    expect(group.className).toContain('author-group');
    expect(group.className).toContain('k-btn-x3');
    expect(group.className).toContain('button-rest-shadow');
    expect(group.className).toContain('button-pill-large');
    expect(group.classList.contains('-e')).toBe(true);
    expect(group.classList.contains('-n')).toBe(false);

    for (const button of buttons) {
      expect(button.className).toContain('button-scale-large');
      expect(button.className).toContain('button-pill-large');
      expect(button.className).toContain('button-primary-vivid-high');
      expect(button.className).not.toContain('button-scale-small');
      expect(button.className).not.toContain('button-neutral-low');
      expect(button.className).not.toContain('button-rest-shadow');
      expect(button.className).not.toContain('button-radius-effect-pill');
      expect(button.classList.contains('-e')).toBe(false);
    }

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(onFirst).toHaveBeenCalledOnce();
    expect(onSecond).toHaveBeenCalledOnce();

    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button inside Button.Group inherits its shared visual contract. Ignored child props: scale, radius, emphasis, intent, surfaceContext, shadow, radiusEffect.'
    );
  });

  it('renders preset-authored group and disclosure dividers as decorative e6 nodes', () => {
    renderWithContext(
      <Button.Group
        data-testid="group"
        scale="s:lg:1"
        emphasis="high"
        intent="primary"
        surfaceContext="onVivid"
      >
        <Button>Save</Button>
        <Button>
          <Button.Label>Options</Button.Label>
          <Button.Disclosure fallback={<svg data-testid="disclosure-icon" />} />
        </Button>
      </Button.Group>,
      createContext({ groupDivider: true, disclosureDivider: true })
    );

    const group = screen.getByTestId('group');
    const groupDivider = Array.from(group.children).find((child) =>
      child.classList.contains('k-btn-e6a')
    );
    const disclosure = screen.getByTestId('disclosure-icon').closest('.k-btn-e5');
    const disclosureDivider = disclosure?.querySelector('.k-btn-e6b');

    expect(group.className).toContain('k-btn-x3a');
    expect(groupDivider).toBeInstanceOf(HTMLSpanElement);
    expect(groupDivider?.getAttribute('aria-hidden')).toBe('true');
    expect(groupDivider?.className).toContain('button-divider');
    expect(groupDivider?.className).toContain('divider-scale-large');
    expect(groupDivider?.className).toContain('divider-primary-vivid-high');
    expect(disclosureDivider?.getAttribute('aria-hidden')).toBe('true');
    expect(disclosureDivider?.className).toContain('button-divider');
    expect(group.querySelector('[role="separator"]')).toBeNull();
  });

  it('keeps the border-collapse branch when the preset does not enable e6', () => {
    renderWithContext(
      <Button.Group data-testid="group">
        <Button>Previous</Button>
        <Button>Next</Button>
      </Button.Group>,
      createContext({ groupDivider: false, disclosureDivider: false, withDivider: false })
    );

    const group = screen.getByTestId('group');
    expect(group.className).toContain('k-btn-x3');
    expect(group.className).not.toContain('k-btn-x3a');
    expect(group.querySelector('.k-btn-e6a')).toBeNull();
  });

  it('falls back to neutral divider paint for external intents', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithContext(
      <Button.Group data-testid="group" emphasis="high" intent="brand.google">
        <Button>Google action</Button>
        <Button>More</Button>
      </Button.Group>,
      createContext({ groupDivider: true })
    );

    const group = screen.getByTestId('group');
    const divider = group.querySelector('.k-btn-e6a');
    expect(group.classList.contains('k-btn-x3a')).toBe(true);
    expect(divider?.className).toContain('divider-neutral-medium');
  });

  it('falls back to neutral medium when a sparse intent override does not match the emphasis', () => {
    renderWithContext(
      <Button.Group data-testid="group" emphasis="low" intent="primary">
        <Button>Primary action</Button>
        <Button>More</Button>
      </Button.Group>,
      createContext({ groupDivider: true })
    );

    const divider = screen.getByTestId('group').querySelector('.k-btn-e6a');
    expect(divider?.className).toContain('divider-neutral-medium');
    expect(divider?.className).not.toContain('divider-primary-vivid-high');
  });

  it('treats buttons nested in Fragments as direct connected siblings', () => {
    renderWithContext(
      <Button.Group data-testid="group">
        <Fragment key="outer">
          <Button>First</Button>
          <Fragment key="inner">
            <Button>Second</Button>
          </Fragment>
        </Fragment>
      </Button.Group>,
      createContext({ groupDivider: true })
    );

    const children = Array.from(screen.getByTestId('group').children);
    expect(children.filter((child) => child.classList.contains('k-btn'))).toHaveLength(2);
    expect(children.filter((child) => child.classList.contains('k-btn-e6a'))).toHaveLength(1);
  });

  it('retains the authored border seam when neither requested nor neutral paint exists', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithContext(
      <Button.Group data-testid="group" emphasis="high" intent="neutral">
        <Button>First</Button>
        <Button>
          <Button.Label>Second</Button.Label>
          <Button.Disclosure fallback={<svg data-testid="unpainted-disclosure" />} />
        </Button>
      </Button.Group>,
      createContext({
        groupDivider: true,
        disclosureDivider: true,
        dividerPaint: 'primary-only'
      })
    );

    const group = screen.getByTestId('group');
    const disclosure = screen.getByTestId('unpainted-disclosure').closest('.k-btn-e5');
    expect(group.classList.contains('k-btn-x3a')).toBe(false);
    expect(group.querySelector('.k-btn-e6a')).toBeNull();
    expect(disclosure?.querySelector('.k-btn-e6b')).toBeNull();
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button groupDivider requires compatible Button.e6 paint from the active preset.'
    );
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button disclosureDivider requires compatible Button.e6 paint from the active preset.'
    );
  });

  it('warns and stays shadowless when the active preset has no Button Rest shadow', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithContext(
      <Button.Group data-testid="group" shadow>
        <Button>Only</Button>
      </Button.Group>,
      createContext({ withShadow: false })
    );

    expect(screen.getByTestId('group').classList.contains('-e')).toBe(false);
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button.Group shadow requires the active preset to publish a Button.e1 Rest shadow.'
    );
  });
});
