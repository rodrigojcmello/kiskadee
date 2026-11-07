'use client';

import type {
  ColorVariant,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import { componentScaleToSize } from '@kiskadee/core';
import { Button as KButton } from '@kiskadee/react-components/button';
import { Card } from '@kiskadee/react-components/card';
import { Layout } from '@kiskadee/react-components/layout';
import { useKiskadee, useSurfaceContext } from '@kiskadee/react-components/resources';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Switch } from '@kiskadee/react-components/switch';
import { Text } from '@kiskadee/react-components/text';
import React from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useButtonColorVariants } from '@/hooks/use-button-color-variants';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from '../Button.module.scss';
import { getButtonColorVariantSupport, qualifyButtonIntent } from './ButtonColorVariantControls';

const COMPARISON_EMPHASES: ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest'];

type ComparisonPresentation = {
  fontName: string;
  onVividSupported: boolean;
  radius: RadiusMode;
  scale?: ElementSizeValue;
  textAlign: 'left' | 'center';
};

function ContextComparisonContent({
  fontName,
  available,
  title,
  titleId,
  description,
  radius,
  scale,
  textAlign,
  colorVariant,
  onVariantChange
}: Omit<ComparisonPresentation, 'onVividSupported'> & {
  available: boolean;
  title: string;
  titleId: string;
  description: string;
  colorVariant: ColorVariant;
  onVariantChange: (variant: ColorVariant) => void;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const { segment, theme } = useKiskadee();
  const context = useSurfaceContext();
  const colorVariants = useButtonColorVariants();
  const supportsAlternative = (emphases: ComponentEmphasis[]) =>
    available &&
    getButtonColorVariantSupport({
      colorVariants,
      segment,
      theme,
      contexts: [context],
      intents: ['primary'],
      emphases
    });
  const alternativeAvailable = supportsAlternative(COMPARISON_EMPHASES);

  return (
    <div className={s['state-content']}>
      <header className={s.contextSurfaceHeader}>
        <div className={s['state-header']}>
          <Text
            as="h4"
            id={titleId}
            profile={textProfiles.subsectionTitle}
            className={s['state-title']}
          >
            {title}
          </Text>
          {showDescriptions ? (
            <Text
              as="p"
              profile={textProfiles.caption}
              emphasis="medium"
              className={s['state-description']}
            >
              {description}
            </Text>
          ) : null}
        </div>
        <Switch
          label="Alt"
          size="sm"
          emphasis="medium"
          disabled={!alternativeAvailable}
          controlState={alternativeAvailable && colorVariant === 'alternative'}
          onControlStateChange={(checked) => onVariantChange(checked ? 'alternative' : 'standard')}
        />
      </header>
      <div className={s.contextSurfaceGrid}>
        {available ? (
          COMPARISON_EMPHASES.map((emphasis) => (
            <KButton
              key={emphasis}
              intent={qualifyButtonIntent(
                'primary',
                supportsAlternative([emphasis]) ? colorVariant : 'standard'
              )}
              type="button"
              emphasis={emphasis}
              radius={radius}
              size={componentScaleToSize(scale)}
            >
              <KButton.Label>
                <SmoothText fontName={fontName} align={textAlign}>
                  {emphasis}
                </SmoothText>
              </KButton.Label>
            </KButton>
          ))
        ) : (
          <Text
            as="p"
            emphasis="lowest"
            profile={textProfiles.caption}
            className={s.contextUnavailable}
          >
            {title} is not available in this palette.
          </Text>
        )}
      </div>
    </div>
  );
}

export function SurfaceContextComparison({
  fontName,
  onVividSupported,
  radius,
  scale,
  surfaceContext,
  textAlign
}: ComparisonPresentation & {
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const [requestedVariants, setRequestedVariants] = React.useState<
    Record<SurfaceContext, ColorVariant>
  >({
    onSubtle: 'standard',
    onVivid: 'standard'
  });

  return (
    <section
      className={`${s.contextComparison} ${
        showDescriptions ? '' : s.contextComparisonWithoutDescription
      }`.trim()}
      aria-labelledby="surface-context-comparison-title"
    >
      <div className={s.contextComparisonHeader}>
        <Text as="h3" id="surface-context-comparison-title" profile={textProfiles.sectionTitle}>
          Surface contexts
        </Text>
        {showDescriptions ? (
          <Text as="p" profile={textProfiles.body}>
            Compare Primary button emphases on subtle and vivid surfaces. Use Alt to explore
            available color variants.
          </Text>
        ) : null}
      </div>
      <div className={s.contextComparisonGrid}>
        <article className={s.contextCard}>
          <ShowcaseExampleCard
            className={`${s.contextSurface} k-root`}
            context="onSubtle"
            role="group"
            aria-labelledby="button-context-on-subtle-title"
          >
            <ContextComparisonContent
              fontName={fontName}
              available
              title="On subtle"
              titleId="button-context-on-subtle-title"
              description="Primary actions on a subtle surface."
              radius={radius}
              scale={scale}
              textAlign={textAlign}
              colorVariant={requestedVariants.onSubtle}
              onVariantChange={(variant) =>
                setRequestedVariants((current) => ({ ...current, onSubtle: variant }))
              }
            />
          </ShowcaseExampleCard>
        </article>
        <article className={s.contextCard}>
          <Card
            className={`${s.contextSurface} k-root`}
            intent="primary"
            emphasis="highest"
            surfaceContext={surfaceContext}
            role="group"
            aria-labelledby="button-context-on-vivid-title"
          >
            <Layout padding="md">
              <ContextComparisonContent
                fontName={fontName}
                available={onVividSupported}
                title="On vivid"
                titleId="button-context-on-vivid-title"
                description="Primary actions on a vivid surface."
                radius={radius}
                scale={scale}
                textAlign={textAlign}
                colorVariant={requestedVariants.onVivid}
                onVariantChange={(variant) =>
                  setRequestedVariants((current) => ({ ...current, onVivid: variant }))
                }
              />
            </Layout>
          </Card>
        </article>
      </div>
    </section>
  );
}
