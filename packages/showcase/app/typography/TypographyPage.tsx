'use client';

import type { FontStack, SchemaFonts, TextFontValue } from '@kiskadee/core';
import { SYSTEM_MONOSPACE_FONT_STACK } from '@kiskadee/core/font-family';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import {
  type FontFamilyRole,
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

function TextComponentExamples({ textProfiles }: { textProfiles: ShowcaseTextProfiles }) {
  return (
    <section className={styles.textComponent} aria-labelledby="text-component-title">
      <div className={styles.sectionHeader}>
        <Text as="p" profile={textProfiles.caption} className={styles.eyebrow}>
          Component
        </Text>
        <Text as="h2" profile={textProfiles.sectionTitle} id="text-component-title">
          Text
        </Text>
        <Text as="p" profile={textProfiles.body}>
          HTML semantics and visual typography are independent. Every example resolves its profile
          through the active preset without creating profile-specific CSS.
        </Text>
      </div>

      <div className={styles.textExampleGrid}>
        <article className={styles.textExampleCard}>
          <Text as="h3" profile={textProfiles.groupTitle}>
            Inline
          </Text>
          <div className={styles.textExamplePreview}>
            <Text profile={textProfiles.body}>Text defaults to a semantic inline span.</Text>
          </div>
          <Text as="code" profile={textProfiles.caption} className={styles.textExampleCode}>
            {`<Text profile="${textProfiles.body}">`}
          </Text>
        </article>

        <article className={styles.textExampleCard}>
          <Text as="h3" profile={textProfiles.groupTitle}>
            Paragraph
          </Text>
          <div className={styles.textExamplePreview}>
            <Text as="p" profile={textProfiles.body}>
              Block semantics are selected through as, while the profile owns the visual recipe.
            </Text>
          </div>
          <Text as="code" profile={textProfiles.caption} className={styles.textExampleCode}>
            {`<Text as="p" profile="${textProfiles.body}">`}
          </Text>
        </article>

        <article className={styles.textExampleCard}>
          <Text as="h3" profile={textProfiles.groupTitle}>
            Heading
          </Text>
          <div className={styles.textExamplePreview}>
            <Text as="h4" profile={textProfiles.pageTitle}>
              Profile does not define heading level
            </Text>
          </div>
          <Text as="code" profile={textProfiles.caption} className={styles.textExampleCode}>
            {`<Text as="h4" profile="${textProfiles.pageTitle}">`}
          </Text>
        </article>
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
  const { global } = useKiskadee();
  const { fontRoleNames, manifest, setFontRoleName } = useShowcase();
  const { familyResolutions } = useFontFamilyStatus();
  const textProfiles = useShowcaseTextProfiles();
  const presetFonts = global?.fonts;
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

      <TextComponentExamples textProfiles={textProfiles} />

      <TypeScale artifactPath={manifest?.typography?.artifact} textProfiles={textProfiles} />
    </section>
  );
}

export default function TypographyPage() {
  return <TypographyContent />;
}
