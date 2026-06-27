// Shared color utilities — used across Dashboard, Reports, ReportDetailModal

export function getScoreColor(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return 'text-gray-400';
  if (score >= 90) return 'text-green-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function getTierColor(tier) {
  switch (tier) {
    case 'A':
      return 'bg-green-500 text-white';
    case 'B':
      return 'bg-blue-500 text-white';
    case 'C':
      return 'bg-yellow-500 text-white';
    case 'D':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-red-500 text-white';
  }
}
