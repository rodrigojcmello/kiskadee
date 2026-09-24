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
  faceEmphasis: ComponentEmphasis;
  actionButton: ButtonProfile;
  settingsButton: ButtonProfile;
  separatorEmphasis: ComponentEmphasis;
};

type ButtonProfile = { intent: 'neutral' | 'primary'; emphasis: ComponentEmphasis };

function QuickSettingsPanel({ panel, radius }: { panel: Panel; radius: CardRadiusMode }) {
  const profiles = useShowcaseTextProfiles();

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
              <Container intent="neutral" emphasis={panel.faceEmphasis} className={s.buttonSurface}>
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
              </Container>
              <Text as="p" profile={profiles.body} className={s.actionLabel}>
                {label}
              </Text>
            </div>
          ))}
        </div>
        <Separator emphasis={panel.separatorEmphasis} />
        <div className={s.volume}>
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
        </div>
        <Separator emphasis={panel.separatorEmphasis} />
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
  const components = manifest?.components;
  const containerState = getManifestComponentState(components?.container, segment, theme);
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

  const pickBand = (intent: 'neutral' | 'primary', order: ComponentEmphasis[]) => {
    for (const emphasis of order) {
      if (!containerState?.[intent]?.[emphasis]?.rest) continue;
      const output = containerOutput('onSubtle', intent, emphasis);
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
    const separatorEmphasis = pick(separatorState?.neutral, [
      'low',
      'medium',
      'lowest',
      'high',
      'highest'
    ]);
    const panelContainerState = getManifestComponentState(
      components?.container,
      segment,
      theme,
      panelOutput
    );
    const faceEmphasis = pick(panelContainerState?.neutral, [
      'low',
      'lowest',
      'medium',
      'high',
      'highest'
    ]);
    if (
      !separatorEmphasis ||
      !faceEmphasis ||
      !supportsManifestSurfaceContext(components?.slider, segment, theme, panelOutput) ||
      !supportsManifestSurfaceContext(components?.text, segment, theme, panelOutput)
    ) {
      return undefined;
    }

    const faceOutput = containerOutput(panelOutput, 'neutral', faceEmphasis);
    const actionButton = pickButton(faceOutput, ['low', 'medium', 'lowest', 'high', 'highest']);
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
        ['lowest', 'low', 'medium', 'high', 'highest'],
        actionButton.intent
      );
      if (settingsButton) {
        return {
          label,
          intent,
          emphasis,
          footerIntent,
          footerEmphasis: emphasis,
          faceEmphasis,
          actionButton,
          settingsButton,
          separatorEmphasis
        };
      }
    }
    return undefined;
  };

  const bandCandidates = [
    pickBand('primary', ['highest']),
    pickBand('neutral', ['high', 'medium', 'low', 'lowest', 'highest'])
  ];
  let band: NonNullable<(typeof bandCandidates)[number]> | undefined;
  let neutralPanel: Panel | undefined;
  for (const candidate of bandCandidates) {
    if (!candidate) continue;
    const panel = (['medium', 'low', 'lowest', 'high', 'highest'] as const)
      .map((emphasis) => buildPanel('Neutral surface', 'neutral', emphasis, candidate.output))
      .find((item) => item !== undefined);
    if (panel) {
      band = candidate;
      neutralPanel = panel;
      break;
    }
  }

  if (!band || !neutralPanel) {
    return (
      <Text profile={profiles.body} emphasis="low">
        This composition requires Container, Card, Button, Separator and Slider recipes in the
        active preset.
      </Text>
    );
  }

  const panels: Panel[] = [neutralPanel];
  const vividPanel = buildPanel('Vivid surface', 'primary', 'highest', band.output);
  if (vividPanel) panels.push(vividPanel);

  return (
    <Container
      intent={band.intent}
      emphasis={band.emphasis}
      surfaceContext="onSubtle"
      className={s.band}
    >
      <div className={s.bandContent}>
        {panels.map((item) => (
          <QuickSettingsPanel key={item.intent} panel={item} radius={radius} />
        ))}
      </div>
    </Container>
  );
}
