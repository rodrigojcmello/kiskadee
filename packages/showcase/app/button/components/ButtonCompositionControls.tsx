'use client';

import {
  ButtonIntentKeys,
  type ButtonIntentValue,
  type ButtonSelectionEmphasis,
  type ComponentEmphasis,
  parseButtonIntentValue,
  type RadiusMode,
  type SurfaceContext,
  type SystemButtonIntent,
  type SystemButtonIntentValue,
  surfaceContextBuckets
} from '@kiskadee/core';
import type { ButtonArtifactConfig } from '@kiskadee/react-components/button';
import { Container } from '@kiskadee/react-components/container';
import { Layout } from '@kiskadee/react-components/layout';
import { useKiskadee } from '@kiskadee/react-components/resources';
import { Separator } from '@kiskadee/react-components/separator';
import { useState } from 'react';
import { ShowcaseContentSelectControl } from '@/components/ShowcaseControls';
import { useButtonColorVariantMetadata } from '@/hooks/use-button-color-variants';
import { ButtonSelectionEmphasisControl } from './ButtonSelectionEmphasisControl';

type CompositionIntent = SystemButtonIntentValue | 'original';
type CompositionSelectionIntent = SystemButtonIntentValue | 'same';

type CompositionDefaults = {
  intent?: CompositionIntent;
  emphasis?: ComponentEmphasis;
  selectionIntent?: CompositionSelectionIntent;
  selectionEmphasis?: ButtonSelectionEmphasis;
};

type CompositionControlsProps = {
  intent: CompositionIntent;
  intentOptions: Array<{ value: SystemButtonIntentValue; label: string }>;
  selectionIntentOptions: Array<{ value: SystemButtonIntentValue; label: string }>;
  allowOriginalIntent: boolean;
  onIntentChange: (value: CompositionIntent) => void;
  emphasis: ComponentEmphasis;
  onEmphasisChange: (value: ComponentEmphasis) => void;
  selectionIntent: CompositionSelectionIntent;
  onSelectionIntentChange: (value: CompositionSelectionIntent) => void;
  selectionEmphasis: ButtonSelectionEmphasis;
  onSelectionEmphasisChange: (value: ButtonSelectionEmphasis) => void;
  descriptionId?: string;
  radiusControl?: {
    value: RadiusMode;
    onValueChange: (value: RadiusMode) => void;
  };
};

export function useButtonCompositionControls(
  classesMap: ButtonArtifactConfig['buttonClassesMap'],
  defaults: CompositionDefaults = {},
  surfaceContext: SurfaceContext = 'onSubtle'
) {
  const { segment, theme } = useKiskadee();
  const metadata = useButtonColorVariantMetadata();
  const colorVariants = metadata?.capabilities?.colorVariants;
  const [requestedIntent, setRequestedIntent] = useState<CompositionIntent>(
    defaults.intent ?? 'neutral'
  );
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>(defaults.emphasis ?? 'low');
  const [requestedSelectionIntent, setRequestedSelectionIntent] =
    useState<CompositionSelectionIntent>(defaults.selectionIntent ?? 'primary');
  const [selectionEmphasis, setSelectionEmphasis] = useState<ButtonSelectionEmphasis>(
    defaults.selectionEmphasis ?? 'lowest'
  );
  const standardCoverage = colorVariants?.standard?.[`${segment}.${theme}`]?.[surfaceContext];
  const standardClasses = classesMap?.e1?.c?.[surfaceContextBuckets[surfaceContext]]?.s;
  const publishedIntents = (Object.keys(ButtonIntentKeys) as SystemButtonIntent[]).filter(
    (intent) =>
      Boolean(
        standardCoverage?.[intent]?.length ||
          Object.values(standardClasses?.[intent] ?? {}).some(Boolean)
      )
  );
  const coverage = colorVariants?.alternative?.[`${segment}.${theme}`]?.[surfaceContext];
  const optionsFor = (level: ComponentEmphasis): SystemButtonIntentValue[] =>
    (Object.keys(ButtonIntentKeys) as SystemButtonIntent[]).flatMap((intent) => [
      ...(publishedIntents.includes(intent) ? [intent] : []),
      ...(coverage?.[intent]?.includes(level) ? [`${intent}-alt` as SystemButtonIntentValue] : [])
    ]);
  const baseOptions = optionsFor(emphasis);
  const selectionOptions = optionsFor(
    selectionEmphasis === 'medium' || selectionEmphasis === 'high' ? 'high' : emphasis
  );
  const allowOriginalIntent = defaults.intent === 'original';
  const fallback =
    publishedIntents.find((value) => value === 'neutral') ?? publishedIntents[0] ?? 'neutral';
  const normalizeAvailable = (
    value: SystemButtonIntentValue,
    options: readonly SystemButtonIntentValue[]
  ) =>
    options.includes(value)
      ? value
      : publishedIntents.includes(parseButtonIntentValue(value)?.intent as SystemButtonIntent)
        ? (parseButtonIntentValue(value)!.intent as SystemButtonIntent)
        : fallback;
  const intent =
    requestedIntent === 'original' && allowOriginalIntent
      ? requestedIntent
      : requestedIntent !== 'original'
        ? normalizeAvailable(requestedIntent, baseOptions)
        : fallback;
  const selectionIntent =
    requestedSelectionIntent === 'same'
      ? 'same'
      : selectionOptions.includes(requestedSelectionIntent)
        ? requestedSelectionIntent
        : publishedIntents.includes(
              parseButtonIntentValue(requestedSelectionIntent)?.intent as SystemButtonIntent
            )
          ? (parseButtonIntentValue(requestedSelectionIntent)!.intent as SystemButtonIntent)
          : 'same';
  const formatOptions = (values: readonly SystemButtonIntentValue[]) =>
    values.map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace('-alt', ' alt')
    }));

  return {
    controls: {
      intent,
      intentOptions: formatOptions(baseOptions),
      selectionIntentOptions: formatOptions(selectionOptions),
      allowOriginalIntent,
      onIntentChange: setRequestedIntent,
      emphasis,
      onEmphasisChange: setEmphasis,
      selectionIntent,
      onSelectionIntentChange: setRequestedSelectionIntent,
      selectionEmphasis,
      onSelectionEmphasisChange: setSelectionEmphasis
    } satisfies CompositionControlsProps,
    buttonProps(originalIntent: ButtonIntentValue = 'neutral') {
      const baseIntent = intent === 'original' ? originalIntent : intent;
      return {
        intent: baseIntent,
        emphasis,
        selectionIntent: selectionIntent === 'same' ? baseIntent : selectionIntent,
        selectionEmphasis
      };
    }
  };
}

export function ButtonCompositionControls({
  intent,
  intentOptions,
  selectionIntentOptions,
  allowOriginalIntent,
  onIntentChange,
  emphasis,
  onEmphasisChange,
  selectionIntent,
  onSelectionIntentChange,
  selectionEmphasis,
  onSelectionEmphasisChange,
  descriptionId,
  radiusControl
}: CompositionControlsProps) {
  return (
    <>
      <Container intent="neutralComplementary" emphasis="low">
        <Layout
          padding="md"
          gap="md"
          display="grid"
          columns={{ 'bp:all': 1, 'bp:lg:1': radiusControl ? 5 : 4 }}
          align="center"
          justify="end"
        >
          <ShowcaseContentSelectControl
            label="Button intent"
            size="sm"
            variant="sequential"
            loop
            aria-describedby={descriptionId}
            value={intent}
            onValueChange={(value) => onIntentChange(value as CompositionIntent)}
            options={[
              ...(allowOriginalIntent ? [{ value: 'original', label: 'Original' }] : []),
              ...intentOptions
            ]}
            width="100%"
            maxWidth="100%"
          />
          <ShowcaseContentSelectControl
            label="Emphasis"
            size="sm"
            variant="sequential"
            loop
            aria-describedby={descriptionId}
            value={emphasis}
            onValueChange={(value) => onEmphasisChange(value as ComponentEmphasis)}
            options={[
              { value: 'lowest', label: 'Lowest' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
            width="100%"
            maxWidth="100%"
          />
          <ShowcaseContentSelectControl
            label="Selection intent"
            size="sm"
            variant="sequential"
            loop
            aria-describedby={descriptionId}
            value={selectionIntent}
            onValueChange={(value) => onSelectionIntentChange(value as CompositionSelectionIntent)}
            options={[{ value: 'same', label: 'Same as button' }, ...selectionIntentOptions]}
            width="100%"
            maxWidth="100%"
          />
          <ButtonSelectionEmphasisControl
            width="100%"
            size="sm"
            sequential
            loop
            descriptionId={descriptionId}
            value={selectionEmphasis}
            onValueChange={onSelectionEmphasisChange}
          />
          {radiusControl ? (
            <ShowcaseContentSelectControl
              label="Radius"
              size="sm"
              variant="sequential"
              loop
              aria-describedby={descriptionId}
              value={radiusControl.value}
              onValueChange={(value) => radiusControl.onValueChange(value as RadiusMode)}
              options={[
                { value: 'rounded', label: 'Rounded' },
                { value: 'pill', label: 'Pill' },
                { value: 'square', label: 'Square' }
              ]}
              width="100%"
              maxWidth="100%"
            />
          ) : null}
        </Layout>
      </Container>
      <Separator intent="neutral" emphasis="low" />
    </>
  );
}
