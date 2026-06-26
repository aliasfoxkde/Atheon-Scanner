import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  theme: 'dark',
  autoRefresh: '0',
  pageSize: '25',
  density: 'comfortable',
  columns: { name: true, language: true, score: true, stars: true, deps: true, files: true },
};

function load() {
  try {
    const raw = localStorage.getItem('atheon-settings');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function save(settings) {
  try {
    localStorage.setItem('atheon-settings', JSON.stringify(settings));
  } catch {}
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    save(settings);
  }, [settings]);

  const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
