/** @vitest-environment jsdom */
import type { ContentSurfaceContextMap, ContentSurfaceContextStateMap } from '@kiskadee/core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { Badge } from '../../components/Badge/Badge.tsx';
import { Slider } from '../../components/Slider/Slider.tsx';
import { Switch } from '../../components/Switch/Switch.tsx';
import { useResolvedTabsBoxRootState } from '../../components/Tabs/box/Tabs.box.root-state.tsx';
import TabsBoxStaticBarEnhancer from '../../components/Tabs/box/Tabs.box.static.tsx';
import { tabsBoxStructural } from '../../components/Tabs/box/Tabs.box.structural.ts';
import { createTabsComponent } from '../../components/Tabs/Tabs.runtime.tsx';
import type { TabsBoxRootProps } from '../../components/Tabs/Tabs.types.ts';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';
import { SurfaceContextProvider, useSurfaceContext } from './SurfaceContext.tsx';

vi.mock('../../components/RollingNumber/RollingNumber.tsx', () => ({ RollingNumber: () => null }));

const TabsBox = createTabsComponent<TabsBoxRootProps>({
  displayName: 'TabsBox',
  structural: tabsBoxStructural,
  StaticEnhancer: TabsBoxStaticBarEnhancer,
  useResolvedRootState: useResolvedTabsBoxRootState
});

afterEach(cleanup);

function Probe({ name }: { name: string }) {
  return <span data-testid={name}>{useSurfaceContext()}</span>;
}

function region(states: ContentSurfaceContextStateMap) {
  const levels = { neutral: { high: states, medium: states } };
  const output: ContentSurfaceContextMap = {
    default: {
      light: {
        onVivid: { standard: levels },
        onSubtle: { standard: levels }
      }
    }
  };
  return { output };
}

function inspect(
  component: string,
  branch: object,
  classes: KiskadeeContextValue['classesMap'],
  children: ReactElement
) {
  const value: KiskadeeContextValue = {
    designSystem: 'regions',
    segment: 'default',
    theme: 'light',
    setSegment() {},
    setTheme() {},
    setDesignSystem() {},
    classesMap: classes,
    componentArtifacts: { [component]: { formatVersion: 3, component, ...branch } }
  };
  return render(
    <KiskadeeContext.Provider value={value}>
      <SurfaceContextProvider value="onVivid">{children}</SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
}

it('publishes the Badge.Mark fill only behind contained artwork', () => {
  const tree = inspect(
    'badge',
    { regions: { e5: region({ rest: 'onSubtle' }) } },
    { badge: {} },
    <>
      <Badge.Mark intent="neutral">
        <Probe name="contained" />
      </Badge.Mark>
      <Badge.Mark intent="neutral" presentation="full-bleed">
        <Probe name="artwork" />
      </Badge.Mark>
    </>
  );
  expect(tree.getByTestId('contained').textContent).toBe('onSubtle');
  expect(tree.getByTestId('artwork').textContent).toBe('onVivid');
});

it('uses the selected thumb paint for a Switch icon while the label stays outside', () => {
  const regions = {
    e2: region({ rest: 'onSubtle' }),
    e3: region({ rest: 'onVivid', selected: 'onSubtle' })
  };
  const tree = inspect(
    'switch',
    { variants: { standard: { modes: { base: { regions } } } } },
    { switch: { standard: { base: { e2: {}, e3: {}, e6: {} } } } },
    <Switch
      intent="neutral"
      emphasis="medium"
      variant="standard"
      mode="base"
      motion={false}
      icons={{ rest: <Probe name="glyph" />, selected: <Probe name="selected-glyph" /> }}
      label={<Probe name="label" />}
    />
  );
  expect(tree.getByTestId('glyph').textContent).toBe('onVivid');
  fireEvent.click(tree.getByRole('switch'));
  expect(tree.getByTestId('selected-glyph').textContent).toBe('onSubtle');
  expect(tree.getByTestId('label').textContent).toBe('onVivid');
});

it('places custom Slider icon and tooltip on their respective fills', () => {
  const regions = {
    e10: region({ rest: 'onSubtle' }),
    e11: region({ rest: 'inherit' }),
    e14: region({ rest: 'onVivid' })
  };
  const tree = inspect(
    'slider',
    { variants: { standard: { modes: { base: { regions } } } } },
    { slider: { standard: { base: { e10: {}, e11: {}, e14: {}, e19: {} } } } },
    <Slider
      intent="neutral"
      emphasis="medium"
      variant="standard"
      mode="base"
      label={<Probe name="label" />}
      thumbIcon={<Probe name="icon" />}
      valueDisplay="tooltip"
      formatValue={() => <Probe name="value" />}
    />
  );
  expect(tree.getByTestId('icon').textContent).toBe('onSubtle');
  expect(tree.getByTestId('value').textContent).toBe('onVivid');
  expect(tree.getByTestId('label').textContent).toBe('onVivid');
});

it.each([
  false,
  true
])('publishes the selected tab surface inside the bar when disabled=%s', (disabled) => {
  const regions = {
    e1: region({ rest: 'onSubtle' }),
    e2: region({ rest: 'inherit', selected: 'onVivid' })
  };
  const classes = {
    tabs: {
      box: {
        e1: { c: { v: { s: { neutral: { m: 'vivid-bar' } } } } },
        e2: { c: { s: { s: { neutral: { m: 'subtle-trigger' } } } } }
      }
    }
  };
  const tree = inspect(
    'tabs',
    { variants: { box: { regions } } },
    classes,
    <TabsBox.Root value="a" intent="neutral" emphasis="medium">
      <TabsBox.Bar>
        <TabsBox.Tab value="a" disabled={disabled}>
          <Probe name="selected" />
        </TabsBox.Tab>
        <TabsBox.Tab value="b">
          <Probe name="idle" />
        </TabsBox.Tab>
      </TabsBox.Bar>
      <TabsBox.Content value="a">
        <Probe name="panel" />
      </TabsBox.Content>
    </TabsBox.Root>
  );
  expect(tree.getByRole('tablist').classList).toContain('vivid-bar');
  expect(tree.getAllByRole('tab')[0].classList).toContain('subtle-trigger');
  expect(tree.getAllByRole('tab')[0].getAttribute('aria-disabled')).toBe(disabled ? 'true' : null);
  expect(tree.getByTestId('selected').textContent).toBe('onVivid');
  expect(tree.getByTestId('idle').textContent).toBe('onSubtle');
  expect(tree.getByTestId('panel').textContent).toBe('onVivid');
});
