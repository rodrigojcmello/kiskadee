import type { SegmentName } from '../types/colors/colors.types.ts';
import type {
  TabsBarElementStyleFromSchema,
  TabsBoxBarElementStyleFromSchema,
  TabsBridgeBarElementStyleFromSchema,
  TabsBridgeIndicatorElementStyleFromSchema,
  TabsBridgeTriggerElementStyleFromSchema,
  TabsEdgeBarElementStyleFromSchema,
  TabsIconElementStyleFromSchema,
  TabsIndicatorElementStyleFromSchema,
  TabsLabelElementStyleFromSchema,
  TabsOptionsFromSchema,
  TabsSegmentedBarElementStyleFromSchema,
  TabsSegmentedIndicatorElementStyleFromSchema,
  TabsSegmentedTriggerElementStyleFromSchema,
  TabsSeparatorElementStyleFromSchema,
  TabsTriggerElementStyleFromSchema
} from './tabs.zod.ts';

/**
 * Tabs elements canonical mapping:
 * - e1: bar
 * - e2: tab
 * - e3: label
 * - e4: icon
 * - e5: indicator / selected shell
 * - e6: separator
 */
export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type TabsVariant = 'line' | 'box' | 'segmented' | 'dot' | 'bridge';
export type TabsIndicatorPosition = 'top' | 'bottom';
export type TabsIndicatorWidth = 'tab' | 'fixed' | 'content';
export type TabsTabWidth = 'content' | 'fixed' | 'adaptive' | 'distributed';
export type TabsBridgeLowerCurve =
  | 'curved'
  | 'flush-start'
  | 'flush-end'
  | 'flush-both'
  | 'flush-all';
export const tabsIndicatorShapesByVariant = {
  line: ['square', 'rounded', 'roundedClip'],
  box: ['square', 'rounded', 'pill'],
  segmented: ['segmented'],
  dot: ['dot'],
  bridge: ['bridge']
} as const;
export type TabsLineIndicatorShape = (typeof tabsIndicatorShapesByVariant.line)[number];
export type TabsBoxIndicatorShape = (typeof tabsIndicatorShapesByVariant.box)[number];
export type TabsSegmentedIndicatorShape = (typeof tabsIndicatorShapesByVariant.segmented)[number];
export type TabsDotIndicatorShape = (typeof tabsIndicatorShapesByVariant.dot)[number];
export type TabsBridgeIndicatorShape = (typeof tabsIndicatorShapesByVariant.bridge)[number];
export type TabsIndicatorShape =
  | TabsLineIndicatorShape
  | TabsBoxIndicatorShape
  | TabsSegmentedIndicatorShape
  | TabsDotIndicatorShape
  | TabsBridgeIndicatorShape;

export type TabsOptions = TabsOptionsFromSchema;
export type TabsVariantOptions = Omit<TabsOptions, 'variant'>;

/**
 * e1 — bar
 * - boxColor or borderColor
 * - padding
 * - borderRadius or border, depending on tabs variant
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
 * `boxWidth` is applied when `tabWidth` is `fixed`, `adaptive`, or `distributed`.
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
 * - marginRight
 *
 * NOTE:
 * `marginRight` currently acts as the inline gap between the icon and the label in the default
 * icon-plus-label composition.
 * `iconColor` maps to `textColor` for now (for currentColor-driven icons).
 * Dedicated icon fill/stroke color channels are not yet modeled at schema level.
 */
export type TabsIconElementStyle<TSegmentName extends SegmentName = never> =
  TabsIconElementStyleFromSchema<TSegmentName>;

/**
 * e5 — indicator / selected shell
 * - boxWidth
 * - boxHeight
 * - margins
 * - boxColor
 * - borderRadius
 *
 * NOTE:
 * `boxWidth` is used by line indicators when `indicatorWidth` is `fixed`.
 * `content` width is measured from the rendered tab content by the visual component layer.
 * `boxHeight` is the line thickness for `line`, the diameter for `dot`, and the fill height for
 * `box` / `segmented`.
 * `marginTop` / `marginBottom` define the gap between the indicator and the bar edge.
 *
 * `roundedClip` is a structural indicator variant handled by component styles (fixed geometry).
 * `dot` is a dedicated variant handled by component styles (fixed circle geometry).
 * `rounded` / `pill` radius values must come from preset artifacts (JSON/CSS classes).
 * `segmented` keeps its radius in schema artifacts and uses the component layer only to flatten
 * inner corners structurally.
 * `bridge` reuses this slot as the selected shell that reconnects into the content panel.
 */
export type TabsIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  TabsIndicatorElementStyleFromSchema<TSegmentName>;

type TabsSegmentedIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  TabsSegmentedIndicatorElementStyleFromSchema<TSegmentName>;

type TabsBridgeIndicatorElementStyle<TSegmentName extends SegmentName = never> =
  TabsBridgeIndicatorElementStyleFromSchema<TSegmentName>;

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

type TabsSegmentedBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsSegmentedBarElementStyleFromSchema<TSegmentName>;

type TabsSegmentedTriggerElementStyle<TSegmentName extends SegmentName = never> =
  TabsSegmentedTriggerElementStyleFromSchema<TSegmentName>;

type TabsDotBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsEdgeBarElementStyleFromSchema<TSegmentName>;

type TabsBridgeBarElementStyle<TSegmentName extends SegmentName = never> =
  TabsBridgeBarElementStyleFromSchema<TSegmentName>;

type TabsBridgeTriggerElementStyle<TSegmentName extends SegmentName = never> =
  TabsBridgeTriggerElementStyleFromSchema<TSegmentName>;

/**
 * Future review
 *     Bridge currently reuses the same rounded border-radius token for both the upper corners
 *     and the lower bridge shoulders.
 * Why
 *     This keeps V1 inside the current schema vocabulary. If real design-system demand appears,
 *     we can later evaluate a runtime alias to a different existing radius token.
 */

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

export type TabsSegmentedElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1' | 'e2' | 'e5'
> & {
  // `segmented` bars keep their own rounded-only border contract and do not accept boxColor.
  e1?: TabsSegmentedBarElementStyle<TSegmentName>;
  // `segmented` triggers keep their own rounded-only radius contract for outer shell corners.
  e2?: TabsSegmentedTriggerElementStyle<TSegmentName>;
  // `segmented` indicators keep their own rounded-only radius contract for selected edges.
  e5?: TabsSegmentedIndicatorElementStyle<TSegmentName>;
};

export type TabsDotElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1'
> & {
  // `dot` bars support only edge-border styling, like `line`.
  e1?: TabsDotBarElementStyle<TSegmentName>;
};

export type TabsBridgeElements<TSegmentName extends SegmentName = never> = Omit<
  TabsElements<TSegmentName>,
  'e1' | 'e2' | 'e5' | 'e6'
> & {
  // `bridge` bars act as the overlap/scroller shell and keep a rounded-only contract.
  e1?: TabsBridgeBarElementStyle<TSegmentName>;
  // `bridge` triggers keep a rounded-only radius contract that feeds the lower curve geometry.
  e2?: TabsBridgeTriggerElementStyle<TSegmentName>;
  // `bridge` selected shell reuses the indicator slot but keeps a rounded-only contract.
  e5?: TabsBridgeIndicatorElementStyle<TSegmentName>;
};

export type TabsVariantConfig<
  TSegmentName extends SegmentName = never,
  TElements extends TabsElements<TSegmentName> = TabsElements<TSegmentName>
> = {
  elements: TElements;
  options?: TabsVariantOptions;
};

export type TabsLineVariantConfig<TSegmentName extends SegmentName = never> = TabsVariantConfig<
  TSegmentName,
  TabsLineElements<TSegmentName>
>;

export type TabsBoxVariantConfig<TSegmentName extends SegmentName = never> = TabsVariantConfig<
  TSegmentName,
  TabsBoxElements<TSegmentName>
>;

export type TabsSegmentedVariantConfig<TSegmentName extends SegmentName = never> =
  TabsVariantConfig<TSegmentName, TabsSegmentedElements<TSegmentName>>;

export type TabsDotVariantConfig<TSegmentName extends SegmentName = never> = TabsVariantConfig<
  TSegmentName,
  TabsDotElements<TSegmentName>
>;

export type TabsBridgeVariantConfig<TSegmentName extends SegmentName = never> = TabsVariantConfig<
  TSegmentName,
  TabsBridgeElements<TSegmentName>
>;

export type TabsVariants<TSegmentName extends SegmentName = never> = Partial<{
  line: TabsLineVariantConfig<TSegmentName>;
  box: TabsBoxVariantConfig<TSegmentName>;
  segmented: TabsSegmentedVariantConfig<TSegmentName>;
  dot: TabsDotVariantConfig<TSegmentName>;
  bridge: TabsBridgeVariantConfig<TSegmentName>;
}>;
