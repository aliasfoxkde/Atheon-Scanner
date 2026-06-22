import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcuts.
 * Supports:
 *   /          → focus search (when on /reports)
 *   g d/r/t/s/p/a → navigate to dashboard/reports/trending/submit/pipeline/api
 *   g s e        → navigate to Settings
 *   ?          → open shortcuts modal
 *   Esc        → close any modal
 */
const NAV_SEQUENCE_TIMEOUT = 1200;

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const lastG = useRef(0);
  const lastSe = useRef(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handler(e) {
      // Don't trigger when typing in an input
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }

      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        // Focus the first search input on the page if it exists
        const search = document.querySelector('input[type="search"], input[data-search]');
        if (search) search.focus();
        return;
      }

      if (e.key === 'g') {
        lastG.current = Date.now();
        return;
      }

      // g+s+e → Settings (nested sequence)
      if (lastG.current && e.key === 's' && Date.now() - lastG.current < NAV_SEQUENCE_TIMEOUT) {
        lastSe.current = Date.now();
        lastG.current = 0;
        return; // wait for 'e'
      }

      if (lastSe.current && e.key === 'e' && Date.now() - lastSe.current < NAV_SEQUENCE_TIMEOUT) {
        e.preventDefault();
        lastSe.current = 0;
        navigate('/settings');
        return;
      }

      // g+s without 'e' → Submit (after g+s+e window expires without 'e')
      if (lastSe.current && Date.now() - lastSe.current >= NAV_SEQUENCE_TIMEOUT) {
        lastSe.current = 0;
      }

      if (Date.now() - lastG.current < NAV_SEQUENCE_TIMEOUT) {
        const routes = { d: '/dashboard', r: '/reports', t: '/trending', s: '/submit', p: '/pipeline', a: '/api' };
        const target = routes[e.key];
        if (target) {
          e.preventDefault();
          lastG.current = 0;
          navigate(target);
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return { showHelp, setShowHelp };
}

export function ShortcutsModal({ open, onClose }) {
  if (!open) return null;
  const items = [
    { keys: ['/'], desc: 'Focus search' },
    { keys: ['g', 'd'], desc: 'Go to Dashboard' },
    { keys: ['g', 'r'], desc: 'Go to Reports' },
    { keys: ['g', 't'], desc: 'Go to Trending' },
    { keys: ['g', 's'], desc: 'Go to Submit' },
    { keys: ['g', 'p'], desc: 'Go to Pipeline' },
    { keys: ['g', 'a'], desc: 'Go to API docs' },
    { keys: ['g', 's', 'e'], desc: 'Go to Settings' },
    { keys: ['?'], desc: 'Toggle this help' },
    { keys: ['Esc'], desc: 'Close modal / blur input' },
  ];
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">Keyboard shortcuts</h2>
        <ul className="space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="text-gray-300">{it.desc}</span>
              <span className="flex gap-1">
                {it.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-0.5 bg-gray-900 border border-gray-600 rounded text-xs font-mono text-gray-200"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
