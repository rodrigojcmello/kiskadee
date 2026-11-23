import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type Color, color, type SolidColor } from '@kiskadee/core';
import { expect, it, vi } from 'vitest';
import neutral from './fluent-2-microsoft/colors/n.black.v1.ts';

// Probe one source track at a time in memory. An independent destination must keep the
// same values. Use existing family tones, so authoring helpers can still resolve alpha,
// references and gradients normally; the control schemas and checked-in assets stay intact.
const probe = vi.hoisted(() => ({ track: '' }));
vi.mock('@kiskadee/core', async (importOriginal) => {
  const core = await importOriginal<typeof import('@kiskadee/core')>();
  // Return a distinguishable existing primitive only to the test. This also detects
  // a wrong-track white or black even when both approved scales contain that RGB.
  type Context = Parameters<typeof core.color>[0];
  function mark(value: SolidColor, ctx: Context, segment: string, track: 'l' | 'd'): SolidColor {
    if (probe.track !== track || !value.startsWith('#')) return value;
    const original = core.normalizeHexColor(value);
    const source = track === 'l' ? 'light' : 'dark';
    for (const family of Object.values(ctx.colors?.primitiveColors ?? {})) {
      const asset = Object.values(family).find(
        (asset) => asset?.kind === 'static' && asset.scales[source]
      );
      const scale = asset?.scales[source];
      if (!scale) continue;
      for (const tone of [8, 18, 0, 100] as const) {
        const rgb = core.normalizeHexColor(scale[tone]).slice(0, 7);
        if (rgb !== original.slice(0, 7)) return rgb + original.slice(7);
      }
    }
    throw new Error(`No approved static probe tones for ${segment} / ${source}`);
  }
  function readColor(...args: Parameters<typeof core.resolveColor>): Color {
    const [ctx, segment, track] = args;
    const value = core.resolveColor(...args);
    if (typeof value === 'string') return mark(value, ctx, segment, track);
    return {
      ...value,
      stops: value.stops.map((stop) => ({
        ...stop,
        color: mark(stop.color, ctx, segment, track)
      }))
    };
  }
  return {
    ...core,
    color: readColor,
    resolveColor: readColor,
    colorByReference(...args: Parameters<typeof core.colorByReference>) {
      const [ctx, segment, track] = args;
      return mark(core.colorByReference(...args), ctx, segment, track);
    }
  };
});

function paletteLeaves(
  value: unknown,
  target: string[],
  path = '',
  themed = false,
  out = new Map<string, string>()
) {
  if (typeof value === 'string' && themed) out.set(path, value);
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (!path && !['components', 'global', 'themeTokens'].includes(key)) continue;
      paletteLeaves(
        child,
        target,
        path ? `${path}.${key}` : key,
        ['light', 'dark', 'darker'].includes(key) ? target.includes(key) : themed,
        out
      );
    }
  }
  return out;
}

it('distinguishes equal RGB stops while preserving short-form input alpha', () => {
  const scale = { ...neutral.scales.dark, 8: '#112233cc', 18: '#112233', 10: '#1238' } as const;
  const ctx = {
    colors: {
      primitiveColors: { black: { v1: { ...neutral, scales: { dark: scale } } } },
      componentIntents: {},
      globalSemantics: { light: {}, dark: {} }
    }
  };
  probe.track = 'd';
  try {
    expect(color(ctx, 'default', 'd', 'primitive.black.v1', 10)).toBe('#00000088');
  } finally {
    probe.track = '';
  }
});

// Fingerprints cover the precise destination paths and values in the reviewed inventory. A new
// preset starts with zero exceptions. Set KISKADEE_LIST_TONAL_DEBT=1 to inspect the
// sorted coordinates before reconciling a change with the documented source inventory.
const recordedDebt: Readonly<Record<string, string>> = {
  'carbon-ibm': 'ad0750ddf9483febf968fb40a72d500ee0e902d7554cfb0ff96bcbd53306b26a',
  'fluent-2-microsoft': 'ea3e6138ff8d44e57131729ede9842c71477bc02da32de8550b9f3304fbcc173',
  'ios-27-apple': 'f3f3b1246651976ae9215259804278fc29a27b3966f49951005b371e52ee003d',
  'material-3-google': 'fca2af23745bb0289ee64fc7455c2764bc4ca4b03fe878ef6440986b273fdbd4'
};

const presets = readdirSync(fileURLToPath(new URL('./', import.meta.url)), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

it.each(
  presets
)('%s keeps published palettes independent of opposite-track reads outside recorded debt', async (preset) => {
  async function load(track: string) {
    vi.resetModules();
    probe.track = track;
    const { schema } = await import(`./${preset}/index.ts`);
    return schema;
  }
  const baseline = await load('');
  const affected = new Set<string>();
  for (const source of ['l', 'd']) {
    const target = source === 'l' ? ['dark', 'darker'] : ['light'];
    const original = paletteLeaves(baseline, target);
    const altered = paletteLeaves(await load(source), target);
    for (const path of new Set([...original.keys(), ...altered.keys()])) {
      if (original.get(path) === altered.get(path)) continue;
      affected.add(`${source} -> ${path} = ${original.get(path) ?? '(absent)'}`);
    }
  }
  for (const dest of ['light', 'dark', 'darker']) {
    for (const [path, value] of paletteLeaves(baseline, [dest])) {
      const source = /^(?:fg|contour|sep):[^.]+\.[^.]+\.(light|dark|darker)\./.exec(value)?.[1];
      if (!source || (source === 'light') === (dest === 'light')) continue;
      affected.add(`${path} -> ${value}`);
    }
  }
  probe.track = '';
  const paths = [...affected].sort();
  const signature = paths.length ? createHash('sha256').update(paths.join('\n')).digest('hex') : '';
  if (process.env.KISKADEE_LIST_TONAL_DEBT === '1') console.info(preset, paths.join('\n'));
  expect(
    signature,
    `${preset}: ${paths.length} cross-track coordinates; inspect with KISKADEE_LIST_TONAL_DEBT=1 pnpm check:preset-colors`
  ).toBe(recordedDebt[preset] ?? '');
});
