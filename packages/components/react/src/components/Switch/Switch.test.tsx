/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { createElement as h, type ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Switch } from './Switch.tsx';

type ControlTextVisibility = 'none' | 'always';

function createContextValue(
  controlTextVisibility: ControlTextVisibility = 'none'
): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'global',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'default',
    setDesignSystem: () => {},
    global: {
      radius: 'rounded',
      components: {
        switch: {
          options: {
            controlTextVisibility
          }
        }
      }
    }
  };
}

function renderSwitch(node: ReactElement, controlTextVisibility: ControlTextVisibility = 'none') {
  return render(
    h(
      KiskadeeContext.Provider,
      {
        value: createContextValue(controlTextVisibility)
      },
      node
    )
  );
}

afterEach(() => {
  cleanup();
});

describe('Switch', () => {
  it('renderiza estrutura e aplica className e classNames de slot', () => {
    const { container } = renderSwitch(
      h(Switch, {
        motion: false,
        thumbShrink: false,
        label: 'Conexão',
        className: 'switch-root-extra',
        classNames: {
          e2: 'track-slot',
          e3: 'thumb-slot'
        }
      })
    );

    const switchInput = screen.getByRole('switch');

    expect(switchInput).toBeTruthy();
    expect(switchInput.getAttribute('role')).toBe('switch');
    expect(screen.getByText('Conexão')).toBeTruthy();
    expect(container.querySelector('[class*="k-swt"]')).toBeTruthy();
    expect(container.querySelector('.switch-root-extra')).toBeTruthy();
    expect(container.querySelector('.track-slot')).toBeTruthy();
    expect(container.querySelector('.thumb-slot')).toBeTruthy();
  });

  it('propaga disabled e readOnly para o input interno', () => {
    renderSwitch(
      h(Switch, {
        motion: false,
        thumbShrink: false,
        label: 'Habilitado',
        disabled: true,
        readOnly: true
      })
    );

    const switchInput = screen.getByRole('switch');

    expect(switchInput.hasAttribute('disabled')).toBe(true);
    expect(switchInput.hasAttribute('readonly')).toBe(true);
    expect(switchInput.getAttribute('aria-readonly')).toBe('true');
    expect(switchInput.getAttribute('aria-checked')).toBe('false');
  });

  it('renderiza controlText quando configurado como always no global config', () => {
    const { container } = renderSwitch(
      h(Switch, {
        motion: false,
        thumbShrink: false,
        controlText: {
          on: 'Ligado',
          off: 'Desligado'
        },
        className: 'control-text'
      }),
      'always'
    );

    expect(screen.getByText('Ligado')).toBeTruthy();
    expect(screen.getByText('Desligado')).toBeTruthy();
    expect(container.querySelector('.control-text')).toBeTruthy();
    expect(container.querySelector('.k-swt-e5-a')).toBeTruthy();
  });
});
