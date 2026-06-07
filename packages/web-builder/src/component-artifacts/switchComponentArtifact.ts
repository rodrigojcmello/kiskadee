import type {
  RadiusMode,
  Schema,
  SwitchActivationMotion,
  SwitchControlTextVisibility,
  SwitchMode,
  SwitchVariant
} from '@kiskadee/core';

export const SWITCH_COMPONENT_ARTIFACT_PATH = 'components/switch.kiskadee.json';

export type SwitchComponentOptionsPayload = {
  variant?: SwitchVariant;
  radius?: RadiusMode;
  activationMotion?: SwitchActivationMotion;
  controlTextVisibility?: SwitchControlTextVisibility;
};

export type SwitchComponentEffectsPayload = {
  thumbShrink?: true;
};

export type SwitchComponentVariantsPayload = {
  [TVariant in SwitchVariant]?: {
    options?: {
      mode?: SwitchMode;
    };
  };
};

export type SwitchComponentArtifactJSON = {
  component: 'switch';
  options: SwitchComponentOptionsPayload;
  effects: SwitchComponentEffectsPayload;
  variants: SwitchComponentVariantsPayload;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickSwitchVariantOptions(
  options: unknown
): NonNullable<SwitchComponentVariantsPayload[SwitchVariant]>['options'] | undefined {
  const mode = (options as { mode?: SwitchMode } | undefined)?.mode;
  return mode ? { mode } : undefined;
}

function hasDeclaredThumbShrinkEffect(element: unknown): boolean {
  if (!isRecord(element) || !isRecord(element.effects)) return false;
  const thumbShrink = element.effects.thumbShrink;
  return (
    Object.hasOwn(element.effects, 'thumbShrink') &&
    thumbShrink !== undefined &&
    thumbShrink !== null &&
    thumbShrink !== false
  );
}

function elementsHaveThumbShrinkEffect(elements: unknown): boolean {
  return isRecord(elements) && Object.values(elements).some(hasDeclaredThumbShrinkEffect);
}

function switchBranchHasThumbShrinkEffect(branch: unknown): boolean {
  if (!isRecord(branch)) return false;
  if (elementsHaveThumbShrinkEffect(branch.elements)) return true;

  const modes = branch.modes;
  return isRecord(modes)
    ? Object.values(modes).some((mode) =>
        isRecord(mode) ? elementsHaveThumbShrinkEffect(mode.elements) : false
      )
    : false;
}

function buildSwitchEffectsPayload(schema: Schema): SwitchComponentEffectsPayload {
  const switchSchema = schema.components?.switch;
  if (!isRecord(switchSchema)) return {};
  if (switchBranchHasThumbShrinkEffect(switchSchema)) return { thumbShrink: true };

  const variants = switchSchema.variants;
  if (!isRecord(variants)) return {};
  return Object.values(variants).some(switchBranchHasThumbShrinkEffect)
    ? { thumbShrink: true }
    : {};
}

function buildSwitchVariantsPayload(schema: Schema): SwitchComponentVariantsPayload {
  const variants: SwitchComponentVariantsPayload = {};
  const standardOptions = pickSwitchVariantOptions(
    schema.components?.switch?.variants?.standard?.options
  );
  if (standardOptions) {
    variants.standard = {
      options: standardOptions
    };
  }

  return variants;
}

export function buildSwitchComponentArtifact(schema: Schema): SwitchComponentArtifactJSON | null {
  const switchSchema = schema.components?.switch;
  if (!switchSchema) return null;

  const options: SwitchComponentOptionsPayload = {
    ...(switchSchema.options?.variant ? { variant: switchSchema.options.variant } : {}),
    ...(switchSchema.options?.radius ? { radius: switchSchema.options.radius } : {}),
    ...(switchSchema.options?.activationMotion
      ? { activationMotion: switchSchema.options.activationMotion }
      : {}),
    ...(switchSchema.options?.controlTextVisibility
      ? { controlTextVisibility: switchSchema.options.controlTextVisibility }
      : {})
  };
  const effects = buildSwitchEffectsPayload(schema);
  const variants = buildSwitchVariantsPayload(schema);

  if (
    !Object.keys(options).length &&
    !Object.keys(effects).length &&
    !Object.keys(variants).length
  ) {
    return null;
  }

  return {
    component: 'switch',
    options,
    effects,
    variants
  };
}
