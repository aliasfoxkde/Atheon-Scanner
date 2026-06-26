export const LANGUAGES = [
  { id: 'JavaScript', label: 'JavaScript', color: 'bg-yellow-500' },
  { id: 'TypeScript', label: 'TypeScript', color: 'bg-blue-500' },
  { id: 'Python', label: 'Python', color: 'bg-green-500' },
  { id: 'Go', label: 'Go', color: 'bg-cyan-500' },
  { id: 'Rust', label: 'Rust', color: 'bg-orange-500' },
  { id: 'Java', label: 'Java', color: 'bg-red-500' },
  { id: 'Ruby', label: 'Ruby', color: 'bg-pink-500' },
  { id: 'PHP', label: 'PHP', color: 'bg-purple-500' },
  { id: 'C++', label: 'C++', color: 'bg-gray-500' },
  { id: 'C', label: 'C', color: 'bg-gray-400' },
  { id: 'Swift', label: 'Swift', color: 'bg-orange-400' },
  { id: 'Kotlin', label: 'Kotlin', color: 'bg-violet-500' },
  { id: 'Dart', label: 'Dart', color: 'bg-blue-400' },
  { id: 'Markdown', label: 'Markdown', color: 'bg-gray-400' },
  { id: 'Shell', label: 'Shell', color: 'bg-green-400' },
];

export const SCAN_METHODS = [
  { id: 'hybrid', label: 'Hybrid', description: 'Static + dependency analysis' },
  { id: 'universal', label: 'Universal', description: 'Full ecosystem scan' },
  { id: 'comprehensive', label: 'Comprehensive', description: 'Deep multi-pass analysis' },
  { id: 'mass', label: 'Mass Scan', description: 'High-volume batch scanning' },
  { id: 'package', label: 'Package', description: 'Package registry scan' },
];

export const getLanguageColor = (lang) => LANGUAGES.find(l => l.id === lang)?.color || 'bg-gray-500';
export const getLanguageLabel = (lang) => LANGUAGES.find(l => l.id === lang)?.label || lang || 'Unknown';
