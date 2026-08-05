import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RedditIcon } from '../src/families/social/RedditIcon.tsx';
import { SnapchatIcon } from '../src/families/social/SnapchatIcon.tsx';
import {
  generateReactComponents,
  type IconManifest,
  validateIconManifest
} from './generate-react.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(packageRoot, 'assets');
const manifestPath = path.resolve(packageRoot, 'metadata/icons.json');
const OFFICIAL_BLACK_BRAND_IDS = ['apple', 'chat-gpt', 'git-hub', 'threads', 'x'] as const;

async function readManifest(): Promise<IconManifest> {
  return JSON.parse(await readFile(manifestPath, 'utf8')) as IconManifest;
}

function readViewBox(svg: string): string {
  const match = svg.match(/\bviewBox="([^"]+)"/);
  if (!match) throw new Error('Canonical SVG source is missing a viewBox.');
  return match[1];
}

function readPathData(svg: string): string[] {
  return [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((match) => match[1]);
}

describe('canonical icon sources', () => {
  it('keeps generated React adapters synchronized', async () => {
    await expect(generateReactComponents({ check: true })).resolves.toBeUndefined();
  });

  it('maps every presentation to one platform-neutral SVG', async () => {
    const manifest = await readManifest();
    const sources = new Set<string>();

    expect(manifest.formatVersion).toBe(4);
    expect(manifest.sourceContract).toBe('kiskadee-icon-svg-v4');
    expect(manifest.icons).toHaveLength(25);

    for (const icon of manifest.icons) {
      expect(icon.constructions[icon.defaultConstruction]).toBeDefined();

      for (const construction of Object.values(icon.constructions)) {
        expect(construction.presentations[construction.defaultPresentation]).toBeDefined();

        for (const presentation of Object.values(construction.presentations)) {
          expect(sources.has(presentation.source)).toBe(false);
          sources.add(presentation.source);

          const svg = await readFile(path.resolve(assetsDir, presentation.source), 'utf8');
          expect(svg).toContain('<svg');
          expect(svg).toContain('</svg>');
          expect(svg).not.toContain('width="1em"');
          expect(svg).not.toContain('height="1em"');
          expect(svg).not.toContain('aria-hidden=');
          expect(svg).not.toContain('focusable=');
          expect(svg).not.toContain('strokeWidth=');
        }
      }
    }
  });

  it('rejects obsolete and structurally invalid optical contracts', async () => {
    const currentManifest = await readManifest();
    const obsoleteManifest = structuredClone(currentManifest);
    const obsoleteContract = obsoleteManifest as unknown as {
      formatVersion: number;
      sourceContract: string;
    };
    obsoleteContract.formatVersion = 3;
    obsoleteContract.sourceContract = 'kiskadee-icon-svg-v3';

    expect(() => validateIconManifest(obsoleteManifest)).toThrow(
      'Unsupported icon manifest contract.'
    );

    const missingSocialTransform = structuredClone(currentManifest);
    const socialIcon = missingSocialTransform.icons.find((icon) => icon.family === 'social');
    const socialConstruction = socialIcon?.constructions[socialIcon.defaultConstruction];
    if (socialConstruction) {
      delete (socialConstruction as Partial<typeof socialConstruction>).opticalTransform;
    }
    expect(() => validateIconManifest(missingSocialTransform)).toThrow(
      'must declare an optical transform'
    );

    const invalidScale = structuredClone(currentManifest);
    const calibratedIcon = invalidScale.icons.find((icon) => icon.family === 'social');
    const calibratedConstruction =
      calibratedIcon?.constructions[calibratedIcon.defaultConstruction];
    if (calibratedConstruction) calibratedConstruction.opticalTransform.scale = 2;
    expect(() => validateIconManifest(invalidScale)).toThrow(
      'Optical scale must be a finite number'
    );
  });

  it('contains only the optically calibrated social brand family', async () => {
    const manifest = await readManifest();

    expect(manifest.families).toEqual({
      social: {
        kind: 'brand',
        origin: 'third-party',
        license: 'trademark-owner-terms',
        provenanceDocument: 'docs/definitions/social-icons.md'
      }
    });
    expect(manifest.icons).toHaveLength(25);
    for (const icon of manifest.icons) {
      expect(icon.family).toBe('social');
      expect(icon.origin).toBe('third-party');
      expect(Object.keys(icon.constructions).length).toBeGreaterThan(0);
      for (const construction of Object.values(icon.constructions)) {
        expect(construction.opticalTransform).toBeDefined();
      }
    }
  });

  it('keeps only the approved multi-construction brands outside the mark-only contract', async () => {
    const manifest = await readManifest();

    for (const icon of manifest.icons.filter(
      (candidate) => candidate.id !== 'reddit' && candidate.id !== 'snapchat'
    )) {
      expect(icon.defaultConstruction, icon.id).toBe('mark');
      expect(Object.keys(icon.constructions), icon.id).toEqual(['mark']);

      for (const [presentationName, presentation] of Object.entries(
        icon.constructions.mark.presentations
      )) {
        expect(presentation.source, `${icon.id}.${presentationName}`).toBe(
          `social/${icon.id}.${presentationName}.svg`
        );
      }
    }

    const snapchat = manifest.icons.find((icon) => icon.id === 'snapchat');
    expect(snapchat?.defaultConstruction).toBe('contained');
    expect(Object.keys(snapchat!.constructions).sort()).toEqual(['contained', 'mark']);
  });

  it('publishes interface icon families only through explicit subpaths', async () => {
    const packageJson = JSON.parse(
      await readFile(path.resolve(packageRoot, 'package.json'), 'utf8')
    ) as {
      exports: Record<string, unknown>;
    };
    const rootSource = await readFile(path.resolve(packageRoot, 'src/index.ts'), 'utf8');

    expect(Object.keys(packageJson.exports)).toContain('./social');
    expect(Object.keys(packageJson.exports)).toContain('./interface');
    expect(Object.keys(packageJson.exports)).toContain('./interface/catalog');
    expect(Object.keys(packageJson.exports)).toContain('./interface/lucide');
    expect(rootSource).toContain('SocialIcons');
    expect(rootSource).not.toContain("from './interface");
    expect(rootSource).not.toContain('KiskadeeIcons');
    expect(rootSource).not.toContain('LucideIcons');
  });

  it('records provenance for every third-party mark', async () => {
    const manifest = await readManifest();
    const thirdPartyIcons = manifest.icons.filter((icon) => icon.origin === 'third-party');

    expect(thirdPartyIcons).toHaveLength(25);
    for (const icon of thirdPartyIcons) {
      expect(icon.provenanceUrl).toMatch(/^https:\/\//);
    }
  });

  it('records one shared optical calibration per construction', async () => {
    const manifest = await readManifest();
    const socialIcons = manifest.icons.filter((icon) => icon.family === 'social');
    const calibrationByIcon = Object.fromEntries(
      socialIcons.map((icon) => [
        icon.id,
        Object.fromEntries(
          Object.entries(icon.constructions).map(([name, construction]) => [
            name,
            construction.opticalTransform
          ])
        )
      ])
    );

    for (const icon of socialIcons) {
      for (const [constructionName, construction] of Object.entries(icon.constructions)) {
        expect(construction.opticalTransform, `${icon.id}.${constructionName}`).toEqual({
          scale: expect.any(Number),
          offsetX: expect.any(Number),
          offsetY: expect.any(Number)
        });
      }
    }

    // What: freeze every human-calibrated transform, not only broad geometric limits.
    // Why: a numerically valid change can still break the perceived balance of the contact sheet.
    expect(calibrationByIcon).toEqual({
      apple: { mark: { scale: 0.94, offsetX: 0, offsetY: -0.03 } },
      'chat-gpt': { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      claude: { mark: { scale: 1.1, offsetX: 0, offsetY: 0 } },
      discord: { mark: { scale: 0.88, offsetX: 0, offsetY: 0 } },
      facebook: { mark: { scale: 0.86, offsetX: 0, offsetY: 0.01 } },
      gemini: { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      'git-hub': { mark: { scale: 0.88, offsetX: 0, offsetY: 0.02 } },
      google: { mark: { scale: 0.88, offsetX: 0.02, offsetY: -0.01 } },
      instagram: { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      'linked-in': { mark: { scale: 0.84, offsetX: 0, offsetY: 0.01 } },
      mastodon: { mark: { scale: 0.86, offsetX: 0.02, offsetY: 0.02 } },
      messenger: { mark: { scale: 0.84, offsetX: 0, offsetY: 0 } },
      microsoft: { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      pinterest: { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      reddit: {
        contained: { scale: 0.76, offsetX: 0, offsetY: 0 },
        mark: { scale: 1.1, offsetX: 0, offsetY: 0 }
      },
      snapchat: {
        contained: { scale: 0.9, offsetX: 0, offsetY: 0 },
        mark: { scale: 1.1, offsetX: 0, offsetY: -0.01 }
      },
      substack: { mark: { scale: 1.2, offsetX: 0, offsetY: 0 } },
      telegram: { mark: { scale: 0.9, offsetX: 0, offsetY: 0 } },
      threads: { mark: { scale: 0.88, offsetX: 0, offsetY: 0 } },
      'tik-tok': { mark: { scale: 1.15, offsetX: 0, offsetY: -0.05 } },
      twitch: { mark: { scale: 0.88, offsetX: 0.04, offsetY: 0.03 } },
      vimeo: { mark: { scale: 0.88, offsetX: -0.02, offsetY: 0.02 } },
      'whats-app': { mark: { scale: 0.9, offsetX: 0.02, offsetY: -0.02 } },
      x: { mark: { scale: 0.8, offsetX: 0, offsetY: 0 } },
      'you-tube': { mark: { scale: 0.94, offsetX: 0, offsetY: 0 } }
    });
  });

  it('gives every social icon a currentColor-only monochrome presentation', async () => {
    const manifest = await readManifest();
    const socialIcons = manifest.icons.filter((icon) => icon.family === 'social');

    expect(socialIcons).toHaveLength(25);

    for (const icon of socialIcons) {
      const monochrome = Object.values(icon.constructions)
        .map((construction) => construction.presentations.monochrome)
        .find(Boolean);

      expect(monochrome, icon.id).toBeDefined();
      expect(monochrome?.colorBehavior, icon.id).toBe('currentColor');

      const svg = await readFile(path.resolve(assetsDir, monochrome!.source), 'utf8');
      expect(svg, icon.id).toContain('currentColor');
      expect(svg, icon.id).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(svg, icon.id).not.toContain('url(');
    }
  });

  it('defaults every third-party icon to its brand presentation', async () => {
    const manifest = await readManifest();
    const thirdPartyIcons = manifest.icons.filter((icon) => icon.origin === 'third-party');

    for (const icon of thirdPartyIcons) {
      const defaultConstruction = icon.constructions[icon.defaultConstruction];

      expect(defaultConstruction.defaultPresentation).toBe('brand');
      expect(defaultConstruction.presentations.brand).toBeDefined();
    }
  });

  it('separates official black brand paint from recolorable monochrome paint', async () => {
    const manifest = await readManifest();

    for (const iconId of OFFICIAL_BLACK_BRAND_IDS) {
      const icon = manifest.icons.find((candidate) => candidate.id === iconId);
      const defaultConstruction = icon?.constructions[icon.defaultConstruction];
      const brand = defaultConstruction?.presentations.brand;
      const monochrome = defaultConstruction?.presentations.monochrome;

      expect(defaultConstruction?.defaultPresentation, iconId).toBe('brand');
      expect(brand?.colorBehavior, iconId).toBe('fixed');
      expect(monochrome?.colorBehavior, iconId).toBe('currentColor');

      const [brandSvg, monochromeSvg] = await Promise.all([
        readFile(path.resolve(assetsDir, brand!.source), 'utf8'),
        readFile(path.resolve(assetsDir, monochrome!.source), 'utf8')
      ]);

      expect(readViewBox(brandSvg), iconId).toBe(readViewBox(monochromeSvg));
      expect(readPathData(brandSvg), iconId).toEqual(readPathData(monochromeSvg));
      expect(brandSvg, iconId).toContain('#000000');
      expect(brandSvg, iconId).not.toContain('currentColor');
      expect(monochromeSvg, iconId).toContain('currentColor');
      expect(monochromeSvg, iconId).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it('keeps brand and monochrome presentations on the exact same coordinate box', async () => {
    const manifest = await readManifest();

    for (const icon of manifest.icons) {
      for (const [constructionName, construction] of Object.entries(icon.constructions)) {
        const presentations = Object.values(construction.presentations);
        const viewBoxes = await Promise.all(
          presentations.map(async (presentation) =>
            readViewBox(await readFile(path.resolve(assetsDir, presentation.source), 'utf8'))
          )
        );

        expect(new Set(viewBoxes).size, `${icon.id}.${constructionName}`).toBe(1);
      }
    }
  });

  it('publishes the four approved Reddit construction/presentation pairs', async () => {
    const manifest = await readManifest();
    const reddit = manifest.icons.find((icon) => icon.id === 'reddit');

    expect(manifest.icons.some((icon) => icon.id === 'bluesky')).toBe(false);
    expect(reddit?.provenanceUrl).toBe('https://redditbrand.lingoapp.com/s/Logo-d9x3n2');
    expect(reddit?.defaultConstruction).toBe('contained');
    expect(Object.keys(reddit!.constructions).sort()).toEqual(['contained', 'mark']);
    expect(Object.keys(reddit!.constructions.contained.presentations).sort()).toEqual([
      'brand',
      'monochrome'
    ]);
    expect(Object.keys(reddit!.constructions.mark.presentations).sort()).toEqual([
      'brand',
      'monochrome'
    ]);

    const [containedBrand, containedMonochrome, markBrand, markMonochrome] = await Promise.all([
      readFile(
        path.resolve(assetsDir, reddit!.constructions.contained.presentations.brand.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, reddit!.constructions.contained.presentations.monochrome.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, reddit!.constructions.mark.presentations.brand.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, reddit!.constructions.mark.presentations.monochrome.source),
        'utf8'
      )
    ]);

    expect(readViewBox(containedBrand)).toBe('0 0 256 256');
    expect(readViewBox(containedMonochrome)).toBe(readViewBox(containedBrand));
    expect(containedBrand).toContain('fill="#FF4500"');
    expect(containedMonochrome).toContain('fill="currentColor"');
    expect(containedMonochrome).toContain('fill-rule="evenodd"');
    expect(containedMonochrome).toContain('clip-rule="evenodd"');
    expect(containedMonochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(containedMonochrome).not.toContain('url(');

    expect(readViewBox(markBrand)).toBe('0 0 256 256');
    expect(readViewBox(markMonochrome)).toBe(readViewBox(markBrand));
    expect(markBrand).not.toContain('<rect');
    expect(markMonochrome).not.toContain('<rect');
    expect(markMonochrome).toContain('fill="currentColor"');
    expect(markMonochrome).toContain('fill-rule="evenodd"');
    expect(markMonochrome).toContain('clip-rule="evenodd"');
    expect(markMonochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(markMonochrome).not.toContain('url(');

    const socialSources = await Promise.all(
      Object.values(reddit!.constructions).flatMap((construction) =>
        Object.values(construction.presentations).map((presentation) =>
          readFile(path.resolve(assetsDir, presentation.source), 'utf8')
        )
      )
    );
    expect(socialSources.join('\n')).not.toContain('silhouette');
  });

  it('generates a consistent Reddit API for contained and mark constructions', async () => {
    const component = await readFile(
      path.resolve(packageRoot, 'src/families/social/RedditIcon.tsx'),
      'utf8'
    );

    expect(component).toContain("construction?: 'contained'");
    expect(component).toContain("presentation?: 'brand' | 'monochrome'");
    expect(component).toContain("construction: 'mark'");
    expect(component).toContain("presentation?: 'brand' | 'monochrome'");
    expect(() =>
      RedditIcon({
        construction: 'contained',
        presentation: 'monochrome'
      } as never)
    ).not.toThrow();
    expect(() =>
      RedditIcon({
        construction: 'mark',
        presentation: 'monochrome'
      } as never)
    ).not.toThrow();
  });

  it('preserves the official Reddit originals as source evidence', async () => {
    const sourcesDir = path.resolve(assetsDir, 'sources/reddit');
    const originals = await Promise.all([
      readFile(path.resolve(sourcesDir, 'Reddit_Icon_FullColor.svg'), 'utf8'),
      readFile(path.resolve(sourcesDir, 'Reddit_Icon_FullColor_Bleed.svg'), 'utf8'),
      readFile(path.resolve(sourcesDir, 'Reddit_Icon_2Color.svg'), 'utf8'),
      readFile(path.resolve(sourcesDir, 'Reddit_Icon_2Color_FullBleed.svg'), 'utf8')
    ]);

    for (const original of originals) {
      expect(original).toContain('<?xml');
      expect(readViewBox(original)).toBe('0 0 256 256');
    }
    expect(originals[0]).toContain('Adobe Illustrator');
    expect(originals[1]).toContain('Adobe Illustrator');
  });

  it('preserves the repaired Apple, Claude, and Telegram geometry', async () => {
    const [apple, claudeBrand, claudeMonochrome, telegramBrand, telegramMonochrome] =
      await Promise.all([
        readFile(path.resolve(assetsDir, 'social/apple.monochrome.svg'), 'utf8'),
        readFile(path.resolve(assetsDir, 'social/claude.brand.svg'), 'utf8'),
        readFile(path.resolve(assetsDir, 'social/claude.monochrome.svg'), 'utf8'),
        readFile(path.resolve(assetsDir, 'social/telegram.brand.svg'), 'utf8'),
        readFile(path.resolve(assetsDir, 'social/telegram.monochrome.svg'), 'utf8')
      ]);

    expect(readViewBox(apple)).toBe('0 11 14 18');
    expect(apple).toContain('m13.0729 17.6825');
    expect(apple).not.toContain('clip-path');

    expect(readViewBox(claudeBrand)).toBe('0 0 128 128');
    expect(readViewBox(claudeMonochrome)).toBe(readViewBox(claudeBrand));
    expect(readPathData(claudeBrand)).toEqual(readPathData(claudeMonochrome));
    expect(claudeBrand).toContain('fill="#D97757"');
    expect(claudeBrand).toContain('M35.0157 79.6937');
    expect(claudeBrand).not.toContain('<rect');
    expect(claudeBrand).not.toContain('<defs');
    expect(claudeMonochrome).toContain('fill="currentColor"');
    expect(claudeMonochrome).not.toContain('<rect');

    expect(readViewBox(telegramBrand)).toBe('0 0 1000 1000');
    expect(telegramBrand).toContain('<circle fill="url(#telegram-gradient)"');
    expect(telegramBrand).toContain('M226.328419 494.722069');
    expect(readViewBox(telegramMonochrome)).toBe(readViewBox(telegramBrand));
    expect(telegramMonochrome).toContain('M500 0A500 500');
    expect(telegramMonochrome).toContain('M226.328419 494.722069');
  });

  it('publishes the approved Snapchat construction and presentation pairs', async () => {
    const manifest = await readManifest();
    const snapchat = manifest.icons.find((icon) => icon.id === 'snapchat');

    expect(snapchat?.defaultConstruction).toBe('contained');
    expect(Object.keys(snapchat!.constructions).sort()).toEqual(['contained', 'mark']);
    expect(Object.keys(snapchat!.constructions.contained.presentations)).toEqual(['brand']);
    expect(Object.keys(snapchat!.constructions.mark.presentations).sort()).toEqual([
      'adaptiveOutline',
      'brand',
      'monochrome'
    ]);

    const [containedBrand, markBrand, markMonochrome, markAdaptiveOutline] = await Promise.all([
      readFile(
        path.resolve(assetsDir, snapchat!.constructions.contained.presentations.brand.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, snapchat!.constructions.mark.presentations.brand.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, snapchat!.constructions.mark.presentations.monochrome.source),
        'utf8'
      ),
      readFile(
        path.resolve(assetsDir, snapchat!.constructions.mark.presentations.adaptiveOutline.source),
        'utf8'
      )
    ]);

    expect(readViewBox(containedBrand)).toBe('0 0 500 500');
    expect(readViewBox(markBrand)).toBe(readViewBox(containedBrand));
    expect(readViewBox(markMonochrome)).toBe(readViewBox(containedBrand));
    expect(readViewBox(markAdaptiveOutline)).toBe(readViewBox(containedBrand));

    expect(containedBrand).toContain('<rect');
    expect(containedBrand).toContain('fill="#FFFC00"');
    expect(containedBrand).toContain('fill="#FFFFFF"');
    expect(containedBrand).toContain('fill="#000000"');

    expect(markBrand).not.toContain('<rect');
    expect(markBrand).toContain('fill="#FFFFFF"');
    expect(markBrand).toContain('fill="#000000"');

    expect(markMonochrome).not.toContain('<rect');
    expect(markMonochrome).toContain('fill="currentColor"');
    expect(markMonochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);

    expect(snapchat!.constructions.mark.presentations.adaptiveOutline.colorBehavior).toBe(
      'adaptive'
    );
    expect(markAdaptiveOutline).not.toContain('<rect');
    expect(markAdaptiveOutline).toContain('fill="#FFFFFF"');
    expect(markAdaptiveOutline).toContain('fill="currentColor"');
    expect(markAdaptiveOutline).not.toContain('fill="#000000"');

    for (const svg of [containedBrand, markBrand, markMonochrome, markAdaptiveOutline]) {
      expect(svg).toContain('M444.3,337.26');
      expect(svg).not.toContain('M12.206 0');
    }
    for (const svg of [containedBrand, markBrand, markAdaptiveOutline]) {
      expect(svg).toContain('M417.93,340.71');
    }
  });

  it('generates the complete Snapchat API', async () => {
    const component = await readFile(
      path.resolve(packageRoot, 'src/families/social/SnapchatIcon.tsx'),
      'utf8'
    );

    expect(component).toContain("construction?: 'contained'");
    expect(component).toContain("presentation?: 'brand'");
    expect(component).toContain("construction: 'mark'");
    expect(component).toContain("presentation?: 'adaptiveOutline' | 'brand' | 'monochrome'");
    expect(() => SnapchatIcon({} as never)).not.toThrow();
    expect(() =>
      SnapchatIcon({
        construction: 'mark',
        presentation: 'adaptiveOutline'
      } as never)
    ).not.toThrow();
  });

  it('uses the current four-color Gemini Spark from the official Gemini surface', async () => {
    const [brand, monochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, 'social/gemini.brand.svg'), 'utf8'),
      readFile(path.resolve(assetsDir, 'social/gemini.monochrome.svg'), 'utf8')
    ]);

    expect(readViewBox(brand)).toBe('0 0 65 65');
    expect(readViewBox(monochrome)).toBe(readViewBox(brand));
    expect(brand).toContain('fill="#FC413D"');
    expect(brand).toContain('fill="#FBBC04"');
    expect(brand).toContain('fill="#00B95C"');
    expect(brand).toContain('fill="#3186FF"');
    expect(brand).toContain('mask="url(#gemini-spark-mask)"');
    expect(monochrome).toContain('fill="currentColor"');
    expect(monochrome).toContain('M57.8647 29.0109');
    expect(monochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('uses one official Substack geometry for brand and monochrome', async () => {
    const manifest = await readManifest();
    const substack = manifest.icons.find((icon) => icon.id === 'substack');
    const mark = substack!.constructions.mark;
    const [brand, monochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, mark.presentations.brand!.source), 'utf8'),
      readFile(path.resolve(assetsDir, mark.presentations.monochrome!.source), 'utf8')
    ]);

    expect(mark.presentations.brand?.colorBehavior).toBe('fixed');
    expect(readViewBox(brand)).toBe('0 0 1000 1000');
    expect(readViewBox(monochrome)).toBe(readViewBox(brand));
    expect(readPathData(brand)).toEqual(readPathData(monochrome));
    expect(readPathData(brand)).toHaveLength(3);

    expect(brand).toContain('fill="#FF6719"');
    expect(brand).not.toContain('<rect');
    expect(brand).not.toContain('<defs');
    expect(brand).not.toContain('<linearGradient');
    expect(brand).not.toContain('url(');
    expect(monochrome).toContain('fill="currentColor"');
    expect(monochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(monochrome).not.toContain('url(');
  });
});
