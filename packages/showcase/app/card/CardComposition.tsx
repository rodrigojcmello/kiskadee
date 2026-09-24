'use client';

import type { CardRadiusMode, ComponentEmphasis } from '@kiskadee/core';
import { Card } from '@kiskadee/react-components/card';
import { Container } from '@kiskadee/react-components/container';
import {
  resolveContentSurfaceContext,
  useComponentMetadata,
  useKiskadee
} from '@kiskadee/react-components/resources';
import { Separator } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Card.module.scss';

export function CardComposition({ radius }: { radius: CardRadiusMode }) {
  const { segment, theme } = useKiskadee();
  const containerMetadata = useComponentMetadata('container');
  const cardMetadata = useComponentMetadata('card');
  const { manifest } = useShowcaseMetadata(['card', 'container', 'separator', 'text']);
  const background = useShowcaseBackground();
  const profiles = useShowcaseTextProfiles();
  const outerState = getManifestComponentState(
    manifest?.components?.container,
    segment,
    theme,
    background.surfaceContext
  );
  const outerOutput = containerMetadata?.contentSurfaceContext
    ? resolveContentSurfaceContext({
        map: containerMetadata.contentSurfaceContext,
        segment,
        theme,
        consumedSurfaceContext: background.surfaceContext,
        intent: 'neutral',
        emphasis: 'low'
      })
    : undefined;
  const state = outerOutput
    ? getManifestComponentState(manifest?.components?.card, segment, theme, outerOutput)
    : undefined;
  const separatorState = outerOutput
    ? getManifestComponentState(manifest?.components?.separator, segment, theme, outerOutput)
    : undefined;
  const separatorEmphasis = (['low', 'medium', 'lowest', 'high', 'highest'] as const).find(
    (emphasis) => separatorState?.neutral?.[emphasis]?.rest
  );
  const supportingIntent = state?.support?.medium?.rest ? 'support' : 'neutral';
  const cardSurfaces: Array<{
    intent: 'neutral' | 'primary' | 'support';
    emphasis: ComponentEmphasis;
  }> = [
    { intent: 'neutral', emphasis: 'lowest' },
    { intent: 'primary', emphasis: 'medium' },
    { intent: supportingIntent, emphasis: 'medium' },
    { intent: 'neutral', emphasis: 'medium' },
    { intent: 'primary', emphasis: 'highest' }
  ];
  const textAvailable = Boolean(
    outerOutput &&
      cardMetadata?.contentSurfaceContext &&
      cardSurfaces.every(({ intent, emphasis }) =>
        supportsManifestSurfaceContext(
          manifest?.components?.text,
          segment,
          theme,
          resolveContentSurfaceContext({
            map: cardMetadata.contentSurfaceContext,
            segment,
            theme,
            consumedSurfaceContext: outerOutput,
            intent,
            emphasis
          })
        )
      )
  );
  const available =
    outerState?.neutral?.low?.rest &&
    separatorEmphasis &&
    textAvailable &&
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
    <Container intent="neutral" emphasis="low" className={s.compositionBand}>
      <Separator emphasis={separatorEmphasis} />
      <div className={s.compositionInner}>
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
          <Card
            intent={supportingIntent}
            emphasis="medium"
            radius={radius}
            className={s.compositionTile}
          >
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
      </div>
      <Separator emphasis={separatorEmphasis} />
    </Container>
  );
}
