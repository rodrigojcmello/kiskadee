import { describe, expect, it } from 'vitest';

import {
  classifyMunsellHex,
  classifyMunsellHue,
  classifyMunsellOklch,
  getMunsellOklchSectorDefinition,
  MUNSELL_OKLCH_PRIMARY_CHROMA,
  MUNSELL_OKLCH_PROJECTION,
  MUNSELL_OKLCH_SAFE_CORE,
  MUNSELL_OKLCH_SECTOR_CENTERS,
  MUNSELL_OKLCH_SECTOR_DEFINITIONS,
  MUNSELL_OKLCH_SECTOR_ORDER,
  MUNSELL_YELLOW_RED_PROTOTYPES,
  projectMunsellHue,
  suggestYellowRedVariant
} from './munsell-oklch';

describe('Munsell OKLCH projection', () => {
  it('freezes the ten approved sector centers and projection identity', () => {
    expect(MUNSELL_OKLCH_PROJECTION).toBe('munsell-oklch-v1');
    expect(MUNSELL_OKLCH_SECTOR_ORDER).toEqual([
      'red',
      'yellow-red',
      'yellow',
      'green-yellow',
      'green',
      'blue-green',
      'blue',
      'purple-blue',
      'purple',
      'red-purple'
    ]);
    expect(MUNSELL_OKLCH_SECTOR_CENTERS).toEqual({
      red: 30,
      'yellow-red': 65,
      yellow: 103,
      'green-yellow': 116,
      green: 145,
      'blue-green': 198,
      blue: 250,
      'purple-blue': 272,
      purple: 322,
      'red-purple': 351
    });
    expect(MUNSELL_OKLCH_SAFE_CORE).toEqual({ start: 0.15, end: 0.85 });
    expect(MUNSELL_OKLCH_PRIMARY_CHROMA).toEqual({
      minimum: 0.005,
      lowConfidenceCeiling: 0.02
    });
  });

  it('derives contiguous midpoint boundaries, including the circular wrap', () => {
    expect(MUNSELL_OKLCH_SECTOR_DEFINITIONS).toHaveLength(10);

    for (const [index, definition] of MUNSELL_OKLCH_SECTOR_DEFINITIONS.entries()) {
      const next =
        MUNSELL_OKLCH_SECTOR_DEFINITIONS[(index + 1) % MUNSELL_OKLCH_SECTOR_DEFINITIONS.length];

      expect(definition.endHue).toBeCloseTo(next.startHue, 10);
      expect(classifyMunsellHue(definition.startHue).sector).toBe(definition.sector);
      expect(classifyMunsellHue(definition.endHue).sector).toBe(next.sector);
    }

    expect(getMunsellOklchSectorDefinition('red')).toMatchObject({
      startHue: 10.5,
      endHue: 47.5,
      spanDegrees: 37
    });
    expect(getMunsellOklchSectorDefinition('red-purple')).toMatchObject({
      startHue: 336.5,
      endHue: 10.5,
      spanDegrees: 34
    });
    expect(classifyMunsellHue(0).sector).toBe('red-purple');
    expect(classifyMunsellHue(360).sector).toBe('red-purple');
  });

  it('classifies every approved center in its own sector', () => {
    for (const sector of MUNSELL_OKLCH_SECTOR_ORDER) {
      const classification = classifyMunsellHue(MUNSELL_OKLCH_SECTOR_CENTERS[sector]);

      expect(classification.sector).toBe(sector);
      expect(classification.isInSafeCore).toBe(true);
      expect(classification.boundarySide).toBeNull();
      expect(classification.nearestSafeHue).toBeCloseTo(MUNSELL_OKLCH_SECTOR_CENTERS[sector], 10);
    }
  });

  it('marks the outer 15% as boundary regions and exposes the nearest safe hue', () => {
    const red = getMunsellOklchSectorDefinition('red');
    const nearStart = classifyMunsellHue(red.startHue + red.spanDegrees * 0.1);
    const nearEnd = classifyMunsellHue(red.startHue + red.spanDegrees * 0.9);
    const safeStart = classifyMunsellHue(red.safeStartHue);
    const safeEnd = classifyMunsellHue(red.safeEndHue);

    expect(nearStart).toMatchObject({
      sector: 'red',
      isInSafeCore: false,
      boundarySide: 'start'
    });
    expect(nearStart.nearestSafeHue).toBeCloseTo(red.safeStartHue, 10);
    expect(nearEnd).toMatchObject({
      sector: 'red',
      isInSafeCore: false,
      boundarySide: 'end'
    });
    expect(nearEnd.nearestSafeHue).toBeCloseTo(red.safeEndHue, 10);
    expect(safeStart.isInSafeCore).toBe(true);
    expect(safeEnd.isInSafeCore).toBe(true);
  });

  it('reports primary chroma errors, low confidence, and boundary review independently', () => {
    const unreliable = classifyMunsellOklch({ l: 50, c: 0.0049, h: 30 });
    const lowConfidence = classifyMunsellOklch({ l: 50, c: 0.005, h: 30 });
    const boundary = classifyMunsellOklch({ l: 50, c: 0.1, h: 11 });
    const confident = classifyMunsellOklch({ l: 50, c: 0.02, h: 30 });

    expect(unreliable.validForPrimary).toBe(false);
    expect(unreliable.diagnostics).toEqual([
      expect.objectContaining({
        severity: 'error',
        code: 'MUNSELL_PRIMARY_CHROMA_UNRELIABLE'
      })
    ]);
    expect(lowConfidence.validForPrimary).toBe(true);
    expect(lowConfidence.diagnostics).toEqual([
      expect.objectContaining({
        severity: 'review',
        code: 'MUNSELL_PRIMARY_CHROMA_LOW_CONFIDENCE'
      })
    ]);
    expect(boundary.validForPrimary).toBe(true);
    expect(boundary.diagnostics).toEqual([
      expect.objectContaining({ severity: 'review', code: 'MUNSELL_HUE_NEAR_BOUNDARY' })
    ]);
    expect(confident.diagnostics).toEqual([]);
  });

  it('normalizes valid hex input and rejects invalid color input explicitly', () => {
    const twitterBlue = classifyMunsellHex(' #1DA1F2 ');

    expect(twitterBlue.hex).toBe('#1da1f2');
    expect(twitterBlue.sector).toBe('blue');
    expect(twitterBlue.validForPrimary).toBe(true);
    expect(() => classifyMunsellHex('twitter-blue')).toThrow('Invalid sRGB hex color');
    expect(() => classifyMunsellOklch({ l: 101, c: 0.1, h: 30 })).toThrow(
      'OKLCH color must use finite L 0-100'
    );
  });

  it('projects relative sector position and clamps generated hues to the safe core', () => {
    const red = getMunsellOklchSectorDefinition('red');
    const blue = getMunsellOklchSectorDefinition('blue');
    const boundarySourceHue = red.startHue + red.spanDegrees * 0.05;
    const clamped = projectMunsellHue(boundarySourceHue, 'blue');
    const safe = projectMunsellHue(MUNSELL_OKLCH_SECTOR_CENTERS.red, 'blue');

    expect(clamped.source.positionInSector).toBeCloseTo(0.05, 10);
    expect(clamped.rawTargetHue).toBeCloseTo(blue.startHue + blue.spanDegrees * 0.05, 10);
    expect(clamped.projectedPosition).toBe(0.15);
    expect(clamped.projectedHue).toBeCloseTo(blue.safeStartHue, 10);
    expect(clamped.clampedToSafeCore).toBe(true);

    expect(safe.projectedPosition).toBeCloseTo(safe.source.positionInSector, 10);
    expect(safe.projectedHue).toBeCloseTo(safe.rawTargetHue, 10);
    expect(safe.clampedToSafeCore).toBe(false);
  });

  it('keeps Orange and Brown as deterministic yellow-red variant prototypes', () => {
    expect(MUNSELL_YELLOW_RED_PROTOTYPES).toEqual({
      v1: { appearance: 'orange', hex: '#ca5010' },
      v2: { appearance: 'brown', hex: '#8e562e' }
    });
    expect(suggestYellowRedVariant('#ca5010')).toMatchObject({
      variant: 'v1',
      appearance: 'orange',
      distances: { v1: 0 }
    });
    expect(suggestYellowRedVariant('#8e562e')).toMatchObject({
      inputSector: 'yellow-red',
      variant: 'v2',
      appearance: 'brown',
      distances: { v2: 0 }
    });
    expect(suggestYellowRedVariant('#ff9800')).toMatchObject({
      inputSector: 'yellow-red',
      variant: 'v1',
      appearance: 'orange'
    });
  });
});
