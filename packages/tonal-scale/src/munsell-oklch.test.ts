import { describe, expect, it } from 'vitest';

import {
  classifyMunsellHex,
  classifyMunsellHue,
  classifyMunsellOklch,
  getMunsellOklchSectorCenterPosition,
  getMunsellOklchSectorDefinition,
  MUNSELL_OKLCH_PRIMARY_CHROMA,
  MUNSELL_OKLCH_PROJECTION,
  MUNSELL_OKLCH_RED_YELLOW_RED_BOUNDARY_HUE,
  MUNSELL_OKLCH_SAFE_CORE,
  MUNSELL_OKLCH_SECTOR_CENTERS,
  MUNSELL_OKLCH_SECTOR_DEFINITIONS,
  MUNSELL_OKLCH_SECTOR_ORDER,
  MUNSELL_OKLCH_SIGNATURE_TRANSFER,
  MUNSELL_YELLOW_RED_PROTOTYPES,
  projectMunsellHue,
  suggestYellowRedAppearance
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
      red: 24,
      'yellow-red': 60,
      yellow: 90,
      'green-yellow': 116,
      green: 145,
      'blue-green': 198,
      blue: 250,
      'purple-blue': 276,
      purple: 322,
      'red-purple': 351
    });
    expect(MUNSELL_OKLCH_SAFE_CORE).toEqual({ start: 0.15, end: 0.85 });
    expect(MUNSELL_OKLCH_SIGNATURE_TRANSFER).toBe(0.4);
    expect(MUNSELL_OKLCH_PRIMARY_CHROMA).toEqual({
      minimum: 0.005,
      lowConfidenceCeiling: 0.02
    });
  });

  it('derives contiguous boundaries, including the calibrated red/yellow-red split and circular wrap', () => {
    expect(MUNSELL_OKLCH_SECTOR_DEFINITIONS).toHaveLength(10);

    for (const [index, definition] of MUNSELL_OKLCH_SECTOR_DEFINITIONS.entries()) {
      const next =
        MUNSELL_OKLCH_SECTOR_DEFINITIONS[(index + 1) % MUNSELL_OKLCH_SECTOR_DEFINITIONS.length];

      expect(definition.endHue).toBeCloseTo(next.startHue, 10);
      expect(classifyMunsellHue(definition.startHue).sector).toBe(definition.sector);
      expect(classifyMunsellHue(definition.endHue).sector).toBe(next.sector);
    }

    expect(getMunsellOklchSectorDefinition('red')).toMatchObject({
      startHue: 7.5,
      endHue: MUNSELL_OKLCH_RED_YELLOW_RED_BOUNDARY_HUE,
      spanDegrees: 26.5
    });
    expect(getMunsellOklchSectorDefinition('red-purple')).toMatchObject({
      startHue: 336.5,
      endHue: 7.5,
      spanDegrees: 31
    });
    expect(classifyMunsellHue(0).sector).toBe('red-purple');
    expect(classifyMunsellHue(360).sector).toBe('red-purple');
  });

  it('keeps red-biased Orange on the yellow-red side of the calibrated boundary', () => {
    expect(classifyMunsellHue(MUNSELL_OKLCH_RED_YELLOW_RED_BOUNDARY_HUE - 1e-9).sector).toBe('red');
    expect(classifyMunsellHue(MUNSELL_OKLCH_RED_YELLOW_RED_BOUNDARY_HUE).sector).toBe('yellow-red');
    expect(classifyMunsellHex('#f4511e').sector).toBe('yellow-red');
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

  it('projects a bounded center-relative signature instead of copying asymmetric positions', () => {
    const red = getMunsellOklchSectorDefinition('red');
    const blue = getMunsellOklchSectorDefinition('blue');
    const boundarySourceHue = red.startHue + red.spanDegrees * 0.05;
    const bounded = projectMunsellHue(boundarySourceHue, 'blue');
    const centered = projectMunsellHue(MUNSELL_OKLCH_SECTOR_CENTERS.red, 'blue');

    expect(bounded.source.positionInSector).toBeCloseTo(0.05, 10);
    expect(bounded.projectedPosition).toBeGreaterThan(MUNSELL_OKLCH_SAFE_CORE.start);
    expect(bounded.projectedPosition).toBeLessThan(getMunsellOklchSectorCenterPosition('blue'));
    expect(bounded.projectedHue).toBeCloseTo(bounded.rawTargetHue, 10);
    expect(bounded.clampedToSafeCore).toBe(false);

    expect(centered.projectedPosition).toBeCloseTo(getMunsellOklchSectorCenterPosition('blue'), 10);
    expect(centered.projectedHue).toBeCloseTo(blue.centerHue, 10);
    expect(centered.rawTargetHue).toBeCloseTo(blue.centerHue, 10);
    expect(centered.clampedToSafeCore).toBe(false);
  });

  it('maps every approved sector center to every other approved center', () => {
    for (const sourceSector of MUNSELL_OKLCH_SECTOR_ORDER) {
      for (const targetSector of MUNSELL_OKLCH_SECTOR_ORDER) {
        const projection = projectMunsellHue(
          MUNSELL_OKLCH_SECTOR_CENTERS[sourceSector],
          targetSector
        );

        expect(projection.projectedHue).toBeCloseTo(MUNSELL_OKLCH_SECTOR_CENTERS[targetSector], 10);
        expect(projection.projectedPosition).toBeCloseTo(
          getMunsellOklchSectorCenterPosition(targetSector),
          10
        );
      }
    }
  });

  it('keeps Orange and Brown as deterministic yellow-red appearance prototypes', () => {
    expect(MUNSELL_YELLOW_RED_PROTOTYPES).toEqual({
      orange: { hex: '#ca5010' },
      brown: { hex: '#8e562e' }
    });
    expect(suggestYellowRedAppearance('#ca5010')).toMatchObject({
      appearance: 'orange',
      distances: { orange: 0 }
    });
    expect(suggestYellowRedAppearance('#8e562e')).toMatchObject({
      inputSector: 'yellow-red',
      appearance: 'brown',
      distances: { brown: 0 }
    });
    expect(suggestYellowRedAppearance('#ff9800')).toMatchObject({
      inputSector: 'yellow-red',
      appearance: 'orange'
    });
  });
});
