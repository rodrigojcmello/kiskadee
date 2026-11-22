/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Chip } from '../../components/Chip/Chip.tsx';
import { Select } from '../../components/Select/Select.tsx';
import { TextFieldText } from '../../components/TextField/TextField.content.tsx';
import { createTextFieldComponent } from '../../components/TextField/TextField.runtime.tsx';
import { textFieldStandardBorderlessStructural } from '../../components/TextField/TextField.structural.ts';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';
import { SurfaceContextProvider, useSurfaceContext } from './SurfaceContext.tsx';

const base: KiskadeeContextValue = {
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  classesMap: {},
  setDesignSystem() {},
  setSegment() {},
  setTheme() {}
};
const Borderless = createTextFieldComponent({
  displayName: 'TestBorderless',
  layout: 'standard',
  structural: textFieldStandardBorderlessStructural
});
function Observer({ name }: { name: string }) {
  return <span data-testid={name}>{useSurfaceContext()}</span>;
}
afterEach(cleanup);

it('publishes independent sibling surfaces for the Chip badge and Remove icon', () => {
  const value = {
    ...base,
    componentArtifacts: {
      chip: {
        formatVersion: 3,
        component: 'chip',
        regions: {
          e2: {
            output: {
              default: {
                light: {
                  onVivid: {
                    standard: {
                      primary: {
                        lowest: { rest: 'inherit', selected: 'onSubtle' }
                      }
                    }
                  }
                }
              }
            }
          },
          e5: {
            output: {
              default: {
                light: {
                  onVivid: {
                    standard: {
                      primary: {
                        lowest: { rest: 'onVivid' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  const view = render(
    <KiskadeeContext.Provider value={value}>
      <SurfaceContextProvider value="onVivid">
        <Chip intent="primary" emphasis="lowest">
          <Chip.Select>
            <Chip.Badge>
              <Observer name="badge" />
            </Chip.Badge>
          </Chip.Select>
          <Chip.Remove aria-label="Remove">
            <Observer name="remove" />
          </Chip.Remove>
        </Chip>
      </SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
  expect(view.getByTestId('badge').textContent).toBe('onVivid');
  fireEvent.click(view.getByRole('button', { name: 'onVivid' }));
  expect(view.getByTestId('badge').textContent).toBe('onSubtle');
  expect(view.getByTestId('remove').textContent).toBe('onVivid');
});

it.each([
  { root: false, select: true, remove: false },
  { root: false, select: false, remove: true },
  { root: true, select: false, remove: false }
])('matches each Chip action surface to its effective disabled state: %o', ({
  root,
  select,
  remove
}) => {
  const region = {
    output: {
      default: {
        light: {
          onSubtle: {
            standard: {
              neutral: { high: { rest: 'onVivid', selected: 'onVivid', disabled: 'onSubtle' } }
            }
          }
        }
      }
    }
  };
  const value = {
    ...base,
    componentArtifacts: {
      chip: { formatVersion: 3, component: 'chip', regions: { e2: region, e5: region } }
    }
  };
  const view = render(
    <KiskadeeContext.Provider value={value}>
      <Chip intent="neutral" emphasis="high" disabled={root}>
        <Chip.Select aria-label="Select" controlState disabled={select}>
          <Observer name="select-content" />
        </Chip.Select>
        <Chip.Remove aria-label="Remove" disabled={remove}>
          <Observer name="remove-content" />
        </Chip.Remove>
      </Chip>
    </KiskadeeContext.Provider>
  );
  for (const [action, locallyDisabled] of [
    ['Select', select],
    ['Remove', remove]
  ] as const) {
    const button = view.getByRole('button', { name: action }) as HTMLButtonElement;
    expect(button.disabled).toBe(root || locallyDisabled);
    expect(within(button).getByTestId(`${action.toLowerCase()}-content`).textContent).toBe(
      button.disabled ? 'onSubtle' : 'onVivid'
    );
  }
});

it('uses the shell paint coordinate to resolve a translucent TextField region', () => {
  const elements = {
    e3: { c: { v: { s: { neutral: { m: 'shell-medium', h: 'shell-high' } } } } },
    e8: {
      c: {
        s: { s: { neutral: { m: 'paint-on-subtle' } } },
        v: { s: { neutral: { m: 'paint-on-vivid' } } }
      }
    },
    e10: {
      c: {
        s: { s: { neutral: { m: 'ink-on-subtle' } } },
        v: { s: { neutral: { m: 'ink-on-vivid' } } }
      }
    }
  };
  const regionMap = (rest: 'onVivid' | 'onSubtle') => ({
    default: { light: { onSubtle: { standard: { neutral: { medium: { rest } } } } } }
  });
  const regions = {
    e3: {
      output: {
        default: {
          light: {
            onVivid: {
              standard: {
                neutral: {
                  medium: { rest: 'onSubtle' },
                  high: { rest: 'onSubtle' }
                }
              }
            }
          }
        }
      }
    },
    e8: {
      output: regionMap('onSubtle'),
      against: {
        '["onVivid","standard","neutral","high","rest"]': regionMap('onVivid')
      }
    }
  };
  const value = {
    ...base,
    classesMap: { textField: { standard: { borderless: elements } } },
    componentArtifacts: {
      textField: {
        formatVersion: 3,
        component: 'textField',
        variants: { standard: { modes: { borderless: { regions } } } }
      }
    }
  };
  const tree = (emphasis: 'medium' | 'high') => (
    <KiskadeeContext.Provider value={value}>
      <SurfaceContextProvider value="onVivid">
        <Borderless
          label="Name"
          emphasis={emphasis}
          endContentEmphasis="medium"
          endContent={
            <>
              <TextFieldText>Suffix</TextFieldText>
              <Observer name="suffix" />
            </>
          }
          connectedEndAction={() => <Observer name="connected" />}
        />
      </SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
  const view = render(tree('medium'));
  expect(view.getByTestId('suffix').textContent).toBe('onSubtle');
  expect(view.getByTestId('connected').textContent).toBe('onVivid');
  view.rerender(tree('high'));
  expect(view.getByTestId('suffix').textContent).toBe('onVivid');
  expect(view.getByText('Suffix').classList).toContain('ink-on-vivid');
  expect(view.getByTestId('suffix').closest('[data-text-field-content]')?.classList).toContain(
    'paint-on-subtle'
  );
});

it('keeps the Select value inside the trigger surface and a list option inside its own painted row', async () => {
  Element.prototype.scrollIntoView = vi.fn();
  const map = (surface: 'onSubtle' | 'onVivid', rest: 'onSubtle' | 'onVivid' | 'inherit') => ({
    output: { default: { light: { [surface]: { standard: { neutral: { medium: { rest } } } } } } }
  });
  const value = {
    ...base,
    classesMap: {
      select: { standard: { outline: { e3: {}, e4: {} } } },
      dropdown: { e1: {}, e2: {} }
    },
    componentArtifacts: {
      select: {
        component: 'select',
        formatVersion: 3,
        variants: {
          standard: {
            modes: {
              outline: {
                regions: {
                  e3: map('onVivid', 'onSubtle'),
                  e4: map('onSubtle', 'inherit')
                }
              }
            }
          }
        }
      },
      dropdown: {
        component: 'dropdown',
        formatVersion: 3,
        regions: { e1: map('onVivid', 'onSubtle'), e2: map('onSubtle', 'onVivid') }
      }
    }
  };
  const view = render(
    <KiskadeeContext.Provider value={value}>
      <SurfaceContextProvider value="onVivid">
        <Select
          label="Workspace"
          defaultValue="a"
          options={[{ value: 'a', textValue: 'Example', label: <Observer name="value" /> }]}
        />
      </SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
  const trigger = view.getByRole('combobox');
  expect(within(trigger).getByTestId('value').textContent).toBe('onSubtle');
  fireEvent.click(trigger);
  const option = await view.findByRole('option');
  expect(within(option).getByTestId('value').textContent).toBe('onVivid');
});
