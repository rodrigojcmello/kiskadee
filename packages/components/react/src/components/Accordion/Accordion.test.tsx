/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type KiskadeeComponentConfigs,
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Accordion } from './Accordion.tsx';
import type { AccordionProps } from './Accordion.types.ts';

const motion = vi.hoisted(() => ({
  enabled: true,
  animate: vi.fn(),
  completions: [] as (() => void)[],
  indicatorCancel: vi.fn(),
  rotate: vi.fn(),
  crossfade: vi.fn(),
  cancel: vi.fn()
}));
vi.mock('./effects/motion/AccordionMotion.loader.ts', () => {
  const module = { animateAccordionPanel: motion.animate };
  return {
    useAccordionMotionModule: (enabled: boolean) => (enabled && motion.enabled ? module : null)
  };
});
vi.mock('../../shared/visual-motion/visualMotion.loader.ts', () => {
  const module = { rotate: motion.rotate, crossfade: motion.crossfade };
  return {
    useVisualMotion: (enabled: boolean) =>
      enabled && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? module : null
  };
});
const context = {
  classesMap: {
    accordion: { e1: {}, e2: {}, e3: { s: { 'md:1': 'trigger-spacing' } }, e4: {}, e5: {}, e6: {} },
    card: { e1: {} },
    container: { e1: {} }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem() {},
  setSegment() {},
  setTheme() {},
  componentArtifacts: {
    accordion: {
      component: 'accordion',
      options: {
        themes: ['light'],
        emphases: ['lowest', 'low', 'medium', 'high'],
        divider: true,
        indicatorTransition: 'rotate'
      },
      effects: {
        presence: {
          profile: 'grow-height',
          profiles: {
            'grow-height': {
              enterDurationMs: 180,
              exitDurationMs: 120,
              enterEasing: 'ease-out',
              exitEasing: 'ease-in'
            }
          }
        }
      }
    } satisfies NonNullable<KiskadeeComponentConfigs['accordion']> & { component: 'accordion' }
  }
} satisfies KiskadeeContextValue;
function Fixture({
  open = [],
  enabled = true,
  theme = 'light',
  appearance = {}
}: {
  open?: string[];
  enabled?: boolean;
  theme?: 'light' | 'dark';
  appearance?: Pick<
    AccordionProps,
    'emphasis' | 'panelEmphasis' | 'divider' | 'border' | 'shadow' | 'indicatorTransition'
  >;
}) {
  return (
    <KiskadeeContext.Provider value={{ ...context, theme }}>
      <Accordion expandedItems={open} motion={enabled} {...appearance}>
        <Accordion.Item value="a">
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Panel>
            <input aria-label="Value" defaultValue="saved" />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </KiskadeeContext.Provider>
  );
}
beforeEach(() => {
  motion.enabled = true;
  motion.completions = [];
  motion.animate.mockReset();
  motion.cancel.mockReset();
  motion.indicatorCancel.mockReset();
  motion.rotate.mockReset().mockReturnValue(motion.indicatorCancel);
  motion.crossfade.mockReset().mockReturnValue(motion.indicatorCancel);
  motion.animate.mockImplementation((_panel, _content, _open, _timing, done) => {
    motion.completions.push(done);
    return motion.cancel;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('Accordion presentation', () => {
  it('animates the indicator independently from disabled panel motion', () => {
    const view = render(<Fixture enabled={false} />);
    view.rerender(<Fixture open={['a']} enabled={false} />);
    expect(motion.animate).not.toHaveBeenCalled();
    expect(motion.rotate).toHaveBeenCalledOnce();
    expect(motion.rotate.mock.calls[0]?.[1]).toBe(180);
    expect((view.container.querySelector('.k-acc-e6') as HTMLElement).hidden).toBe(false);
  });
  it('can keep panel motion enabled while swapping the indicator without animation', () => {
    const view = render(<Fixture appearance={{ indicatorTransition: 'none' }} />);
    view.rerender(<Fixture open={['a']} appearance={{ indicatorTransition: 'none' }} />);
    expect(motion.animate).toHaveBeenCalledOnce();
    expect(motion.rotate).not.toHaveBeenCalled();
    expect(motion.crossfade).not.toHaveBeenCalled();
    expect(view.container.querySelector('.k-acc-e5a')).not.toBeNull();
  });
  it('uses the indicator default from the artifact and allows an instance override', () => {
    const alternate = {
      ...context,
      componentArtifacts: {
        accordion: {
          ...context.componentArtifacts!.accordion!,
          options: {
            ...context.componentArtifacts!.accordion!.options!,
            indicatorTransition: 'crossfade' as const
          }
        }
      }
    };
    const example = (indicatorTransition?: 'none') => (
      <KiskadeeContext.Provider value={alternate}>
        <Accordion indicatorTransition={indicatorTransition}>
          <Accordion.Item value="a">
            <Accordion.Header>Header</Accordion.Header>
            <Accordion.Panel>Content</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </KiskadeeContext.Provider>
    );
    const view = render(example());
    expect(view.container.querySelector('.k-acc-e5.k-cfd')).not.toBeNull();
    view.rerender(example('none'));
    expect(view.container.querySelector('.k-acc-e5a')).not.toBeNull();
  });
  it('switches indicator presentation without replacing panel content or adding selection', () => {
    const view = render(<Fixture open={['a']} enabled={false} />);
    const input = view.getByRole('textbox');
    expect(view.container.querySelector('.k-acc-e5.k-rot')).not.toBeNull();
    view.rerender(
      <Fixture open={['a']} enabled={false} appearance={{ indicatorTransition: 'crossfade' }} />
    );
    expect(view.container.querySelector('.k-acc-e5.k-cfd')).not.toBeNull();
    expect(view.getByRole('textbox')).toBe(input);
    expect(view.getByRole('button').hasAttribute('aria-pressed')).toBe(false);
    view.rerender(<Fixture enabled={false} appearance={{ indicatorTransition: 'crossfade' }} />);
    expect((view.container.querySelector('.k-acc-e6') as HTMLElement).hidden).toBe(true);
  });
  it('honors a disabled preset divider default and an explicit enabled override', () => {
    const alternate = {
      ...context,
      componentArtifacts: {
        accordion: {
          ...context.componentArtifacts!.accordion!,
          options: {
            themes: ['light'] as const,
            emphases: ['medium'] as const,
            divider: false,
            indicatorTransition: 'crossfade' as const
          }
        }
      }
    };
    const example = (divider?: boolean) => (
      <KiskadeeContext.Provider value={alternate}>
        <Accordion defaultExpandedItems={['a']} divider={divider} motion={false}>
          <Accordion.Item value="a">
            <Accordion.Header>Header</Accordion.Header>
            <Accordion.Panel>Content</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </KiskadeeContext.Provider>
    );
    const view = render(example());
    expect(view.container.querySelector('.k-acc-body > hr')).toBeNull();
    view.rerender(example(true));
    expect(view.container.querySelectorAll('.k-acc-body > hr')).toHaveLength(1);
  });
  it('applies the preset divider default at every emphasis and honors instance overrides', () => {
    const view = render(
      <Fixture open={['a']} enabled={false} appearance={{ emphasis: 'lowest' }} />
    );
    for (const emphasis of ['lowest', 'low', 'medium', 'high'] as const) {
      view.rerender(<Fixture open={['a']} enabled={false} appearance={{ emphasis }} />);
      expect(view.container.querySelectorAll('.k-acc-body > hr')).toHaveLength(1);
    }
    view.rerender(
      <Fixture
        open={['a']}
        enabled={false}
        appearance={{
          emphasis: 'high',
          panelEmphasis: 'lowest',
          divider: false,
          indicatorTransition: 'crossfade' as const
        }}
      />
    );
    expect(view.container.querySelector('.k-acc-body > hr')).toBeNull();
    expect(view.getByRole('textbox')).toBeTruthy();
  });
  it('does not fabricate an unsupported emphasis', () => {
    const view = render(<Fixture appearance={{ panelEmphasis: 'highest' }} />);
    expect(view.queryByRole('button')).toBeNull();
  });
  it('keeps content mounted when emphasis and independent frame options change', () => {
    const view = render(
      <Fixture open={['a']} enabled={false} appearance={{ emphasis: 'low', border: false }} />
    );
    const input = view.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Retained appearance edit' } });
    expect(view.container.querySelector('.k-acc-frame.k-crd-b')).not.toBeNull();
    view.rerender(
      <Fixture
        open={['a']}
        enabled={false}
        appearance={{ emphasis: 'medium', border: true, shadow: 's:lg:1' }}
      />
    );
    expect(view.getByRole('textbox')).toBe(input);
    expect((input as HTMLInputElement).value).toBe('Retained appearance edit');
    expect(view.container.querySelector('.k-acc-frame.k-crd-b')).toBeNull();
    expect(view.getByRole('button').hasAttribute('aria-pressed')).toBe(false);
    expect(view.container.querySelector('[shadow]')).toBeNull();
  });
  it('renders one native action without selection and does not animate initial expansion', () => {
    const view = render(<Fixture open={['a']} />);
    const trigger = view.getByRole('button');
    expect(view.container.querySelectorAll('button')).toHaveLength(1);
    expect(trigger.hasAttribute('aria-pressed')).toBe(false);
    expect(trigger.classList.contains('k-crd-a')).toBe(true);
    expect(trigger.classList.contains('trigger-spacing')).toBe(true);
    expect(motion.animate).not.toHaveBeenCalled();
    expect(view.container.querySelector('.k-acc-e5')?.getAttribute('style')).toContain('180deg');
  });
  it('closes semantics immediately, retains exit DOM, then hides without unmounting', () => {
    const view = render(<Fixture open={['a']} />);
    const input = view.getByRole('textbox');
    input.focus();
    view.rerender(<Fixture />);
    const panel = view.container.querySelector('.k-acc-e6') as HTMLElement;
    expect(panel.hidden).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(view.getByRole('button'));
    expect(motion.animate).toHaveBeenCalledOnce();
    act(() => motion.completions[0]?.());
    expect(panel.hidden).toBe(true);
    expect(input.isConnected).toBe(true);
    view.rerender(<Fixture open={['a']} />);
    expect(panel.hidden).toBe(false);
  });
  it('cancels an in-flight exit when it reopens', () => {
    const view = render(<Fixture open={['a']} />);
    view.rerender(<Fixture />);
    view.rerender(<Fixture open={['a']} />);
    expect(motion.cancel).toHaveBeenCalledOnce();
    expect(motion.animate.mock.calls.map((call) => call[2])).toEqual([false, true]);
  });
  it('preserves local inputs across immediate closure and reopening', () => {
    const view = render(<Fixture open={['a']} enabled={false} />);
    fireEvent.change(view.getByRole('textbox'), { target: { value: 'edited' } });
    view.rerender(<Fixture enabled={false} />);
    expect((view.container.querySelector('.k-acc-e6') as HTMLElement).hidden).toBe(true);
    view.rerender(<Fixture open={['a']} enabled={false} />);
    expect((view.getByRole('textbox') as HTMLInputElement).value).toBe('edited');
    expect(motion.animate).not.toHaveBeenCalled();
  });
  it('does not replay expansion when Motion arrives after a fallback transition', () => {
    motion.enabled = false;
    const view = render(<Fixture />);
    view.rerender(<Fixture open={['a']} />);
    motion.enabled = true;
    view.rerender(<Fixture open={['a']} />);
    expect(motion.animate).not.toHaveBeenCalled();
  });
  it('respects reduced motion and does not render unsupported themes', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {}
    }));
    const view = render(<Fixture />);
    view.rerender(<Fixture open={['a']} />);
    expect(motion.animate).not.toHaveBeenCalled();
    view.rerender(<Fixture theme="dark" />);
    expect(view.queryByRole('button')).toBeNull();
  });
});
