import { type ChipIntent, primitive, type Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';
type ChipComponent = NonNullable<Schema<'purple'>['components']['chip']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';
type ChipEmphasis = 'high' | 'medium' | 'low' | 'lowest';
type SurfaceContext = 'onSubtle' | 'onVivid';
type ChipRole = `chip.${ChipIntent}`;

type CreateMaterial3GoogleChipSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

const INTENTS = ['neutral', 'primary'] as const satisfies readonly ChipIntent[];
const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const satisfies readonly ChipEmphasis[];

function createMap<TKey extends string, TValue>(
  keys: readonly TKey[],
  create: (key: TKey) => TValue
): Record<TKey, TValue> {
  return Object.fromEntries(keys.map((key) => [key, create(key)])) as Record<TKey, TValue>;
}

function createChipIntentSchema({
  c,
  segment,
  theme,
  intent,
  context,
  transparent
}: {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segment: Material3GoogleSegmentName;
  theme: ThemeName;
  intent: ChipIntent;
  context: SurfaceContext;
  transparent: string;
}) {
  const role = `chip.${intent}` as ChipRole;
  const themeShortcut: ThemeShortcut = theme === 'light' ? 'l' : 'd';
  const lightSurface = context === 'onVivid';
  const family = (reference: 'subtle' | 'vivid', offset = 0, alpha?: number) =>
    c.ref(segment, lightSurface ? 'l' : themeShortcut, role, reference, offset, alpha);
  const physical = (polarity: 'light' | 'dark', alpha?: number) =>
    c(segment, 'l', primitive('black', 'v1'), polarity === 'light' ? 0 : 100, alpha);

  const stateOffset = (state: 'hover' | 'focus' | 'pressed') => (state === 'pressed' ? 2 : 1);

  const familySurface = (kind: 'high' | 'medium', delta: number) => {
    if (kind === 'high') {
      if (context === 'onVivid') return family('subtle', -delta);
      // A dark neutral ramp already ends near the light endpoint. Moving it
      // toward the dark side keeps the state delta visible and in range.
      const signedDelta = theme === 'dark' && intent === 'neutral' ? -delta : delta;
      return family('vivid', signedDelta);
    }

    if (context === 'onVivid') return family('subtle', -delta);
    return family('subtle', theme === 'light' ? -delta : delta);
  };

  const foreground =
    context === 'onSubtle' && theme === 'dark' && intent !== 'neutral'
      ? family('vivid', 6)
      : family('vivid');
  const highForeground =
    context === 'onVivid'
      ? foreground
      : theme === 'dark' && intent === 'neutral'
        ? physical('dark')
        : physical('light');
  const disabledForeground =
    context === 'onVivid' || theme === 'dark' ? physical('light', 38) : physical('dark', 38);
  const disabledSurface =
    context === 'onVivid' || theme === 'dark' ? physical('light', 10) : physical('dark', 10);
  const disabledBorder =
    context === 'onVivid' || theme === 'dark' ? physical('light', 12) : physical('dark', 12);

  const surfaceStates = (emphasis: ChipEmphasis) => {
    const kind = emphasis === 'high' ? 'high' : emphasis === 'medium' ? 'medium' : undefined;
    const rest = kind === undefined ? transparent : familySurface(kind, 0);
    const transient = (state: 'hover' | 'focus' | 'pressed') =>
      kind === undefined
        ? family('vivid', 0, state === 'pressed' ? 12 : state === 'focus' ? 10 : 8)
        : familySurface(kind, stateOffset(state));

    return {
      rest,
      hover: transient('hover'),
      focus: transient('focus'),
      pressed: transient('pressed'),
      selected: {
        rest: familySurface('high', 1),
        hover: familySurface('high', 2),
        focus: familySurface('high', 2),
        pressed: familySurface('high', 3)
      },
      disabled: disabledSurface
    };
  };

  const borderStates = (emphasis: ChipEmphasis) => {
    const outlined = emphasis === 'low' || emphasis === 'lowest';
    const alpha = emphasis === 'low' ? 40 : 24;
    return {
      rest: outlined ? family('vivid', 0, alpha) : transparent,
      ...(outlined
        ? {
            hover: family('vivid', 0, emphasis === 'low' ? 55 : 40),
            focus: family('vivid', 0, emphasis === 'low' ? 50 : 35),
            pressed: family('vivid', 0, emphasis === 'low' ? 70 : 55),
            selected: { rest: transparent },
            disabled: disabledBorder
          }
        : {})
    };
  };

  const textStates = (emphasis: ChipEmphasis) => {
    const rest =
      context === 'onVivid' && (emphasis === 'low' || emphasis === 'lowest')
        ? physical('light')
        : emphasis === 'high'
          ? highForeground
          : foreground;
    const selected = highForeground;
    return {
      rest,
      ...(rest === selected ? {} : { selected: { rest: { ref: selected } } }),
      disabled: { ref: disabledForeground }
    };
  };

  return {
    box: createMap(EMPHASES, surfaceStates),
    border: createMap(EMPHASES, borderStates),
    text: createMap(EMPHASES, textStates)
  };
}

type ContentSurfaceContextValue = SurfaceContext | 'inherit';

function highContentSurfaceContext(
  theme: ThemeName,
  surface: SurfaceContext,
  intent: ChipIntent
): SurfaceContext {
  // High onVivid is authored from the Light-track subtle family, so its
  // children remain on a subtle surface even when the consumed context is
  // vivid. Dark neutral high uses the D95 endpoint for the same reason;
  // chromatic dark high remains a strong vivid surface. Medium always maps to
  // onSubtle below because it is authored as a filled subtle treatment.
  if (surface === 'onVivid' || (theme === 'dark' && intent === 'neutral')) {
    return 'onSubtle';
  }
  return 'onVivid';
}

function createContentSurfaceContext() {
  const themes = ['light', 'dark'] as const;
  const surfaces = ['onSubtle', 'onVivid'] as const;
  return Object.fromEntries(
    themes.map((themeName) => [
      themeName,
      Object.fromEntries(
        surfaces.map((surfaceName) => [
          surfaceName,
          Object.fromEntries(
            INTENTS.map((intentName) => {
              const high = highContentSurfaceContext(themeName, surfaceName, intentName);
              const disabled: ContentSurfaceContextValue = surfaceName;
              return [
                intentName,
                {
                  high: { rest: high, selected: high, disabled },
                  medium: { rest: 'onSubtle', selected: high, disabled },
                  low: { rest: 'inherit', selected: high, disabled },
                  lowest: { rest: 'inherit', selected: high, disabled }
                }
              ];
            })
          )
        ])
      )
    ])
  );
}

export function createMaterial3GoogleChipSchema({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleChipSchemaArgs): ChipComponent {
  const surfacePalette = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    context: SurfaceContext
  ) => ({
    boxColor: createMap(
      INTENTS,
      (intent) => createChipIntentSchema({ c, segment, theme, intent, context, transparent }).box
    ),
    borderColor: createMap(
      INTENTS,
      (intent) => createChipIntentSchema({ c, segment, theme, intent, context, transparent }).border
    )
  });

  const textPalette = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    context: SurfaceContext
  ) => ({
    textColor: createMap(
      INTENTS,
      (intent) => createChipIntentSchema({ c, segment, theme, intent, context, transparent }).text
    )
  });

  const surfacePalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: surfacePalette(segment, 'light', 'onSubtle'),
      onVivid: surfacePalette(segment, 'light', 'onVivid')
    },
    dark: {
      onSubtle: surfacePalette(segment, 'dark', 'onSubtle'),
      onVivid: surfacePalette(segment, 'dark', 'onVivid')
    }
  }));

  const textPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: textPalette(segment, 'light', 'onSubtle'),
      onVivid: textPalette(segment, 'light', 'onVivid')
    },
    dark: {
      onSubtle: textPalette(segment, 'dark', 'onSubtle'),
      onVivid: textPalette(segment, 'dark', 'onVivid')
    }
  }));

  return {
    contentSurfaceContext: buildBySegment(segmentNames, () => createContentSurfaceContext()),
    options: { density: { compact: 's:md:1', spacious: 's:lg:1' } },
    elements: {
      e1: { name: 'chip-container' },
      e2: {
        name: 'chip-primary-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: { 's:sm:1': 24, 's:md:1': 32, 's:lg:1': 40 },
          paddingTop: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingBottom: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingLeft: { 's:sm:1': 8, 's:md:1': 12, 's:lg:1': 16 },
          paddingRight: { 's:sm:1': 8, 's:md:1': 12, 's:lg:1': 16 },
          borderWidth: { 's:sm:1': 1, 's:md:1': 1, 's:lg:1': 1 },
          borderRadius: { rounded: 8, pill: 999 }
        },
        palettes: surfacePalettes
      },
      e3: {
        name: 'chip-label',
        typography: {
          's:sm:1': 'label-medium',
          's:md:1': 'label-large',
          's:lg:1': 'body-medium'
        },
        scales: {
          paddingLeft: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 4 },
          paddingRight: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 4 }
        },
        palettes: textPalettes
      },
      e4: {
        name: 'chip-icon',
        iconSize: { 's:sm:1': 's:sm:1', 's:md:1': 's:md:1', 's:lg:1': 's:lg:1' },
        scales: { marginRight: { 's:sm:1': 4, 's:md:1': 8, 's:lg:1': 8 } },
        palettes: textPalettes
      },
      e5: {
        name: 'chip-remove-control',
        decorations: { borderStyle: 'solid' },
        scales: {
          marginLeft: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingTop: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingRight: { 's:sm:1': 8, 's:md:1': 12, 's:lg:1': 16 },
          paddingBottom: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingLeft: { 's:sm:1': 4, 's:md:1': 8, 's:lg:1': 8 },
          borderWidth: { 's:sm:1': 1, 's:md:1': 1, 's:lg:1': 1 },
          borderRadius: { rounded: 8, pill: 999 }
        },
        palettes: surfacePalettes
      },
      e6: {
        name: 'chip-remove-icon',
        iconSize: { 's:sm:1': 's:sm:1', 's:md:1': 's:md:1', 's:lg:1': 's:lg:1' },
        palettes: textPalettes
      },
      e7: {
        name: 'chip-badge-relation',
        scales: { marginLeft: { 's:sm:1': 4, 's:md:1': 8, 's:lg:1': 8 } }
      }
    }
  };
}
