'use client';

import type { CardRadiusMode } from '@kiskadee/core';
import {
  Badge,
  Button,
  Card,
  Slider,
  Switch,
  Text,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import { useState } from 'react';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import s from './Card.module.scss';

export function CardComposition({ radius }: { radius: CardRadiusMode }) {
  const { segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const background = useShowcaseBackground();
  const profiles = useShowcaseTextProfiles();
  const [notifications, setNotifications] = useState(true);
  const [sync, setSync] = useState(false);
  const [selection, setSelection] = useState('Overview');
  const [activations, setActivations] = useState(0);
  const state = getManifestComponentState(manifest?.components?.card, segment, theme, 'onSubtle');
  const outerState = getManifestComponentState(
    manifest?.components?.card,
    segment,
    theme,
    background.surfaceContext
  );
  const buttonState = getManifestComponentState(
    manifest?.components?.button,
    segment,
    theme,
    'onSubtle'
  );
  const sliderState = getManifestComponentState(
    manifest?.components?.slider,
    segment,
    theme,
    'onSubtle'
  );
  const vividButtonState = getManifestComponentState(
    manifest?.components?.button,
    segment,
    theme,
    'onVivid'
  );
  const available =
    outerState?.neutral?.low?.rest &&
    state?.neutral?.lowest?.rest &&
    state?.neutral?.low?.rest &&
    state?.neutral?.medium?.rest &&
    state?.primary?.medium?.rest &&
    state?.primary?.highest?.rest &&
    buttonState?.primary?.high?.rest &&
    vividButtonState?.primary?.high?.rest;

  if (!available)
    return (
      <Text profile={profiles.body} emphasis="low">
        This composition requires base, light neutral, neutral/primary medium and vivid Card
        surfaces, plus Button in both contexts.
      </Text>
    );

  return (
    <Card intent="neutral" emphasis="low" radius={radius}>
      <div className={s.compositionGrid}>
        <Card
          intent="neutral"
          emphasis="lowest"
          border={false}
          radius={radius}
          className={s.compositionSidebar}
        >
          <div className={s.compositionSettings}>
            <Text profile={profiles.groupTitle}>Preferences</Text>
            {manifest?.components?.switch ? (
              <>
                <Switch
                  label="Notifications"
                  controlState={notifications}
                  onControlStateChange={setNotifications}
                />
                <Switch
                  label="Sync across devices"
                  controlState={sync}
                  onControlStateChange={setSync}
                />
              </>
            ) : null}
            {sliderState?.neutral?.medium?.rest ? (
              <Slider label="Volume" defaultValue={40} min={0} max={100} />
            ) : (
              <Text profile={profiles.caption} emphasis="low">
                Slider is not published for this theme.
              </Text>
            )}
            <Text profile={profiles.caption} emphasis="low">
              neutral.lowest
            </Text>
          </div>
        </Card>
        <Card intent="primary" emphasis="medium" radius={radius} className={s.compositionTile}>
          <div className={s.content}>
            <Text profile={profiles.groupTitle}>Workspace</Text>
            <section className={s.controlRow} aria-label="Workspace view">
              {['Overview', 'Activity'].map((item) => (
                <Button
                  key={item}
                  intent="primary"
                  emphasis="high"
                  toggle
                  controlState={selection === item}
                  onClick={() => setSelection(item)}
                >
                  <Button.Label>{item}</Button.Label>
                </Button>
              ))}
            </section>
            <Text profile={profiles.caption} emphasis="low">
              primary.medium · {selection}
            </Text>
          </div>
        </Card>
        <Card intent="neutral" emphasis="medium" radius={radius} className={s.compositionTile}>
          <div className={s.controlRow}>
            {manifest?.components?.badge ? (
              <Badge intent="primary" emphasis="high" radius="pill">
                MB
              </Badge>
            ) : null}
            <div className={s.content}>
              <Text profile={profiles.groupTitle}>Morgan Blake</Text>
              <Text profile={profiles.caption} emphasis="low">
                Product designer
              </Text>
              <Text profile={profiles.caption} emphasis="low">
                neutral.medium
              </Text>
            </div>
          </div>
        </Card>
        <Card intent="neutral" emphasis="low" radius={radius} className={s.compositionWide}>
          <div className={s.content}>
            <div className={s.controlRow}>
              {(['rest', 'hover', 'pressed'] as const).map((status) => (
                <Button
                  key={status}
                  intent="primary"
                  emphasis="high"
                  status={status === 'rest' ? undefined : status}
                  interactionLocked
                >
                  <Button.Label>
                    {status === 'rest' ? 'Rest' : status === 'hover' ? 'Hover' : 'Pressed'}
                  </Button.Label>
                </Button>
              ))}
            </div>
            <Text profile={profiles.caption} emphasis="low">
              neutral.low · Projected Button states
            </Text>
          </div>
        </Card>
        <Card intent="primary" emphasis="highest" radius={radius} className={s.compositionWide}>
          <div className={s.content}>
            <Text profile={profiles.groupTitle}>Ready to continue?</Text>
            <Button
              intent="primary"
              emphasis="high"
              onClick={() => setActivations((count) => count + 1)}
            >
              <Button.Label>Continue</Button.Label>
            </Button>
            <Text profile={profiles.caption} emphasis="low" role="status">
              {activations
                ? `Continued ${activations} times`
                : 'primary.highest · Content inherits onVivid'}
            </Text>
          </div>
        </Card>
      </div>
    </Card>
  );
}
