'use client';

import type { FontStack, SchemaFonts } from '@kiskadee/core';
import { SYSTEM_MONOSPACE_FONT_STACK } from '@kiskadee/core/font-family';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import {
  type FontFamilyRole,
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

function TypographyContent() {
  const { global } = useKiskadee();
  const { fontRoleNames, setFontRoleName } = useShowcase();
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
    </section>
  );
}

export default function TypographyPage() {
  return <TypographyContent />;
}
