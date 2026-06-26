import { loadRealScannerData } from './realScannerData';

export async function getReports({ search = '', language = '', sort = 'stars', order = 'desc', page = 1, pageSize = 25 } = {}) {
  const data = await loadRealScannerData();

  let filtered = data;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => r.name?.toLowerCase().includes(q));
  }
  if (language) {
    filtered = filtered.filter(r => r.language?.toLowerCase() === language.toLowerCase());
  }

  filtered.sort((a, b) => {
    const av = a[sort] ?? 0;
    const bv = b[sort] ?? 0;
    if (order === 'asc') return av > bv ? 1 : -1;
    return av < bv ? 1 : -1;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const reports = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { reports, total, page, pageSize, totalPages };
}

export async function getTrendingReports(limit = 20) {
  const data = await loadRealScannerData();
  return [...data].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)).slice(0, limit);
}

export async function getDashboardStats() {
  const data = await loadRealScannerData();

  const totalScans = data.length;
  const totalPackages = data.reduce((s, r) => s + (r.dependency_count ?? 0), 0);
  const avgScore = totalScans
    ? Math.round(data.reduce((s, r) => s + (r.quality_score ?? 0), 0) / totalScans)
    : 0;

  const languageCounts = {};
  for (const r of data) {
    const lang = r.language || 'Unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  }
  const languageCountsList = Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  const tierCounts = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const r of data) {
    const score = r.quality_score ?? 0;
    if (score >= 90) tierCounts.S++;
    else if (score >= 80) tierCounts.A++;
    else if (score >= 70) tierCounts.B++;
    else if (score >= 60) tierCounts.C++;
    else if (score >= 50) tierCounts.D++;
    else tierCounts.F++;
  }
  const tierDistribution = Object.entries(tierCounts)
    .map(([tier, count]) => ({ tier, count }));

  const recentScans = [...data]
    .sort((a, b) => (b.scan_date || '') > (a.scan_date || '') ? 1 : -1)
    .slice(0, 5);

  return { totalScans, totalPackages, avgScore, languageCounts: languageCountsList, tierDistribution, recentScans };
}

export async function getPipelineData() {
  const data = await loadRealScannerData();

  const seenRuns = new Map();
  for (const r of data) {
    const key = `${r.scan_method}::${r.scan_date}`;
    if (!seenRuns.has(key)) {
      seenRuns.set(key, { scan_method: r.scan_method, scan_date: r.scan_date });
    }
  }
  const runs = Array.from(seenRuns.values());

  const methodCounts = {};
  for (const r of data) {
    const m = r.scan_method || 'unknown';
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  }
  const patterns = Object.entries(methodCounts).map(([scan_method, count]) => ({ scan_method, count }));

  const benchmarks = {};
  for (const r of data) {
    const m = r.scan_method || 'unknown';
    if (!benchmarks[m]) benchmarks[m] = [];
    benchmarks[m].push(r.quality_score ?? 0);
  }
  const benchmarksList = Object.entries(benchmarks).map(([scan_method, scores]) => {
    const sum = scores.reduce((a, b) => a + b, 0);
    return {
      scan_method,
      avgScore: Math.round(sum / scores.length),
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
    };
  });

  return { runs, patterns, benchmarks: benchmarksList, source: 'derived_from_scans' };
}

export async function searchPackages(query) {
  const data = await loadRealScannerData();
  const q = query.toLowerCase();
  return data.filter(r => r.name?.toLowerCase().includes(q)).slice(0, 8);
}
