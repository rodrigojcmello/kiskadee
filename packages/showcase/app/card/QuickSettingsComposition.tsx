'use client';

import type { CardRadiusMode, ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
import { Button } from '@kiskadee/react-components/button';
import { Card } from '@kiskadee/react-components/card';
import { Container } from '@kiskadee/react-components/container';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import {
  resolveContentSurfaceContext,
  useComponentMetadata,
  useKiskadee
} from '@kiskadee/react-components/resources';
import { Separator } from '@kiskadee/react-components/separator';
import { Slider } from '@kiskadee/react-components/slider';
import { Text } from '@kiskadee/react-components/text';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './QuickSettingsComposition.module.scss';

const actions = [
  { label: 'Accessibility', icon: 'settings' },
  { label: 'Energy saver', icon: 'sun' },
  { label: 'Live captions', icon: 'smile' },
  { label: 'Night light', icon: 'sun' },
  { label: 'Nearby sharing', icon: 'share' },
  { label: 'Cast', icon: 'volume-high' }
] as const;

function pick(
  levels: Partial<Record<ComponentEmphasis, { rest?: unknown }>> | undefined,
  order: ComponentEmphasis[]
) {
  return order.find((emphasis) => levels?.[emphasis]?.rest);
}

type Panel = {
  label: string;
  intent: 'neutral' | 'primary';
  emphasis: ComponentEmphasis;
  footerIntent: 'neutral' | 'neutralComplementary' | 'primary' | 'primaryComplementary';
  footerEmphasis: ComponentEmphasis;
  actionButton: ButtonProfile;
  settingsButton: ButtonProfile;
  separatorEmphasis: ComponentEmphasis;
  footerSeparatorIntent: 'neutral' | 'primary';
};

type ButtonProfile = { intent: 'neutral' | 'primary'; emphasis: ComponentEmphasis };

function QuickSettingsPanel({ panel, radius }: { panel: Panel; radius: CardRadiusMode }) {
  const profiles = useShowcaseTextProfiles();
  const volume = (
    <Slider
      aria-label="Volume"
      defaultValue={65}
      min={0}
      max={100}
      step={1}
      marks={[
        { value: 0, icon: <FamilyResolvedIcon name="volume-low" /> },
        { value: 100, icon: <FamilyResolvedIcon name="volume-high" /> }
      ]}
      edgeMarks="exclude"
    />
  );

  return (
    <div className={s.variant}>
      <Text as="p" profile={profiles.caption} className={s.variantLabel}>
        {panel.label}
      </Text>
      <Card
        intent={panel.intent}
        emphasis={panel.emphasis}
        radius={radius}
        border
        shadow
        flushContent
        className={s.panel}
      >
        <div className={s.actions}>
          {actions.map(({ label, icon }) => (
            <div key={label} className={s.action}>
              <Button
                intent={panel.actionButton.intent}
                emphasis={panel.actionButton.emphasis}
                radius={radius}
                size="lg"
                aria-label={label}
                classNames={{ e1: s.actionButton }}
              >
                <Button.Icon>
                  <FamilyResolvedIcon name={icon} />
                </Button.Icon>
              </Button>
              <Text as="p" profile={profiles.body} className={s.actionLabel}>
                {label}
              </Text>
            </div>
          ))}
        </div>
        <Separator intent="neutral" emphasis={panel.separatorEmphasis} />
        <div className={s.volume}>{volume}</div>
        <Separator intent={panel.footerSeparatorIntent} emphasis={panel.separatorEmphasis} />
        <Container intent={panel.footerIntent} emphasis={panel.footerEmphasis} className={s.footer}>
          <Button
            intent={panel.settingsButton.intent}
            emphasis={panel.settingsButton.emphasis}
            aria-label="Settings"
          >
            <Button.Icon>
              <FamilyResolvedIcon name="settings" />
            </Button.Icon>
          </Button>
        </Container>
      </Card>
    </div>
  );
}

export function QuickSettingsComposition({ radius }: { radius: CardRadiusMode }) {
  const { segment, theme } = useKiskadee();
  const containerMetadata = useComponentMetadata('container');
  const cardMetadata = useComponentMetadata('card');
  const { manifest } = useShowcaseMetadata([
    'container',
    'card',
    'button',
    'separator',
    'slider',
    'text'
  ]);
  const profiles = useShowcaseTextProfiles();
  const background = useShowcaseBackground();
  const components = manifest?.components;
  const containerState = getManifestComponentState(
    components?.container,
    segment,
    theme,
    background.surfaceContext
  );
  const containerMap = containerMetadata?.contentSurfaceContext;
  const cardMap = cardMetadata?.contentSurfaceContext;

  if (!containerMap || !cardMap || !components?.slider) {
    return (
      <Text profile={profiles.body} emphasis="low">
        This composition requires Container, Card, Button, Separator and Slider recipes in the
        active preset.
      </Text>
    );
  }

  const containerOutput = (
    consumedSurfaceContext: SurfaceContext,
    intent: Panel['footerIntent'],
    emphasis: ComponentEmphasis
  ) =>
    resolveContentSurfaceContext({
      map: containerMap,
      segment,
      theme,
      consumedSurfaceContext,
      intent,
      emphasis
    });

  const pickBand = (intent: Panel['footerIntent'], order: ComponentEmphasis[]) => {
    for (const emphasis of order) {
      if (!containerState?.[intent]?.[emphasis]?.rest) continue;
      const output = containerOutput(background.surfaceContext, intent, emphasis);
      if (supportsManifestSurfaceContext(components?.text, segment, theme, output)) {
        return { intent, emphasis, output };
      }
    }
    return undefined;
  };
  const pickButton = (
    surfaceContext: SurfaceContext,
    order: ComponentEmphasis[],
    preferredIntent: ButtonProfile['intent'] = 'neutral'
  ): ButtonProfile | undefined => {
    const state = getManifestComponentState(components?.button, segment, theme, surfaceContext);
    const intents: ButtonProfile['intent'][] =
      preferredIntent === 'neutral' ? ['neutral', 'primary'] : ['primary', 'neutral'];
    for (const intent of intents) {
      const emphasis = pick(state?.[intent], order);
      if (emphasis) return { intent, emphasis };
    }
    return undefined;
  };

  const buildPanel = (
    label: string,
    intent: Panel['intent'],
    emphasis: ComponentEmphasis,
    consumedSurfaceContext: SurfaceContext
  ): Panel | undefined => {
    const cardState = getManifestComponentState(
      components?.card,
      segment,
      theme,
      consumedSurfaceContext
    );
    if (!cardState?.[intent]?.[emphasis]?.rest) return undefined;

    const panelOutput = resolveContentSurfaceContext({
      map: cardMap,
      segment,
      theme,
      consumedSurfaceContext,
      intent,
      emphasis
    });
    const separatorState = getManifestComponentState(
      components?.separator,
      segment,
      theme,
      panelOutput
    );
    const separatorEmphasis = pick(
      separatorState?.neutral,
      panelOutput === 'onVivid'
        ? ['medium', 'low', 'lowest', 'high', 'highest']
        : ['low', 'medium', 'lowest', 'high', 'highest']
    );
    const panelContainerState = getManifestComponentState(
      components?.container,
      segment,
      theme,
      panelOutput
    );
    if (
      !separatorEmphasis ||
      !supportsManifestSurfaceContext(components?.text, segment, theme, panelOutput)
    ) {
      return undefined;
    }
    const footerSeparatorIntent =
      panelOutput === 'onVivid' && separatorState?.primary?.[separatorEmphasis]?.rest
        ? 'primary'
        : 'neutral';

    const actionButton = pickButton(
      panelOutput,
      panelOutput === 'onVivid'
        ? ['medium', 'high', 'low', 'lowest', 'highest']
        : ['low', 'medium', 'high', 'lowest', 'highest']
    );
    if (!actionButton) return undefined;

    const footerIntents: Panel['footerIntent'][] =
      intent === 'neutral'
        ? ['neutralComplementary', 'neutral']
        : ['primaryComplementary', 'primary'];
    for (const footerIntent of footerIntents) {
      if (!panelContainerState?.[footerIntent]?.[emphasis]?.rest) continue;
      const footerOutput = containerOutput(panelOutput, footerIntent, emphasis);
      const settingsButton = pickButton(
        footerOutput,
        footerOutput === 'onVivid'
          ? ['medium', 'high', 'low', 'lowest', 'highest']
          : ['lowest', 'low', 'medium', 'high', 'highest'],
        actionButton.intent
      );
      if (settingsButton) {
        return {
          label,
          intent,
          emphasis,
          footerIntent,
          footerEmphasis: emphasis,
          actionButton,
          settingsButton,
          separatorEmphasis,
          footerSeparatorIntent
        };
      }
    }
    return undefined;
  };

  const vivid = background.surfaceContext === 'onVivid';
  const bandCandidates = vivid
    ? [pickBand('primaryComplementary', ['highest']), pickBand('primary', ['highest'])]
    : [pickBand('neutral', ['high', 'medium', 'low', 'lowest'])];
  let band: NonNullable<(typeof bandCandidates)[number]> | undefined;
  let panel: Panel | undefined;
  for (const candidate of bandCandidates) {
    if (!candidate) continue;
    const matchingPanel = vivid
      ? buildPanel('Vivid surface', 'primary', 'highest', candidate.output)
      : (['medium', 'low', 'lowest', 'high'] as const)
          .map((emphasis) => buildPanel('Neutral surface', 'neutral', emphasis, candidate.output))
          .find((item) => item !== undefined);
    if (matchingPanel) {
      band = candidate;
      panel = matchingPanel;
      break;
    }
  }

  if (!band || !panel) {
    return (
      <Text profile={profiles.body} emphasis="low">
        This composition requires Container, Card, Button, Separator and Slider recipes in the
        active preset.
      </Text>
    );
  }

  return (
    <Container
      intent={band.intent}
      emphasis={band.emphasis}
      surfaceContext={background.surfaceContext}
      className={s.band}
    >
      <div className={s.bandContent}>
        <QuickSettingsPanel panel={panel} radius={radius} />
      </div>
    </Container>
  );
}
