'use client';

import {
  type FontStack,
  type SchemaFonts,
  type TextEmphasis,
  type TextFontValue,
  type TextForegroundName,
  textForegroundValues
} from '@kiskadee/core';
import { SYSTEM_MONOSPACE_FONT_STACK } from '@kiskadee/core/font-family';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import {
  Card,
  type FontFamilyRole,
  SurfaceContextProvider,
  Text,
  useFontFamilyStatus,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import { ShowcaseIconographyControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useTypographyArtifact } from '@/hooks/use-typography-artifact';
import {
  createFontSelectionOptions,
  FOLLOW_PRESET_FONT_KEY,
  type FontFamilyResolutions,
  formatFontProvider,
  getFamilyResolutionLabel,
  getPresetFamilyId,
  getRecommendedFontLabel
} from '@/utils/font-family-selection';
import { type ShowcaseTextProfiles, useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Typography.module.scss';

type RoleDisplay = {
  familyLabel: string;
  note?: string;
  sourceLabel: string;
  stack?: FontStack;
};

const FONT_ROLES: readonly FontFamilyRole[] = ['body', 'heading', 'code'];
const TYPOGRAPHY_ROLE_ORDER: readonly TextFontValue[] = ['body', 'heading', 'code'];
const TEXT_FOREGROUND_EMPHASES: readonly TextEmphasis[] = ['medium', 'low', 'lowest'];
const TEXT_CHROMATIC_FOREGROUNDS = textForegroundValues.filter(
  (foreground): foreground is Exclude<TextForegroundName, 'neutral'> => foreground !== 'neutral'
);

const PROFILE_SAMPLES: Readonly<Record<TextFontValue, string>> = {
  body: 'Typography should make every interface clear and comfortable.',
  heading: 'Build a recognizable voice',
  code: 'const profile = "semantic";'
};

function resolveRoleDisplay(
  role: FontFamilyRole,
  selection: string,
  presetFonts: SchemaFonts | undefined,
  resolutions: FontFamilyResolutions
): RoleDisplay {
  if (selection !== FOLLOW_PRESET_FONT_KEY) {
    const entry = fontFamilyCatalogById.get(selection);
    const resolution = resolutions[selection];

    return {
      familyLabel: resolution ? getFamilyResolutionLabel(resolution) : (entry?.label ?? selection),
      sourceLabel:
        resolution?.source === 'local' ? 'Local' : entry ? formatFontProvider(entry) : 'Registered',
      stack: entry?.stack
    };
  }

  const familyId = getPresetFamilyId(role, presetFonts);
  if (familyId) {
    const family = presetFonts?.families[familyId];
    const entry = fontFamilyCatalogById.get(familyId);
    const resolution = resolutions[familyId];

    return {
      familyLabel: getRecommendedFontLabel(role, presetFonts, resolutions),
      note:
        role === 'heading' && presetFonts?.roles.heading === undefined
          ? 'Reuses the Body role'
          : undefined,
      sourceLabel:
        resolution?.source === 'local'
          ? 'Local'
          : entry
            ? `Recommended · ${formatFontProvider(entry)}`
            : 'Recommended · Host',
      stack: family?.stack
    };
  }

  if (role === 'code') {
    return {
      familyLabel: 'System monospace',
      note: 'Used when the preset omits Code',
      sourceLabel: 'Fallback',
      stack: SYSTEM_MONOSPACE_FONT_STACK
    };
  }

  return {
    familyLabel: 'Application default',
    note: 'Inherited from the host application',
    sourceLabel: 'Host'
  };
}

function RolePreview({
  display,
  role,
  textProfiles
}: {
  display: RoleDisplay;
  role: FontFamilyRole;
  textProfiles: ShowcaseTextProfiles;
}) {
  const stackLabel = display.stack?.join(', ') ?? 'Inherited from the host';

  return (
    <article className={styles.roleCard} data-font-role={role}>
      <header className={styles.roleHeader}>
        <div>
          <Text as="p" profile={textProfiles.caption} className={styles.roleEyebrow}>
            {role}
          </Text>
          <Text as="h3" profile={textProfiles.subsectionTitle} className={styles.familyName}>
            {display.familyLabel}
          </Text>
        </div>
        <Text as="span" profile={textProfiles.caption} className={styles.sourceBadge}>
          {display.sourceLabel}
        </Text>
      </header>

      <div className={styles.sample}>
        {role === 'body' ? (
          <Text as="p" profile={textProfiles.body} className={styles.roleSample}>
            Clear typography keeps interfaces comfortable through long reading sessions.
          </Text>
        ) : null}
        {role === 'heading' ? (
          <Text as="p" profile={textProfiles.sectionTitle} className={styles.roleSample}>
            Build a recognizable voice
          </Text>
        ) : null}
        {role === 'code' ? (
          <Text
            as="pre"
            profile={textProfiles.caption}
            className={`${styles.roleSample} ${styles.codeSample}`}
          >{`const family = "${display.familyLabel}";`}</Text>
        ) : null}
      </div>

      <footer className={styles.roleMeta}>
        <Text as="code" profile={textProfiles.caption} className={styles.roleStack}>
          {stackLabel}
        </Text>
        {display.note ? (
          <Text as="span" profile={textProfiles.caption}>
            {display.note}
          </Text>
        ) : null}
      </footer>
    </article>
  );
}

function ChromaticForegroundRows({
  foregrounds,
  textProfiles
}: {
  foregrounds: readonly TextForegroundName[];
  textProfiles: ShowcaseTextProfiles;
}) {
  return (
    <table className={styles.chromaticTable} aria-label="Chromatic Text foregrounds by emphasis">
      <thead>
        <tr className={`${styles.chromaticRow} ${styles.chromaticHeaderRow}`}>
          <Text as="th" emphasis="lowest" profile={textProfiles.caption} scope="col">
            Family
          </Text>
          {TEXT_FOREGROUND_EMPHASES.map((emphasis) => (
            <Text
              as="th"
              emphasis="lowest"
              key={emphasis}
              profile={textProfiles.caption}
              scope="col"
            >
              {emphasis[0].toUpperCase() + emphasis.slice(1)}
            </Text>
          ))}
        </tr>
      </thead>
      <tbody>
        {foregrounds.map((foreground) => (
          <tr className={styles.chromaticRow} data-text-foreground={foreground} key={foreground}>
            <Text as="th" foreground={foreground} profile={textProfiles.caption} scope="row">
              {foreground[0].toUpperCase() + foreground.slice(1)}
            </Text>
            {TEXT_FOREGROUND_EMPHASES.map((emphasis) => (
              <Text
                as="td"
                data-text-emphasis={emphasis}
                foreground={foreground}
                emphasis={emphasis}
                key={emphasis}
                profile={textProfiles.body}
              >
                Aa
              </Text>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TextComponentExamples({
  chromaticForegrounds,
  textProfiles
}: {
  chromaticForegrounds: readonly TextForegroundName[];
  textProfiles: ShowcaseTextProfiles;
}) {
  return (
    <section className={styles.textComponent} aria-labelledby="text-component-title">
      <div className={styles.sectionHeader}>
        <Text
          as="p"
          emphasis="lowest"
          profile={textProfiles.caption}
          className={styles.foregroundEyebrow}
        >
          Component
        </Text>
        <Text as="h2" profile={textProfiles.sectionTitle} id="text-component-title">
          Text foreground
        </Text>
        <Text as="p" profile={textProfiles.body}>
          Typography and foreground resolve independently. Preset-owned neutral and chromatic
          profiles adapt three levels of emphasis to the surface behind the Text.
        </Text>
      </div>

      <div className={styles.foregroundMatrix}>
        <Card
          className={`${styles.foregroundCard} k-root`}
          emphasis="low"
          intent="neutral"
          surfaceContext="onSubtle"
        >
          <div className={styles.foregroundCardContent}>
            <header className={styles.foregroundCardHeader}>
              <Text as="h3" profile={textProfiles.groupTitle}>
                On subtle
              </Text>
              <Text as="p" emphasis="low" profile={textProfiles.caption}>
                Neutral foregrounds over a light or otherwise subtle surface.
              </Text>
            </header>
            <div className={styles.foregroundRows}>
              {TEXT_FOREGROUND_EMPHASES.map((emphasis) => (
                <div className={styles.foregroundRow} key={emphasis}>
                  <Text emphasis={emphasis} profile={textProfiles.body}>
                    {emphasis[0].toUpperCase() + emphasis.slice(1)}
                  </Text>
                  <Text emphasis="lowest" profile={textProfiles.caption}>
                    {`neutral.${emphasis}`}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          className={`${styles.foregroundCard} k-root`}
          emphasis="highest"
          intent="primary"
          surfaceContext="onSubtle"
        >
          <div className={styles.foregroundCardContent}>
            <header className={styles.foregroundCardHeader}>
              <Text as="h3" profile={textProfiles.groupTitle}>
                On vivid
              </Text>
              <Text as="p" emphasis="low" profile={textProfiles.caption}>
                The same hierarchy projected over a vivid surface.
              </Text>
            </header>
            <div className={styles.foregroundRows}>
              {TEXT_FOREGROUND_EMPHASES.map((emphasis) => (
                <div className={styles.foregroundRow} key={emphasis}>
                  <Text emphasis={emphasis} profile={textProfiles.body}>
                    {emphasis[0].toUpperCase() + emphasis.slice(1)}
                  </Text>
                  <Text emphasis="lowest" profile={textProfiles.caption}>
                    {`neutral.${emphasis}`}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {chromaticForegrounds.length > 0 ? (
        <section className={styles.chromaticSection} aria-labelledby="chromatic-foregrounds-title">
          <div className={styles.sectionHeader}>
            <Text as="h3" id="chromatic-foregrounds-title" profile={textProfiles.groupTitle}>
              Chromatic foregrounds
            </Text>
            <Text as="p" emphasis="low" profile={textProfiles.body}>
              Color names select a visual family without assigning an action semantic such as
              destructive or positive.
            </Text>
          </div>

          <div className={styles.foregroundMatrix}>
            <Card
              className={`${styles.foregroundCard} k-root`}
              emphasis="low"
              intent="neutral"
              surfaceContext="onSubtle"
            >
              <div className={styles.foregroundCardContent}>
                <Text as="h4" profile={textProfiles.groupTitle}>
                  On subtle
                </Text>
                <ChromaticForegroundRows
                  foregrounds={chromaticForegrounds}
                  textProfiles={textProfiles}
                />
              </div>
            </Card>

            <Card
              className={`${styles.foregroundCard} k-root`}
              emphasis="highest"
              intent="primary"
              surfaceContext="onSubtle"
            >
              <div className={styles.foregroundCardContent}>
                <Text as="h4" profile={textProfiles.groupTitle}>
                  On vivid
                </Text>
                <ChromaticForegroundRows
                  foregrounds={chromaticForegrounds}
                  textProfiles={textProfiles}
                />
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      <div className={styles.foregroundBehaviorGrid}>
        <Card
          className={`${styles.foregroundCard} k-root`}
          emphasis="low"
          intent="neutral"
          surfaceContext="onSubtle"
        >
          <div className={styles.foregroundCardContent}>
            <Text as="h3" profile={textProfiles.groupTitle}>
              Default and inherit
            </Text>
            <div className={styles.foregroundCases}>
              <div className={styles.foregroundCase}>
                <Text as="h4" profile={textProfiles.caption}>
                  Default
                </Text>
                <Text profile={textProfiles.body}>Neutral medium is applied automatically.</Text>
                <Text emphasis="lowest" profile={textProfiles.caption}>
                  No foreground, emphasis, or surface prop.
                </Text>
              </div>
              <div className={styles.foregroundCase}>
                <Text as="h4" profile={textProfiles.caption}>
                  Inherit
                </Text>
                <Text foreground="inherit" profile={textProfiles.body}>
                  The parent owns this color while Text keeps its typography.
                </Text>
                <Text emphasis="lowest" profile={textProfiles.caption}>
                  foreground=&quot;inherit&quot;
                </Text>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className={`${styles.foregroundCard} k-root`}
          emphasis="highest"
          intent="primary"
          surfaceContext="onSubtle"
        >
          <div className={styles.foregroundCardContent}>
            <Text as="h3" profile={textProfiles.groupTitle}>
              Context resolution
            </Text>
            <div className={styles.foregroundCases}>
              <SurfaceContextProvider value="onVivid">
                <div className={styles.foregroundCase}>
                  <Text as="h4" profile={textProfiles.caption}>
                    Provider inherited
                  </Text>
                  <Text profile={textProfiles.body}>
                    The nearest Provider selects the vivid branch.
                  </Text>
                  <Text emphasis="lowest" profile={textProfiles.caption}>
                    No surfaceContext prop.
                  </Text>
                </div>
              </SurfaceContextProvider>
              <SurfaceContextProvider value="onSubtle">
                <div className={styles.foregroundCase}>
                  <Text as="h4" profile={textProfiles.caption} surfaceContext="onVivid">
                    Explicit override
                  </Text>
                  <Text profile={textProfiles.body} surfaceContext="onVivid">
                    The Text prop wins over the inherited Provider.
                  </Text>
                  <Text emphasis="lowest" profile={textProfiles.caption} surfaceContext="onVivid">
                    surfaceContext=&quot;onVivid&quot;
                  </Text>
                </div>
              </SurfaceContextProvider>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function PreparationStatus() {
  const { error, pendingFamilyIds, retry, status } = useFontFamilyStatus();
  const statusLabel =
    status === 'preparing' ? 'Preparing' : status[0].toUpperCase() + status.slice(1);

  return (
    <ShowcaseControlGroup title="Preparation">
      <div className={styles.statusPanel} aria-live="polite">
        <div className={styles.statusLine}>
          <span>Status</span>
          <strong data-status={status}>{statusLabel}</strong>
        </div>
        {pendingFamilyIds.length > 0 ? (
          <p className={styles.statusDetail}>{pendingFamilyIds.join(', ')}</p>
        ) : null}
        {error ? <p className={styles.statusError}>{error.message}</p> : null}
        {status === 'error' ? (
          <button className={styles.retryButton} type="button" onClick={retry}>
            Retry preparation
          </button>
        ) : null}
      </div>
    </ShowcaseControlGroup>
  );
}

function TypeScale({
  artifactPath,
  textProfiles
}: {
  artifactPath?: string;
  textProfiles: ShowcaseTextProfiles;
}) {
  const { designSystem } = useKiskadee();
  const { artifact, error, loading } = useTypographyArtifact(designSystem, artifactPath);

  if (!artifactPath) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
            Profiles
          </Text>
          <Text as="h2" profile={textProfiles.sectionTitle} id="type-scale-title">
            Type scale
          </Text>
        </div>
        <Text as="p" profile={textProfiles.caption} className={styles.emptyState}>
          This preset does not declare typography profiles.
        </Text>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
            Profiles
          </Text>
          <Text as="h2" profile={textProfiles.sectionTitle} id="type-scale-title">
            Type scale
          </Text>
        </div>
        <Text
          as="p"
          profile={textProfiles.caption}
          className={styles.emptyState}
          aria-live="polite"
        >
          Loading the preset type scale…
        </Text>
      </section>
    );
  }

  if (error || !artifact) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
            Profiles
          </Text>
          <Text as="h2" profile={textProfiles.sectionTitle} id="type-scale-title">
            Type scale
          </Text>
        </div>
        <Text as="p" profile={textProfiles.caption} className={styles.errorState} role="alert">
          {error?.message ?? 'The typography artifact could not be loaded.'}
        </Text>
      </section>
    );
  }

  const profiles = Object.entries(artifact.profiles);
  if (profiles.length === 0) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
            Profiles
          </Text>
          <Text as="h2" profile={textProfiles.sectionTitle} id="type-scale-title">
            Type scale
          </Text>
        </div>
        <Text as="p" profile={textProfiles.caption} className={styles.emptyState}>
          This preset does not declare typography profiles.
        </Text>
      </section>
    );
  }

  return (
    <section className={styles.typeScale} aria-labelledby="type-scale-title">
      <div className={styles.sectionHeader}>
        <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
          Profiles
        </Text>
        <Text as="h2" profile={textProfiles.sectionTitle} id="type-scale-title">
          Type scale
        </Text>
        <Text as="p" profile={textProfiles.body}>
          Complete preset recipes compiled into the same atomic classes used by component slots.
        </Text>
      </div>

      <div className={styles.profileGroups}>
        {TYPOGRAPHY_ROLE_ORDER.map((role) => {
          const roleProfiles = profiles.filter(
            ([, profile]) => profile.decorations.textFont === role
          );
          if (roleProfiles.length === 0) return null;

          return (
            <section
              className={styles.profileGroup}
              key={role}
              aria-labelledby={`profiles-${role}`}
            >
              <header className={styles.profileGroupHeader}>
                <Text as="h3" profile={textProfiles.subsectionTitle} id={`profiles-${role}`}>
                  {role}
                </Text>
                <Text as="span" profile={textProfiles.caption}>
                  {roleProfiles.length}
                </Text>
              </header>

              <div className={styles.profileList}>
                {roleProfiles.map(([profileId, profile]) => {
                  const tracking = profile.scales.textLetterSpacing;

                  return (
                    <article className={styles.profileCard} key={profileId}>
                      <div className={styles.profilePreview}>
                        <Text as="p" profile={profileId} className={styles.profileSample}>
                          {PROFILE_SAMPLES[role]}
                        </Text>
                      </div>

                      <div className={styles.profileDetails}>
                        <Text as="code" profile={textProfiles.caption} className={styles.profileId}>
                          {profileId}
                        </Text>
                        <dl className={styles.profileMetrics}>
                          <div>
                            <Text as="dt" profile={textProfiles.caption}>
                              Role
                            </Text>
                            <Text as="dd" profile={textProfiles.caption}>
                              {profile.decorations.textFont}
                            </Text>
                          </div>
                          <div>
                            <Text as="dt" profile={textProfiles.caption}>
                              Size
                            </Text>
                            <Text as="dd" profile={textProfiles.caption}>
                              {profile.scales.textSize}px
                            </Text>
                          </div>
                          <div>
                            <Text as="dt" profile={textProfiles.caption}>
                              Line height
                            </Text>
                            <Text as="dd" profile={textProfiles.caption}>
                              {profile.scales.textHeight}px
                            </Text>
                          </div>
                          <div>
                            <Text as="dt" profile={textProfiles.caption}>
                              Weight
                            </Text>
                            <Text as="dd" profile={textProfiles.caption}>
                              {profile.decorations.textWeight}
                            </Text>
                          </div>
                          <div>
                            <Text as="dt" profile={textProfiles.caption}>
                              Tracking
                            </Text>
                            <Text as="dd" profile={textProfiles.caption}>
                              {tracking === undefined ? 'default' : `${tracking}px`}
                            </Text>
                          </div>
                        </dl>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function TypographyContent() {
  const { global, segment, theme } = useKiskadee();
  const { fontRoleNames, manifest, setFontRoleName } = useShowcase();
  const { familyResolutions } = useFontFamilyStatus();
  const textProfiles = useShowcaseTextProfiles();
  const presetFonts = global?.fonts;
  const textSurfaceContexts = manifest?.components?.text?.surfaceContexts?.[`${segment}.${theme}`];
  const chromaticForegrounds = TEXT_CHROMATIC_FOREGROUNDS.filter((foreground) => {
    const subtle = textSurfaceContexts?.onSubtle?.state?.[foreground];
    const vivid = textSurfaceContexts?.onVivid?.state?.[foreground];
    return Boolean(subtle?.medium?.rest && vivid?.medium?.rest);
  });
  const headingReusesBody =
    fontRoleNames.heading === FOLLOW_PRESET_FONT_KEY && presetFonts?.roles.heading === undefined;
  const effectiveSelections: Record<FontFamilyRole, string> = {
    ...fontRoleNames,
    heading: headingReusesBody ? fontRoleNames.body : fontRoleNames.heading
  };
  const displays = Object.fromEntries(
    FONT_ROLES.map((role) => {
      const display = resolveRoleDisplay(
        role,
        effectiveSelections[role],
        presetFonts,
        familyResolutions
      );

      return [
        role,
        role === 'heading' && headingReusesBody
          ? { ...display, note: 'Reuses the Body role' }
          : display
      ];
    })
  ) as Record<FontFamilyRole, RoleDisplay>;

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Semantic roles">
        <ShowcaseControlStack>
          {FONT_ROLES.map((role) => (
            <ShowcaseSelectControl
              key={role}
              label={role[0].toUpperCase() + role.slice(1)}
              options={createFontSelectionOptions(role, presetFonts, familyResolutions).map(
                (option) => ({
                  ...option,
                  label:
                    option.value === FOLLOW_PRESET_FONT_KEY
                      ? option.label
                      : `${option.label} · ${formatFontProvider(
                          fontFamilyCatalogById.get(option.value)!
                        )}`
                })
              )}
              value={fontRoleNames[role]}
              onValueChange={(value) => setFontRoleName(role, value)}
            />
          ))}
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
      <PreparationStatus />
      <ShowcaseControlGroup title="Iconografia">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
          Foundation
        </Text>
        <Text as="h2" profile={textProfiles.pageTitle} className={styles.title}>
          Typography / Text
        </Text>
        <Text as="p" profile={textProfiles.body} className={styles.summary}>
          Presets recommend semantic font families while applications remain free to provide them
          natively or prepare only the families that become active. Text consumes the active
          preset's profiles without coupling visual recipes to HTML semantics.
        </Text>
      </header>

      <ShowcaseRouteControls
        id="typography"
        eyebrow="Typography / Text"
        showGlobalControls={false}
        title="Controls"
      >
        {controls}
      </ShowcaseRouteControls>

      <div className={styles.previewGrid}>
        {FONT_ROLES.map((role) => (
          <RolePreview
            key={role}
            role={role}
            display={displays[role]}
            textProfiles={textProfiles}
          />
        ))}
      </div>

      <TextComponentExamples
        chromaticForegrounds={chromaticForegrounds}
        textProfiles={textProfiles}
      />

      <TypeScale artifactPath={manifest?.typography?.artifact} textProfiles={textProfiles} />
    </section>
  );
}

export default function TypographyPage() {
  return <TypographyContent />;
}
