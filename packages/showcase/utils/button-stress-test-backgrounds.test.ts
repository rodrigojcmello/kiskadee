import { describe, expect, it } from 'vitest';
import {
  type ButtonStressTestBackgroundAvailability,
  getAvailableButtonStressTestBackgrounds
} from './button-stress-test-backgrounds';

type TestTone = ButtonStressTestBackgroundAvailability & {
  key: string;
};

const tones: TestTone[] = [
  {
    key: 'light',
    availableThemes: ['light'],
    row: 'light',
    surfaceContexts: ['default']
  },
  {
    key: 'vivid',
    availableThemes: ['light', 'dark', 'darker'],
    row: 'vivid',
    surfaceContexts: ['default', 'inverse']
  },
  {
    key: 'dark',
    availableThemes: ['dark', 'darker'],
    row: 'dark',
    surfaceContexts: ['default', 'inverse']
  }
];

describe('Button stress-test background availability', () => {
  it('shows light and vivid rows for the Light default context', () => {
    expect(
      getAvailableButtonStressTestBackgrounds(tones, 'light', 'default').map((tone) => tone.key)
    ).toEqual(['light', 'vivid']);
  });

  it('shows only the vivid row for the Light inverse context', () => {
    expect(
      getAvailableButtonStressTestBackgrounds(tones, 'light', 'inverse').map((tone) => tone.key)
    ).toEqual(['vivid']);
  });

  it('replaces the light row with the dark row in Dark and Darker themes', () => {
    expect(
      getAvailableButtonStressTestBackgrounds(tones, 'dark', 'default').map((tone) => tone.key)
    ).toEqual(['vivid', 'dark']);
    expect(
      getAvailableButtonStressTestBackgrounds(tones, 'darker', 'inverse').map((tone) => tone.key)
    ).toEqual(['vivid', 'dark']);
  });
});
