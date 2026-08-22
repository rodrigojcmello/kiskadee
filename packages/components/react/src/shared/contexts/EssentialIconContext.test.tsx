/** @vitest-environment jsdom */

import {
  DEFAULT_ESSENTIAL_ICONS,
  defineIconFamily,
  type EssentialIconMap,
  type EssentialIconName
} from '@kiskadee/icons/interface';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EssentialIconProvider, useEssentialIcon } from './EssentialIconContext.tsx';
import { IconFamilyProvider } from './IconFamilyContext.tsx';

function Glyph() {
  return <svg />;
}

const completeFamily = defineIconFamily({
  id: 'complete',
  label: 'Complete',
  glyphs: {
    check: Glyph,
    'radio-selected': Glyph,
    'chevron-down': Glyph,
    'chevron-left': Glyph,
    'chevron-end': Glyph,
    close: Glyph,
    'acme:confirmed': Glyph
  }
});

const partialFamily = defineIconFamily({
  id: 'partial',
  label: 'Partial',
  glyphs: { check: Glyph }
});

function Probe({ name }: { name: EssentialIconName }) {
  return <output data-testid="icon-name">{useEssentialIcon(name) ?? 'missing'}</output>;
}

function renderProbe(options: {
  family?: typeof completeFamily;
  icons?: Readonly<EssentialIconMap>;
  name?: EssentialIconName;
  provider?: boolean;
}) {
  const {
    family = completeFamily,
    icons = DEFAULT_ESSENTIAL_ICONS,
    name = 'check',
    provider = true
  } = options;
  const probe = <Probe name={name} />;
  return render(
    <IconFamilyProvider families={[family]} family={family.id}>
      {provider ? <EssentialIconProvider icons={icons}>{probe}</EssentialIconProvider> : probe}
    </IconFamilyProvider>
  );
}

afterEach(cleanup);

describe('EssentialIconProvider', () => {
  it('resolves the default map through the effective icon family', async () => {
    const result = renderProbe({});
    await waitFor(() => expect(result.getByTestId('icon-name').textContent).toBe('check'));
  });

  it('supports partial maps and custom namespaced mappings', async () => {
    const partial = renderProbe({ icons: { check: 'acme:confirmed' } });
    await waitFor(() =>
      expect(partial.getByTestId('icon-name').textContent).toBe('acme:confirmed')
    );
    partial.unmount();

    const missing = renderProbe({ icons: {}, name: 'close' });
    expect(missing.getByTestId('icon-name').textContent).toBe('missing');
  });

  it('returns undefined without a provider or without family coverage', async () => {
    const absent = renderProbe({ provider: false });
    expect(absent.getByTestId('icon-name').textContent).toBe('missing');
    absent.unmount();

    const unavailable = renderProbe({ family: partialFamily, name: 'close' });
    await waitFor(() => expect(unavailable.getByTestId('icon-name').textContent).toBe('missing'));
  });
});
