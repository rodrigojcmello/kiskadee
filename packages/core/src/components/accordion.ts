import type { ElementStyle } from '../schema.ts';
import { type ComponentEmphasis, componentEmphasisBuckets } from '../types/colors/colors.types.ts';
import type { GrowHeightPresenceProfile } from '../types/effects/presence/presence.types.ts';

export type AccordionEmphasis = ComponentEmphasis;
export type AccordionIndicatorTransition = 'rotate' | 'crossfade' | 'none';
export type AccordionElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';
export type AccordionOptions = {
  themes: readonly ['light'];
  emphases: readonly AccordionEmphasis[];
  divider: boolean;
  indicatorTransition: AccordionIndicatorTransition;
};
export type AccordionComponent = {
  options: AccordionOptions;
  effects: { presence: { profile: 'grow-height' } };
  elements: {
    e1: { name: 'root' };
    e2: { name: 'item' };
    e3: {
      name: 'trigger';
      scales: Pick<
        NonNullable<ElementStyle['scales']>,
        'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
      >;
    };
    e4: { name: 'label'; typography: NonNullable<ElementStyle['typography']> };
    e5: {
      name: 'indicator';
      scales: Pick<NonNullable<ElementStyle['scales']>, 'boxWidth' | 'boxHeight'>;
    };
    e6: { name: 'panel' };
  };
};
export type ResolvedAccordionPresenceEffect = {
  profile: 'grow-height';
  profiles: { 'grow-height': GrowHeightPresenceProfile };
};

/** Keep composition slots free from re-authored Card/Container visual recipes. */
export function validateAccordionComponentContract(value: unknown): string[] {
  const issues: string[] = [];
  const record = (v: unknown): v is Record<string, any> =>
    Boolean(v && typeof v === 'object' && !Array.isArray(v));
  if (!record(value)) return ['components.accordion: expected object'];
  const allowed = (v: Record<string, unknown>, keys: string[], path: string) => {
    for (const key of Object.keys(v))
      if (!keys.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  };
  allowed(value, ['options', 'effects', 'elements'], 'components.accordion');
  if (
    !record(value.options) ||
    JSON.stringify(value.options.themes) !== '["light"]' ||
    !Array.isArray(value.options.emphases) ||
    value.options.emphases.length === 0 ||
    new Set(value.options.emphases).size !== value.options.emphases.length ||
    value.options.emphases.some(
      (emphasis: unknown) =>
        typeof emphasis !== 'string' || !Object.hasOwn(componentEmphasisBuckets, emphasis)
    ) ||
    typeof value.options.divider !== 'boolean' ||
    !['rotate', 'crossfade', 'none'].includes(value.options.indicatorTransition)
  )
    issues.push(
      'components.accordion.options: expected Light coverage, unique supported emphases and valid divider and indicatorTransition defaults'
    );
  else
    allowed(
      value.options,
      ['themes', 'emphases', 'divider', 'indicatorTransition'],
      'components.accordion.options'
    );
  if (
    !record(value.effects) ||
    !record(value.effects.presence) ||
    value.effects.presence.profile !== 'grow-height'
  )
    issues.push('components.accordion.effects.presence: expected grow-height');
  else {
    allowed(value.effects, ['presence'], 'components.accordion.effects');
    allowed(value.effects.presence, ['profile'], 'components.accordion.effects.presence');
  }
  if (!record(value.elements)) return [...issues, 'components.accordion.elements: expected object'];
  const slots = {
    e1: 'root',
    e2: 'item',
    e3: 'trigger',
    e4: 'label',
    e5: 'indicator',
    e6: 'panel'
  };
  allowed(value.elements, Object.keys(slots), 'components.accordion.elements');
  for (const [slot, name] of Object.entries(slots)) {
    const element = value.elements[slot];
    const path = `components.accordion.elements.${slot}`;
    if (!record(element) || element.name !== name) {
      issues.push(`${path}.name: expected ${name}`);
      continue;
    }
    allowed(
      element,
      [
        'name',
        ...(slot === 'e4' ? ['typography'] : slot === 'e3' || slot === 'e5' ? ['scales'] : [])
      ],
      path
    );
    if (slot === 'e4' && !record(element.typography)) issues.push(`${path}.typography: required`);
    if (slot === 'e3' || slot === 'e5') {
      const keys =
        slot === 'e3'
          ? ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
          : ['boxWidth', 'boxHeight'];
      if (!record(element.scales)) {
        issues.push(`${path}.scales: required`);
        continue;
      }
      allowed(element.scales, keys, `${path}.scales`);
      for (const key of keys) {
        const scale = element.scales[key];
        const number = record(scale) ? scale['s:md:1'] : scale;
        if (typeof number !== 'number' || !Number.isFinite(number) || number <= 0)
          issues.push(`${path}.scales.${key}: expected positive medium value`);
      }
    }
  }
  return issues;
}
