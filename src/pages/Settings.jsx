import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SECTION_NAMES = {
  appearance: 'Appearance',
  data: 'Data',
  display: 'Display',
  about: 'About',
};

const DEFAULTS = {
  theme: 'dark',
  density: 'comfortable',
  autoRefreshInterval: 60,
  defaultPageSize: 25,
  visibleColumns: ['name', 'language', 'score', 'stars', 'dependencies', 'files'],
};

export default function Settings() {
  useDocumentTitle('Settings — Atheon Scanner');

  const { settings, updateSetting, resetSettings } = useSettings();
  const { showToast } = useToast();

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleResetClick = () => {
    if (resetConfirm) {
      resetSettings();
      setResetConfirm(false);
      showToast('Settings reset to defaults', 'success');
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  const columnOptions = [
    { key: 'name', label: 'Name' },
    { key: 'language', label: 'Language' },
    { key: 'score', label: 'Score' },
    { key: 'stars', label: 'Stars' },
    { key: 'dependencies', label: 'Dependencies' },
    { key: 'files', label: 'Files' },
  ];

  const handleColumnToggle = (columnKey) => {
    const current = settings.visibleColumns || [];
    const updated = current.includes(columnKey)
      ? current.filter((c) => c !== columnKey)
      : [...current, columnKey];
    updateSetting('visibleColumns', updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Appearance Section */}
      <section aria-labelledby="appearance-heading">
        <h2
          id="appearance-heading"
          className="text-lg font-semibold text-gray-100 mb-4"
          data-testid="section-heading"
        >
          {SECTION_NAMES.appearance}
        </h2>

        {/* Theme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Theme
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settings.theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => updateSetting('theme', 'dark')}
              aria-pressed={settings.theme === 'dark'}
            >
              Dark
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
              disabled
              title="Light theme coming soon"
            >
              Light
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
              disabled
              title="System theme coming soon"
            >
              System
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Light and System themes are coming soon
          </p>
        </div>

        {/* Density */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Density
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settings.density === 'comfortable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => updateSetting('density', 'comfortable')}
              aria-pressed={settings.density === 'comfortable'}
            >
              Comfortable
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settings.density === 'compact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => updateSetting('density', 'compact')}
              aria-pressed={settings.density === 'compact'}
            >
              Compact
            </button>
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section aria-labelledby="data-heading">
        <h2
          id="data-heading"
          className="text-lg font-semibold text-gray-100 mb-4"
          data-testid="section-heading"
        >
          {SECTION_NAMES.data}
        </h2>

        {/* Auto-refresh interval */}
        <div className="mb-6">
          <label
            htmlFor="auto-refresh-select"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Auto-refresh interval
          </label>
          <select
            id="auto-refresh-select"
            value={settings.autoRefreshInterval}
            onChange={(e) =>
              updateSetting('autoRefreshInterval', Number(e.target.value))
            }
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Off</option>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>

        {/* Default page size */}
        <div>
          <label
            htmlFor="page-size-select"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Default page size
          </label>
          <select
            id="page-size-select"
            value={settings.defaultPageSize}
            onChange={(e) =>
              updateSetting('defaultPageSize', Number(e.target.value))
            }
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </section>

      {/* Display Section */}
      <section aria-labelledby="display-heading">
        <h2
          id="display-heading"
          className="text-lg font-semibold text-gray-100 mb-4"
          data-testid="section-heading"
        >
          {SECTION_NAMES.display}
        </h2>

        {/* Column visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Column visibility
          </label>
          <div className="space-y-2">
            {columnOptions.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    !settings.visibleColumns ||
                    settings.visibleColumns.includes(key)
                  }
                  onChange={() => handleColumnToggle(key)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section aria-labelledby="about-heading">
        <h2
          id="about-heading"
          className="text-lg font-semibold text-gray-100 mb-4"
          data-testid="section-heading"
        >
          {SECTION_NAMES.about}
        </h2>

        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="text-gray-400 w-32">Version:</dt>
            <dd className="text-gray-200">1.0.0</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-gray-400 w-32">Data source:</dt>
            <dd className="text-gray-200">Embedded JSON (static)</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-gray-400 w-32">Last build:</dt>
            <dd className="text-gray-200">{__BUILD_DATE__ || 'Development'}</dd>
          </div>
          <div className="flex gap-4 pt-2">
            <dt className="text-gray-400 w-32">Description:</dt>
            <dd className="text-gray-200">
              Atheon GitHub Scanner is a comprehensive security and quality analysis tool
              that scans GitHub repositories to identify vulnerabilities, assess code quality,
              and provide actionable insights for improving your projects.
            </dd>
          </div>
        </dl>
      </section>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleResetClick}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            resetConfirm
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {resetConfirm ? 'Click again to confirm' : 'Reset to Defaults'}
        </button>
        {resetConfirm && (
          <p className="mt-2 text-xs text-red-400">
            This will reset all settings to their default values.
          </p>
        )}
      </div>
    </div>
  );
}
