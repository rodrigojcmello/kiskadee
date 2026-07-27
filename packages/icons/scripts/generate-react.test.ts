import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generateReactComponents, type IconManifest } from './generate-react.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(packageRoot, 'assets');
const manifestPath = path.resolve(packageRoot, 'metadata/icons.json');
const MONOCHROME_BRAND_IDS = new Set(['apple', 'chat-gpt', 'git-hub', 'threads', 'x']);

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

    expect(manifest.sourceContract).toBe('kiskadee-icon-svg-v1');
    expect(manifest.icons).toHaveLength(45);

    for (const icon of manifest.icons) {
      expect(icon.presentations[icon.defaultPresentation]).toBeDefined();

      for (const presentation of Object.values(icon.presentations)) {
        expect(sources.has(presentation.source)).toBe(false);
        sources.add(presentation.source);

        const svg = await readFile(path.resolve(assetsDir, presentation.source), 'utf8');
        expect(svg).toMatch(/^<svg /);
        expect(svg).toContain('</svg>');
        expect(svg).not.toContain('width="1em"');
        expect(svg).not.toContain('height="1em"');
        expect(svg).not.toContain('aria-hidden=');
        expect(svg).not.toContain('focusable=');
        expect(svg).not.toContain('strokeWidth=');
      }
    }
  });

  it('records provenance for every third-party mark', async () => {
    const manifest = await readManifest();
    const thirdPartyIcons = manifest.icons.filter((icon) => icon.origin === 'third-party');

    expect(thirdPartyIcons).toHaveLength(25);
    for (const icon of thirdPartyIcons) {
      expect(icon.provenanceUrl).toMatch(/^https:\/\//);
    }
  });

  it('gives every social icon a currentColor-only monochrome presentation', async () => {
    const manifest = await readManifest();
    const socialIcons = manifest.icons.filter((icon) => icon.family === 'social');

    expect(socialIcons).toHaveLength(25);

    for (const icon of socialIcons) {
      const monochrome = icon.presentations.monochrome;

      expect(monochrome, icon.id).toBeDefined();
      expect(monochrome?.colorBehavior, icon.id).toBe('currentColor');

      const svg = await readFile(path.resolve(assetsDir, monochrome!.source), 'utf8');
      expect(svg, icon.id).toContain('currentColor');
      expect(svg, icon.id).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(svg, icon.id).not.toContain('url(');
    }
  });

  it('defaults chromatic third-party marks to their brand presentation', async () => {
    const manifest = await readManifest();
    const thirdPartyIcons = manifest.icons.filter((icon) => icon.origin === 'third-party');

    for (const icon of thirdPartyIcons) {
      if (MONOCHROME_BRAND_IDS.has(icon.id)) {
        expect(icon.defaultPresentation).toBe('monochrome');
        expect(icon.presentations.brand).toBeUndefined();
        continue;
      }

      expect(icon.defaultPresentation).toBe('brand');
      expect(icon.presentations.brand).toBeDefined();
    }
  });

  it('keeps brand and monochrome presentations on the exact same coordinate box', async () => {
    const manifest = await readManifest();

    for (const icon of manifest.icons) {
      const brand = icon.presentations.brand;
      const monochrome = icon.presentations.monochrome;
      if (!brand || !monochrome) continue;

      const [brandSvg, monochromeSvg] = await Promise.all([
        readFile(path.resolve(assetsDir, brand.source), 'utf8'),
        readFile(path.resolve(assetsDir, monochrome.source), 'utf8')
      ]);

      expect(readViewBox(brandSvg), icon.id).toBe(readViewBox(monochromeSvg));
    }
  });

  it('uses the current official Reddit compact constructions and excludes Bluesky', async () => {
    const manifest = await readManifest();
    const reddit = manifest.icons.find((icon) => icon.id === 'reddit');

    expect(manifest.icons.some((icon) => icon.id === 'bluesky')).toBe(false);
    expect(reddit?.provenanceUrl).toBe('https://redditbrand.lingoapp.com/s/Logo-d9x3n2');

    const [brand, monochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, reddit!.presentations.brand!.source), 'utf8'),
      readFile(path.resolve(assetsDir, reddit!.presentations.monochrome!.source), 'utf8')
    ]);

    expect(readViewBox(brand)).toBe('0 0 256 256');
    expect(brand).toContain('fill="#ff4500"');
    expect(brand).toContain('fill="#ffffff"');
    expect(brand).not.toContain('<defs');
    expect(brand).not.toContain('stroke=');

    expect(readViewBox(monochrome)).toBe(readViewBox(brand));
    expect(monochrome).toContain('fill="currentColor"');
    expect(monochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(monochrome).not.toContain('<defs');
  });

  it('preserves the repaired first-party Apple, Claude, and Telegram geometry', async () => {
    const [apple, claude, telegramBrand, telegramMonochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, 'social/apple.monochrome.svg'), 'utf8'),
      readFile(path.resolve(assetsDir, 'social/claude.brand.svg'), 'utf8'),
      readFile(path.resolve(assetsDir, 'social/telegram.brand.svg'), 'utf8'),
      readFile(path.resolve(assetsDir, 'social/telegram.monochrome.svg'), 'utf8')
    ]);

    expect(readViewBox(apple)).toBe('0 11 14 18');
    expect(apple).toContain('m13.0729 17.6825');
    expect(apple).not.toContain('clip-path');

    expect(readViewBox(claude)).toBe('0 0 128 128');
    expect(claude).toContain('<rect width="128" height="128" rx="30"');
    expect(claude).toContain('M35.0157 79.6937');
    expect(claude).not.toContain('<polygon');

    expect(readViewBox(telegramBrand)).toBe('0 0 1000 1000');
    expect(telegramBrand).toContain('<circle fill="url(#telegram-gradient)"');
    expect(telegramBrand).toContain('M226.328419 494.722069');
    expect(readViewBox(telegramMonochrome)).toBe(readViewBox(telegramBrand));
    expect(telegramMonochrome).toContain('M500 0A500 500');
    expect(telegramMonochrome).toContain('M226.328419 494.722069');
  });

  it('preserves the official Snapchat Ghost geometry in both presentations', async () => {
    const [brand, monochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, 'social/snapchat.brand.svg'), 'utf8'),
      readFile(path.resolve(assetsDir, 'social/snapchat.monochrome.svg'), 'utf8')
    ]);

    expect(readViewBox(brand)).toBe('0 0 500 500');
    expect(readViewBox(monochrome)).toBe(readViewBox(brand));

    expect(brand).toContain('fill="#FFFC00"');
    expect(brand).toContain('fill="#FFFFFF"');
    expect(brand).toContain('fill="#000000"');
    expect(brand).toContain('M417.93,340.71');
    expect(brand).toContain('M444.3,337.26');

    expect(monochrome).toContain('fill="currentColor"');
    expect(monochrome).toContain('M444.3,337.26');
    expect(monochrome).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(brand).not.toContain('M12.206 0');
    expect(monochrome).not.toContain('M12.206 0');
  });

  it('uses one official Substack geometry for brand and monochrome', async () => {
    const manifest = await readManifest();
    const substack = manifest.icons.find((icon) => icon.id === 'substack');
    const [brand, monochrome] = await Promise.all([
      readFile(path.resolve(assetsDir, substack!.presentations.brand!.source), 'utf8'),
      readFile(path.resolve(assetsDir, substack!.presentations.monochrome!.source), 'utf8')
    ]);

    expect(substack?.presentations.brand?.colorBehavior).toBe('fixed');
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
