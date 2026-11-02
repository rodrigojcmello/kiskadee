'use client';

import {
  ButtonIntentKeys,
  type ButtonIntentValue,
  type ColorVariant,
  type ComponentEmphasis,
  parseButtonIntentValue,
  type SurfaceContext
} from '@kiskadee/core';
import { useKiskadee, useSurfaceContext } from '@kiskadee/react-components/resources';
import { Select } from '@kiskadee/react-components/select';
import type { ManifestComponent } from '@kiskadee/web-builder/types';
import { useButtonColorVariants } from '@/hooks/use-button-color-variants';
import styles from '../Button.module.scss';

const INTENTS = Object.keys(ButtonIntentKeys);
const EMPHASES: readonly ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest'];

type VariantSupportInput = {
  colorVariants: ManifestComponent['colorVariants'];
  segment: string;
  theme: string;
  contexts: readonly SurfaceContext[];
  intents?: readonly string[];
  emphases?: readonly ComponentEmphasis[];
};

/** Coverage is authoritative and local to the active palette and consumed surface. */
export function getButtonColorVariantSupport({
  colorVariants,
  segment,
  theme,
  contexts,
  intents = INTENTS,
  emphases = EMPHASES
}: VariantSupportInput): boolean {
  const coverage = colorVariants?.alternative?.[`${segment}.${theme}`];
  return contexts.some((context) =>
    intents.some((intent) =>
      emphases.some((emphasis) => coverage?.[context]?.[intent]?.includes(emphasis))
    )
  );
}

export function qualifyButtonIntent(
  intent: ButtonIntentValue,
  variant: ColorVariant
): ButtonIntentValue {
  const parsed = parseButtonIntentValue(intent);
  if (!parsed || parsed.intent.startsWith('brand.')) return intent;
  return variant === 'alternative' ? (`${parsed.intent}-alt` as ButtonIntentValue) : parsed.intent;
}

export function ButtonColorVariantControls({
  colorVariant,
  onColorVariantChange,
  contexts,
  intents,
  emphases
}: {
  colorVariant: ColorVariant;
  onColorVariantChange: (value: ColorVariant) => void;
  contexts?: readonly SurfaceContext[];
  intents?: readonly string[];
  emphases?: readonly ComponentEmphasis[];
}) {
  const { segment, theme } = useKiskadee();
  const ambientContext = useSurfaceContext();
  const colorVariants = useButtonColorVariants();
  const supported = getButtonColorVariantSupport({
    colorVariants,
    segment,
    theme,
    contexts: contexts ?? [ambientContext],
    intents,
    emphases
  });
  return (
    <div className={styles.colorVariantControls}>
      <Select
        label="Color variant"
        size="sm"
        sequential
        loop
        showDividers={false}
        value={supported ? colorVariant : 'standard'}
        onValueChange={(value) => {
          if (value === 'standard' || value === 'alternative') onColorVariantChange(value);
        }}
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'alternative', label: 'Alternative', disabled: !supported }
        ]}
      />
    </div>
  );
}
