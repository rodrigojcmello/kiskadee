import type {
  Schema,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetByRadius,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant
} from '@kiskadee/core';

export const TEXT_FIELD_COMPONENT_ARTIFACT_PATH = 'components/text-field.kiskadee.json';

export type TextFieldOptionsPayload = {
  variant?: TextFieldVariant;
  mode?: TextFieldMode;
  focusRingColorSource?: TextFieldFocusRingColorSource;
};

export type TextFieldModeOptionsPayload = {
  labelOffset?: TextFieldLabelOffsetByRadius;
  focusRingColorSource?: TextFieldFocusRingColorSource;
};

export type TextFieldModePayload<TMode extends TextFieldMode = TextFieldMode> = Partial<
  Record<TMode, { options?: TextFieldModeOptionsPayload }>
>;

export type TextFieldVariantOptionsPayload = {
  focusRingColorSource?: TextFieldFocusRingColorSource;
};

export type TextFieldVariantsPayload = {
  [TVariant in TextFieldVariant]?: {
    options?: TextFieldVariantOptionsPayload;
    modes?: TextFieldModePayload<TextFieldModeByVariant[TVariant]>;
  };
};

export type TextFieldComponentArtifactJSON = {
  component: 'textField';
  options: TextFieldOptionsPayload;
  variants: TextFieldVariantsPayload;
};

function pickTextFieldModeOptions(options: unknown): TextFieldModeOptionsPayload | undefined {
  const labelOffset = (options as { labelOffset?: TextFieldLabelOffsetByRadius } | undefined)
    ?.labelOffset;
  const focusRingColorSource = (
    options as { focusRingColorSource?: TextFieldFocusRingColorSource } | undefined
  )?.focusRingColorSource;
  return labelOffset || focusRingColorSource
    ? {
        ...(labelOffset ? { labelOffset } : {}),
        ...(focusRingColorSource ? { focusRingColorSource } : {})
      }
    : undefined;
}

function pickTextFieldVariantOptions(options: unknown): TextFieldVariantOptionsPayload | undefined {
  const focusRingColorSource = (
    options as { focusRingColorSource?: TextFieldFocusRingColorSource } | undefined
  )?.focusRingColorSource;
  return focusRingColorSource ? { focusRingColorSource } : undefined;
}

function buildTextFieldVariantsPayload(schema: Schema): TextFieldVariantsPayload {
  const textField = schema.components?.textField;
  const standardVariant = textField?.variants?.standard;
  const floatingVariant = textField?.variants?.floating;
  const standardModes = textField?.variants?.standard?.modes;
  const floatingModes = textField?.variants?.floating?.modes;
  const variants: TextFieldVariantsPayload = {};

  const standardOptions = pickTextFieldVariantOptions(standardVariant?.options);
  const standard: TextFieldModePayload<TextFieldModeByVariant['standard']> = {};
  const outlineOptions = pickTextFieldModeOptions(standardModes?.outline?.options);
  const underlineOptions = pickTextFieldModeOptions(standardModes?.underline?.options);
  const borderlessOptions = pickTextFieldModeOptions(standardModes?.borderless?.options);
  if (outlineOptions) standard.outline = { options: outlineOptions };
  if (underlineOptions) standard.underline = { options: underlineOptions };
  if (borderlessOptions) standard.borderless = { options: borderlessOptions };
  if (standardOptions || Object.keys(standard).length > 0) {
    variants.standard = {
      ...(standardOptions ? { options: standardOptions } : {}),
      ...(Object.keys(standard).length > 0 ? { modes: standard } : {})
    };
  }

  const floatingOptions = pickTextFieldVariantOptions(floatingVariant?.options);
  const floating: TextFieldModePayload<TextFieldModeByVariant['floating']> = {};
  const notchedOptions = pickTextFieldModeOptions(floatingModes?.notched?.options);
  const insideOptions = pickTextFieldModeOptions(floatingModes?.inside?.options);
  if (notchedOptions) floating.notched = { options: notchedOptions };
  if (insideOptions) floating.inside = { options: insideOptions };
  if (floatingOptions || Object.keys(floating).length > 0) {
    variants.floating = {
      ...(floatingOptions ? { options: floatingOptions } : {}),
      ...(Object.keys(floating).length > 0 ? { modes: floating } : {})
    };
  }

  return variants;
}

export function buildTextFieldComponentArtifact(
  schema: Schema
): TextFieldComponentArtifactJSON | null {
  const textFieldSchema = schema.components?.textField;
  if (!textFieldSchema) return null;

  const options: TextFieldOptionsPayload = {
    ...(textFieldSchema.options?.variant ? { variant: textFieldSchema.options.variant } : {}),
    ...(textFieldSchema.options?.mode ? { mode: textFieldSchema.options.mode } : {}),
    ...(textFieldSchema.options?.focusRingColorSource
      ? { focusRingColorSource: textFieldSchema.options.focusRingColorSource }
      : {})
  };
  const variants = buildTextFieldVariantsPayload(schema);

  if (!Object.keys(options).length && !Object.keys(variants).length) {
    return null;
  }

  return {
    component: 'textField',
    options,
    variants
  };
}
