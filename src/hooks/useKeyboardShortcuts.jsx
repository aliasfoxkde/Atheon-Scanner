import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const gKeyTimer = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      // '/' focuses search on reports page
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const el = document.getElementById('reports-search');
        if (el) el.focus();
        return;
      }

      // Escape closes modals
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-modals'));
        return;
      }

      // Chord: 'g' followed by another key
      if (e.key === 'g' && !isInput) {
        gKeyTimer.current = setTimeout(() => {
          gKeyTimer.current = null;
        }, 500);
        return;
      }

      if (gKeyTimer.current) {
        clearTimeout(gKeyTimer.current);
        gKeyTimer.current = null;

        switch (e.key) {
          case 'd':
            navigate('/dashboard');
            break;
          case 'r':
            navigate('/reports');
            break;
          case 't':
            navigate('/trending');
            break;
          case 's':
            navigate('/submit');
            break;
          case 'p':
            navigate('/pipeline');
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gKeyTimer.current) clearTimeout(gKeyTimer.current);
    };
  }, [navigate]);
}
