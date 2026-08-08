'use client';

import type { FontStack, SchemaFonts, TextFontValue } from '@kiskadee/core';
import { SYSTEM_MONOSPACE_FONT_STACK } from '@kiskadee/core/font-family';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import {
  type FontFamilyRole,
  useFontFamilyStatus,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import type { TypographyArtifactUsage } from '@kiskadee/web-builder/types';
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

function RolePreview({ display, role }: { display: RoleDisplay; role: FontFamilyRole }) {
  const stackLabel = display.stack?.join(', ') ?? 'Inherited from the host';

  return (
    <article className={styles.roleCard} data-font-role={role}>
      <header className={styles.roleHeader}>
        <div>
          <p className={styles.roleEyebrow}>{role}</p>
          <h3 className={styles.familyName}>{display.familyLabel}</h3>
        </div>
        <span className={styles.sourceBadge}>{display.sourceLabel}</span>
      </header>

      <div className={styles.sample}>
        {role === 'body' ? (
          <p className={styles.bodySample}>
            Clear typography keeps interfaces comfortable through long reading sessions.
          </p>
        ) : null}
        {role === 'heading' ? (
          <p className={styles.headingSample}>Build a recognizable voice</p>
        ) : null}
        {role === 'code' ? (
          <pre className={styles.codeSample}>
            <code>{`const family = "${display.familyLabel}";`}</code>
          </pre>
        ) : null}
      </div>

      <footer className={styles.roleMeta}>
        <code>{stackLabel}</code>
        {display.note ? <span>{display.note}</span> : null}
      </footer>
    </article>
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

function formatUsage(usage: TypographyArtifactUsage): string {
  const branch = [usage.component, usage.variant, usage.mode].filter(Boolean).join('.');
  const breakpoint = usage.breakpoint ? ` · ${usage.breakpoint}` : '';

  return `${branch} · ${usage.elementName} (${usage.element}) · ${usage.scale}${breakpoint}`;
}

function TypeScale({ artifactPath }: { artifactPath?: string }) {
  const { designSystem } = useKiskadee();
  const { artifact, error, loading } = useTypographyArtifact(designSystem, artifactPath);

  if (!artifactPath) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Profiles</p>
          <h2 id="type-scale-title">Type scale</h2>
        </div>
        <p className={styles.emptyState}>This preset does not declare typography profiles.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Profiles</p>
          <h2 id="type-scale-title">Type scale</h2>
        </div>
        <p className={styles.emptyState} aria-live="polite">
          Loading the preset type scale…
        </p>
      </section>
    );
  }

  if (error || !artifact) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Profiles</p>
          <h2 id="type-scale-title">Type scale</h2>
        </div>
        <p className={styles.errorState} role="alert">
          {error?.message ?? 'The typography artifact could not be loaded.'}
        </p>
      </section>
    );
  }

  const profiles = Object.entries(artifact.profiles);
  if (profiles.length === 0) {
    return (
      <section className={styles.typeScale} aria-labelledby="type-scale-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Profiles</p>
          <h2 id="type-scale-title">Type scale</h2>
        </div>
        <p className={styles.emptyState}>This preset does not declare typography profiles.</p>
      </section>
    );
  }

  return (
    <section className={styles.typeScale} aria-labelledby="type-scale-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Profiles</p>
        <h2 id="type-scale-title">Type scale</h2>
        <p>
          Complete preset recipes compiled into the same atomic classes used by component slots.
        </p>
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
                <h3 id={`profiles-${role}`}>{role}</h3>
                <span>{roleProfiles.length}</span>
              </header>

              <div className={styles.profileList}>
                {roleProfiles.map(([profileId, profile]) => {
                  const usages = artifact.usage[profileId] ?? [];
                  const tracking = profile.scales.textLetterSpacing;

                  return (
                    <article className={styles.profileCard} key={profileId}>
                      <div className={styles.profilePreview}>
                        <p className={`${styles.profileSample} ${profile.className}`}>
                          {PROFILE_SAMPLES[role]}
                        </p>
                      </div>

                      <div className={styles.profileDetails}>
                        <code className={styles.profileId}>{profileId}</code>
                        <dl className={styles.profileMetrics}>
                          <div>
                            <dt>Role</dt>
                            <dd>{profile.decorations.textFont}</dd>
                          </div>
                          <div>
                            <dt>Size</dt>
                            <dd>{profile.scales.textSize}px</dd>
                          </div>
                          <div>
                            <dt>Line height</dt>
                            <dd>{profile.scales.textHeight}px</dd>
                          </div>
                          <div>
                            <dt>Weight</dt>
                            <dd>{profile.decorations.textWeight}</dd>
                          </div>
                          <div>
                            <dt>Tracking</dt>
                            <dd>{tracking === undefined ? 'default' : `${tracking}px`}</dd>
                          </div>
                        </dl>

                        <div className={styles.profileUsage}>
                          <h4>Used by</h4>
                          {usages.length > 0 ? (
                            <ul>
                              {usages.map((usage) => (
                                <li key={formatUsage(usage)}>{formatUsage(usage)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>
                              Declared for direct inspection; no component slot currently uses it.
                            </p>
                          )}
                        </div>
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
        <p className={styles.eyebrow}>Foundation</p>
        <h2 className={styles.title}>Typography</h2>
        <p className={styles.summary}>
          Presets recommend semantic font families while applications remain free to provide them
          natively or prepare only the families that become active.
        </p>
      </header>

      <ShowcaseRouteControls
        id="typography"
        eyebrow="Typography"
        showGlobalControls={false}
        title="Controls"
      >
        {controls}
      </ShowcaseRouteControls>

      <div className={styles.previewGrid}>
        {FONT_ROLES.map((role) => (
          <RolePreview key={role} role={role} display={displays[role]} />
        ))}
      </div>

      <TypeScale artifactPath={manifest?.typography?.artifact} />
    </section>
  );
}

export default function TypographyPage() {
  return <TypographyContent />;
}
