import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'atheon_settings';
const DEFAULTS = {
  autoRefreshInterval: 30, // seconds; 0 = off
  defaultPageSize: 10,
  density: 'comfortable', // compact | comfortable
  showStars: true,
  showDeps: true,
  showFiles: true,
};

// Validate and sanitize loaded settings against defaults
function validateSettings(stored) {
  const validated = {};
  for (const key of Object.keys(DEFAULTS)) {
    const def = DEFAULTS[key];
    const val = stored[key];
    if (val === undefined) continue;
    // Type check: only allow same-type values
    if (typeof val === typeof def) {
      validated[key] = val;
    }
  }
  return validated;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULTS, ...validateSettings(stored) };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota errors */
    }
  }, [settings]);

  const updateSettings = useMemo(
    () => (patch) => setSettings((s) => ({ ...s, ...validateSettings(patch) })),
    []
  );
  const reset = useMemo(() => () => setSettings(DEFAULTS), []);

  const value = useMemo(
    () => ({ settings, updateSettings, reset }),
    [settings, updateSettings, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
