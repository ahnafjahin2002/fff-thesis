/**
 * usePreferences.js
 * ------------------
 * Custom hook that wraps the Zustand preferences store.
 *
 * WHY A SEPARATE HOOK:
 *  - Components import ONE thing: usePreferences()
 *  - All store internals stay hidden behind a clean API
 *  - Easy to swap state management library later without touching every component
 *
 * USAGE:
 *   const { preferences, update, reset, openPanel } = usePreferences();
 *   update('fontSize', 26);
 */

import { useEffect } from 'react';
import usePreferencesStore, { applyCSSVars } from '../store/preferencesStore';

export default function usePreferences() {
  const {
    preferences,
    isPanelOpen,
    updatePreference,
    setPreferences,
    resetPreferences,
    openPanel,
    closePanel,
    togglePanel,
  } = usePreferencesStore();

  // On first mount: apply persisted prefs to CSS vars immediately
  // This prevents a flash of default styles on page load
  useEffect(() => {
    applyCSSVars(preferences);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    preferences,
    isPanelOpen,
    update:      updatePreference,   // (key, value) → void
    setAll:      setPreferences,     // (prefsObject) → void  — use after server fetch
    reset:       resetPreferences,   // () → void
    openPanel,
    closePanel,
    togglePanel,
  };
}
