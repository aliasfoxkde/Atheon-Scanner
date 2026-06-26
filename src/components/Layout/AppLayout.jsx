import { NavLink, Link } from 'react-router-dom';
import Toast from '../Toast';

const AppLayout = ({ children }) => {
  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                Atheon Scanner
              </Link>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/reports" className={navLinkClass}>
                Reports
              </NavLink>
              <NavLink to="/trending" className={navLinkClass}>
                Trending
              </NavLink>
              <NavLink to="/submit" className={navLinkClass}>
                Submit
              </NavLink>
              <NavLink to="/pipeline" className={navLinkClass}>
                Pipeline
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </div>

            {/* Settings */}
            <div className="flex items-center">
              <Link
                to="/settings"
                className="p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Toast Container */}
      <Toast />
    </div>
  );
};

export default AppLayout;
