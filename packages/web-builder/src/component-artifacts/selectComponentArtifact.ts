import type { Schema, SelectMode, SelectPresentationOptions } from '@kiskadee/core';
export const SELECT_COMPONENT_ARTIFACT_PATH = 'components/select.kiskadee.json';
export type SelectPresentationOptionsJSON = Required<SelectPresentationOptions>;
export type SelectComponentArtifactJSON = {
  component: 'select';
  options: { variant: 'standard'; mode: SelectMode } & SelectPresentationOptionsJSON;
  modes: SelectMode[];
  modeOptions: Partial<Record<SelectMode, SelectPresentationOptionsJSON>>;
};
export function buildSelectComponentArtifact(schema: Schema): SelectComponentArtifactJSON | null {
  const select = schema.components?.select;
  if (!select) return null;
  const componentOptions: SelectPresentationOptionsJSON = {
    focusIndicator: select.options?.focusIndicator ?? 'underline',
    focusRingColorSource: select.options?.focusRingColorSource ?? 'global',
    showDividers: select.options?.showDividers ?? false
  };
  const modes = Object.keys(select.variants.standard.modes) as SelectMode[];
  const modeOptions = Object.fromEntries(
    modes.map((mode) => {
      const options = select.variants.standard.modes[mode]?.options;
      return [
        mode,
        {
          focusIndicator: options?.focusIndicator ?? componentOptions.focusIndicator,
          focusRingColorSource:
            options?.focusRingColorSource ?? componentOptions.focusRingColorSource,
          showDividers: options?.showDividers ?? componentOptions.showDividers
        }
      ];
    })
  ) as SelectComponentArtifactJSON['modeOptions'];
  return {
    component: 'select',
    options: {
      variant: 'standard',
      mode: select.options?.mode ?? 'outline',
      ...componentOptions
    },
    modes,
    modeOptions
  };
}
