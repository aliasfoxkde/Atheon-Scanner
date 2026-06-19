import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const AppLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Atheon Scanner</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors">Code Security & Quality Analysis</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                Dashboard
              </Link>
              <Link to="/reports" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/reports')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                Reports
              </Link>
              <Link to="/trending" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/trending')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                Trending
              </Link>
              <Link to="/submit" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/submit')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                Submit
              </Link>
              <Link to="/pipeline" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/pipeline')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                Pipeline
              </Link>
              <Link to="/api" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/api')
                  ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                API
              </Link>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button & Theme Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/reports') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Reports
              </Link>
              <Link
                to="/trending"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/trending') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Trending
              </Link>
              <Link
                to="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/submit') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Submit
              </Link>
              <Link
                to="/pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/pipeline') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Pipeline
              </Link>
              <Link
                to="/api"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/api') ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                API
              </Link>

              {/* Theme Toggle in Mobile Menu */}
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Theme</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('theme-toggle')?.click();
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center"
                  >
                    Toggle Theme
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Powered by</h3>
              <p className="mt-2 text-sm text-gray-400">
                Patterns from <a href="https://github.com/HoraDomu/Atheon" className="text-blue-400 hover:text-blue-300">Atheon</a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Resources</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/api" className="hover:text-white">API Reference</Link></li>
                <li><a href="https://github.com/aliasfoxkde/Atheon-GitHub-Scanner" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Community</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li><a href="https://github.com/aliasfoxkde/Atheon-GitHub-Scanner/issues" className="hover:text-white">Report Issues</a></li>
                <li><a href="https://github.com/aliasfoxkde/Atheon-GitHub-Scanner/discussions" className="hover:text-white">Discussions</a></li>
                <li><a href="https://github.com/HoraDomu/Atheon" className="hover:text-white">Atheon Project</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
            <p>© 2026 Atheon GitHub Scanner. Open source security analysis tool.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;