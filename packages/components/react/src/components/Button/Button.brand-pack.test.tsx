/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { createElement as h } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BrandPackBoundary,
  createBrandPackResourceKey,
  type LoadedBrandPackResources
} from '../../shared/contexts/BrandPackContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';

const baseButtonClassMap = {
  e1: {
    d: 'button-structure',
    c: {
      s: {
        neutral: {
          h: 'neutral-box'
        }
      },
      v: {
        neutral: {
          h: 'neutral-box-on-vivid'
        }
      }
    }
  },
  e2: {
    c: {
      s: {
        neutral: {
          h: 'neutral-label'
        }
      }
    }
  }
};

const brandButtonClassMap = {
  e1: {
    c: {
      s: {
        'brand.google': {
          h: 'google-box-high',
          m: 'google-box-medium',
          l: 'google-box-low',
          ll: 'google-box-lowest'
        }
      },
      v: {
        'brand.google': {
          h: 'google-box-on-vivid-high',
          m: 'google-box-on-vivid-medium',
          l: 'google-box-on-vivid-low',
          ll: 'google-box-on-vivid-lowest'
        }
      }
    }
  },
  e2: {
    c: {
      s: {
        'brand.google': {
          h: 'google-label-high',
          m: 'google-label-medium',
          l: 'google-label-low',
          ll: 'google-label-lowest'
        }
      }
    }
  }
};

function createContextValue(
  preloadedBrandPacks?: Readonly<Record<string, LoadedBrandPackResources>>
): KiskadeeContextValue {
  return {
    classesMap: {
      button: baseButtonClassMap
    },
    segment: 'default',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'button-brand-test',
    setDesignSystem: () => {},
    preloadedBrandPacks
  };
}

function createPreloadedResources(): LoadedBrandPackResources {
  const request = {
    designSystem: 'button-brand-test',
    pack: 'auth' as const,
    segment: 'default',
    theme: 'light' as const,
    components: ['button'] as const
  };

  return {
    ...request,
    cacheKey: createBrandPackResourceKey(request),
    stylesheetHref: '/brand-packs/auth/button-test.css',
    stylesheetSha256: '0'.repeat(64),
    classMaps: {
      button: {
        component: 'button',
        classMap: brandButtonClassMap
      }
    },
    intents: ['brand.google']
  };
}

afterEach(() => {
  cleanup();
  for (const link of document.querySelectorAll('link[data-test-brand-pack]')) {
    link.remove();
  }
  vi.restoreAllMocks();
});

describe('Button brand intents', () => {
  it('reports a missing boundary and never falls back to a system intent', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      h(
        KiskadeeContext.Provider,
        { value: createContextValue() },
        h(Button, {
          label: 'Continue with Google',
          intent: 'brand.google',
          emphasis: 'high'
        })
      )
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('button-structure');
    expect(button.className).not.toContain('neutral-box');
    expect(button.className).not.toContain('google-box');
    expect(consoleError).toHaveBeenCalledWith(
      '[Kiskadee] Button intent="brand.google" requires a compatible BrandPackBoundary. No brand color classes were applied.'
    );
  });

  it('merges a compatible pack without replacing the system intents', () => {
    const resources = createPreloadedResources();
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = resources.stylesheetHref;
    stylesheet.dataset.kLoaded = 'true';
    stylesheet.dataset.testBrandPack = 'true';
    document.head.appendChild(stylesheet);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      h(
        KiskadeeContext.Provider,
        {
          value: createContextValue({
            [resources.cacheKey]: resources
          })
        },
        h(
          BrandPackBoundary,
          { pack: 'auth', components: ['button'] },
          h(
            'div',
            null,
            h(Button, {
              label: 'Neutral',
              intent: 'neutral',
              emphasis: 'high'
            }),
            ...(['high', 'medium', 'low', 'lowest'] as const).map((emphasis) =>
              h(Button, {
                key: emphasis,
                label: `Google ${emphasis}`,
                intent: 'brand.google',
                emphasis
              })
            )
          )
        )
      )
    );

    expect(screen.getByRole('button', { name: 'Neutral' }).className).toContain('neutral-box');
    for (const emphasis of ['high', 'medium', 'low', 'lowest'] as const) {
      expect(screen.getByRole('button', { name: `Google ${emphasis}` }).className).toContain(
        `google-box-${emphasis}`
      );
    }
    expect(consoleError).not.toHaveBeenCalled();
  });
});
