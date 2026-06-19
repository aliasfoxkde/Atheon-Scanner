import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012.708 12.708 9 9 0 01-3.646 18.646 9 9 0 00-12.708-12.708 9 9 0 013.646-18.646M12 3a9 9 0 019 9 9 9 0 019-9 9 9 0 00-9-9z" />
          </svg>
        );
      case 'light':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-9M5.636 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 3a9 9 0 019 9 9 9 0 019-9m-9 9h.01M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1m8-8a4 4 0 01-1.786-2.928M4 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Dark Mode';
      case 'light': return 'Light Mode';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative group p-2 rounded-lg bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-700 dark:border-gray-600 transition-all duration-200"
      title={`Current: ${getThemeLabel()} - Click to cycle themes`}
    >
      <div className="relative">
        {getThemeIcon()}
        {/* Theme indicator dot */}
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      </div>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {getThemeLabel()}
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
    </button>
  );
}