/**
 * Shared EmptyState component.
 * Props:
 *   icon     — emoji or string shown as the visual (default: 📭)
 *   title    — bold headline
 *   body     — optional subtitle / description
 *   action   — optional { label, onClick } for a CTA button
 */
export default function EmptyState({ icon = '📭', title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {body && <p className="text-gray-400 text-sm max-w-sm mb-6">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
