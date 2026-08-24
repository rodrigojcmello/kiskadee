'use client';

import type { ChipEmphasis, ChipIntent, ChipScale, RadiusMode } from '@kiskadee/core';
import {
  Badge,
  Chip,
  EssentialIconProvider,
  FamilyResolvedIcon,
  Text,
  useShowcase
} from '@kiskadee/react-components';
import { useState } from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Chip.module.scss';

export default function ChipShowcase() {
  const { manifest } = useShowcase();
  const profiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.chip);
  const [intent, setIntent] = useState<ChipIntent>('neutral');
  const [emphasis, setEmphasis] = useState<ChipEmphasis>('medium');
  const [scale, setScale] = useState<ChipScale>('s:md:1');
  const [radius, setRadius] = useState<Extract<RadiusMode, 'rounded' | 'pill'>>('rounded');
  const [disabled, setDisabled] = useState(false);
  const [controlled, setControlled] = useState(true);
  const [items, setItems] = useState(['Marketing', 'Product']);

  return (
    <main className={styles.page}>
      <Text as="h2" profile={profiles.pageTitle}>
        Chip
      </Text>
      <Text as="p" profile={profiles.body} className={styles.lead}>
        Entity and filter values with explicit static, selectable and removable compositions.
      </Text>
      <ShowcaseRouteControls id="chip" eyebrow="Chip" title="Controls" isAvailable={available}>
        <ShowcaseControlPanel>
          <ShowcaseControlGroup title="Presentation">
            <ShowcaseControlStack>
              <ShowcaseSelectControl
                label="Intent"
                options={['neutral', 'primary'].map((value) => ({ value, label: value }))}
                value={intent}
                onValueChange={(value) => setIntent(value as ChipIntent)}
              />
              <ShowcaseSelectControl
                label="Emphasis"
                options={['high', 'medium', 'low', 'lowest'].map((value) => ({
                  value,
                  label: value
                }))}
                value={emphasis}
                onValueChange={(value) => setEmphasis(value as ChipEmphasis)}
              />
              <ShowcaseSelectControl
                label="Scale"
                options={['s:sm:1', 's:md:1', 's:lg:1'].map((value) => ({ value, label: value }))}
                value={scale}
                onValueChange={(value) => setScale(value as ChipScale)}
              />
              <ShowcaseSelectControl
                label="Radius"
                options={['rounded', 'pill'].map((value) => ({ value, label: value }))}
                value={radius}
                onValueChange={(value) => setRadius(value as typeof radius)}
              />
              <ShowcaseBooleanControl
                label="Disabled"
                checked={disabled}
                onCheckedChange={setDisabled}
              />
            </ShowcaseControlStack>
          </ShowcaseControlGroup>
        </ShowcaseControlPanel>
      </ShowcaseRouteControls>

      {!available ? (
        <div className={styles.unavailable}>
          <Text as="p" profile={profiles.body}>
            Chip is not available in the active design system.
          </Text>
        </div>
      ) : (
        <div className={styles.sections}>
          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Four supported compositions
            </Text>
            <div className={styles.stage}>
              <Chip
                intent={intent}
                emphasis={emphasis}
                scale={scale}
                radius={radius}
                disabled={disabled}
              >
                <Chip.Content>
                  <Chip.Label>Static</Chip.Label>
                </Chip.Content>
              </Chip>
              <Chip
                intent={intent}
                emphasis={emphasis}
                scale={scale}
                radius={radius}
                disabled={disabled}
              >
                <Chip.Select defaultControlState>
                  <Chip.Label>Selectable</Chip.Label>
                </Chip.Select>
              </Chip>
              {items.map((item) => (
                <Chip
                  key={item}
                  intent={intent}
                  emphasis={emphasis}
                  scale={scale}
                  radius={radius}
                  disabled={disabled}
                >
                  <Chip.Content>
                    <Chip.Label>{item}</Chip.Label>
                  </Chip.Content>
                  <Chip.Remove
                    aria-label={`Remove ${item}`}
                    onRemove={() =>
                      setItems((current) => current.filter((value) => value !== item))
                    }
                  />
                </Chip>
              ))}
              <Chip
                intent={intent}
                emphasis={emphasis}
                scale={scale}
                radius={radius}
                disabled={disabled}
              >
                <Chip.Select controlState={controlled} onControlStateChange={setControlled}>
                  <Chip.Icon>
                    <FamilyResolvedIcon name="settings" />
                  </Chip.Icon>
                  <Chip.Label>Compound</Chip.Label>
                  <Chip.Badge>
                    <Badge intent="primary">3</Badge>
                  </Chip.Badge>
                </Chip.Select>
                <Chip.Remove aria-label="Remove Compound" />
              </Chip>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Controlled and uncontrolled selection
            </Text>
            <div className={styles.stage}>
              <Chip intent="primary" emphasis="high">
                <Chip.Select controlState={controlled} onControlStateChange={setControlled}>
                  <Chip.Label>
                    {controlled ? 'Controlled: selected' : 'Controlled: rest'}
                  </Chip.Label>
                </Chip.Select>
              </Chip>
              <Chip>
                <Chip.Select defaultControlState>
                  <Chip.Label>Uncontrolled</Chip.Label>
                </Chip.Select>
              </Chip>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Scale, radius and disabled
            </Text>
            <div className={styles.stage}>
              <Chip scale="s:sm:1" radius="pill">
                <Chip.Content>
                  <Chip.Label>Small pill</Chip.Label>
                </Chip.Content>
              </Chip>
              <Chip scale="s:md:1" radius="rounded" intent="primary">
                <Chip.Select defaultControlState>
                  <Chip.Label>Medium selected</Chip.Label>
                </Chip.Select>
              </Chip>
              <Chip scale="s:lg:1" radius="pill" disabled>
                <Chip.Content>
                  <Chip.Label>Large disabled</Chip.Label>
                </Chip.Content>
                <Chip.Remove aria-label="Remove disabled" />
              </Chip>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Absent Essential Icon Provider
            </Text>
            <EssentialIconProvider icons={{}}>
              <div className={styles.stage}>
                <Chip>
                  <Chip.Content>
                    <Chip.Label>Remove omitted</Chip.Label>
                  </Chip.Content>
                  <Chip.Remove aria-label="Remove omitted" />
                </Chip>
                <Chip>
                  <Chip.Content>
                    <Chip.Label>Explicit override</Chip.Label>
                  </Chip.Content>
                  <Chip.Remove aria-label="Remove explicit">×</Chip.Remove>
                </Chip>
              </div>
            </EssentialIconProvider>
            <Text as="p" profile={profiles.caption} className={styles.note}>
              The first Remove wrapper disappears; explicit children remain supported.
            </Text>
          </section>
        </div>
      )}
    </main>
  );
}
