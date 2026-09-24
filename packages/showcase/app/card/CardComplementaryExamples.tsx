'use client';

import type { CardRadiusMode, ComponentEmphasis } from '@kiskadee/core';
import { Card } from '@kiskadee/react-components/card';
import { Container } from '@kiskadee/react-components/container';
import {
  resolveContentSurfaceContext,
  useComponentMetadata,
  useKiskadee
} from '@kiskadee/react-components/resources';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Card.module.scss';

type SurfacePair = {
  baseIntent: 'neutral' | 'primary';
  complementaryIntent: 'neutralComplementary' | 'primaryComplementary';
  emphasis: ComponentEmphasis;
};

const families: Array<Pick<SurfacePair, 'baseIntent' | 'complementaryIntent'>> = [
  { baseIntent: 'neutral', complementaryIntent: 'neutralComplementary' },
  { baseIntent: 'primary', complementaryIntent: 'primaryComplementary' }
];

const emphases: ComponentEmphasis[] = ['lowest', 'low', 'medium', 'high', 'highest'];

function pairLabel({ baseIntent, complementaryIntent, emphasis }: SurfacePair) {
  return `${baseIntent}.${emphasis} + ${complementaryIntent}.${emphasis}`;
}

function pairTitle({ baseIntent, emphasis }: SurfacePair) {
  return `${baseIntent === 'neutral' ? 'Neutral' : 'Primary'} · ${emphasis}`;
}

export function CardComplementaryExamples({ radius }: { radius: CardRadiusMode }) {
  const { segment, theme } = useKiskadee();
  const containerMetadata = useComponentMetadata('container');
  const cardMetadata = useComponentMetadata('card');
  const { manifest } = useShowcaseMetadata(['container', 'card', 'text']);
  const background = useShowcaseBackground();
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const components = manifest?.components;
  const containerMap = containerMetadata?.contentSurfaceContext;
  const cardMap = cardMetadata?.contentSurfaceContext;

  if (!containerMap || !cardMap) return null;

  const allPairs: SurfacePair[] = families.flatMap(({ baseIntent, complementaryIntent }) =>
    emphases.map((emphasis) => ({ baseIntent, complementaryIntent, emphasis }))
  );
  const containerState = getManifestComponentState(
    components?.container,
    segment,
    theme,
    background.surfaceContext
  );
  const cardState = getManifestComponentState(
    components?.card,
    segment,
    theme,
    background.surfaceContext
  );
  const sectionContext = containerState?.neutral?.lowest?.rest
    ? resolveContentSurfaceContext({
        map: containerMap,
        segment,
        theme,
        consumedSurfaceContext: background.surfaceContext,
        intent: 'neutral',
        emphasis: 'lowest'
      })
    : undefined;
  const sectionCardState = sectionContext
    ? getManifestComponentState(components?.card, segment, theme, sectionContext)
    : undefined;

  const standalone = allPairs.filter(({ complementaryIntent, emphasis }) => {
    if (!containerState?.[complementaryIntent]?.[emphasis]?.rest) return false;
    const produced = resolveContentSurfaceContext({
      map: containerMap,
      segment,
      theme,
      consumedSurfaceContext: background.surfaceContext,
      intent: complementaryIntent,
      emphasis
    });
    return supportsManifestSurfaceContext(components?.text, segment, theme, produced);
  });

  const compositions = allPairs.filter(({ baseIntent, complementaryIntent, emphasis }) => {
    if (!sectionContext) return false;
    if (!sectionCardState?.[baseIntent]?.[emphasis]?.rest) return false;
    const baseOutput = resolveContentSurfaceContext({
      map: cardMap,
      segment,
      theme,
      consumedSurfaceContext: sectionContext,
      intent: baseIntent,
      emphasis
    });
    const nestedState = getManifestComponentState(
      components?.container,
      segment,
      theme,
      baseOutput
    );
    if (
      !nestedState?.[complementaryIntent]?.[emphasis]?.rest ||
      !supportsManifestSurfaceContext(components?.text, segment, theme, baseOutput)
    ) {
      return false;
    }
    const complementaryOutput = resolveContentSurfaceContext({
      map: containerMap,
      segment,
      theme,
      consumedSurfaceContext: baseOutput,
      intent: complementaryIntent,
      emphasis
    });
    return supportsManifestSurfaceContext(components?.text, segment, theme, complementaryOutput);
  });

  if (!standalone.length && !compositions.length) return null;

  return (
    <>
      {standalone.length ? (
        <section className={s.exampleSection} aria-labelledby="card-complementary-surfaces">
          <header className={s.sectionHeader}>
            <Text as="h3" id="card-complementary-surfaces" profile={profiles.sectionTitle}>
              Complementary surfaces
            </Text>
            {showDescriptions ? (
              <Text as="p" profile={profiles.body} className={s.description}>
                A complementary intent can paint its own Card or Container. Its emphasis names the
                base it is recommended to accompany, without restricting where you use it.
              </Text>
            ) : null}
          </header>
          <div className={s.complementaryGrid}>
            {standalone.map((sample) => (
              <div className={s.complementaryExample} key={pairLabel(sample)}>
                <Text as="h4" profile={profiles.bodyStrong}>
                  {sample.complementaryIntent}.{sample.emphasis}
                </Text>
                {cardState?.[sample.complementaryIntent]?.[sample.emphasis]?.rest ? (
                  <Card
                    intent={sample.complementaryIntent}
                    emphasis={sample.emphasis}
                    radius={radius}
                    surfaceContext={background.surfaceContext}
                    border
                    shadow
                    className={s.complementarySurface}
                  >
                    <Text as="span" profile={profiles.groupTitle}>
                      Complementary surface
                    </Text>
                    <Text as="span" profile={profiles.caption} emphasis="low">
                      Suggested for {sample.baseIntent}.{sample.emphasis}
                    </Text>
                  </Card>
                ) : (
                  <Container
                    intent={sample.complementaryIntent}
                    emphasis={sample.emphasis}
                    surfaceContext={background.surfaceContext}
                    className={s.complementarySurface}
                  >
                    <Text as="span" profile={profiles.groupTitle}>
                      Complementary surface
                    </Text>
                    <Text as="span" profile={profiles.caption} emphasis="low">
                      Suggested for {sample.baseIntent}.{sample.emphasis}
                    </Text>
                  </Container>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {compositions.length ? (
        <Container
          intent="neutral"
          emphasis="lowest"
          surfaceContext={background.surfaceContext}
          className={s.compositionBand}
        >
          <section
            className={`${s.exampleSection} ${s.compositionInner}`}
            aria-labelledby="card-complementary-pairs"
          >
            <header className={s.sectionHeader}>
              <Text as="h3" id="card-complementary-pairs" profile={profiles.sectionTitle}>
                Base and complementary surfaces
              </Text>
              {showDescriptions ? (
                <Text as="p" profile={profiles.body} className={s.description}>
                  A Card keeps the base surface, while an inner Container paints a header or footer.
                  These are suggested pairings, not nesting rules.
                </Text>
              ) : null}
            </header>
            <div className={s.complementaryCompositionGrid}>
              {compositions.map((sample) => {
                const placement = sample.emphasis === 'low' ? 'header' : 'footer';
                const band = (
                  <Container
                    intent={sample.complementaryIntent}
                    emphasis={sample.emphasis}
                    className={s.complementaryBand}
                  >
                    <Text as="span" profile={profiles.groupTitle}>
                      {placement === 'header' ? 'Header' : 'Footer'}
                    </Text>
                    <Text as="span" profile={profiles.caption} emphasis="low">
                      {sample.complementaryIntent}.{sample.emphasis}
                    </Text>
                  </Container>
                );

                return (
                  <div
                    className={`${s.complementaryExample} ${
                      sample.baseIntent === 'neutral' && sample.emphasis === 'low'
                        ? s.complementaryNeutralLow
                        : sample.baseIntent === 'neutral' && sample.emphasis === 'medium'
                          ? s.complementaryNeutralMedium
                          : sample.baseIntent === 'primary' && sample.emphasis === 'low'
                            ? s.complementaryPrimaryLow
                            : sample.baseIntent === 'primary' && sample.emphasis === 'medium'
                              ? s.complementaryPrimaryMedium
                              : sample.baseIntent === 'primary' && sample.emphasis === 'highest'
                                ? s.complementaryPrimaryHighest
                                : ''
                    }`}
                    key={pairLabel(sample)}
                  >
                    <Text as="h4" profile={profiles.bodyStrong}>
                      {pairTitle(sample)}
                    </Text>
                    <Card
                      intent={sample.baseIntent}
                      emphasis={sample.emphasis}
                      radius={radius}
                      border={!(sample.baseIntent === 'primary' && sample.emphasis === 'highest')}
                      shadow={false}
                      flushContent
                      className={s.complementaryPairCard}
                    >
                      {placement === 'header' ? band : null}
                      <div className={s.complementaryBody}>
                        <Text as="span" profile={profiles.groupTitle}>
                          Main content
                        </Text>
                        <Text as="span" profile={profiles.body}>
                          {sample.baseIntent}.{sample.emphasis} remains the Card background.
                        </Text>
                      </div>
                      {placement === 'footer' ? band : null}
                    </Card>
                  </div>
                );
              })}
            </div>
          </section>
        </Container>
      ) : null}
    </>
  );
}
