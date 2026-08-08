import { describe, expect, it } from 'vitest';
import { resolveFloatingInputBlockOffset } from './floatingRestTypography.runtime.ts';

describe('resolveFloatingInputBlockOffset', () => {
  it('keeps the nominal input lane unchanged when the floating label does not overlap it', () => {
    expect(
      resolveFloatingInputBlockOffset({
        currentOffset: 0,
        inputLineBlockStart: 16,
        labelBlockEnd: 7,
        needsTextExpansion: false
      })
    ).toBe(0);
  });

  it('preserves nominal geometry even when authored line boxes intentionally touch', () => {
    expect(
      resolveFloatingInputBlockOffset({
        currentOffset: 0,
        inputLineBlockStart: 19,
        labelBlockEnd: 22,
        needsTextExpansion: false
      })
    ).toBe(0);
  });

  it('adds only the measured overlap to the current structural offset', () => {
    expect(
      resolveFloatingInputBlockOffset({
        currentOffset: 0,
        inputLineBlockStart: 8,
        labelBlockEnd: 21,
        needsTextExpansion: true
      })
    ).toBe(13);

    expect(
      resolveFloatingInputBlockOffset({
        currentOffset: 3,
        inputLineBlockStart: 20.5,
        labelBlockEnd: 22,
        needsTextExpansion: true
      })
    ).toBe(4.5);
  });

  it('removes obsolete offset when the available text lane grows again', () => {
    expect(
      resolveFloatingInputBlockOffset({
        currentOffset: 13,
        inputLineBlockStart: 28,
        labelBlockEnd: 15,
        needsTextExpansion: false
      })
    ).toBe(0);
  });
});
