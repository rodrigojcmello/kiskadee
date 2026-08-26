'use client';

import type {
  BadgeEmphasis,
  BadgeIntent,
  BadgeScale,
  BadgeSeparation,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import {
  Badge,
  Button,
  Chip,
  Dropdown,
  FamilyResolvedIcon,
  SurfaceContextProvider,
  Text,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import Image from 'next/image';
import { type ReactNode, type Ref, useEffect, useState } from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import { isDarkSurfaceColor } from '@/utils/canonical-card-surfaces';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Badge.module.scss';

const intents: BadgeIntent[] = [
  'neutral',
  'primary',
  'novelty',
  'positive',
  'warning',
  'attention'
];
const emphases: BadgeEmphasis[] = ['high', 'medium', 'low', 'lowest'];
const scales: BadgeScale[] = ['s:sm:3', 's:sm:2', 's:sm:1', 's:md:1', 's:lg:1', 's:lg:2'];
const radii = ['square', 'rounded', 'pill'] as const;
const surfaceContexts: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];

const fullBleedMarkFixtures = Array.from(
  { length: 8 },
  (_, index) => `/fixtures/badge/fluent-full-bleed-marks/${String(index + 1).padStart(2, '0')}.svg`
);
const profileFixture = '/fixtures/badge/profile/blonde-woman.webp';

function FullBleedArtwork({ index = 0 }: { index?: number }) {
  return <Image alt="" src={fullBleedMarkFixtures[index]} width={32} height={32} unoptimized />;
}

function Unavailable() {
  const profiles = useShowcaseTextProfiles();
  return (
    <div className={styles.unavailable}>
      <Text as="p" profile={profiles.body}>
        Badge is not available in the active design system.
      </Text>
    </div>
  );
}

function UnavailableHost({ name }: { name: string }) {
  const profiles = useShowcaseTextProfiles();
  return (
    <article className={styles.contextCard}>
      <Text as="strong" profile={profiles.caption}>
        {name}
      </Text>
      <Text as="p" profile={profiles.caption} className={styles.note}>
        This host is unavailable in the active design system.
      </Text>
    </article>
  );
}

function ScaleRow({ title, render }: { title: string; render: (scale: BadgeScale) => ReactNode }) {
  const profiles = useShowcaseTextProfiles();
  return (
    <div className={styles.matrixRow}>
      <Text as="strong" profile={profiles.caption}>
        {title}
      </Text>
      <div className={styles.stage}>{scales.map(render)}</div>
    </div>
  );
}

function BadgeDropdownExample({ shadow }: { shadow: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Anchor
        render={(anchorProps) => {
          const { ref, ...props } = anchorProps;
          return (
            <button
              {...props}
              ref={ref as Ref<HTMLButtonElement>}
              type="button"
              className={styles.dropdownTrigger}
            >
              Open updates
            </button>
          );
        }}
      />
      <Dropdown.Content width="min-anchor">
        <Dropdown.Surface>
          <Dropdown.Items>
            <Dropdown.Group>
              <Dropdown.GroupLabel>Notifications</Dropdown.GroupLabel>
              <Dropdown.Item
                render={(itemProps) => {
                  const { ref, ...props } = itemProps;
                  return (
                    <button {...props} ref={ref as Ref<HTMLButtonElement>} type="button">
                      <Dropdown.Label>Product updates</Dropdown.Label>
                      <Dropdown.EndText>
                        <Badge intent="novelty" shadow={shadow}>
                          New
                        </Badge>
                      </Dropdown.EndText>
                    </button>
                  );
                }}
              />
              <Dropdown.Item
                render={(itemProps) => {
                  const { ref, ...props } = itemProps;
                  return (
                    <button {...props} ref={ref as Ref<HTMLButtonElement>} type="button">
                      <Dropdown.Label>Messages</Dropdown.Label>
                      <Dropdown.EndText>
                        <Badge intent="neutral" shadow={shadow}>
                          3
                        </Badge>
                      </Dropdown.EndText>
                    </button>
                  );
                }}
              />
            </Dropdown.Group>
          </Dropdown.Items>
        </Dropdown.Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

function RingButtonSpecimen({
  label,
  separation,
  shadow
}: {
  label: string;
  separation: BadgeSeparation;
  shadow: boolean;
}) {
  const profiles = useShowcaseTextProfiles();
  return (
    <article className={styles.specimen}>
      <Text as="span" profile={profiles.caption}>
        {label}
      </Text>
      <Button intent="primary" emphasis="high" aria-label="Messages">
        <Button.Icon>
          <FamilyResolvedIcon name="mail" />
        </Button.Icon>
        <Button.Badge placement="block-start-inline-end">
          <Badge.Dot
            intent="attention"
            scale="s:sm:1"
            separation={separation}
            shadow={shadow}
            aria-label={label}
          />
        </Button.Badge>
      </Button>
    </article>
  );
}

function IntentBadgeButton({
  emphasis,
  intent,
  kind,
  radius,
  shadow
}: {
  emphasis: BadgeEmphasis;
  intent: BadgeIntent;
  kind: 'dot' | 'number' | 'new';
  radius: Extract<RadiusMode, 'square' | 'rounded' | 'pill'>;
  shadow: boolean;
}) {
  const label = kind === 'dot' ? 'Status' : kind === 'number' ? 'Count' : 'Feature';

  return (
    <Button intent="primary" emphasis="low">
      <Button.Label>{label}</Button.Label>
      <Button.Badge placement={kind === 'dot' ? 'block-start-inline-end' : 'inline-end'}>
        {kind === 'dot' ? (
          <Badge.Dot
            intent={intent}
            scale="s:sm:2"
            shadow={shadow}
            aria-label={`${intent} status`}
          />
        ) : (
          <Badge intent={intent} emphasis={emphasis} scale="s:sm:1" radius={radius} shadow={shadow}>
            {kind === 'number' ? '3' : 'New'}
          </Badge>
        )}
      </Button.Badge>
    </Button>
  );
}

export default function BadgeShowcase() {
  const { manifest } = useShowcase();
  const { global, segment, theme } = useKiskadee();
  const profiles = useShowcaseTextProfiles();
  const canonicalSurfaces = useCanonicalCardSurfaces();
  const available = Boolean(manifest?.components?.badge);
  const buttonAvailable = Boolean(manifest?.components?.button);
  const chipAvailable = Boolean(manifest?.components?.chip);
  const dropdownAvailable = Boolean(manifest?.components?.dropdown);
  const [intent, setIntent] = useState<BadgeIntent>('attention');
  const [emphasis, setEmphasis] = useState<BadgeEmphasis>('medium');
  const [scale, setScale] = useState<BadgeScale>('s:md:1');
  const [radius, setRadius] = useState<Extract<RadiusMode, 'square' | 'rounded' | 'pill'>>('pill');
  const [separation, setSeparation] = useState<BadgeSeparation>('none');
  const [surfaceContext, setSurfaceContext] = useState<SurfaceContext>('onSubtle');
  const [isSimplified, setIsSimplified] = useState(true);
  const [shadow, setShadow] = useState(false);
  const [count, setCount] = useState(3);
  const onVividSupported = supportsManifestSurfaceContext(
    manifest?.components?.badge,
    String(segment ?? 'default'),
    theme,
    'onVivid'
  );
  const activeSurface = canonicalSurfaces.tones.find(
    (surface) => surface.contentSurfaceContext === surfaceContext
  );
  const activeSurfaceIsDark = activeSurface
    ? isDarkSurfaceColor(activeSurface.resolvedColor)
    : false;
  const badgeShadow = global?.components?.badge?.effects?.shadow;
  const shadowSupported = Boolean(badgeShadow?.e1 && badgeShadow.e3 && badgeShadow.e5);
  const activeShadow = shadow && shadowSupported;
  const buttonState = getManifestComponentState(
    manifest?.components?.button,
    String(segment ?? 'default'),
    theme,
    'onSubtle'
  );
  const positiveButtonAvailable = Boolean(buttonState?.positive?.high?.rest);

  useEffect(() => {
    if (!onVividSupported && surfaceContext === 'onVivid') {
      setSurfaceContext('onSubtle');
    }
  }, [onVividSupported, surfaceContext]);

  useEffect(() => {
    if (!shadowSupported && shadow) setShadow(false);
  }, [shadow, shadowSupported]);

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Presentation">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Intent"
            options={intents.map((value) => ({ value, label: value }))}
            value={intent}
            onValueChange={(value) => setIntent(value as BadgeIntent)}
          />
          <ShowcaseSelectControl
            label="Emphasis"
            options={emphases.map((value) => ({ value, label: value }))}
            value={emphasis}
            onValueChange={(value) => setEmphasis(value as BadgeEmphasis)}
          />
          <ShowcaseSelectControl
            label="Scale"
            options={scales.map((value) => ({ value, label: value }))}
            value={scale}
            onValueChange={(value) => setScale(value as BadgeScale)}
          />
          <ShowcaseSelectControl
            label="Radius"
            options={radii.map((value) => ({ value, label: value }))}
            value={radius}
            onValueChange={(value) => setRadius(value as typeof radius)}
          />
          <ShowcaseSegmentedControl
            label="Surface context"
            options={surfaceContexts}
            value={surfaceContext}
            onValueChange={(value) => setSurfaceContext(value as SurfaceContext)}
            disabled={!onVividSupported}
          />
          <ShowcaseBooleanControl
            label="Separation ring"
            checked={separation === 'ring'}
            onCheckedChange={(checked) => setSeparation(checked ? 'ring' : 'none')}
          />
          <ShowcaseBooleanControl
            label="Simplified examples"
            checked={isSimplified}
            onCheckedChange={setIsSimplified}
          />
          <ShowcaseBooleanControl
            label="Static shadow"
            checked={activeShadow}
            onCheckedChange={setShadow}
            disabled={!shadowSupported}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <main className={`${styles.page} ${theme === 'light' ? '' : styles.darkPage}`}>
      <Text as="h2" profile={profiles.pageTitle}>
        Badge
      </Text>
      <Text as="p" profile={profiles.body} className={styles.lead}>
        Passive dot, short text, number, or icon-only metadata. Badge remains Rest-only wherever it
        is composed.
      </Text>
      <ShowcaseRouteControls id="badge" eyebrow="Badge" title="Controls" isAvailable={available}>
        {controls}
      </ShowcaseRouteControls>

      {!available ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Runtime metadata
            </Text>
            <div className={styles.stage}>
              <Badge
                intent={intent}
                emphasis={emphasis}
                scale={scale}
                radius={radius}
                separation={separation}
                shadow={activeShadow}
                surfaceContext={surfaceContext}
              >
                {count}
              </Badge>
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setCount((value) => value + 1)}
              >
                Increase count
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Metadata by intent
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Every intent shows all four Rest-only emphases on the canonical {surfaceContext}{' '}
              surface. Simplified mode keeps one count per emphasis; complete mode adds short text.
            </Text>
            {activeSurface ? (
              <SurfaceContextProvider value={surfaceContext}>
                <div
                  className={`${styles.metadataSurface} ${
                    activeSurfaceIsDark ? styles.metadataSurfaceDark : ''
                  }`}
                  style={{ backgroundColor: activeSurface.resolvedColor }}
                >
                  <Text as="strong" profile={profiles.caption}>
                    {activeSurface.label} / {surfaceContext}
                  </Text>
                  {buttonAvailable ? (
                    <div className={styles.intentGrid}>
                      {intents.map((itemIntent) => (
                        <article className={styles.intentCard} key={itemIntent}>
                          <Text as="strong" profile={profiles.caption}>
                            {itemIntent}
                          </Text>
                          <div className={styles.intentEmphasisGrid}>
                            {emphases.map((level) => (
                              <div className={styles.intentEmphasisRow} key={level}>
                                <Text as="span" profile={profiles.caption} className={styles.note}>
                                  {level}
                                </Text>
                                <div className={styles.stage}>
                                  {level === 'high' ? (
                                    <IntentBadgeButton
                                      emphasis={level}
                                      intent={itemIntent}
                                      kind="dot"
                                      radius={radius}
                                      shadow={activeShadow}
                                    />
                                  ) : null}
                                  <IntentBadgeButton
                                    emphasis={level}
                                    intent={itemIntent}
                                    kind="number"
                                    radius={radius}
                                    shadow={activeShadow}
                                  />
                                  {!isSimplified ? (
                                    <IntentBadgeButton
                                      emphasis={level}
                                      intent={itemIntent}
                                      kind="new"
                                      radius={radius}
                                      shadow={activeShadow}
                                    />
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Text as="p" role="status" profile={profiles.caption} className={styles.note}>
                      Button is unavailable in the active design system.
                    </Text>
                  )}
                </div>
              </SurfaceContextProvider>
            ) : (
              <Text as="p" role="status" profile={profiles.caption} className={styles.note}>
                The active preset does not publish a canonical {surfaceContext} surface.
              </Text>
            )}
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Six Fluent scales
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Dot, number, and short text are independent anatomies at every scale. Content may grow
              beyond the nominal minimum, including at 200% zoom.
            </Text>
            <div className={styles.matrix}>
              <ScaleRow
                title="Dot"
                render={(itemScale) => (
                  <Badge.Dot
                    key={itemScale}
                    scale={itemScale}
                    intent="attention"
                    shadow={activeShadow}
                    aria-label={`Dot ${itemScale}`}
                  />
                )}
              />
              <ScaleRow
                title="Number"
                render={(itemScale) => (
                  <Badge key={itemScale} scale={itemScale} intent="primary" shadow={activeShadow}>
                    3
                  </Badge>
                )}
              />
              <ScaleRow
                title="New"
                render={(itemScale) => (
                  <Badge key={itemScale} scale={itemScale} intent="novelty" shadow={activeShadow}>
                    New
                  </Badge>
                )}
              />
            </div>
            <div className={styles.counterGrowth}>
              <Text as="strong" profile={profiles.caption}>
                Counter growth
              </Text>
              <div className={styles.stage}>
                <Badge intent="primary" scale={scale} shadow={activeShadow}>
                  {3}
                </Badge>
                <Badge intent="primary" scale={scale} shadow={activeShadow}>
                  {12}
                </Badge>
                <Badge
                  intent="primary"
                  scale={scale}
                  shadow={activeShadow}
                  aria-label="More than 99 notifications"
                >
                  99+
                </Badge>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Contained and full-bleed Mark ownership
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Contained Marks combine a family-resolved glyph with a Badge-owned surface. Full-bleed
              Marks are complete consumer-owned artworks; these eight Fluent vectors are private
              Showcase fixtures and do not follow the icon-family selector.
            </Text>
            <div className={styles.ownershipGrid}>
              <article className={styles.ownershipCard}>
                <Text as="strong" profile={profiles.caption}>
                  Contained Marks
                </Text>
                <div className={styles.stage}>
                  {(['check', 'bell', 'rocket'] as const).map((name) => (
                    <Badge.Mark
                      key={name}
                      intent={name === 'check' ? 'positive' : 'novelty'}
                      scale="s:lg:1"
                      shadow={activeShadow}
                      aria-label={`${name} contained Mark`}
                    >
                      <FamilyResolvedIcon name={name} />
                    </Badge.Mark>
                  ))}
                </div>
              </article>
              <article className={styles.ownershipCard}>
                <Text as="strong" profile={profiles.caption}>
                  Fluent full-bleed artworks
                </Text>
                <div className={styles.fixtureGrid}>
                  {fullBleedMarkFixtures.map((fixture, index) => (
                    <Badge.Mark
                      key={fixture}
                      presentation="full-bleed"
                      intent="attention"
                      scale="s:lg:1"
                      shadow={activeShadow}
                      aria-label={`Fluent source artwork ${index + 1}`}
                    >
                      <FullBleedArtwork index={index} />
                    </Badge.Mark>
                  ))}
                </div>
              </article>
            </div>
            <div className={styles.matrix}>
              <ScaleRow
                title="Contained Mark"
                render={(itemScale) => (
                  <Badge.Mark
                    key={itemScale}
                    scale={itemScale}
                    intent="positive"
                    shadow={activeShadow}
                    aria-label={`Contained Mark ${itemScale}`}
                  >
                    <FamilyResolvedIcon name="check" />
                  </Badge.Mark>
                )}
              />
              <ScaleRow
                title="Full-bleed Mark"
                render={(itemScale) => (
                  <Badge.Mark
                    key={itemScale}
                    presentation="full-bleed"
                    scale={itemScale}
                    intent="positive"
                    shadow={activeShadow}
                    aria-label={`Full-bleed Mark ${itemScale}`}
                  >
                    <FullBleedArtwork />
                  </Badge.Mark>
                )}
              />
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Radius and separation
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Pill is the recommended Badge radius. Square and rounded remain available as a
              secondary compatibility axis; Dot and Mark are always pill.
            </Text>
            <div className={styles.specimenGrid}>
              {radii.map((itemRadius) => (
                <article className={styles.specimen} key={itemRadius}>
                  <Text as="span" profile={profiles.caption}>
                    {itemRadius === 'pill' ? 'pill (recommended)' : itemRadius}
                  </Text>
                  <Badge intent="novelty" radius={itemRadius} shadow={activeShadow}>
                    New
                  </Badge>
                </article>
              ))}
              {buttonAvailable ? (
                <>
                  <RingButtonSpecimen
                    label="Without ring"
                    separation="none"
                    shadow={activeShadow}
                  />
                  <RingButtonSpecimen label="With ring" separation="ring" shadow={activeShadow} />
                </>
              ) : null}
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Badge in context
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Each host owns its relation to passive Badge metadata. The profile is a local Showcase
              fixture, not an Avatar component contract.
            </Text>
            <div className={styles.contextGrid}>
              {buttonAvailable ? (
                <article className={styles.contextCard}>
                  <Text as="strong" profile={profiles.caption}>
                    Button
                  </Text>
                  <div className={styles.stage}>
                    <Button intent="primary" emphasis="high">
                      <Button.Label>Updates</Button.Label>
                      <Button.Badge placement="inline-end">
                        <Badge intent="novelty" shadow={activeShadow}>
                          New
                        </Badge>
                      </Button.Badge>
                    </Button>
                    {positiveButtonAvailable ? (
                      <Button intent="positive" emphasis="high">
                        <Button.Label>Chances</Button.Label>
                        <Button.Badge placement="inline-end">
                          <Badge intent="positive" shadow={activeShadow}>
                            8
                          </Badge>
                        </Button.Badge>
                      </Button>
                    ) : null}
                    <Button intent="primary" emphasis="high" aria-label="Messages">
                      <Button.Icon>
                        <FamilyResolvedIcon name="mail" />
                      </Button.Icon>
                      <Button.Badge>
                        <Badge.Dot
                          intent="attention"
                          scale="s:sm:2"
                          separation="ring"
                          shadow={activeShadow}
                          aria-label="Unread"
                        />
                      </Button.Badge>
                    </Button>
                    <Button intent="primary" emphasis="low">
                      <Button.Icon>
                        <FamilyResolvedIcon name="cart" />
                      </Button.Icon>
                      <Button.Label>Carrinho</Button.Label>
                      <Button.Badge placement="inline-end">
                        <Badge
                          intent="attention"
                          emphasis="high"
                          scale="s:md:1"
                          shadow={activeShadow}
                        >
                          3
                        </Badge>
                      </Button.Badge>
                    </Button>
                    <Button intent="primary" emphasis="high" disabled>
                      <Button.Label>Messages</Button.Label>
                      <Button.Badge>
                        <Badge intent="attention" shadow={activeShadow}>
                          3
                        </Badge>
                      </Button.Badge>
                    </Button>
                  </div>
                </article>
              ) : (
                <UnavailableHost name="Button" />
              )}

              {chipAvailable ? (
                <article className={styles.contextCard}>
                  <Text as="strong" profile={profiles.caption}>
                    Chip
                  </Text>
                  <div className={styles.stage}>
                    <Chip>
                      <Chip.Content>
                        <Chip.Label>Pull requests</Chip.Label>
                        <Chip.Badge>
                          <Badge intent="neutral" shadow={activeShadow}>
                            3
                          </Badge>
                        </Chip.Badge>
                      </Chip.Content>
                    </Chip>
                    <Chip intent="primary">
                      <Chip.Content>
                        <Chip.Label>Features</Chip.Label>
                        <Chip.Badge>
                          <Badge intent="novelty" shadow={activeShadow}>
                            New
                          </Badge>
                        </Chip.Badge>
                      </Chip.Content>
                    </Chip>
                  </div>
                </article>
              ) : (
                <UnavailableHost name="Chip" />
              )}

              {dropdownAvailable ? (
                <article className={styles.contextCard}>
                  <Text as="strong" profile={profiles.caption}>
                    Dropdown.EndText
                  </Text>
                  <BadgeDropdownExample shadow={activeShadow} />
                </article>
              ) : (
                <UnavailableHost name="Dropdown" />
              )}

              <article className={styles.contextCard}>
                <Text as="strong" profile={profiles.caption}>
                  Synthetic profile fixtures
                </Text>
                <div className={styles.profileFixtures}>
                  <figure className={styles.profileFigure}>
                    <div
                      className={`${styles.profileHost} ${styles.profileHostSmall}`}
                      role="img"
                      aria-label="Small synthetic profile fixture with available status"
                    >
                      <Image
                        src={profileFixture}
                        alt=""
                        width={512}
                        height={512}
                        loading="eager"
                        className={styles.profileImage}
                      />
                      <span className={`${styles.profileBadge} ${styles.profileBadgeSmall}`}>
                        <Badge.Dot
                          intent="positive"
                          scale="s:sm:1"
                          separation="ring"
                          shadow={activeShadow}
                          aria-label="Available"
                        />
                      </span>
                    </div>
                    <Text
                      as="figcaption"
                      profile={profiles.groupTitle}
                      className={styles.profileCaption}
                    >
                      Small
                    </Text>
                  </figure>
                  <figure className={styles.profileFigure}>
                    <div
                      className={`${styles.profileHost} ${styles.profileHostMedium}`}
                      role="img"
                      aria-label="Medium synthetic profile fixture with eight notifications"
                    >
                      <Image
                        src={profileFixture}
                        alt=""
                        width={512}
                        height={512}
                        className={styles.profileImage}
                      />
                      <span className={`${styles.profileBadge} ${styles.profileBadgeMedium}`}>
                        <Badge
                          intent="attention"
                          scale="s:md:1"
                          separation="ring"
                          shadow={activeShadow}
                          aria-label="Eight notifications"
                        >
                          8
                        </Badge>
                      </span>
                    </div>
                    <Text
                      as="figcaption"
                      profile={profiles.groupTitle}
                      className={styles.profileCaption}
                    >
                      Medium
                    </Text>
                  </figure>
                  <figure className={styles.profileFigure}>
                    <div
                      className={`${styles.profileHost} ${styles.profileHostLarge}`}
                      role="img"
                      aria-label="Large synthetic verified profile fixture"
                    >
                      <Image
                        src={profileFixture}
                        alt=""
                        width={512}
                        height={512}
                        className={styles.profileImage}
                      />
                      <span className={`${styles.profileBadge} ${styles.profileBadgeLarge}`}>
                        <Badge.Mark
                          intent="positive"
                          scale="s:lg:1"
                          separation="ring"
                          shadow={activeShadow}
                          aria-label="Verified"
                        >
                          <FamilyResolvedIcon name="check" />
                        </Badge.Mark>
                      </span>
                    </div>
                    <Text
                      as="figcaption"
                      profile={profiles.groupTitle}
                      className={styles.profileCaption}
                    >
                      Large with Mark
                    </Text>
                  </figure>
                </div>
                <Text as="strong" profile={profiles.groupTitle}>
                  Full-bleed status artworks
                </Text>
                <div className={styles.profileStatusFixtures}>
                  {fullBleedMarkFixtures.map((fixture, index) => (
                    <figure className={styles.profileFigure} key={fixture}>
                      <div
                        className={`${styles.profileHost} ${styles.profileHostSmall}`}
                        role="img"
                        aria-label={`Small synthetic profile fixture with status artwork ${index + 1}`}
                      >
                        <Image
                          src={profileFixture}
                          alt=""
                          width={512}
                          height={512}
                          className={styles.profileImage}
                        />
                        <span className={`${styles.profileBadge} ${styles.profileBadgeSmall}`}>
                          <Badge.Mark
                            presentation="full-bleed"
                            intent="attention"
                            scale="s:sm:1"
                            separation="ring"
                            shadow={activeShadow}
                            aria-label={`Status artwork ${index + 1}`}
                          >
                            <FullBleedArtwork index={index} />
                          </Badge.Mark>
                        </span>
                      </div>
                      <Text
                        as="figcaption"
                        profile={profiles.groupTitle}
                        className={styles.profileCaption}
                      >
                        Status {index + 1}
                      </Text>
                    </figure>
                  ))}
                </div>
                <Text as="p" profile={profiles.caption} className={styles.note}>
                  Local 512 x 512 WebP fixture; this is not an Avatar component contract.
                </Text>
              </article>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
