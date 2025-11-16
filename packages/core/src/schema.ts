import type { Breakpoints, ElementAllSizeValue, ElementSizeValue } from './breakpoints';
import type { ElementPalettes, InteractionState, SemanticColor } from './types/colors/colors.types';
import type { DecorationSchema } from './types/decorations/decorations.types';
import type { ElementEffects } from './types/effects';
import type { ScaleSchema } from './types/scales/scales.types';

// Names of all supported components
export type ComponentName = 'button' | 'tabs';

// Unique identifier for each segment (brand/product identity) within a design system
export type SegmentName = string;

export type ElementStyle = Partial<{
  name?: string; // for example "element-element-element-element"
  decorations: DecorationSchema;
  scales: ScaleSchema;
  // Palettes follow the same structure as SchemaSegments: segmentName → themes → ColorSchema
  // This ensures consistency and enables proper white-label theming with light/dark mode support
  palettes: ElementPalettes;
  effects: ElementEffects;
}>;

type Elements = Record<ElementName, ElementStyle>;

// -------------------------------------------------------------------------------------------------
export type StyleKey = string;

/**
 * Element name by component. Initially using generic names like e1, e2, etc., but may need specific
 * names in the future.
 */
export type ElementName = string;

// Mapping of style keys by interaction state per element
export type StyleKeysByInteractionState = Partial<Record<InteractionState, StyleKey[]>>;

export type InteractionStateBySemanticColor = Partial<{
  [K in SemanticColor]: StyleKeysByInteractionState;
}>;

export interface StyleKeyByElement {
  decorations: StyleKey[];
  effects: StyleKeysByInteractionState;
  scales: Partial<Record<ElementSizeValue | ElementAllSizeValue, StyleKey[]>>;
  // Palettes now include theme mode in the structure: segment → theme → semantic color → interaction states
  palettes: Partial<Record<SegmentName, Partial<Record<string, InteractionStateBySemanticColor>>>>;
}

export type ComponentStyleKeyMap = Partial<{
  [componenteName in ComponentName]: {
    [elementName: ElementName]: StyleKeyByElement;
  };
}>;

// Legacy, delete it
export interface ClassNameMap {
  [componenteName: string]: {
    [elementName: string]: Partial<Record<InteractionState, string[]>>;
  };
}

// -------------------------------------------------------------------------------------------------

type Components = Partial<Record<ComponentName, { elements: Elements }>>;

export type SchemaMetadata = {
  name: string;
  version: [number, number, number];
  author: string;
  breakpoints: Breakpoints;
  prefix?: string;
};

export type Schema = SchemaMetadata & {
  components: Components;
};

// Color classes structure: segregates single-color, soft, and solid variants
export type ColorClasses = {
  u?: string; // unique/single color (no tone variants)
  f?: string; // soft (light tone track)
  d?: string; // solid (dark tone track)
};

// Types describing the JSON artifact produced by web-builder (classNamesMap.json)
export type ClassNameByElementJSON = {
  // d = decorations, e = effects, s = scales, c = colors (with u/f/d sub-fields), cs = control states
  // d: flattened into a single space-separated string of class names (always-on)
  d?: string;
  // e: unified string of effect base classes (space-separated). These classes are opt-in and require
  // activation via state activators (.-a, .-h, .-f, .-p, .-s, .-d, .-r) or native pseudos to take effect.
  // No interaction-state nesting here; components may append all base effect classes unconditionally.
  e?: string;
  // s: values are pre-joined into a single space-separated string (no arrays) per size key
  s?: Partial<Record<string, string>>;
  // c: Map of semantic key -> ColorClasses (semantic-aware colors). No legacy flat format.
  c?: Record<string, ColorClasses>;
  // cs: control-state specific (selected) — flattened string of utility classes
  // TODO: replace is with a single letter
  cs?: string;
};

export type ComponentClassNameMapJSON = Partial<
  Record<string, Record<string, ClassNameByElementJSON>>
>;
