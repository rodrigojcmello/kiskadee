import type {
  GlobalSemanticsByTheme,
  IntentValue,
  KiskadeeTone,
  PrimitiveRole,
  ResolvedGradient,
  RoleWithPaint,
  Schema,
  SchemaColors,
  SemanticColor,
  SemanticVariant,
  SolidColor,
  TonalFunctionalReferenceName
} from '@kiskadee/core';
import { color, colorByReference } from '@kiskadee/core';

type ThemeShortcut = 'l' | 'd';

type GradientRole = `${string}.${string}.gradient`;
type SolidRole = Exclude<RoleWithPaint, GradientRole>;
const semanticKeys = [
  'primary',
  'secondary',
  'redLike',
  'yellowLike',
  'greenLike',
  'purpleLike',
  'neutral'
] as const satisfies SemanticColor[];

type SemanticRole = SemanticColor | `${SemanticColor}.${SemanticVariant}`;
type IntentRoleWithVariant = `${string}.${string}.${SemanticVariant}`;

export type PresetSolidColorRole = PrimitiveRole | SolidRole | SemanticRole | IntentRoleWithVariant;

export type PresetColorEvidence = {
  source: string;
  rationale: string;
};

export type PresetColorEvidenceRegistry = Readonly<Record<string, PresetColorEvidence>>;

export type PresetReferenceColorLocator = {
  mode: 'reference';
  reference: TonalFunctionalReferenceName;
  offset?: number;
  alpha?: number;
};

export type PresetExactColorLocator<TEvidenceId extends string = string> = {
  mode: 'exact';
  tone: KiskadeeTone;
  evidenceId: TEvidenceId;
  alpha?: number;
};

export type PresetCapColorLocator = {
  mode: 'cap';
  primitive: PrimitiveRole;
  polarity: 'light' | 'dark';
  alpha?: number;
};

export type PresetFamilyColorLocator<TEvidenceId extends string = string> =
  | PresetReferenceColorLocator
  | PresetExactColorLocator<TEvidenceId>
  | PresetCapColorLocator;

export type PresetColorLocator<TEvidenceId extends string = string> =
  | (PresetReferenceColorLocator & { role: PresetSolidColorRole })
  | (PresetExactColorLocator<TEvidenceId> & { role: PresetSolidColorRole })
  | PresetCapColorLocator;

export type StrictPresetColorResolver<TSegmentName extends string, TEvidenceId extends string> = {
  resolve(
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    locator: PresetColorLocator<TEvidenceId>
  ): SolidColor;
};

function parseSemanticRole(
  value: string
): { semantic: SemanticColor; variant: SemanticVariant } | null {
  const parts = value.split('.');
  if (parts.length !== 1 && parts.length !== 2) return null;
  const [semanticRaw, variantRaw] = parts;
  if (!semanticRaw) return null;
  if (!(semanticKeys as readonly string[]).includes(semanticRaw)) return null;

  if (parts.length === 1) {
    return { semantic: semanticRaw as SemanticColor, variant: 'v1' };
  }

  if (variantRaw === 'v1' || variantRaw === 'v2') {
    return { semantic: semanticRaw as SemanticColor, variant: variantRaw };
  }

  return null;
}

function parseIntentVariantRole(value: string): {
  component: string;
  intent: string;
  variant: SemanticVariant;
} | null {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [component, intent, variant] = parts;
  if (!component || !intent) return null;
  if (component === 'primitive') return null;
  if (variant !== 'v1' && variant !== 'v2') return null;
  return { component, intent, variant };
}

function resolvePresetRole(
  colors: NonNullable<Schema['colors']>,
  segmentName: string,
  theme: ThemeShortcut,
  roleOrPrimitive: RoleWithPaint | PrimitiveRole | SemanticRole | IntentRoleWithVariant
): RoleWithPaint | PrimitiveRole {
  const semanticRole =
    typeof roleOrPrimitive === 'string' ? parseSemanticRole(roleOrPrimitive) : null;
  const intentVariantRole =
    typeof roleOrPrimitive === 'string' ? parseIntentVariantRole(roleOrPrimitive) : null;

  if (semanticRole) {
    const themeName = theme === 'l' ? 'light' : 'dark';
    const fromSegment =
      colors.globalSemanticsBySegment?.[segmentName]?.themes?.[themeName]?.[semanticRole.semantic];
    const fromGlobal = (colors.globalSemantics as GlobalSemanticsByTheme | undefined)?.[
      themeName
    ]?.[semanticRole.semantic];
    const entry = fromSegment ?? fromGlobal;
    const primitiveRole =
      typeof entry === 'string' ? entry : (entry?.[semanticRole.variant] ?? entry?.v1);
    if (!primitiveRole) {
      throw new Error(
        `Global semantic not mapped for role=${roleOrPrimitive} theme=${theme} segment=${segmentName}`
      );
    }
    return primitiveRole;
  }

  if (intentVariantRole) {
    const themeName = theme === 'l' ? 'light' : 'dark';
    const componentIntents = colors.componentIntents as
      | Partial<Record<string, Partial<Record<string, IntentValue>>>>
      | undefined;
    const intentValue = componentIntents?.[intentVariantRole.component]?.[intentVariantRole.intent];
    if (!intentValue) {
      throw new Error(`Intent not mapped for role=${roleOrPrimitive}`);
    }

    const semanticEntry =
      colors.globalSemanticsBySegment?.[segmentName]?.themes?.[themeName]?.[
        intentValue as SemanticColor
      ] ?? colors.globalSemantics?.[themeName]?.[intentValue as SemanticColor];

    const primitiveRole: PrimitiveRole | undefined = intentValue.startsWith('primitive.')
      ? (intentValue as PrimitiveRole)
      : typeof semanticEntry === 'string'
        ? (semanticEntry as PrimitiveRole)
        : (semanticEntry?.[intentVariantRole.variant] ?? semanticEntry?.v1);

    if (!primitiveRole) {
      throw new Error(
        `Global semantic not mapped for role=${roleOrPrimitive} theme=${theme} segment=${segmentName}`
      );
    }
    return primitiveRole;
  }

  return roleOrPrimitive as RoleWithPaint | PrimitiveRole;
}

export function assertPresetColorAlpha(alpha: number | undefined): void {
  if (alpha === undefined) return;
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 100) {
    throw new Error(`Preset color alpha must be between 0 and 100, got: ${alpha}`);
  }
}

export function assertPresetColorEvidence(
  registry: PresetColorEvidenceRegistry,
  evidenceId: string
): void {
  const evidence = registry[evidenceId];
  if (!evidence?.source.trim() || !evidence.rationale.trim()) {
    throw new Error(`Missing preset color evidence for exact locator: ${evidenceId}`);
  }
}

export function bindPresetColorRole<TEvidenceId extends string>(
  role: PresetSolidColorRole,
  locator: PresetFamilyColorLocator<TEvidenceId>
): PresetColorLocator<TEvidenceId> {
  return locator.mode === 'cap' ? locator : { ...locator, role };
}

export type PresetColorGetter<TSegmentName extends string> = {
  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole | SemanticRole | IntentRoleWithVariant,
    tone: KiskadeeTone,
    alpha?: number
  ): SolidColor;

  (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: GradientRole,
    tone: KiskadeeTone | KiskadeeTone[],
    alpha?: number
  ): ResolvedGradient;

  ref(
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole | SemanticRole | IntentRoleWithVariant,
    reference: TonalFunctionalReferenceName,
    offset?: number,
    alpha?: number
  ): SolidColor;
};

/**
 * Small preset-level wrapper around `@kiskadee/core` `color()`.
 *
 * Why this exists:
 * - Presets frequently need a compact helper when authoring palettes.
 * - We keep the `.solid` (default) vs `.gradient` typing at the call site.
 */
export function createPresetColorGetter<TSegmentName extends string>(schemaContext: {
  colors: NonNullable<Schema['colors']>;
}): PresetColorGetter<TSegmentName> {
  const c = (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: RoleWithPaint | PrimitiveRole | SemanticRole | IntentRoleWithVariant,
    tone: KiskadeeTone | KiskadeeTone[],
    alpha?: number
  ): SolidColor | ResolvedGradient => {
    const resolvedRole = resolvePresetRole(
      schemaContext.colors,
      segmentName,
      theme,
      roleOrPrimitive
    );
    return color(schemaContext, segmentName, theme, resolvedRole as never, tone as never, alpha);
  };

  const getter = c as PresetColorGetter<TSegmentName>;

  getter.ref = (
    segmentName: TSegmentName,
    theme: ThemeShortcut,
    roleOrPrimitive: PrimitiveRole | SolidRole | SemanticRole | IntentRoleWithVariant,
    reference: TonalFunctionalReferenceName,
    offset = 0,
    alpha?: number
  ): SolidColor => {
    const resolvedRole = resolvePresetRole(
      schemaContext.colors,
      segmentName,
      theme,
      roleOrPrimitive
    );
    return colorByReference(
      schemaContext,
      segmentName,
      theme,
      resolvedRole as PrimitiveRole | `${string}.${string}` | `${string}.${string}.solid`,
      reference,
      offset,
      alpha
    );
  };

  return getter;
}

/**
 * What
 *     Creates a preset-authoring resolver that accepts only explicit color locators.
 * Why
 *     Reference-first presets need exact tones and absolute caps to remain visible and auditable.
 */
export function createStrictPresetColorResolver<
  TSegmentName extends string,
  const TEvidenceRegistry extends PresetColorEvidenceRegistry
>(args: {
  colors: SchemaColors;
  exactEvidence: TEvidenceRegistry;
}): StrictPresetColorResolver<TSegmentName, Extract<keyof TEvidenceRegistry, string>> {
  type EvidenceId = Extract<keyof TEvidenceRegistry, string>;

  for (const evidenceId of Object.keys(args.exactEvidence)) {
    assertPresetColorEvidence(args.exactEvidence, evidenceId);
  }

  return {
    resolve(
      segmentName: TSegmentName,
      theme: ThemeShortcut,
      locator: PresetColorLocator<EvidenceId>
    ): SolidColor {
      assertPresetColorAlpha(locator.alpha);

      if (locator.mode === 'cap') {
        const tone =
          locator.polarity === 'light' ? (theme === 'l' ? 0 : 100) : theme === 'l' ? 100 : 0;
        return color(args, segmentName, theme, locator.primitive, tone, locator.alpha);
      }

      if (locator.role.endsWith('.gradient')) {
        throw new Error(`Preset color locators support only solid roles: ${locator.role}`);
      }

      const resolvedRole = resolvePresetRole(args.colors, segmentName, theme, locator.role);

      if (locator.mode === 'reference') {
        return colorByReference(
          args,
          segmentName,
          theme,
          resolvedRole as PrimitiveRole | `${string}.${string}` | `${string}.${string}.solid`,
          locator.reference,
          locator.offset,
          locator.alpha
        );
      }

      assertPresetColorEvidence(args.exactEvidence, locator.evidenceId);
      return color(
        args,
        segmentName,
        theme,
        resolvedRole as PrimitiveRole | SolidRole,
        locator.tone,
        locator.alpha
      );
    }
  };
}
