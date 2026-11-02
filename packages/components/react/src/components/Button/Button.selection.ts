import type {
  ButtonIntent,
  ButtonIntentValue,
  ButtonSelectionEmphasis,
  ClassNameByElementJSON,
  ColorVariant,
  ComponentEmphasis,
  SurfaceContext
} from '@kiskadee/core';
import { parseButtonIntentValue } from '@kiskadee/core';
import { resolveIntentClassName } from '../../shared/class-resolution/classNames.ts';
import type {
  ButtonClassesMap,
  ButtonGroupClassesMap,
  ButtonSelectionRestClassesMap
} from './Button.types.ts';

/** Chooses an authored paint source while keeping selection ownership on the control. */
export function resolveButtonSelectionPaint({
  elements,
  groupPaint,
  controlState,
  selectionEmphasis,
  emphasis,
  intent,
  colorVariant = 'standard',
  variantCoverage,
  selectionIntent,
  supportsSelectionIntent = true,
  surfaceContext,
  hasLabel,
  hasIcon,
  hasDisclosure,
  surfaced
}: {
  elements: ButtonClassesMap | undefined;
  groupPaint?: ButtonGroupClassesMap;
  controlState: boolean | undefined;
  selectionEmphasis: ButtonSelectionEmphasis;
  emphasis: ComponentEmphasis;
  intent: ButtonIntent;
  colorVariant?: ColorVariant;
  variantCoverage?: Partial<Record<string, readonly ComponentEmphasis[]>>;
  selectionIntent?: ButtonIntentValue;
  supportsSelectionIntent?: boolean;
  surfaceContext: SurfaceContext;
  hasLabel: boolean;
  hasIcon: boolean;
  hasDisclosure: boolean;
  surfaced: boolean;
}) {
  const requestsHigh = selectionEmphasis === 'medium' || selectionEmphasis === 'high';
  const projection = elements?.selectionRest;
  const hasPaint = (
    element: ClassNameByElementJSON | undefined,
    tone: ComponentEmphasis,
    paintIntent = intent,
    variant: ColorVariant = 'standard'
  ) =>
    Boolean(
      resolveIntentClassName(element, paintIntent, tone, { surfaceContext, colorVariant: variant })
    );
  const hasRecipe = (paintIntent: ButtonIntent, high: boolean, variant: ColorVariant) => {
    const recipe = high ? projection : elements;
    const tone = high ? 'high' : emphasis;
    const hasPartPaint = (part: keyof ButtonSelectionRestClassesMap) =>
      !elements?.[part]?.c || hasPaint(recipe?.[part], tone, paintIntent, variant);
    const root = groupPaint
      ? high
        ? groupPaint.selectionRestMember
        : groupPaint.member
      : recipe?.e1;
    return (
      hasPaint(root, tone, paintIntent, variant) &&
      (!hasLabel || hasPartPaint('e2')) &&
      (!hasIcon || surfaced || hasPartPaint(elements?.e3?.c ? 'e3' : 'e2')) &&
      (!hasDisclosure || hasPartPaint(elements?.e5?.c ? 'e5' : 'e2')) &&
      (!surfaced || !elements?.e4?.c || hasPaint(recipe?.e4, 'medium', 'neutral', variant))
    );
  };
  const variantAt = (
    paintIntent: ButtonIntent,
    requested: ColorVariant,
    high: boolean
  ): ColorVariant =>
    requested === 'alternative' &&
    variantCoverage?.[paintIntent]?.includes(high ? 'high' : emphasis) &&
    hasRecipe(paintIntent, high, 'alternative')
      ? 'alternative'
      : 'standard';
  const selected =
    selectionIntent === undefined
      ? { intent, colorVariant: variantAt(intent, colorVariant, false) }
      : parseButtonIntentValue(selectionIntent);
  const target = controlState === true && selected ? selected : { intent, colorVariant };
  const available = (choice: { intent: ButtonIntent; colorVariant: ColorVariant }) =>
    (requestsHigh &&
      hasRecipe(choice.intent, true, variantAt(choice.intent, choice.colorVariant, true))) ||
    hasRecipe(choice.intent, false, variantAt(choice.intent, choice.colorVariant, false));
  const intentUnavailable =
    controlState === true &&
    target.intent !== intent &&
    (!supportsSelectionIntent || !available(target));
  const choice =
    intentUnavailable && !target.intent.startsWith('brand.')
      ? { intent, colorVariant: variantAt(intent, colorVariant, false) }
      : target;
  const highVariant = variantAt(choice.intent, choice.colorVariant, true);
  const highAvailable = hasRecipe(choice.intent, true, highVariant);
  const usesHighRest = controlState === true && requestsHigh && highAvailable;
  const effectiveEmphasis = usesHighRest ? ('high' as const) : emphasis;
  const effectiveVariant = variantAt(choice.intent, choice.colorVariant, usesHighRest);
  return {
    intent: choice.intent,
    colorVariant: effectiveVariant,
    emphasis: effectiveEmphasis,
    selectedPaint: controlState === true && !usesHighRest,
    projection: usesHighRest ? projection : undefined,
    indicatorEnabled: selectionEmphasis === 'low' || selectionEmphasis === 'high',
    highUnavailable: controlState === true && requestsHigh && !highAvailable,
    variantUnavailable: choice.colorVariant === 'alternative' && effectiveVariant === 'standard',
    intentUnavailable
  };
}

/** Replaces only authored paint/effects; the original part retains all geometry and decoration. */
export function resolveButtonPaintElement(
  element: ClassNameByElementJSON | undefined,
  projection: ClassNameByElementJSON | undefined,
  usesProjection: boolean
): ClassNameByElementJSON | undefined {
  if (!usesProjection) return element;
  if (!element) return undefined;
  return { ...element, c: projection?.c, e: projection?.e, l: undefined };
}
