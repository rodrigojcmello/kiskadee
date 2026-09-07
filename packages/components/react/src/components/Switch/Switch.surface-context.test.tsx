/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { switchSurfaceClassMaps } from './fixtures/switch-surface-class-maps.ts';
import { resolveSwitchThumbShrinkClassNames } from './Switch.class-names.ts';
import { Switch } from './Switch.tsx';

afterEach(cleanup);

it.each([
  'light',
  'dark'
] as const)('consumes real %s palette slots and explicit surface overrides', (theme) => {
  const classMap = switchSurfaceClassMaps[theme];
  const context: KiskadeeContextValue = {
    classesMap: { switch: classMap },
    designSystem: `switch-surface-${theme}`,
    segment: 'default',
    theme,
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    global: { components: { switch: { options: { controlTextVisibility: 'always' } } } }
  };
  const tree = (surfaceContext?: 'onSubtle' | 'onVivid') => (
    <KiskadeeContext.Provider value={context}>
      <SurfaceContextProvider value="onVivid">
        <Switch
          motion={false}
          thumbShrink={false}
          icons={{ rest: <svg />, selected: <svg /> }}
          activationFeedback={false}
          label="Switch"
          controlText={{ on: 'On', off: 'Off' }}
          surfaceContext={surfaceContext}
        />
      </SurfaceContextProvider>
    </KiskadeeContext.Provider>
  );
  const view = render(tree());
  for (const surface of ['v', 's'] as const) {
    if (surface === 's') view.rerender(tree('onSubtle'));
    for (const slot of ['e2', 'e3', 'e4', 'e5', 'e6'] as const) {
      const expected = classMap.standard.base[slot]?.c?.[surface]?.neutral?.m;
      expect(expected).toBeTruthy();
      expect(view.container.innerHTML).toContain(expected);
    }
    const resolved = resolveSwitchThumbShrinkClassNames({
      elements: classMap.standard.base,
      classNames: {},
      structuralBranch: 'a',
      scale: 's:md:1',
      intent: 'neutral',
      emphasis: 'medium',
      radius: 'rounded',
      activationMotion: 'standard',
      labelPosition: 'start',
      hasLabel: true,
      hasControlText: true,
      surfaceContext: surface === 'v' ? 'onVivid' : 'onSubtle'
    });
    expect(resolved.x5).toContain(classMap.standard.base.e3.c[surface].neutral.m);
  }
});
