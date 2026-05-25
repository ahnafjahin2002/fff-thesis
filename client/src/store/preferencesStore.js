/**
 * preferencesStore.js
 * -------------------
 * Zustand global store for all Adaptive Text Visualization preferences.
 *
 * WHY ZUSTAND:
 *  - Lightweight (~1KB) — critical for low-resource Bangladeshi devices
 *  - No boilerplate — simpler than Redux for a focused feature store
 *  - Persists to localStorage automatically via persist middleware
 *  - Any component can read/write without prop drilling
 *
 * HOW IT WORKS:
 *  - All preference values live here
 *  - usePreferences hook (separate file) reads/writes from this store
 *  - applyCSSVars() pushes values into CSS custom properties on <html>
 *    so the .reading-content class picks them up automatically
 *  - syncToBackend() sends a PATCH to /api/users/:id/preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Default values matching the documentation ──────────────────────────────
export const DEFAULT_PREFERENCES = {
  fontFamily:      'Noto Sans Bengali',  // Options: Noto Sans Bengali, Kalpurush, SolaimanLipi
  fontSize:        22,                   // px, range 16–36
  lineHeight:      2.2,                  // CSS line-height, range 1.5–3.0
  letterSpacing:   3,                    // px, range 0–8
  wordSpacing:     8,                    // px, range 4–16
  colorTheme:      'cream',              // cream | bluetint | yellowtint | white
  textColor:       'darkbrown',          // darkbrown | black | navy
  columnWidth:     70,                   // %, range 60–100
  paragraphBreak:  'every-sentence',     // every-sentence | every-2-sentences
  highlightColor:  '#FFD700',            // phoneme highlight color

  // Bangla-specific toggles
  showConjunctUnderline: true,           // underline যুক্তবর্ণ
  showVowelMarkColor:    true,           // tint কার-চিহ্ন
  showRephIndicator:     true,           // marker on র-ফলা words
  boldHighFreqWords:     true,           // bold মা, বাবা, বাড়ি etc.

  // Image & narration toggles
  showImages:      true,
  useVoiceInput:   false,
  narrationSpeed:  0.85,
};

// ── Color theme map → CSS values ────────────────────────────────────────────
export const COLOR_THEMES = {
  cream:     { bg: '#FFF8E7', label: 'ক্রিম' },
  bluetint:  { bg: '#E8F4FD', label: 'নীল' },
  yellowtint:{ bg: '#FFFDE7', label: 'হলুদ' },
  white:     { bg: '#FFFFFF', label: 'সাদা' },
};

export const TEXT_COLORS = {
  darkbrown: { color: '#2D1B00', label: 'বাদামি' },
  black:     { color: '#111111', label: 'কালো' },
  navy:      { color: '#1A2B4A', label: 'নীল' },
};

export const FONT_FAMILIES = [
  { value: 'Noto Sans Bengali', label: 'নোটো বাংলা' },
  { value: 'Kalpurush',         label: 'কল্পুরুষ' },
  { value: 'SolaimanLipi',      label: 'সোলায়মান লিপি' },
];

// ── Apply preferences to CSS custom properties ──────────────────────────────
export function applyCSSVars(prefs) {
  const root = document.documentElement;
  root.style.setProperty('--pref-font-size',       `${prefs.fontSize}px`);
  root.style.setProperty('--pref-font-family',     `'${prefs.fontFamily}', 'Noto Sans Bengali', sans-serif`);
  root.style.setProperty('--pref-line-height',     `${prefs.lineHeight}`);
  root.style.setProperty('--pref-letter-spacing',  `${prefs.letterSpacing}px`);
  root.style.setProperty('--pref-word-spacing',    `${prefs.wordSpacing}px`);
  root.style.setProperty('--pref-bg-color',        COLOR_THEMES[prefs.colorTheme]?.bg || '#FFF8E7');
  root.style.setProperty('--pref-text-color',      TEXT_COLORS[prefs.textColor]?.color || '#2D1B00');
  root.style.setProperty('--pref-column-width',    `${prefs.columnWidth}%`);
  root.style.setProperty('--pref-highlight-color', prefs.highlightColor);
}

// ── Sync to backend (non-blocking) ──────────────────────────────────────────
async function syncToBackend(preferences) {
  try {
    const token = localStorage.getItem('fff_token');
    const userId = localStorage.getItem('fff_userId');
    if (!token || !userId) return; // Not logged in yet — skip sync

    await fetch(`/api/users/${userId}/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  } catch {
    // Silent fail — preferences already saved locally via persist middleware
  }
}

// ── Zustand Store ────────────────────────────────────────────────────────────
const usePreferencesStore = create(
  persist(
    (set, get) => ({
      preferences: { ...DEFAULT_PREFERENCES },
      isPanelOpen: false,

      // Update a single preference key
      updatePreference: (key, value) => {
        const updated = { ...get().preferences, [key]: value };
        set({ preferences: updated });
        applyCSSVars(updated);
        syncToBackend(updated); // fire-and-forget
      },

      // Update multiple preferences at once (e.g. on profile load from server)
      setPreferences: (newPrefs) => {
        const merged = { ...DEFAULT_PREFERENCES, ...newPrefs };
        set({ preferences: merged });
        applyCSSVars(merged);
      },

      // Reset to defaults
      resetPreferences: () => {
        set({ preferences: { ...DEFAULT_PREFERENCES } });
        applyCSSVars(DEFAULT_PREFERENCES);
        syncToBackend(DEFAULT_PREFERENCES);
      },

      // Toggle the preferences panel
      openPanel:  () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),
      togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
    }),
    {
      name: 'fff-preferences', // localStorage key
      partialize: (state) => ({ preferences: state.preferences }), // only persist prefs
    }
  )
);

export default usePreferencesStore;
