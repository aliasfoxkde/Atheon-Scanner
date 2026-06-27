import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

const MAX_TOASTS = 5;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast].slice(-MAX_TOASTS); // cap at 5 toasts
    case 'DISMISS':
      return state.filter((t) => t.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timers = useRef(new Map());

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    dispatch({ type: 'CLEAR' });
  }, []);

  const dismiss = useCallback((id) => {
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
    dispatch({ type: 'DISMISS', id });
  }, []);

  const show = useCallback(
    (message, { type = 'info', duration = 4000 } = {}) => {
      const id = nextId++;
      const toast = { id, message, type };
      dispatch({ type: 'ADD', toast });
      if (duration > 0) {
        const timer = setTimeout(() => {
          // Guard: skip if already dismissed (e.g., by clear())
          if (timers.current.has(id)) {
            dismiss(id);
          }
        }, duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      show,
      success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => show(msg, { ...opts, type: 'error' }),
      info: (msg, opts) => show(msg, { ...opts, type: 'info' }),
      warning: (msg, opts) => show(msg, { ...opts, type: 'warning' }),
      dismiss,
      clear,
    }),
    [toasts, show, dismiss, clear]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
