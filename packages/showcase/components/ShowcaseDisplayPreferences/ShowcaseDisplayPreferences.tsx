'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

type ShowcaseDisplayPreferencesContextValue = {
  setShowDescriptions: (showDescriptions: boolean) => void;
  showDescriptions: boolean;
};

const ShowcaseDisplayPreferencesContext =
  createContext<ShowcaseDisplayPreferencesContextValue | null>(null);

export function ShowcaseDisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [showDescriptions, setShowDescriptions] = useState(true);
  const value = useMemo(() => ({ setShowDescriptions, showDescriptions }), [showDescriptions]);

  return (
    <ShowcaseDisplayPreferencesContext.Provider value={value}>
      {children}
    </ShowcaseDisplayPreferencesContext.Provider>
  );
}

export function useShowcaseDisplayPreferences() {
  const context = useContext(ShowcaseDisplayPreferencesContext);

  if (!context) {
    throw new Error(
      'useShowcaseDisplayPreferences must be used inside ShowcaseDisplayPreferencesProvider.'
    );
  }

  return context;
}
