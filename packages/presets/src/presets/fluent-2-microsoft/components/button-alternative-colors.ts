import {
  type ColorProperty,
  fg,
  type InteractionStateColorMap,
  interactionStateKeys,
  type Schema,
  type SystemButtonIntent
} from '@kiskadee/core';
import {
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';
import {
  composeOpaqueSurface,
  FLUENT_BUTTON_ON_VIVID_RECIPE,
  FLUENT_BUTTON_PENDING_VISIBILITY,
  type FluentButtonFormulaTheme,
  omitFluentButtonPendingTextState
} from './button-color-formula.ts';

type Button = NonNullable<Schema<never>['components']['button']>;
type Emphasis = 'high' | 'medium' | 'low' | 'lowest';
type IntentPaint = Partial<
  Record<SystemButtonIntent, Partial<Record<Emphasis, InteractionStateColorMap>>>
>;
type Paint = Partial<Record<ColorProperty, IntentPaint>>;
type HighForegroundCoordinate =
  `${string}.standard.${FluentButtonFormulaTheme}.${'onSubtle' | 'onVivid'}.${'' | 'alternative.'}high`;

const themes = ['light', 'dark', 'darker'] as const;
const LOW_BOTTOM_ALPHA = { light: 70, dark: 90, darker: 90 } as const;
const intents = ['primary', 'neutral', 'destructive', 'positive'] as const;

const complementaryRoles = {
  primary: 'button.primary.v2',
  positive: 'button.positive.v2',
  destructive: 'button.destructive.v2'
} as const;

const foregroundFamilies = { primary: 'blue', positive: 'green', destructive: 'red' } as const;

function sameRecipe(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
  const a = left as Record<string, unknown>;
  const b = right as Record<string, unknown>;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && sameRecipe(a[key], b[key]))
  );
}

/** Preserve complete changed state maps while leaving unchanged recipes to Standard inheritance. */
function changedStateMaps<T>(standard: T, alternative: T): T | undefined {
  if (sameRecipe(standard, alternative)) return undefined;
  if (
    !alternative ||
    typeof alternative !== 'object' ||
    Object.keys(alternative).some((key) => interactionStateKeys.includes(key as never))
  )
    return alternative;
  const base = standard as Record<string, unknown> | undefined;
  return Object.fromEntries(
    Object.entries(alternative).flatMap(([key, value]) => {
      const changed = changedStateMaps(base?.[key], value);
      return changed === undefined ? [] : [[key, changed]];
    })
  ) as T;
}

function standardPaint(
  button: Button,
  element: 'e1' | 'e2' | 'e3' | 'e6',
  theme: FluentButtonFormulaTheme
): Paint {
  return button.elements[element]!.palettes!.default![theme]!.onVivid!.standard as Paint;
}

/** Preset-owned optional paint; standard recipes remain the immutable compatibility baseline. */
export function createFluentButtonAlternativeColors(
  button: Button,
  c: Fluent2MicrosoftColorResolver
) {
  const canonicalLight = c.resolve(
    'default',
    'l',
    exactColor('card.primary', 55, 'component.card')
  );
  const result = structuredClone(button);

  for (const theme of themes) {
    const standardRoot = standardPaint(button, 'e1', theme);
    const standardLabel = standardPaint(button, 'e2', theme);
    const rootPaint: Paint = {};
    const labelPaint: Paint = { textColor: {} };
    const standardContexts = button.contentSurfaceContext!.default![theme]!.onVivid!.standard;
    const context = structuredClone(standardContexts);

    for (const intent of intents) {
      if (intent === 'neutral') continue;
      for (const [property, intentPaint] of Object.entries(standardRoot) as [
        ColorProperty,
        IntentPaint
      ][]) {
        if (intentPaint[intent]) {
          const propertyPaint = rootPaint[property] ?? {};
          propertyPaint[intent] = structuredClone(intentPaint[intent]);
          rootPaint[property] = propertyPaint;
        }
      }
      labelPaint.textColor![intent] = structuredClone(standardLabel.textColor![intent]);

      const role = complementaryRoles[intent];
      const resolve = (reference: 'subtle' | 'vivid', offset = 0, alpha?: number) =>
        c.resolve('default', 'l', referenceColor(role, reference, offset, alpha));
      const complementary = resolve('vivid');
      const light = theme === 'light';
      const hoverAlpha = light
        ? FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightSurfaceAlpha.hover
        : FLUENT_BUTTON_ON_VIVID_RECIPE.low.hoverAlpha;
      const pressedAlpha = light
        ? FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightSurfaceAlpha.pressed
        : FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha;
      const lowHover = resolve('vivid', 0, hoverAlpha);
      const lowPressed = resolve('vivid', 0, pressedAlpha);
      const base = standardRoot.boxColor![intent]!;

      rootPaint.boxColor![intent] = {
        high: {
          ...base.high!,
          rest: complementary,
          hover: resolve('vivid', 1),
          pressed: resolve('vivid', 3),
          pending: resolve('vivid', 0, FLUENT_BUTTON_PENDING_VISIBILITY.surface),
          selected: { rest: resolve('vivid', 3), hover: resolve('vivid', 3) }
        },
        medium: base.medium!,
        low: {
          ...base.low!,
          hover: light ? composeOpaqueSurface(lowHover, canonicalLight) : lowHover,
          pressed: light ? composeOpaqueSurface(lowPressed, canonicalLight) : lowPressed,
          selected: {
            rest: light ? composeOpaqueSurface(lowPressed, canonicalLight) : lowPressed,
            hover: light ? composeOpaqueSurface(lowPressed, canonicalLight) : lowPressed
          }
        },
        lowest: {
          ...base.lowest!,
          hover: lowHover,
          pressed: lowPressed,
          selected: { rest: lowPressed, hover: lowPressed }
        }
      };
      const borderAlpha = FLUENT_BUTTON_ON_VIVID_RECIPE.low.borderAlpha[theme];
      const lowBorder = resolve('vivid', 0, borderAlpha);
      rootPaint.borderColor![intent]!.low = {
        rest: lowBorder,
        pending: resolve('vivid', 0, (borderAlpha * FLUENT_BUTTON_PENDING_VISIBILITY.border) / 100),
        disabled: rootPaint.borderColor![intent]!.low!.disabled,
        ...(light
          ? {
              pressed: resolve('vivid', 0, 7),
              selected: { rest: resolve('vivid', 0, 7), hover: resolve('vivid', 0, 7) }
            }
          : {})
      };
      const bottomAlpha = LOW_BOTTOM_ALPHA[theme];
      const bottom = resolve('vivid', 0, bottomAlpha);
      rootPaint.borderBottomColor![intent]!.low = {
        rest: bottom,
        // Explicit side resets retain the stronger bottom above the active borderColor shorthand.
        hover: bottom,
        pressed: bottom,
        selected: { rest: bottom, hover: bottom },
        pending: resolve('vivid', 0, (bottomAlpha * FLUENT_BUTTON_PENDING_VISIBILITY.border) / 100),
        disabled: rootPaint.borderColor![intent]!.low!.disabled
      };

      const disabled = standardLabel.textColor![intent]!.high!.disabled;
      const foreground = (coordinate: HighForegroundCoordinate): InteractionStateColorMap => ({
        rest: fg(coordinate),
        pending: fg.parentState(`${coordinate}.pending`),
        disabled
      });
      const family = foregroundFamilies[intent];
      const lowestStates = foreground(`${family}.standard.${theme}.onVivid.alternative.high`);
      labelPaint.textColor![intent] = {
        high: foreground('neutral.standard.light.onSubtle.high'),
        medium: { ...standardLabel.textColor![intent]!.medium!, rest: lowestStates.rest },
        low: { ...standardLabel.textColor![intent]!.low!, rest: lowestStates.rest },
        lowest: lowestStates
      };
      context[intent]!.high = { rest: 'onSubtle', pending: 'onSubtle', disabled: 'onSubtle' };
    }

    // Reuse Light's dark Neutral High interaction recipe while retaining onVivid terminals.
    const neutralSurface =
      button.elements.e1!.palettes!.default!.light!.onSubtle.standard.boxColor!.neutral!.high!;
    const neutralStandardSurface = standardRoot.boxColor!.neutral!.high!;
    rootPaint.boxColor!.neutral = {
      high: {
        ...neutralSurface,
        pending: neutralStandardSurface.pending,
        disabled: neutralStandardSurface.disabled,
        selected: { ...neutralSurface.selected, hover: neutralSurface.selected!.rest }
      }
    };
    const neutralLabel =
      button.elements.e2!.palettes!.default!.light!.onSubtle.standard.textColor!.neutral!.high!;
    const neutralStandardLabel = standardLabel.textColor!.neutral!.high!;
    labelPaint.textColor!.neutral = {
      high: {
        ...neutralLabel,
        pending: neutralStandardLabel.pending,
        disabled: neutralStandardLabel.disabled
      }
    };
    context.neutral!.high = { rest: 'onVivid', pending: 'onSubtle', disabled: 'onSubtle' };
    result.elements.e1!.palettes!.default![theme]!.onVivid!.alternative = changedStateMaps(
      standardRoot,
      rootPaint
    );
    result.elements.e2!.palettes!.default![theme]!.onVivid!.alternative = changedStateMaps(
      standardLabel,
      labelPaint
    );
    result.elements.e3!.palettes!.default![theme]!.onVivid!.alternative = changedStateMaps(
      standardPaint(button, 'e3', theme),
      { textColor: omitFluentButtonPendingTextState(labelPaint.textColor!) as IntentPaint }
    );
    // Divider paint is achromatic and identical to Standard, so it inherits without an override.
    result.contentSurfaceContext!.default![theme]!.onVivid!.alternative = changedStateMaps(
      standardContexts,
      context
    );
  }
  return result;
}
