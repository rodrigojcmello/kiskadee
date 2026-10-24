import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type ButtonElements, elementSizeValues, type Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  buildButtonLayoutSupport,
  buildSizeSupport,
  publishComponentResources
} from './publishComponentResources.ts';

function buttonFixture() {
  return {
    elements: {
      e1: {
        name: 'button',
        scales: { paddingTop: { 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 9 } }
      },
      e8: {
        name: 'button-stacked',
        scales: {
          paddingTop: 8,
          paddingRight: 12,
          paddingBottom: 8,
          paddingLeft: 12,
          borderWidth: 1,
          borderRadius: { rounded: 4 }
        }
      },
      e9: {
        name: 'button-stacked-label',
        typography: { 's:all': 'caption-medium' },
        scales: { marginTop: 4 }
      },
      e10: {
        name: 'button-stacked-icon',
        iconSize: { 's:all': 's:lg:1' }
      }
    } satisfies ButtonElements
  };
}

const componentSizes = ['sm:1', 'md:1', 'lg:1'];

describe('Button stacked layout capabilities', () => {
  it('supports scalar geometry and shared references only within existing component sizes', () => {
    const button = buttonFixture();
    const support = buildSizeSupport(button);
    expect(support.sizes).toEqual(['lg:1', 'md:1', 'sm:1']);
    expect(buildButtonLayoutSupport(button, support.sizes!)).toEqual({
      stacked: {
        sizes: componentSizes,
        sizesByRadius: { rounded: componentSizes, pill: [], square: [] }
      }
    });
    expect(buildButtonLayoutSupport(button, ['md:1'])).toEqual({
      stacked: {
        sizes: ['md:1'],
        sizesByRadius: { rounded: ['md:1'], pill: [], square: [] }
      }
    });
    expect(buildSizeSupport(button)).toEqual(support);
  });

  it('recognizes shared scale assignments without inferring an authored size from metadata', () => {
    const button = buttonFixture();
    const branch = {
      elements: {
        ...button.elements,
        e8: {
          ...button.elements.e8,
          scales: { ...button.elements.e8.scales, paddingTop: { 's:all': 8 }, _boxHeight: 60 }
        }
      }
    };
    expect(buildButtonLayoutSupport(branch, componentSizes)).toEqual({
      stacked: {
        sizes: componentSizes,
        sizesByRadius: { rounded: componentSizes, pill: [], square: [] }
      }
    });
    expect(buildButtonLayoutSupport(branch, [])).toEqual({
      stacked: { sizes: [], sizesByRadius: { rounded: [], pill: [], square: [] } }
    });
  });

  it.each([
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderWidth'
  ] as const)('intersects a partial %s map instead of accepting other global utilities', (property) => {
    const button = buttonFixture();
    const scales = button.elements.e8.scales as Record<string, unknown>;
    scales[property] = { 's:md:1': 8 };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: {
        sizes: ['md:1'],
        sizesByRadius: { rounded: ['md:1'], pill: [], square: [] }
      }
    });
  });

  it('intersects label typography, gap, radius and icon size independently', () => {
    const restrict = [
      (elements: ButtonElements) => {
        elements.e8!.scales.borderRadius = { rounded: { 's:md:1': 4 } };
      },
      (elements: ButtonElements) => {
        elements.e9!.typography = { 's:md:1': 'caption-medium' };
      },
      (elements: ButtonElements) => {
        elements.e9!.scales.marginTop = { 's:md:1': 4 };
      },
      (elements: ButtonElements) => {
        elements.e10!.iconSize = { 's:md:1': 's:lg:1' };
      }
    ];
    for (const limit of restrict) {
      const button = buttonFixture();
      limit(button.elements);
      expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
        stacked: {
          sizes: ['md:1'],
          sizesByRadius: { rounded: ['md:1'], pill: [], square: [] }
        }
      });
    }
  });

  it('publishes pill-only support without inventing a rounded recipe', () => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    elements.e8!.scales.borderRadius = { pill: 28 };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: {
        sizes: componentSizes,
        sizesByRadius: { rounded: [], pill: componentSizes, square: [] }
      }
    });
  });

  it('keeps per-radius size coverage and accepts an explicitly square zero radius', () => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    elements.e8!.scales.borderRadius = {
      rounded: { 's:md:1': 4 },
      pill: { 's:sm:1': 24, 's:lg:1': 34 },
      square: 0
    };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: {
        sizes: componentSizes,
        sizesByRadius: {
          rounded: ['md:1'],
          pill: ['sm:1', 'lg:1'],
          square: componentSizes
        }
      }
    });
  });

  it('does not advertise a responsive-only radius even when another radius covers the size', () => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    elements.e8!.scales.borderRadius = {
      rounded: 4,
      pill: { 's:md:1': { 'bp:lg:1': 28 } },
      square: { 's:sm:1': { 'bp:all': 0, 'bp:lg:1': 0 } }
    };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: {
        sizes: componentSizes,
        sizesByRadius: { rounded: componentSizes, pill: [], square: ['sm:1'] }
      }
    });
    elements.e8!.scales.borderRadius.pill = {
      's:md:1': { 'bp:all': 28, 'bp:lg:1': 30 }
    };
    expect(buildButtonLayoutSupport(button, componentSizes)?.stacked?.sizesByRadius?.pill).toEqual([
      'md:1'
    ]);
  });

  it('requires baseline values for responsive assignments and accepts zero spacing', () => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    elements.e8!.scales.paddingTop = { 's:md:1': { 'bp:all': 0, 'bp:lg:1': 8 } };
    elements.e9!.typography = { 's:all': { 'bp:all': 'caption-medium' } };
    elements.e10!.iconSize = { 's:all': { 'bp:all': 's:lg:1' } };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: {
        sizes: ['md:1'],
        sizesByRadius: { rounded: ['md:1'], pill: [], square: [] }
      }
    });
    elements.e8!.scales.paddingTop = { 's:md:1': { 'bp:lg:1': 8 } };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: { sizes: [], sizesByRadius: { rounded: [], pill: [], square: [] } }
    });
  });

  it('does not infer complete geometry from borders, gaps or inspection references', () => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    elements.e8!.scales.paddingTop = { 's:md:1': 8 };
    elements.e8!.scales._boxHeight = Object.fromEntries(
      elementSizeValues.map((size) => [size, 60])
    );
    elements.e10!.iconSize = { 's:sm:1': 's:lg:1' };
    expect(buildButtonLayoutSupport(button, componentSizes)).toEqual({
      stacked: { sizes: [], sizesByRadius: { rounded: [], pill: [], square: [] } }
    });
  });

  it.each(['e8', 'e9', 'e10'] as const)('omits layout capabilities without %s', (missing) => {
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    delete elements[missing];
    expect(buildButtonLayoutSupport(button, componentSizes)).toBeUndefined();
  });

  it.each([
    'absent',
    'empty',
    'complete',
    'pill-only'
  ] as const)('replaces stale layout publication when the current recipe is %s', async (kind) => {
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-button-layout-'));
    const button = buttonFixture();
    const elements: ButtonElements = button.elements;
    if (kind === 'absent') delete elements.e10;
    if (kind === 'empty') {
      elements.e9!.typography = { 's:md:1': 'caption-medium' };
      elements.e10!.iconSize = { 's:sm:1': 's:lg:1' };
    }
    if (kind === 'pill-only') elements.e8!.scales.borderRadius = { pill: 28 };
    const schema = {
      name: 'Button layout capabilities',
      author: 'Kiskadee',
      version: [1, 0, 0],
      breakpoints: { 'bp:all': 0 },
      components: { button }
    } satisfies Schema;
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await mkdir(join(dir, 'components'));
      await write('manifest.json', {
        themes: {},
        components: { button: { artifacts: { metadata: 'components/previous-button.json' } } }
      });
      await write('global.kiskadee.json', {
        components: { button: { layouts: { stacked: { sizes: ['lg:5'] } } } }
      });
      await write('components/previous-button.json', {
        layouts: {
          stacked: {
            sizes: ['sm:5'],
            sizesByRadius: { rounded: ['sm:5'], pill: ['lg:5'], square: ['md:5'] }
          }
        }
      });
      await write('core.kiskadee.json', {});
      await write('core.kiskadee.css', '');
      await publishComponentResources(dir, schema);
      const metadata = JSON.parse(
        await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
      );
      if (kind === 'absent') expect(metadata).not.toHaveProperty('layouts');
      else {
        expect(metadata.layouts).toEqual({
          stacked: {
            sizes: kind === 'empty' ? [] : componentSizes,
            sizesByRadius: {
              rounded: kind === 'complete' ? componentSizes : [],
              pill: kind === 'pill-only' ? componentSizes : [],
              square: []
            }
          }
        });
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
