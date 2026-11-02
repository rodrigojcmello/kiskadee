import { describe, expect, it } from 'vitest';
import { createStrictPresetColorResolver } from '../../utils/presetColor.ts';
import blueComplementary from './colors/b.blue.v1.c.ts';
import greenComplementary from './colors/g.green.v1.c.ts';
import indigoComplementary from './colors/pb.indigo.v2.c.ts';
import redComplementary from './colors/r.red.v1.c.ts';
import { referenceColor } from './fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from './fluent-2-microsoft.color-evidence.ts';
import {
  componentIntents,
  globalSemantics,
  globalSemanticsBySegment,
  schemaColors
} from './fluent-2-microsoft.colors.ts';

describe('Fluent complementary three-layer handoff', () => {
  const c = createStrictPresetColorResolver({
    colors: schemaColors,
    exactEvidence: fluent2MicrosoftColorEvidence
  });
  it('publishes explicit primary variant coverage per segment instead of falling back to v1', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(globalSemantics[theme].primary.v2).toBe('primitive.blue.v2');
      expect(globalSemanticsBySegment.teams.themes[theme].primary.v2).toBe('primitive.purple.v3');
      const track = theme === 'light' ? 'l' : 'd';
      for (const role of [
        'primary.v2',
        'button.primary.v2',
        'switch.primary.v2',
        'slider.primary.v2'
      ] as const) {
        expect(c.resolve('default', track, referenceColor(role, 'vivid'))).toBe(
          blueComplementary.scales[theme][blueComplementary.functionalReferences[theme].vivid]
        );
        expect(c.resolve('teams', track, referenceColor(role, 'vivid'))).toBe(
          indigoComplementary.scales[theme][indigoComplementary.functionalReferences[theme].vivid]
        );
      }
    }
  });
  it('retains semantic intents and exposes status complements without replacing original defaults', () => {
    expect(componentIntents.button.primary).toBe('primary');
    expect(componentIntents.switch.primary).toBe('primary');
    expect(componentIntents.slider.primary).toBe('primary');
    for (const segment of ['default', 'teams'] as const) {
      expect(c.resolve(segment, 'l', referenceColor('redLike.v2', 'vivid'))).toBe(
        redComplementary.scales.light[redComplementary.functionalReferences.light.vivid]
      );
      expect(c.resolve(segment, 'l', referenceColor('greenLike.v2', 'vivid'))).toBe(
        greenComplementary.scales.light[greenComplementary.functionalReferences.light.vivid]
      );
      expect(c.resolve(segment, 'l', referenceColor('primary.v1', 'vivid'))).not.toBe(
        c.resolve(segment, 'l', referenceColor('primary.v2', 'vivid'))
      );
    }
  });
});
