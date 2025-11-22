import { schema as ios26Kiskadee } from '@kiskadee/presets/src/presets/ios-26-kiskadee/ios-26-kiskadee.schema';
import { describe, expect, it } from 'vitest';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap';

/**
 * This regression test encodes the expected behavior for control-state "selected":
 * - Selected palette classes must remain scoped by semantic (primary/neutral/redLike) and tone (soft/solid).
 * - They should not be aggregated into a single global bucket that loses semantic context.
 *
 * Current behavior (bug):
 * - Phase 5 moves selected palette classes into the core `cs` field, unioning classes from all semantics.
 * - As a result, components enabling `selected` end up with selected classes for every semantic,
 *   and the last one wins by CSS order (e.g., redLike), which matches the UI bug.
 *
 * This test asserts the desired API: palettes keep selected classes under the semantic/tone bucket.
 * It will fail with the current implementation, reproducing the issue in a controlled way.
 */

describe('Selected control-state should be semantic- and tone-scoped in palettes', () => {
  it('keeps primary.soft selected classes under palettes["ios.light"].button.e1.c.primary.f', () => {
    const { styleKeys, toneMetadata } = convertElementSchemaToStyleKeys(ios26Kiskadee);

    // Build the rest of the pipeline to get class name mappings
    const usage = mapStyleKeyUsage(styleKeys);
    const shortenMap = shortenCssClassNames(usage);
    const { palettes: classNamesPalettes } = generateClassNamesMapSplit(
      styleKeys,
      shortenMap,
      toneMetadata
    );

    // Collect the expected selected style keys for primary.soft.selected:rest
    const selectedPrimarySoftRest =
      // @ts-expect-error
      styleKeys.button?.e1?.palettes?.ios?.light?.primary?.['selected:rest'];

    expect(Array.isArray(selectedPrimarySoftRest) && selectedPrimarySoftRest.length > 0).toBe(true);

    // Map to shortened class names
    // @ts-expect-error
    const expectedSelectedClasses = (selectedPrimarySoftRest ?? []).map((k) => shortenMap[k] ?? k);

    // Where we expect them to live: palettes under ios.light, button.e1, color map c.primary.f
    const iosLight = classNamesPalettes['ios.light'];
    expect(iosLight).toBeTruthy();

    const buttonEl = iosLight?.button?.e1;
    expect(buttonEl).toBeTruthy();

    // @ts-expect-error
    const primaryColorClasses = buttonEl?.c?.primary;
    expect(primaryColorClasses).toBeTruthy();

    const primarySoftClasses: string | undefined = primaryColorClasses?.f;

    // EXPECTED (correct behavior): selected classes for primary.soft must be present under c.primary.f
    // FAILS TODAY: selected classes are removed from palettes and placed into core.cs instead.
    for (const cls of expectedSelectedClasses) {
      expect(primarySoftClasses?.split(' ') ?? []).toContain(cls);
    }
  });
});
