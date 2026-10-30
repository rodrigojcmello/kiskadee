/** @vitest-environment jsdom */
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ButtonRichTextEditorExample } from './ButtonRichTextEditorExample';

const artifact = vi.hoisted(() => ({
  intents: ['primary', 'neutral', 'destructive', 'positive', 'support']
}));
const INITIAL_SELECTED_ACTIONS = ['Italic', 'Align left', 'Numbered list'];

vi.mock('@kiskadee/react-components/button', async () => {
  const { createElement } = await import('react');
  return {
    Button: Object.assign(
      ({
        toggle,
        controlState,
        emphasis,
        selectionEmphasis,
        selectionIntent,
        intent,
        radius,
        size,
        surfaceContext,
        ...props
      }: HTMLAttributes<HTMLButtonElement> & {
        toggle?: boolean;
        controlState?: boolean;
        emphasis?: string;
        selectionEmphasis?: string;
        selectionIntent?: string;
        intent?: string;
        radius?: string;
        size?: string;
        surfaceContext?: string;
      }) =>
        createElement('button', {
          ...props,
          'aria-pressed': toggle ? controlState === true : undefined,
          'data-emphasis': emphasis,
          'data-selection-emphasis': selectionEmphasis,
          'data-selection-intent': selectionIntent,
          'data-intent': intent,
          'data-radius': radius,
          'data-size': size,
          'data-surface-context': surfaceContext
        }),
      {
        Icon: (props: HTMLAttributes<HTMLElement>) => createElement('span', props),
        Group: ({
          children,
          emphasis,
          intent,
          radius,
          size,
          surfaceContext,
          ...props
        }: HTMLAttributes<HTMLDivElement> & {
          children: ReactNode;
          emphasis?: string;
          intent?: string;
          radius?: string;
          size?: string;
          surfaceContext?: string;
        }) =>
          createElement(
            'div',
            {
              ...props,
              'data-rich-button-group': true,
              'data-emphasis': emphasis,
              'data-intent': intent,
              'data-radius': radius,
              'data-size': size,
              'data-surface-context': surfaceContext
            },
            children
          )
      }
    ),
    useButtonArtifactConfig: () => ({
      buttonClassesMap: {
        e1: {
          c: {
            s: Object.fromEntries(artifact.intents.map((intent) => [intent, { m: 'published' }]))
          }
        }
      }
    })
  };
});

vi.mock('@kiskadee/react-components/icon', () => ({
  FamilyResolvedIcon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />
}));

vi.mock('@kiskadee/react-components/container', () => ({
  Container: ({
    children,
    intent,
    emphasis
  }: {
    children: ReactNode;
    intent?: string;
    emphasis?: string;
  }) => (
    <div data-container-intent={intent} data-container-emphasis={emphasis}>
      {children}
    </div>
  )
}));

vi.mock('@kiskadee/react-components/layout', () => ({
  Layout: ({
    children,
    padding,
    justify
  }: {
    children: ReactNode;
    padding?: string;
    justify?: string;
  }) => (
    <div data-layout-padding={padding} data-layout-justify={justify}>
      {children}
    </div>
  )
}));

vi.mock('@kiskadee/react-components/separator', () => ({
  Separator: () => <hr data-composition-separator />
}));

vi.mock('@kiskadee/react-components/text', async () => {
  const { createElement } = await import('react');
  return {
    Text: ({
      as = 'span',
      profile: _profile,
      emphasis: _emphasis,
      foreground: _foreground,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      as?: string;
      profile?: string;
      emphasis?: string;
      foreground?: string;
    }) => createElement(as, props)
  };
});

vi.mock('@/components/ShowcaseControls', () => ({
  ShowcaseContentSelectControl: ({
    label,
    value,
    onValueChange,
    options,
    size,
    variant,
    loop,
    width,
    maxWidth
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: ReadonlyArray<{ value: string; label: string }>;
    size?: string;
    variant?: string;
    loop?: boolean;
    width?: string;
    maxWidth?: string;
  }) => (
    <label>
      {label}
      <select
        value={value}
        data-size={size}
        data-variant={variant}
        data-loop={loop}
        data-width={width}
        data-max-width={maxWidth}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}));

vi.mock('@/components/ShowcaseBackground/ShowcaseExampleCard', () => ({
  ShowcaseExampleCard: ({
    children,
    padding,
    clipContent,
    context
  }: {
    children: ReactNode;
    padding?: false | string;
    clipContent?: boolean;
    context?: string;
  }) => (
    <div
      data-example-card
      data-card-padding={String(padding)}
      data-card-clipped={clipContent}
      data-card-context={context}
    >
      {children}
    </div>
  )
}));

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({
    subsectionTitle: 'test-heading',
    bodyStrong: 'test-subheading',
    body: 'test-body',
    caption: 'test-caption'
  })
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  artifact.intents = ['primary', 'neutral', 'destructive', 'positive', 'support'];
});

function render() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root?.render(
      <ButtonRichTextEditorExample radius="rounded" scale="s:md:1" surfaceContext="onVivid" />
    )
  );
}

function row(layout: 'independent' | 'connected') {
  const result = container?.querySelector(`[data-rich-text-layout="${layout}"]`);
  expect(result).not.toBeNull();
  return result as HTMLElement;
}

function button(layout: 'independent' | 'connected', label: string) {
  const result = Array.from(row(layout).querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === label
  );
  expect(result).toBeDefined();
  return result as HTMLButtonElement;
}

function selected(layout: 'independent' | 'connected') {
  return Array.from(row(layout).querySelectorAll('button[aria-pressed="true"]'), (element) =>
    element.getAttribute('aria-label')
  );
}

function control(label: string) {
  const result = Array.from(container?.querySelectorAll('label') ?? [])
    .find((element) => element.firstChild?.textContent === label)
    ?.querySelector('select');
  expect(result).toBeDefined();
  return result as HTMLSelectElement;
}

function changeControl(label: string, value: string) {
  const element = control(label);
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('Rich text editor composition', () => {
  it('keeps the title outside the Card and the compact controls in its complementary header', () => {
    render();
    const card = container?.querySelector('[data-example-card]');
    const title = container?.querySelector('#button-rich-text-editor-title');
    const header = card?.querySelector('[data-container-intent="neutralComplementary"]');
    expect(title).not.toBeNull();
    expect(card?.contains(title ?? null)).toBe(false);
    expect(card?.getAttribute('data-card-padding')).toBe('false');
    expect(card?.getAttribute('data-card-clipped')).toBe('true');
    expect(card?.getAttribute('data-card-context')).toBe('onVivid');
    expect(header?.getAttribute('data-container-emphasis')).toBe('low');
    expect(header?.querySelector('[data-layout-justify="end"]')).not.toBeNull();
    expect(card?.querySelector('[data-composition-separator]')).not.toBeNull();
    for (const label of ['Button intent', 'Emphasis', 'Selection intent', 'Selection emphasis']) {
      const element = control(label);
      expect(header?.contains(element)).toBe(true);
      expect(element.getAttribute('data-size')).toBe('sm');
      expect(element.getAttribute('data-variant')).toBe('sequential');
      expect(element.getAttribute('data-loop')).toBe('true');
      expect(element.getAttribute('data-width')).toBe('100%');
      expect(element.getAttribute('data-max-width')).toBe('100%');
    }
    expect(control('Emphasis').value).toBe('low');
    expect(control('Button intent').value).toBe('neutral');
    expect(control('Selection intent').value).toBe('primary');
    expect(control('Selection emphasis').value).toBe('lowest');
    expect(header?.contains(row('independent'))).toBe(false);
    expect(card?.contains(row('independent'))).toBe(true);
    expect(card?.contains(row('connected'))).toBe(true);
    expect(card?.querySelector('p')).toBeNull();
  });

  it('renders the same accessible mapped actions in independent and connected presentations', () => {
    render();
    const independent = row('independent').querySelectorAll('button');
    const connected = row('connected').querySelectorAll('button');
    expect(independent).toHaveLength(12);
    expect(connected).toHaveLength(12);
    expect(row('connected').querySelectorAll('[data-rich-button-group]')).toHaveLength(4);
    for (let index = 0; index < independent.length; index++) {
      const label = independent[index].getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(connected[index].getAttribute('aria-label')).toBe(label);
      expect(connected[index].getAttribute('title')).toBe(label);
      expect(connected[index].querySelector('svg')?.getAttribute('data-icon')).toBe(
        independent[index].querySelector('svg')?.getAttribute('data-icon')
      );
      const expectedSelected = String(INITIAL_SELECTED_ACTIONS.includes(label ?? ''));
      expect(independent[index].getAttribute('aria-pressed')).toBe(expectedSelected);
      expect(connected[index].getAttribute('aria-pressed')).toBe(expectedSelected);
    }
    expect(selected('independent')).toEqual(INITIAL_SELECTED_ACTIONS);
    expect(selected('connected')).toEqual(INITIAL_SELECTED_ACTIONS);
  });

  it('keeps independent formatting toggles and separate selection for each row', () => {
    render();
    act(() => {
      button('independent', 'Bold').click();
      button('independent', 'Underline').click();
      button('independent', 'Strikethrough').click();
      button('independent', 'Undo').click();
    });
    expect(selected('independent')).toEqual([
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Align left',
      'Numbered list',
      'Undo'
    ]);
    expect(selected('connected')).toEqual(INITIAL_SELECTED_ACTIONS);
    act(() => {
      button('connected', 'Bold').click();
      button('connected', 'Undo').click();
      button('connected', 'Redo').click();
    });
    expect(selected('connected')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS, 'Undo', 'Redo']);
    act(() => {
      button('independent', 'Bold').click();
      button('connected', 'Undo').click();
    });
    expect(selected('independent')).toEqual([
      'Italic',
      'Underline',
      'Strikethrough',
      'Align left',
      'Numbered list',
      'Undo'
    ]);
    expect(selected('connected')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS, 'Redo']);
  });

  it.each([
    'independent',
    'connected'
  ] as const)('keeps alignment and list choices mutually exclusive in the %s row', (layout) => {
    render();
    act(() => {
      button(layout, 'Bold').click();
      button(layout, 'Insert link').click();
      button(layout, 'Undo').click();
      button(layout, 'Redo').click();
      button(layout, 'Bulleted list').click();
    });
    for (const alignment of ['Align center', 'Align right', 'Align left']) {
      act(() => button(layout, alignment).click());
      expect(selected(layout)).toEqual([
        'Bold',
        'Italic',
        alignment,
        'Bulleted list',
        'Insert link',
        'Undo',
        'Redo'
      ]);
    }
    act(() => button(layout, 'Numbered list').click());
    expect(selected(layout)).toEqual([
      'Bold',
      'Italic',
      'Align left',
      'Numbered list',
      'Insert link',
      'Undo',
      'Redo'
    ]);
    act(() => button(layout, 'Bulleted list').click());
    expect(selected(layout)).toEqual([
      'Bold',
      'Italic',
      'Align left',
      'Bulleted list',
      'Insert link',
      'Undo',
      'Redo'
    ]);
    act(() => {
      button(layout, 'Align left').click();
      button(layout, 'Bulleted list').click();
    });
    expect(selected(layout)).toEqual(['Bold', 'Italic', 'Insert link', 'Undo', 'Redo']);
    const other = layout === 'independent' ? 'connected' : 'independent';
    expect(selected(other)).toEqual(INITIAL_SELECTED_ACTIONS);
  });

  it('updates both presentation controls without resetting selection or forcing the outer surface context', () => {
    render();
    act(() => {
      button('independent', 'Bold').click();
      button('connected', 'Redo').click();
    });
    changeControl('Emphasis', 'high');
    changeControl('Selection emphasis', 'high');
    expect(selected('independent')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS]);
    expect(selected('connected')).toEqual([...INITIAL_SELECTED_ACTIONS, 'Redo']);
    for (const element of row('independent').querySelectorAll('button')) {
      expect(element.getAttribute('data-emphasis')).toBe('high');
      expect(element.getAttribute('data-intent')).toBe('neutral');
      expect(element.getAttribute('data-radius')).toBe('rounded');
      expect(element.getAttribute('data-size')).toBe('md');
    }
    for (const element of row('connected').querySelectorAll('[data-rich-button-group]')) {
      expect(element.getAttribute('data-emphasis')).toBe('high');
      expect(element.getAttribute('data-intent')).toBe('neutral');
      expect(element.getAttribute('data-radius')).toBe('rounded');
      expect(element.getAttribute('data-size')).toBe('md');
      expect(element.hasAttribute('data-surface-context')).toBe(false);
    }
    for (const element of container?.querySelectorAll('button') ?? []) {
      expect(element.getAttribute('data-selection-emphasis')).toBe('high');
      expect(element.getAttribute('data-selection-intent')).toBe('primary');
      expect(element.hasAttribute('data-surface-context')).toBe(false);
    }
    changeControl('Emphasis', 'lowest');
    changeControl('Selection emphasis', 'lowest');
    expect(selected('independent')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS]);
    expect(selected('connected')).toEqual([...INITIAL_SELECTED_ACTIONS, 'Redo']);
    expect(button('independent', 'Bold').getAttribute('data-emphasis')).toBe('lowest');
    expect(button('connected', 'Redo').getAttribute('data-selection-emphasis')).toBe('lowest');
  });

  it('allows every published intent pair and follows the base intent explicitly without clearing either row', () => {
    render();
    act(() => {
      button('independent', 'Bold').click();
      button('connected', 'Redo').click();
    });

    expect(Array.from(control('Button intent').options, (option) => option.value)).toEqual(
      artifact.intents
    );
    expect(Array.from(control('Selection intent').options, (option) => option.value)).toEqual([
      'same',
      ...artifact.intents
    ]);
    changeControl('Button intent', 'positive');
    changeControl('Selection intent', 'destructive');
    expect(button('independent', 'Bold').getAttribute('data-intent')).toBe('positive');
    expect(button('independent', 'Bold').getAttribute('data-selection-intent')).toBe('destructive');
    expect(button('connected', 'Redo').getAttribute('data-selection-intent')).toBe('destructive');
    for (const group of row('connected').querySelectorAll('[data-rich-button-group]')) {
      expect(group.getAttribute('data-intent')).toBe('positive');
    }

    changeControl('Selection intent', 'same');
    changeControl('Button intent', 'support');
    expect(button('independent', 'Bold').getAttribute('data-selection-intent')).toBe('support');
    expect(button('connected', 'Redo').getAttribute('data-selection-intent')).toBe('support');
    expect(selected('independent')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS]);
    expect(selected('connected')).toEqual([...INITIAL_SELECTED_ACTIONS, 'Redo']);
  });

  it('updates published intent choices after a preset change without resetting selections', () => {
    render();
    act(() => button('connected', 'Bold').click());
    changeControl('Button intent', 'support');
    changeControl('Selection intent', 'support');
    artifact.intents = ['primary', 'neutral', 'destructive', 'positive'];
    act(() =>
      root?.render(
        <ButtonRichTextEditorExample radius="rounded" scale="s:md:1" surfaceContext="onVivid" />
      )
    );
    expect(Array.from(control('Button intent').options, (option) => option.value)).toEqual(
      artifact.intents
    );
    expect(control('Button intent').value).toBe('neutral');
    expect(control('Selection intent').value).toBe('same');
    expect(button('connected', 'Bold').getAttribute('data-selection-intent')).toBe('neutral');
    expect(selected('connected')).toEqual(['Bold', ...INITIAL_SELECTED_ACTIONS]);
  });
});
