import { createHash } from 'node:crypto';
import {
  BRAND_PACK_BUILD_CONTRACT,
  BRAND_PACK_BUILD_FORMAT_VERSION,
  type BrandPackBuildManifest
} from '@kiskadee/web-builder/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadBrandPack } from '../utils/brand-pack-loader.client';

const CLASS_MAP_JSON = `${JSON.stringify(
  {
    component: 'button',
    classMap: {
      e1: {
        c: {
          s: {
            'brand.google': {
              h: 'google-box'
            }
          }
        }
      }
    }
  },
  null,
  2
)}\n`;

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

function createManifest(classMapSha256 = sha256(CLASS_MAP_JSON)): BrandPackBuildManifest {
  return {
    kind: BRAND_PACK_BUILD_CONTRACT,
    formatVersion: BRAND_PACK_BUILD_FORMAT_VERSION,
    designSystem: 'fluent-2-microsoft',
    pack: 'auth',
    namespace: 'fm-brand-auth-test',
    brands: [
      {
        id: 'apple',
        intent: 'brand.apple',
        iconId: 'apple',
        contentPolarity: 'light',
        tonalIntegritySha256: '1'.repeat(64)
      },
      {
        id: 'google',
        intent: 'brand.google',
        iconId: 'google',
        contentPolarity: 'light',
        tonalIntegritySha256: '2'.repeat(64)
      },
      {
        id: 'microsoft',
        intent: 'brand.microsoft',
        iconId: 'microsoft',
        contentPolarity: 'dark',
        tonalIntegritySha256: '3'.repeat(64)
      }
    ],
    components: ['button'],
    palettes: {
      'default.light': {
        css: 'default.light.test.kiskadee.css',
        cssSha256: '4'.repeat(64),
        classMaps: {
          button: 'class-maps/default.light/button.test.kiskadee.json'
        },
        classMapSha256: {
          button: classMapSha256
        }
      }
    }
  };
}

function mockArtifacts(manifest: unknown, classMapJson = CLASS_MAP_JSON) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/manifest.json')) {
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
      if (url.includes('/class-maps/')) {
        return new Response(classMapJson, {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
      return new Response('Not found', { status: 404 });
    })
  );
}

const REQUEST = {
  designSystem: 'fluent-2-microsoft',
  pack: 'auth' as const,
  segment: 'default',
  theme: 'light' as const,
  components: ['button'] as const
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Showcase brand-pack loader', () => {
  it('validates the contract and class-map bytes before exposing resources', async () => {
    mockArtifacts(createManifest());

    await expect(loadBrandPack(REQUEST)).resolves.toMatchObject({
      cacheKey: 'fluent-2-microsoft|auth|default|light|button',
      stylesheetHref: '/build/fluent-2-microsoft/brand-packs/auth/default.light.test.kiskadee.css',
      stylesheetSha256: '4'.repeat(64),
      intents: ['brand.apple', 'brand.google', 'brand.microsoft']
    });
  });

  it('rejects a tampered class map', async () => {
    mockArtifacts(createManifest('f'.repeat(64)));

    await expect(loadBrandPack(REQUEST)).rejects.toThrow('class-map integrity');
  });

  it('rejects an unsupported manifest contract', async () => {
    mockArtifacts({
      ...createManifest(),
      formatVersion: 999
    });

    await expect(loadBrandPack(REQUEST)).rejects.toThrow('unsupported build contract');
  });
});
