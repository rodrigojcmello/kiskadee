'use client';

import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { Text, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useState } from 'react';
import {
  ShowcaseGlobalSemanticControls,
  ShowcaseIconographyControls,
  ShowcaseTypographyControls
} from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { supportsManifestSurfaceContext } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import { SocialButtonExamples } from '../button/components/SocialButtonExamples';

const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];

const BUTTON_SCALE_OPTIONS: Array<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:2', label: 'Small 2' },
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' },
  { value: 's:lg:2', label: 'Large 2' },
  { value: 's:lg:3', label: 'Large 3' }
];

export default function BrandButtonsPage() {
  const { segment, theme } = useKiskadee();
  const { fontName, manifest } = useShowcase();
  const canonicalBackgrounds = useCanonicalCardSurfaces();
  const textProfiles = useShowcaseTextProfiles();
  const { setShowDescriptions, showDescriptions } = useShowcaseDisplayPreferences();
  const [buttonScale, setButtonScale] = useState<ElementSizeValue>('s:md:1');
  const [surfaceContext, setSurfaceContext] = useState<SurfaceContext>('onSubtle');

  const buttonMeta = manifest?.components?.button;
  const examplesAvailable = ['auth', 'social'].every((pack) =>
    manifest?.brandPacks?.packs.includes(pack)
  );
  const onVividSupported = supportsManifestSurfaceContext(buttonMeta, segment, theme, 'onVivid');
  const activeSurfaceContext = onVividSupported ? surfaceContext : 'onSubtle';
  const availableButtonScaleOptions = BUTTON_SCALE_OPTIONS.filter(
    (option) => !buttonMeta?.scale || Boolean(buttonMeta.scale[option.value])
  );
  const activeButtonScale =
    availableButtonScaleOptions.find((option) => option.value === buttonScale)?.value ??
    availableButtonScaleOptions.find((option) => option.value === 's:md:1')?.value ??
    availableButtonScaleOptions[0]?.value ??
    's:md:1';
  const onSubtleBackground = canonicalBackgrounds.tones.find(
    (tone) => tone.contentSurfaceContext === 'onSubtle'
  )?.resolvedColor;
  const onVividBackground = canonicalBackgrounds.tones.find(
    (tone) => tone.contentSurfaceContext === 'onVivid'
  )?.resolvedColor;

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Ambiente">
        <ShowcaseGlobalSemanticControls />
        <ShowcaseSegmentedControl
          label="Surface context"
          options={SURFACE_CONTEXT_OPTIONS}
          value={activeSurfaceContext}
          onValueChange={(value) => setSurfaceContext(value as SurfaceContext)}
          disabled={!onVividSupported}
        />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconografia">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Visualização">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Button size"
            options={availableButtonScaleOptions}
            value={activeButtonScale}
            onValueChange={(value) => setButtonScale(value as ElementSizeValue)}
          />
          <ShowcaseBooleanControl
            label="Descrições"
            checked={showDescriptions}
            onCheckedChange={setShowDescriptions}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <section aria-labelledby="brand-buttons-title">
      <Text as="h2" id="brand-buttons-title" profile={textProfiles.pageTitle}>
        Brand buttons
      </Text>
      <ShowcaseRouteControls
        id="brand-buttons"
        eyebrow="Button"
        title="Brand controls"
        showGlobalControls={false}
      >
        {controls}
      </ShowcaseRouteControls>
      {examplesAvailable ? (
        <SocialButtonExamples
          fontName={fontName}
          iconRegionAvailable={Boolean(buttonMeta?.iconTreatments?.includes('surface'))}
          scale={activeButtonScale}
          onSubtleBackground={onSubtleBackground}
          onVividBackground={onVividBackground}
          surfaceContext={activeSurfaceContext}
        />
      ) : (
        <Text as="p" profile={textProfiles.body} role="status">
          Brand button examples are unavailable because this Design System does not publish both
          Auth and Social Brand Packs.
        </Text>
      )}
    </section>
  );
}
