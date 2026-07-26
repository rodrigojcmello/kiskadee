import { describe, expect, it } from 'vitest';
import {
  type ButtonStressTestBackgroundAvailability,
  getAvailableButtonStressTestBackgrounds,
  getPreferredButtonStressTestBackground,
  resolveBackgroundSurfaceContext
} from './button-stress-test-backgrounds';

type TestTone = ButtonStressTestBackgroundAvailability & {
  key: string;
};

const tones: TestTone[] = [
  {
    key: 'light',
    availableThemes: ['light'],
    row: 'light',
    surfaceContexts: ['onSubtle']
  },
  {
    key: 'vivid',
    availableThemes: ['light', 'dark', 'darker'],
    row: 'vivid',
    surfaceContexts: ['onSubtle', 'onVivid']
  },
  {
    key: 'dark',
    availableThemes: ['dark', 'darker'],
    row: 'dark',
    surfaceContexts: ['onSubtle', 'onVivid']
  }
];

describe('Button stress-test background availability', () => {
  it('shows light and vivid rows throughout the Light theme', () => {
    expect(getAvailableButtonStressTestBackgrounds(tones, 'light').map((tone) => tone.key)).toEqual(
      ['light', 'vivid']
    );
  });

  it('replaces the light row with the dark row in Dark and Darker themes', () => {
    expect(getAvailableButtonStressTestBackgrounds(tones, 'dark').map((tone) => tone.key)).toEqual([
      'vivid',
      'dark'
    ]);
    expect(
      getAvailableButtonStressTestBackgrounds(tones, 'darker').map((tone) => tone.key)
    ).toEqual(['vivid', 'dark']);
  });

  it('resolves the first theme-visible tone compatible with a manually selected context', () => {
    expect(getPreferredButtonStressTestBackground(tones, 'light', 'onSubtle')?.key).toBe('light');
    expect(getPreferredButtonStressTestBackground(tones, 'light', 'onVivid')?.key).toBe('vivid');
    expect(getPreferredButtonStressTestBackground(tones, 'dark', 'onSubtle')?.key).toBe('vivid');
  });
});

describe('Button background surface-context resolution', () => {
  it('selects onSubtle for light stress-test backgrounds', () => {
    expect(resolveBackgroundSurfaceContext('light')).toBe('onSubtle');
  });

  it('selects onVivid for vivid and dark stress-test backgrounds', () => {
    expect(resolveBackgroundSurfaceContext('vivid')).toBe('onVivid');
    expect(resolveBackgroundSurfaceContext('dark')).toBe('onVivid');
  });
});
