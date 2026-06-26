import { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const DISMISS_MS = 4000;

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const schedule = useCallback((toast) => {
    timers.current[toast.id] = setTimeout(() => dismiss(toast.id), DISMISS_MS);
  }, [dismiss]);

  const show = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD', payload: { id, message, type } });
    schedule({ id });
  }, [schedule]);

  const success = useCallback((message) => show(message, 'success'), [show]);
  const error = useCallback((message) => show(message, 'error'), [show]);
  const info = useCallback((message) => show(message, 'info'), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, toasts, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
