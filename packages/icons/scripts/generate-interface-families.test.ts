import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CANONICAL_ICON_NAMES } from '../src/interface/canonical.ts';
import { generateInterfaceFamilies } from './generate-interface-families.ts';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('interface family metadata', () => {
  it('maps every canonical name in every official family', async () => {
    const metadata = JSON.parse(
      await readFile(path.resolve(packageRoot, 'metadata/interface-families.json'), 'utf8')
    ) as {
      families: Record<
        string,
        {
          directions: Record<string, 'fixed' | 'mirror' | 'unique'>;
          mappings: Record<string, string>;
          rtlMappings?: Record<string, string>;
        }
      >;
    };

    expect(Object.keys(metadata.families)).toHaveLength(7);
    for (const family of Object.values(metadata.families)) {
      expect(Object.keys(family.mappings).sort()).toEqual([...CANONICAL_ICON_NAMES].sort());
      expect(family.directions).toMatchObject({
        'chevron-left': 'mirror',
        redo: 'mirror',
        send: 'mirror',
        undo: 'mirror'
      });
    }

    expect(metadata.families['fluent-system']).toMatchObject({
      directions: {
        list: 'unique',
        'list-ordered': 'unique'
      },
      mappings: {
        moon: 'WeatherMoonRegular',
        'moon-star': 'WeatherPartlyCloudyNightRegular'
      },
      rtlMappings: {
        list: 'TextBulletListRtlRegular',
        'list-ordered': 'TextNumberListRtlRegular'
      }
    });
    expect(metadata.families.iconoir).toMatchObject({
      directions: {
        list: 'mirror',
        'list-ordered': 'unique'
      },
      rtlMappings: {
        'list-ordered': 'NumberedListRight'
      }
    });
  });

  it('keeps generated adapters synchronized', async () => {
    await expect(generateInterfaceFamilies({ check: true })).resolves.toBeUndefined();
  });

  it('uses supported per-glyph subpaths for large upstream packages', async () => {
    const [fluent, phosphor, fontAwesome] = await Promise.all([
      readFile(path.resolve(packageRoot, 'src/interface/families/fluent-system.tsx'), 'utf8'),
      readFile(path.resolve(packageRoot, 'src/interface/families/phosphor.tsx'), 'utf8'),
      readFile(
        path.resolve(packageRoot, 'src/interface/families/font-awesome-classic-solid.tsx'),
        'utf8'
      )
    ]);

    expect(fluent).toContain("from '@fluentui/react-icons/headless/svg/search'");
    expect(fluent).toContain("from '@fluentui/react-icons/headless/svg/text-bullet-list-rtl'");
    expect(fluent).toContain("from '@fluentui/react-icons/headless/svg/text-number-list-rtl'");
    expect(fluent).not.toContain("from '@fluentui/react-icons';");
    expect(phosphor).toContain("from '@phosphor-icons/react/MagnifyingGlass'");
    expect(phosphor).not.toContain("from '@phosphor-icons/react';");
    expect(fontAwesome).toContain("from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'");
    expect(fontAwesome).not.toContain("from '@fortawesome/free-solid-svg-icons';");
  });
});
