import {
  type ColorProperty,
  type InteractionStateColorMap,
  interactionStateKeys,
  primitive,
  type Schema,
  type SolidColor,
  type SystemButtonIntent
} from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';
import { bindPresetColorRole } from '../../../utils/presetColor.ts';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  type Fluent2MicrosoftFamilyColorLocator,
  referenceColor
} from '../fluent-2-microsoft.color.ts';
import {
  composeOpaqueSurface,
  createFluentButtonOnVividIntent,
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

const themes = ['light', 'dark', 'darker'] as const;
const intents = ['primary', 'neutral', 'destructive', 'positive'] as const;

const complementaryRoles = {
  primary: 'button.primary.v2',
  positive: 'button.positive.v2',
  destructive: 'button.destructive.v2'
} as const;

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
  const white = c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light'));
  const dark = c.resolve('default', 'l', referenceColor('neutral', 'vivid'));
  const whitePending = c.resolve(
    'default',
    'l',
    absoluteCap(primitive('black', 'v1'), 'light', FLUENT_BUTTON_PENDING_VISIBILITY.content)
  );
  const darkPending = c.resolve(
    'default',
    'l',
    referenceColor('neutral', 'vivid', 0, FLUENT_BUTTON_PENDING_VISIBILITY.content)
  );
  const canonicalLight = c.resolve(
    'default',
    'l',
    exactColor('card.primary', 50, 'component.card')
  );
  const canonicalRole = c.resolve('default', 'l', referenceColor('button.primary', 'vivid'));
  const result = structuredClone(button);

  const hostSurface = (theme: FluentButtonFormulaTheme) =>
    c.resolve(
      'default',
      theme === 'light' ? 'l' : 'd',
      exactColor(
        'card.primary',
        theme === 'light' ? 50 : theme === 'dark' ? 35 : 18,
        'component.card'
      )
    );

  for (const theme of themes) {
    const standardRoot = standardPaint(button, 'e1', theme);
    const standardLabel = standardPaint(button, 'e2', theme);
    const rootPaint: Paint = {};
    const labelPaint: Paint = { textColor: {} };
    const standardContexts = button.contentSurfaceContext!.default![theme]!.onVivid!.standard;
    const context = structuredClone(standardContexts);
    delete context.neutral;

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
      const family = {
        resolve: (_theme: 'light' | 'dark', locator: Fluent2MicrosoftFamilyColorLocator) =>
          c.resolve('default', 'l', bindPresetColorRole(role, locator))
      };
      const formula = createFluentButtonOnVividIntent({
        theme,
        family,
        neutralButtonFamily: family,
        canonicalSurface: canonicalRole,
        lightBaseSurface: canonicalLight
      });
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
      const medium = formula.boxColor.medium as InteractionStateColorMap;

      rootPaint.boxColor![intent] = {
        high: {
          ...base.high!,
          rest: complementary,
          hover: resolve('vivid', 1),
          pressed: resolve('vivid', 3),
          pending: resolve('vivid', 0, FLUENT_BUTTON_PENDING_VISIBILITY.surface),
          selected: { rest: resolve('vivid', 3), hover: resolve('vivid', 3) }
        },
        medium: {
          ...medium,
          ...(light
            ? {
                rest: resolve('vivid', 0, 14),
                hover: resolve('vivid', 0, 10),
                pending: resolve('vivid', 0, (14 * FLUENT_BUTTON_PENDING_VISIBILITY.surface) / 100)
              }
            : {}),
          pressed: complementary,
          selected: { rest: complementary, hover: complementary }
        },
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
      if (light) {
        rootPaint.borderColor![intent]!.medium = {
          ...rootPaint.borderColor![intent]!.medium!,
          rest: resolve('vivid', 0, 10),
          pending: resolve('vivid', 0, (10 * FLUENT_BUTTON_PENDING_VISIBILITY.border) / 100)
        };
      }
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
      rootPaint.borderBottomColor![intent]!.low = {
        ...rootPaint.borderColor![intent]!.low!,
        rest: resolve('vivid', 0, light ? 45 : 100),
        ...(light ? { hover: resolve('vivid', 0, 50) } : {}),
        pending: resolve(
          'vivid',
          0,
          ((light ? 45 : 100) * FLUENT_BUTTON_PENDING_VISIBILITY.border) / 100
        )
      };

      const disabled = standardLabel.textColor![intent]!.high!.disabled;
      const foreground = (rest: SolidColor, pending: SolidColor): InteractionStateColorMap => ({
        rest,
        pending: { ref: pending },
        disabled
      });
      const lowest = resolve('subtle');
      const lowestStates = foreground(
        lowest,
        resolve('subtle', 0, FLUENT_BUTTON_PENDING_VISIBILITY.content)
      );
      // The Light-track Subtle foreground needs a stronger active polarity over the 30% Dark tint.
      const lowestSurface = composeOpaqueSurface(lowPressed, hostSurface(theme));
      if (contrastRatio(lowest, lowestSurface) < 4.5) {
        lowestStates.pressed = { ref: white };
        lowestStates.selected = { rest: { ref: white } };
      }
      labelPaint.textColor![intent] = {
        high: foreground(dark, darkPending),
        medium: {
          ...foreground(white, whitePending),
          pressed: { ref: dark },
          selected: { rest: { ref: dark } }
        },
        low: foreground(white, whitePending),
        lowest: lowestStates
      };
      context[intent]!.high = { rest: 'onSubtle', pending: 'onSubtle', disabled: 'onSubtle' };
      context[intent]!.medium = { ...context[intent]!.medium!, selected: 'onSubtle' };
    }
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
