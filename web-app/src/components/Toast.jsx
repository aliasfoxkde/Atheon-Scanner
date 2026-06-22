import { useToast } from '../contexts/ToastContext';

const TYPE_STYLES = {
  success: { bg: 'bg-green-600', icon: '✓' },
  error: { bg: 'bg-red-600', icon: '✕' },
  info: { bg: 'bg-blue-600', icon: 'ℹ' },
  warning: { bg: 'bg-yellow-600', icon: '⚠' },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none max-h-[90vh] overflow-y-auto"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const style = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto ${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in`}
            role="alert"
          >
            <span className="text-lg leading-none flex-shrink-0 mt-0.5" aria-hidden="true">
              {style.icon}
            </span>
            <p className="flex-1 text-sm break-words">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-white/80 hover:text-white text-lg leading-none"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
