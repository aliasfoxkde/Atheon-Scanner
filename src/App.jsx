import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Trending from './pages/Trending';
import Submit from './pages/Submit';
import Pipeline from './pages/Pipeline';
import Settings from './pages/Settings';
import About from './pages/About';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';

export default function App() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleSwUpdate = async () => {
      if (!navigator.serviceWorker.controller) return;
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      } catch {
        // SW registration unavailable — skip reload
      }
    };

    navigator.serviceWorker?.addEventListener('controllerchange', handleSwUpdate);
    return () => navigator.serviceWorker?.removeEventListener('controllerchange', handleSwUpdate);
  }, []);

  return (
    <ErrorBoundary>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  );
}
