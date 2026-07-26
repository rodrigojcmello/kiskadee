import type { ManifestComponent } from '@kiskadee/web-builder/types';
import { describe, expect, it } from 'vitest';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from './manifest-surface-context.ts';

const component: ManifestComponent = {
  surfaceContexts: {
    'default.light': {
      onSubtle: {
        state: {
          primary: {
            high: { rest: true }
          }
        }
      },
      onVivid: {
        state: {
          primary: {
            high: { rest: true, hover: true }
          }
        }
      }
    },
    'default.dark': {
      onSubtle: {
        state: {
          neutral: {
            medium: { rest: true }
          }
        }
      }
    }
  }
};

describe('manifest surface-context helpers', () => {
  it('resolves state capabilities from the active palette and context', () => {
    expect(getManifestComponentState(component, 'default', 'light', 'onVivid')).toEqual({
      primary: {
        high: { rest: true, hover: true }
      }
    });
  });

  it('defaults capability reads to the onSubtle surface context', () => {
    expect(getManifestComponentState(component, 'default', 'dark')).toEqual({
      neutral: {
        medium: { rest: true }
      }
    });
  });

  it('reports context support per palette without fallback', () => {
    expect(supportsManifestSurfaceContext(component, 'default', 'light', 'onVivid')).toBe(true);
    expect(supportsManifestSurfaceContext(component, 'default', 'dark', 'onVivid')).toBe(false);
    expect(getManifestComponentState(component, 'default', 'dark', 'onVivid')).toBeUndefined();
  });
});
