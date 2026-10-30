/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, Fragment, type ReactNode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';

const buttonClassMap = {
  e1: {
    d: 'button-base',
    p: {
      gd: {
        all: 'divider-width-all',
        'lg:1': 'divider-width-large'
      }
    },
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
  },
  group: {
    frame: {
      d: 'frame-border-style',
      s: { all: 'frame-border-width' },
      rr: { all: 'frame-rounded' },
      rp: { all: 'frame-pill' },
      rs: { all: 'frame-square' },
      c: {
        s: {
          neutral: {
            m: 'frame-neutral-rest',
            l: 'frame-neutral-low-rest',
            h: 'frame-neutral-high-rest'
          },
          primary: { h: 'frame-primary-rest', l: 'frame-primary-low-rest' },
          'brand.google': { h: 'frame-google-rest' }
        },
        v: { primary: { h: 'frame-primary-vivid-rest' } }
      }
    },
    member: {
      d: 'member-border-off',
      c: {
        s: {
          neutral: {
            m: 'member-neutral-medium',
            l: 'member-neutral-low',
            h: 'member-neutral-high'
          },
          primary: { h: 'member-primary-high', l: 'member-primary-low' },
          'brand.google': { h: 'member-google-high' }
        },
        v: { primary: { h: 'member-primary-vivid-high' } }
      }
    },
    selectionRestMember: {
      d: 'member-border-off',
      c: { s: { neutral: { h: 'member-neutral-high-normal' } } }
    }
  },
  selectionRest: {
    e1: { c: { s: { neutral: { h: 'button-neutral-high-normal' } } } },
    e2: { c: { s: { neutral: { h: 'label-neutral-high-normal' } } } }
  }
};

function createContext(options?: {
  groupDivider?: boolean;
  disclosureDivider?: boolean;
  dividerPaint?: 'default' | 'primary-only';
  withDivider?: boolean;
  withDividerGeometry?: boolean;
  withProjection?: boolean;
  withShadow?: boolean;
  withGroup?: boolean;
  withSelectionRest?: boolean;
}): KiskadeeContextValue {
  const withDivider = options?.withDivider ?? true;
  const withProjection = options?.withProjection ?? true;
  const withShadow = options?.withShadow ?? true;

  return {
    classesMap: {
      button: {
        ...buttonClassMap,
        group: options?.withGroup === false ? undefined : buttonClassMap.group,
        selectionRest:
          options?.withSelectionRest === false ? undefined : buttonClassMap.selectionRest,
        e1: {
          ...buttonClassMap.e1,
          p: withDivider && withProjection ? buttonClassMap.e1.p : undefined,
          e: withShadow ? buttonClassMap.e1.e : undefined
        },
        e6: withDivider
          ? {
              ...buttonClassMap.e6,
              s: options?.withDividerGeometry === false ? undefined : buttonClassMap.e6.s,
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
    global: {},
    componentArtifacts: {
      button: {
        component: 'button',
        ...{
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
        size="lg"
        radius="pill"
        emphasis="high"
        intent="primary"
        surfaceContext="onVivid"
        shadow
      >
        <Button
          size="sm"
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
      '[Kiskadee] Button inside Button.Group inherits its shared visual contract. Ignored child props: size, radius, emphasis, intent, surfaceContext, shadow, radiusEffect.'
    );
  });

  it('renders preset-authored group and disclosure dividers as decorative e6 nodes', () => {
    renderWithContext(
      <Button.Group
        data-testid="group"
        size="lg"
        emphasis="high"
        intent="primary"
        surfaceContext="onVivid"
      >
        <Button>Save</Button>
        <Button>
          <Button.Label>Options</Button.Label>
          <Button.Disclosure>
            <svg data-testid="disclosure-icon" />
          </Button.Disclosure>
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
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).toContain('divider-width-all');
      expect(button.className).toContain('divider-width-large');
      expect(button.className).toContain('member-primary-vivid-high');
      expect(button.className).toContain('member-border-off');
      expect(button.className).not.toContain('button-primary-vivid-high');
    }
    const frame = group.querySelector('.k-btn-x3b');
    expect(frame?.className).toContain('frame-primary-vivid-rest');
    expect(frame?.className).toContain('frame-rounded');
    expect(frame?.getAttribute('aria-hidden')).toBe('true');
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

  it('keeps legacy borders when the divider thickness projection is unavailable', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithContext(
      <Button.Group data-testid="group">
        <Button>Previous</Button>
        <Button>Next</Button>
      </Button.Group>,
      createContext({ groupDivider: true, withProjection: false })
    );

    const group = screen.getByTestId('group');
    expect(group.className).toContain('k-btn-x3');
    expect(group.classList.contains('k-btn-x3a')).toBe(false);
    expect(group.querySelector('.k-btn-e6a')).toBeNull();
    expect(group.querySelector('.k-btn-x3b')).toBeNull();
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).not.toContain('divider-width-all');
    }
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button groupDivider requires compatible divider geometry and a published Group Rest frame/member paint projection from the active preset.'
    );
  });

  it('keeps the border seam when divider paint has no published geometry', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithContext(
      <Button.Group data-testid="group">
        <Button>Previous</Button>
        <Button>Next</Button>
      </Button.Group>,
      createContext({ groupDivider: true, withDividerGeometry: false })
    );

    const group = screen.getByTestId('group');
    expect(group.classList.contains('k-btn-x3a')).toBe(false);
    expect(group.querySelector('.k-btn-e6a')).toBeNull();
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button groupDivider requires compatible divider geometry and a published Group Rest frame/member paint projection from the active preset.'
    );
  });

  it.each([
    'lowest',
    'low',
    'medium',
    'high'
  ] as const)('preserves the shared Rest recipe while %s selection changes member paint', (selectionEmphasis) => {
    function Example() {
      const [selected, setSelected] = useState(false);
      return (
        <Button.Group data-testid="group" size="lg" emphasis="low">
          <Button
            toggle
            controlState={selected}
            selectionEmphasis={selectionEmphasis}
            activationFeedback={false}
            onClick={() => setSelected((value) => !value)}
          >
            Toggle
          </Button>
          <Button controlState toggle activationFeedback={false}>
            Neighbor
          </Button>
        </Button.Group>
      );
    }
    renderWithContext(<Example />, createContext({ groupDivider: true }));
    const group = screen.getByTestId('group');
    const button = screen.getByRole('button', { name: 'Toggle' });
    const frame = button.nextElementSibling;
    expect(frame?.classList.contains('k-btn-x3b')).toBe(true);
    const initialFrameClasses = frame?.className;
    expect(frame?.getAttribute('aria-hidden')).toBe('true');
    expect(initialFrameClasses).toContain('frame-neutral-low-rest');
    expect(button.className).toContain('button-scale-large');
    expect(button.className).toContain('member-border-off');
    expect(button.className).toContain('member-neutral-low');
    expect(button.className).not.toContain('button-neutral-low');
    expect(button.classList.contains('k-btn-e1l')).toBe(false);
    fireEvent.click(button);
    const promoted = selectionEmphasis === 'medium' || selectionEmphasis === 'high';
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('-s')).toBe(true);
    expect(button.classList.contains('k-btn-e1l')).toBe(promoted);
    expect(button.className).toContain(
      promoted ? 'member-neutral-high-normal' : 'member-neutral-low'
    );
    expect(button.className).not.toContain('button-neutral-high');
    expect(group.querySelectorAll('.k-btn-x3b')).toHaveLength(2);
    expect(button.nextElementSibling).toBe(frame);
    expect(frame?.className).toBe(initialFrameClasses);
    fireEvent.pointerEnter(button);
    fireEvent.pointerDown(button);
    expect(frame?.className).toBe(initialFrameClasses);
    fireEvent.pointerUp(button);
    expect(screen.getByRole('button', { name: 'Neighbor' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList.contains('k-btn-e1l')).toBe(false);
    expect(button.nextElementSibling).toBe(frame);
    expect(frame?.className).toBe(initialFrameClasses);
  });

  it('keeps each member and its decorative frame adjacent without changing native Button roots', () => {
    renderWithContext(
      <Button.Group data-testid="group" emphasis="low">
        <Button toggle controlState selectionEmphasis="medium">
          First
        </Button>
        <Button toggle controlState selectionEmphasis="high">
          Second
        </Button>
        <Button toggle controlState selectionEmphasis="low">
          Third
        </Button>
      </Button.Group>,
      createContext({ groupDivider: true })
    );
    const group = screen.getByTestId('group');
    const buttons = screen.getAllByRole('button');
    const frames = group.querySelectorAll('.k-btn-x3b');
    expect(frames).toHaveLength(3);
    expect(group.querySelectorAll('.k-btn-e6a')).toHaveLength(2);
    for (const [index, button] of buttons.entries()) {
      expect(button.parentElement).toBe(group);
      expect(button.nextElementSibling).toBe(frames[index]);
      expect(button.style.gridColumn).toBe(String(index + 1));
      expect((frames[index] as HTMLElement).style.gridColumn).toBe(`${index + 1} / ${index + 2}`);
      expect((frames[index] as HTMLElement).style.gridRow).toBe('1 / 2');
      expect(frames[index].getAttribute('aria-hidden')).toBe('true');
      expect(frames[index].className).toContain('frame-neutral-low-rest');
      expect(button.classList.contains('k-btn-e1l')).toBe(index < 2);
      expect(button.getAttribute('aria-pressed')).toBe('true');
    }
  });

  it('does not suppress a member frame when a requested High projection is unavailable', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithContext(
      <Button.Group data-testid="group" emphasis="low">
        <Button toggle controlState selectionEmphasis="high">
          Fallback
        </Button>
        <Button>Neighbor</Button>
      </Button.Group>,
      createContext({ groupDivider: true, withSelectionRest: false })
    );
    const button = screen.getByRole('button', { name: 'Fallback' });
    expect(button.classList.contains('-s')).toBe(true);
    expect(button.classList.contains('k-btn-e1l')).toBe(false);
    expect(button.className).toContain('member-neutral-low');
    expect(button.nextElementSibling?.classList.contains('k-btn-x3b')).toBe(true);
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button selectionEmphasis requires a published High Rest paint projection for the active intent, surface and content. Keeping the base Selected recipe.'
    );
  });

  it('restores the member frame when selection emphasis changes without clearing selection', () => {
    const context = createContext({ groupDivider: true });
    const view = (selectionEmphasis: 'low' | 'high') => (
      <KiskadeeContext.Provider value={context}>
        <Button.Group data-testid="group" emphasis="low">
          <Button toggle controlState selectionEmphasis={selectionEmphasis}>
            Selected
          </Button>
          <Button>Neighbor</Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    const result = render(view('high'));
    const button = screen.getByRole('button', { name: 'Selected' });
    const frame = button.nextElementSibling;
    expect(button.classList.contains('k-btn-e1l')).toBe(true);
    result.rerender(view('low'));
    expect(screen.getByRole('button', { name: 'Selected' })).toBe(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('k-btn-e1l')).toBe(false);
    expect(button.nextElementSibling).toBe(frame);
    expect(frame?.className).toContain('frame-neutral-low-rest');
  });

  it('keeps the shared Rest perimeter with disabled and pending selected members', () => {
    renderWithContext(
      <Button.Group data-testid="group" emphasis="low">
        <Button disabled toggle controlState>
          Disabled
        </Button>
        <Button pending toggle controlState>
          Pending
        </Button>
      </Button.Group>,
      createContext({ groupDivider: true })
    );
    const frame = screen.getByTestId('group').querySelector('.k-btn-x3b');
    expect(frame?.className).toContain('frame-neutral-low-rest');
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).toContain('member-border-off');
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.className).not.toContain('button-neutral-low');
    }
  });

  it('restores the authored member borders when switching to artifacts without the Group recipe', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const view = (context: KiskadeeContextValue) => (
      <KiskadeeContext.Provider value={context}>
        <Button.Group data-testid="group" emphasis="low">
          <Button>First</Button>
          <Button>Second</Button>
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    const result = render(view(createContext({ groupDivider: true })));
    const first = screen.getByRole('button', { name: 'First' });
    expect(first.className).toContain('member-border-off');
    result.rerender(view(createContext({ groupDivider: true, withGroup: false })));
    expect(screen.getByRole('button', { name: 'First' })).toBe(first);
    expect(first.className).toContain('button-neutral-low');
    expect(first.className).not.toContain('member-border-off');
    expect(screen.getByTestId('group').querySelector('.k-btn-x3b')).toBeNull();
    expect(screen.getByTestId('group').querySelector('.k-btn-e6a')).toBeNull();
    expect(warning).toHaveBeenCalledWith(
      '[Kiskadee] Button groupDivider requires compatible divider geometry and a published Group Rest frame/member paint projection from the active preset.'
    );
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
          <Button.Disclosure>
            <svg data-testid="unpainted-disclosure" />
          </Button.Disclosure>
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
      '[Kiskadee] Button groupDivider requires compatible divider geometry and a published Group Rest frame/member paint projection from the active preset.'
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
