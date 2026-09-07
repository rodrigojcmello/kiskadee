'use client';

import type { CardRadiusMode } from '@kiskadee/core';
import { Card, Text, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Card.module.scss';

export function CardComposition({ radius }: { radius: CardRadiusMode }) {
  const { segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const background = useShowcaseBackground();
  const profiles = useShowcaseTextProfiles();
  const state = getManifestComponentState(manifest?.components?.card, segment, theme, 'onSubtle');
  const outerState = getManifestComponentState(
    manifest?.components?.card,
    segment,
    theme,
    background.surfaceContext
  );
  const available =
    outerState?.neutral?.low?.rest &&
    state?.neutral?.lowest?.rest &&
    state?.neutral?.medium?.rest &&
    state?.primary?.medium?.rest &&
    state?.primary?.highest?.rest;

  if (!available)
    return (
      <Text profile={profiles.body} emphasis="low">
        This composition requires base, neutral/primary medium and vivid Card surfaces.
      </Text>
    );

  return (
    <Card intent="neutral" emphasis="low" border radius={radius}>
      <div className={s.compositionGrid}>
        <Card
          intent="neutral"
          emphasis="lowest"
          border={false}
          radius={radius}
          className={s.compositionSidebar}
        >
          <div className={s.compositionSettings}>
            <Text profile={profiles.body}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Text>
          </div>
        </Card>
        <Card intent="primary" emphasis="medium" radius={radius} className={s.compositionTile}>
          <Text profile={profiles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>
        <Card intent="neutral" emphasis="medium" radius={radius} className={s.compositionTile}>
          <Text profile={profiles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>
        <Card intent="neutral" emphasis="medium" radius={radius} className={s.compositionWide}>
          <Text profile={profiles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>
        <Card intent="primary" emphasis="highest" radius={radius} className={s.compositionWide}>
          <Text profile={profiles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Card>
      </div>
    </Card>
  );
}
