export type StructuralSchemaFallbackDebt = {
  file: string;
  variable: string;
  count: number;
  justification: string;
};

/**
 * Existing schema-owned CSS variable fallbacks are tracked as debt, not precedent.
 * Any count increase must be reviewed and explicitly recorded here before it can pass CI.
 */
export const STRUCTURAL_SCHEMA_FALLBACK_DEBT: readonly StructuralSchemaFallbackDebt[] = [
  {
    file: 'components/BottomSheet/BottomSheet.structural.scss',
    variable: '--k-bxh',
    count: 1,
    justification: 'Legacy handle geometry remains outside the icon-slot migration.'
  },
  {
    file: 'components/BottomSheet/BottomSheet.structural.scss',
    variable: '--k-bxw',
    count: 2,
    justification: 'Legacy handle and separator geometry remain outside the icon-slot migration.'
  },
  ...(['--k-pdb', '--k-pdt'] as const).map((variable) => ({
    file: 'components/BottomSheet/BottomSheet.structural.scss',
    variable,
    count: 1,
    justification: 'Optional body spacing remains existing structural debt.'
  })),
  ...(['--k-pdl', '--k-pdr'] as const).map((variable) => ({
    file: 'components/BottomSheet/BottomSheet.structural.scss',
    variable,
    count: 3,
    justification: 'Optional item and metadata spacing remains existing structural debt.'
  })),
  {
    file: 'components/Button/effects/activation-feedback/ButtonActivationFeedback.structural.scss',
    variable: '--k-bdr',
    count: 1,
    justification: 'Effect clipping remains existing runtime-owned structural debt.'
  },
  ...(['--k-pdl', '--k-pdr'] as const).map((variable) => ({
    file: 'components/Dropdown/Dropdown.structural.scss',
    variable,
    count: 1,
    justification: 'Optional end-text spacing remains existing structural debt.'
  })),
  ...(
    [
      ['--k-bdw', 1],
      ['--k-bxh', 4],
      ['--k-bxw', 2],
      ['--k-mgb', 3],
      ['--k-mgl', 4],
      ['--k-mgr', 1],
      ['--k-mgt', 5],
      ['--k-pdb', 1],
      ['--k-pdl', 1],
      ['--k-pdt', 2]
    ] as const
  ).map(([variable, count]) => ({
    file: 'components/Slider/Slider.structural.scss',
    variable,
    count,
    justification: 'Legacy optional Slider layout geometry remains outside the icon-slot migration.'
  })),
  ...(
    [
      ['--k-bdr', 2],
      ['--k-bdw', 5],
      ['--k-bxw', 1],
      ['--k-pdb', 1],
      ['--k-pdl', 3],
      ['--k-pdr', 3],
      ['--k-pdt', 1]
    ] as const
  ).map(([variable, count]) => ({
    file: 'components/Switch/Switch.structural.scss',
    variable,
    count,
    justification: 'Legacy track and thumb geometry remains outside the icon-slot migration.'
  })),
  ...[
    'floating-inside/TextField.floating-inside.structural.scss',
    'floating-notched/TextField.floating-notched.structural.scss',
    'standard-borderless/TextField.standard-borderless.structural.scss',
    'standard-outline/TextField.standard-outline.structural.scss',
    'standard-underline/TextField.standard-underline.structural.scss'
  ].flatMap((file) =>
    (['--k-bdr', '--k-mgl'] as const).map((variable) => ({
      file: `components/TextField/${file}`,
      variable,
      count: 1,
      justification: 'Legacy TextField label offset remains existing structural debt.'
    }))
  )
];
