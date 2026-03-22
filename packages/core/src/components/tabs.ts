import type { SegmentName } from '../types/colors/colors.types';
import type {
  TabsBarElementStyleFromSchema,
  TabsBoxBarElementStyleFromSchema,
  TabsEdgeBarElementStyleFromSchema,
  TabsIconElementStyleFromSchema,
  TabsIndicatorElementStyleFromSchema,
  TabsLabelElementStyleFromSchema,
  TabsOptionsFromSchema,
  TabsSeparatorElementStyleFromSchema,
  TabsTriggerElementStyleFromSchema
} from './tabs.zod';

/**
 * Tabs elements canonical mapping:
 * - e1: bar
 * - e2: tab
 * - e3: label
 * - e4: icon
 * - e5: indicator
 * - e6: separator
 */
export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type TabsType = 'line' | 'box' | 'dot';
export type TabsIndicatorPosition = 'top' | 'bottom';
export type TabsIndicatorWidthMode = 'tab' | 'fixed' | 'content';
export type TabsTabWidthMode = 'auto' | 'fixed';
export const tabsIndicatorVariantsByType = {
  line: ['square', 'rounded', 'roundedClip'],
  box: ['square', 'rounded', 'pill'],
  dot: ['dot']
} as const;
export type TabsLineIndicatorVariant = (typeof tabsIndicatorVariantsByType.line)[number];
export type TabsBoxIndicatorVariant = (typeof tabsIndicatorVariantsByType.box)[number];
export type TabsDotIndicatorVariant = (typeof tabsIndicatorVariantsByType.dot)[number];
export type TabsIndicatorVariant =
  | TabsLineIndicatorVariant
  | TabsBoxIndicatorVariant
  | TabsDotIndicatorVariant;

export type TabsOptions = TabsOptionsFromSchema;

/**
 * e1 — bar
 * - boxColor
 * - padding
 * - borderRadius or border, depending on tabs type
 *
 * NOTE:
 * `box` bars support container background + padding + borderRadius.
 * `line` / `dot` bars support edge border styling + padding.
 * The rendered edge still resolves to top or bottom from `indicatorPosition`.
 */
export type TabsBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsBarElementStyleFromSchema<TSegmentName>;

/**
 * e2 — tab
 * - boxColor
 * - boxWidth
 * - padding
 * - borderRadius
 *
 * NOTE:
 * `boxWidth` is only applied when `tabWidthMode` is `fixed`.
 */
export type TabsTriggerElementStyle<TSegmentName extends SegmentName = never> =
  TabsTriggerElementStyleFromSchema<TSegmentName>;

/**
 * e3 — label
 * - textColor
 * - textSize
 * - textFamily
 * - textWeight
 * - textLineHeight
 *
 * NOTE:
 * `textLineHeight` maps to `textHeight` in the current schema scale model.
 */
export type TabsLabelElementStyle<TSegmentName extends SegmentName = never> =
  TabsLabelElementStyleFromSchema<TSegmentName>;

/**
 * e4 — icon
 * - iconSize
 * - iconColor
 * - padding
 *
 * NOTE:
 * `iconColor` maps to `textColor` for now (for currentColor-driven icons).
 * Dedicated icon fill/stroke color channels are not yet modeled at schema level.
 */
export type TabsIconElementStyle<TSegmentName extends SegmentName = never> =
  TabsIconElementStyleFromSchema<TSegmentName>;

/**
 * e5 — indicator (line/background/pill)
 * - boxWidth
 * - boxHeight
 * - margins
 * - boxColor
 * - borderRadius
 *
 * NOTE:
 * `boxWidth` is used by line indicators when `indicatorWidthMode` is `fixed`.
 * `content` width is measured from the rendered tab content by the visual component layer.
 * `boxHeight` is the line thickness for `line`, the diameter for `dot`, and the fill height for `box`.
 * `marginTop` / `marginBottom` define the gap between the indicator and the bar edge.
 *
 * `roundedClip` is a structural indicator variant handled by component styles (fixed geometry).
 * `dot` is a dedicated type handled by component styles (fixed circle geometry).
 * `rounded` / `pill` radius values must come from preset artifacts (JSON/CSS classes).
 */
export type TabsIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  TabsIndicatorElementStyleFromSchema<TSegmentName>;

/**
 * e6 — separator (between tabs)
 * - boxWidth
 * - boxHeight
 * - margins
 * - boxColor
 */
export type TabsSeparatorElementStyle<TSegmentName extends SegmentName = never> =
  TabsSeparatorElementStyleFromSchema<TSegmentName>;

export type TabsElements<TSegmentName extends SegmentName = never> = {
  // e1: bar
  e1?: TabsBarElementStyle<TSegmentName>;
  // e2: tab
  e2?: TabsTriggerElementStyle<TSegmentName>;
  // e3: label
  e3?: TabsLabelElementStyle<TSegmentName>;
  // e4: icon
  e4?: TabsIconElementStyle<TSegmentName>;
  // e5: indicator
  e5?: TabsIndicatorElementStyle<TSegmentName>;
  // e6: separator
  e6?: TabsSeparatorElementStyle<TSegmentName>;
};

type TabsLineBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsEdgeBarElementStyleFromSchema<TSegmentName>;

type TabsBoxBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsBoxBarElementStyleFromSchema<TSegmentName>;

type TabsDotBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsEdgeBarElementStyleFromSchema<TSegmentName>;

export type TabsLineElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1'
> & {
  // `line` bars support only edge-border styling, not container radius.
  e1?: TabsLineBarElementStyle<TSegmentName>;
};

export type TabsBoxElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1'
> & {
  // `box` bars model container chrome with background/padding/radius, not border.
  e1?: TabsBoxBarElementStyle<TSegmentName>;
};

export type TabsDotElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1'
> & {
  // `dot` bars support only edge-border styling, like `line`.
  e1?: TabsDotBarElementStyle<TSegmentName>;
};

export type TabsTypeConfig<
  TSegmentName extends SegmentName = never,
  TElements extends TabsElements<TSegmentName> = TabsElements<TSegmentName>
> = {
  elements: TElements;
  options?: TabsOptions;
};

export type TabsLineTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName,
  TabsLineElements<TSegmentName>
>;

export type TabsBoxTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName,
  TabsBoxElements<TSegmentName>
>;

export type TabsDotTypeConfig<TSegmentName extends SegmentName = never> = TabsTypeConfig<
  TSegmentName,
  TabsDotElements<TSegmentName>
>;

export type TabsTypes<TSegmentName extends SegmentName = never> = Partial<{
  line: TabsLineTypeConfig<TSegmentName>;
  box: TabsBoxTypeConfig<TSegmentName>;
  dot: TabsDotTypeConfig<TSegmentName>;
}>;
export { validateTabsComponentContract } from './tabs.zod';
