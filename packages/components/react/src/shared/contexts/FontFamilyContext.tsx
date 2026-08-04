'use client';

import type { FontFamilyId, FontStack, SchemaFonts } from '@kiskadee/core';
import { toCssFontFamily } from '@kiskadee/core/font-family';
import {
  type DefinedFontFamily,
  type FontFamilyPreparationResult,
  getFontFamilyPreparationResult,
  getFontFamilyPreparationStatus,
  prepareFontFamilies
} from '@kiskadee/runtime/font-family';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { KiskadeeContext } from './KiskadeeContext.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type FontFamilyRole = keyof SchemaFonts['roles'];
export type FontFamilyRoleSelection = Partial<Record<FontFamilyRole, FontFamilyId>>;
export type FontFamilyProviderStatus = 'idle' | 'preparing' | 'ready' | 'error';

export type FontFamilyStatusValue = {
  status: FontFamilyProviderStatus;
  pendingFamilyIds: readonly FontFamilyId[];
  familyResolutions: Readonly<Partial<Record<FontFamilyId, FontFamilyPreparationResult>>>;
  error?: Error;
  retry: () => void;
};

export type FontFamilyProviderProps = {
  children: ReactNode;
  families?: readonly DefinedFontFamily[];
  roles?: FontFamilyRoleSelection;
};

type ResolvedRole = {
  familyId: FontFamilyId;
  role: FontFamilyRole;
  stack: FontStack;
};

type InlinePropertySnapshot = {
  priority: string;
  value: string;
};

const EMPTY_FONT_FAMILIES: readonly DefinedFontFamily[] = [];
const FONT_ROLES: readonly FontFamilyRole[] = ['body', 'heading', 'code'];
const FONT_VARIABLES: Record<FontFamilyRole, `--k-font-${FontFamilyRole}`> = {
  body: '--k-font-body',
  heading: '--k-font-heading',
  code: '--k-font-code'
};

const FontFamilyContext = createContext<FontFamilyStatusValue | undefined>(undefined);
const EMPTY_FAMILY_RESOLUTIONS = Object.freeze({});

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function createDefinitionMap(
  families: readonly DefinedFontFamily[]
): ReadonlyMap<FontFamilyId, DefinedFontFamily> {
  const definitions = new Map<FontFamilyId, DefinedFontFamily>();

  for (const family of families) {
    if (definitions.has(family.id)) {
      throw new Error(`Font family "${family.id}" was registered more than once.`);
    }
    definitions.set(family.id, family);
  }

  return definitions;
}

function collectFamilyResolutions(
  definitions: readonly DefinedFontFamily[]
): Readonly<Partial<Record<FontFamilyId, FontFamilyPreparationResult>>> {
  const resolutions: Partial<Record<FontFamilyId, FontFamilyPreparationResult>> = {};

  for (const definition of definitions) {
    const result = getFontFamilyPreparationResult(definition.id);
    if (result) resolutions[definition.id] = result;
  }

  return Object.freeze(resolutions);
}

function resolveFontRoles(
  presetFonts: SchemaFonts | undefined,
  overrides: FontFamilyRoleSelection | undefined,
  definitions: ReadonlyMap<FontFamilyId, DefinedFontFamily>
): readonly ResolvedRole[] {
  const presetBody = presetFonts?.roles.body;
  const body = overrides?.body ?? presetBody;
  const heading = overrides?.heading ?? presetFonts?.roles.heading ?? body;
  const code = overrides?.code ?? presetFonts?.roles.code;
  const roleIds: FontFamilyRoleSelection = { body, heading, code };
  const resolved: ResolvedRole[] = [];

  for (const role of FONT_ROLES) {
    const familyId = roleIds[role];
    if (!familyId) continue;

    const definition = definitions.get(familyId);
    // Presets own their recommendation. A descriptor stack is only the fallback
    // for a family selected outside the active preset catalog.
    const stack = presetFonts?.families[familyId]?.stack ?? definition?.stack;

    if (!stack) {
      throw new Error(
        `Font family "${familyId}" selected for "${role}" requires a stack in the ` +
          'active preset or its defineFontFamily() descriptor.'
      );
    }

    resolved.push({ familyId, role, stack });
  }

  return resolved;
}

function snapshotInlineProperties(
  target: HTMLElement
): Record<FontFamilyRole, InlinePropertySnapshot> {
  return {
    body: {
      value: target.style.getPropertyValue(FONT_VARIABLES.body),
      priority: target.style.getPropertyPriority(FONT_VARIABLES.body)
    },
    heading: {
      value: target.style.getPropertyValue(FONT_VARIABLES.heading),
      priority: target.style.getPropertyPriority(FONT_VARIABLES.heading)
    },
    code: {
      value: target.style.getPropertyValue(FONT_VARIABLES.code),
      priority: target.style.getPropertyPriority(FONT_VARIABLES.code)
    }
  };
}

function restoreInlineProperty(
  target: HTMLElement,
  role: FontFamilyRole,
  snapshot: InlinePropertySnapshot
): void {
  const property = FONT_VARIABLES[role];

  if (snapshot.value) {
    target.style.setProperty(property, snapshot.value, snapshot.priority);
    return;
  }

  target.style.removeProperty(property);
}

/**
 * What
 *     Coordinates optional font preparation and projects resolved role stacks to the document root.
 * Why
 *     Preset metadata and host-provided resources stay independent until a family is selected.
 */
export function FontFamilyProvider({
  children,
  families = EMPTY_FONT_FAMILIES,
  roles
}: FontFamilyProviderProps) {
  const kiskadee = useContext(KiskadeeContext);
  const presetFonts = kiskadee?.global?.fonts;
  const definitions = useMemo(() => createDefinitionMap(families), [families]);
  const resolvedRoles = resolveFontRoles(presetFonts, roles, definitions);
  const selectionKey = JSON.stringify(resolvedRoles);
  const selectedDefinitions = useMemo(() => {
    const selected = new Map<FontFamilyId, DefinedFontFamily>();

    for (const resolvedRole of resolvedRoles) {
      const definition = definitions.get(resolvedRole.familyId);
      if (definition?.prepare) {
        selected.set(definition.id, definition);
      }
    }

    return [...selected.values()];
  }, [definitions, selectionKey]);
  const [state, setState] = useState<Omit<FontFamilyStatusValue, 'retry'>>({
    status: 'idle',
    pendingFamilyIds: [],
    familyResolutions: EMPTY_FAMILY_RESOLUTIONS
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const originalInlineValuesRef = useRef<Record<FontFamilyRole, InlinePropertySnapshot> | null>(
    null
  );

  const retry = useCallback(() => {
    setRetryVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const target = document.documentElement;
    originalInlineValuesRef.current ??= snapshotInlineProperties(target);
    const originalInlineValues = originalInlineValuesRef.current;
    let cancelled = false;

    const applySelection = async () => {
      const pendingFamilyIds = selectedDefinitions
        .filter((definition) => getFontFamilyPreparationStatus(definition.id) !== 'ready')
        .map((definition) => definition.id);

      setState({
        status: pendingFamilyIds.length > 0 ? 'preparing' : 'ready',
        pendingFamilyIds,
        familyResolutions: collectFamilyResolutions(selectedDefinitions)
      });

      try {
        await prepareFontFamilies(selectedDefinitions);
        if (cancelled) return;

        const selectedRoles = new Map(
          resolvedRoles.map((resolvedRole) => [resolvedRole.role, resolvedRole] as const)
        );

        for (const role of FONT_ROLES) {
          const resolvedRole = selectedRoles.get(role);

          if (resolvedRole) {
            target.style.setProperty(FONT_VARIABLES[role], toCssFontFamily(resolvedRole.stack));
          } else {
            restoreInlineProperty(target, role, originalInlineValues[role]);
          }
        }

        setState({
          status: 'ready',
          pendingFamilyIds: [],
          familyResolutions: collectFamilyResolutions(selectedDefinitions)
        });
      } catch (value: unknown) {
        if (cancelled) return;
        const error = toError(value);

        if (process.env.NODE_ENV !== 'production') {
          console.warn('[kiskadee] Failed to prepare the selected font families.', error);
        }

        setState({
          status: 'error',
          pendingFamilyIds: [],
          familyResolutions: collectFamilyResolutions(selectedDefinitions),
          error
        });
      }
    };

    void applySelection();

    return () => {
      cancelled = true;
    };
  }, [retryVersion, selectionKey, selectedDefinitions]);

  useEffect(
    () => () => {
      if (typeof document === 'undefined' || !originalInlineValuesRef.current) return;

      const target = document.documentElement;
      for (const role of FONT_ROLES) {
        restoreInlineProperty(target, role, originalInlineValuesRef.current[role]);
      }
    },
    []
  );

  const contextValue = useMemo<FontFamilyStatusValue>(
    () => ({
      ...state,
      retry
    }),
    [retry, state]
  );

  return <FontFamilyContext.Provider value={contextValue}>{children}</FontFamilyContext.Provider>;
}

export function useFontFamilyStatus(): FontFamilyStatusValue {
  const value = useContext(FontFamilyContext);

  if (!value) {
    throw new Error('useFontFamilyStatus must be used within a FontFamilyProvider');
  }

  return value;
}
