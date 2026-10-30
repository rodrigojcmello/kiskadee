import type {
  ButtonIntent,
  ButtonSelectionEmphasis,
  ClassNameByElementJSON,
  ComponentEmphasis,
  SurfaceContext
} from '@kiskadee/core';
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
  selectionIntent = intent,
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
  selectionIntent?: ButtonIntent;
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
    paintIntent = intent
  ) => Boolean(resolveIntentClassName(element, paintIntent, tone, { surfaceContext }));
  const hasRecipe = (paintIntent: ButtonIntent, high: boolean) => {
    const recipe = high ? projection : elements;
    const tone = high ? 'high' : emphasis;
    const hasPartPaint = (part: keyof ButtonSelectionRestClassesMap) =>
      !elements?.[part]?.c || hasPaint(recipe?.[part], tone, paintIntent);
    const root = groupPaint
      ? high
        ? groupPaint.selectionRestMember
        : groupPaint.member
      : recipe?.e1;
    return (
      hasPaint(root, tone, paintIntent) &&
      (!hasLabel || hasPartPaint('e2')) &&
      (!hasIcon || surfaced || hasPartPaint(elements?.e3?.c ? 'e3' : 'e2')) &&
      (!hasDisclosure || hasPartPaint(elements?.e5?.c ? 'e5' : 'e2')) &&
      (!surfaced || !elements?.e4?.c || hasPaint(recipe?.e4, 'medium', 'neutral'))
    );
  };
  const changesIntent = controlState === true && selectionIntent !== intent;
  const intentUnavailable =
    changesIntent &&
    (!supportsSelectionIntent ||
      !((requestsHigh && hasRecipe(selectionIntent, true)) || hasRecipe(selectionIntent, false)));
  // Brand resources must fail visibly; only system intents may fall back to the base intent.
  const paintIntent =
    !changesIntent || (intentUnavailable && !selectionIntent.startsWith('brand.'))
      ? intent
      : selectionIntent;
  const highAvailable = hasRecipe(paintIntent, true);
  const usesHighRest = controlState === true && requestsHigh && highAvailable;

  return {
    intent: paintIntent,
    emphasis: usesHighRest ? ('high' as const) : emphasis,
    selectedPaint: controlState === true && !usesHighRest,
    projection: usesHighRest ? projection : undefined,
    indicatorEnabled: selectionEmphasis === 'low' || selectionEmphasis === 'high',
    highUnavailable: controlState === true && requestsHigh && !highAvailable,
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
