import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import pkg from '../../package.json';
import { useToast } from '../contexts/ToastContext';

const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Settings() {
  const { settings, update, reset } = useSettings();
  const { theme, setThemeMode } = useTheme();
  const toast = useToast();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      toast.success('Settings reset to defaults');
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm">Personalize your Atheon Scanner experience</p>
      </div>

      {/* Appearance */}
      <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setThemeMode(t);
                    toast.info(`Theme set to ${t}`);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    theme === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Data</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto-refresh interval
            </label>
            <select
              value={settings.autoRefreshInterval}
              onChange={(e) => update({ autoRefreshInterval: Number(e.target.value) })}
              className="w-full sm:w-auto bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How often the dashboard refetches data from the embedded source.
            </p>
          </div>
        </div>
      </section>

      {/* Display */}
      <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Display</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default page size</label>
            <select
              value={settings.defaultPageSize}
              onChange={(e) => update({ defaultPageSize: Number(e.target.value) })}
              className="w-full sm:w-auto bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Density</label>
            <div className="grid grid-cols-2 gap-2 max-w-xs">
              {['comfortable', 'compact'].map((d) => (
                <button
                  key={d}
                  onClick={() => update({ density: d })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    settings.density === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-300 mb-2">Show columns</span>
            <div className="space-y-2">
              {[
                ['showStars', 'GitHub stars'],
                ['showDeps', 'Dependencies'],
                ['showFiles', 'File count'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => update({ [key]: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">About</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <dt className="text-gray-400">App</dt>
          <dd className="text-white">{pkg.name.replace(/-/g, ' ').replace(/pwa/i, 'PWA')}</dd>
          <dt className="text-gray-400">Version</dt>
          <dd className="text-white">{pkg.version}</dd>
          <dt className="text-gray-400">Data source</dt>
          <dd className="text-white">Embedded + Cloudflare Worker</dd>
          <dt className="text-gray-400">Storage</dt>
          <dd className="text-white">localStorage (settings) / IndexedDB (PWA cache)</dd>
        </dl>
        <button
          onClick={handleReset}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showResetConfirm ? 'Click again to confirm reset' : 'Reset all settings'}
        </button>
      </section>
    </div>
  );
}
