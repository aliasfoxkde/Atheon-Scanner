import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'atheon_settings';
const DEFAULTS = {
  autoRefreshInterval: 30, // seconds; 0 = off
  defaultPageSize: 10,
  density: 'comfortable', // compact | comfortable
  showStars: true,
  showDeps: true,
  showFiles: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULTS, ...stored };
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

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const reset = () => setSettings(DEFAULTS);

  return (
    <SettingsContext.Provider value={{ settings, update, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
