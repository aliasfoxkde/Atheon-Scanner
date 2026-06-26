let cachedData = null;

export async function loadRealScannerData() {
  if (cachedData) return cachedData;

  let response;
  let isGzipped = false;

  // Try .gz first
  try {
    response = await fetch('/embedded-data.json.gz');
    if (response.ok) {
      const contentEncoding = response.headers.get('content-encoding');
      isGzipped = contentEncoding === 'gzip' || response.url.endsWith('.gz');
    }
  } catch (_) {
    // fallback will be tried below
  }

  // Fallback to non-gzipped
  if (!response || !response.ok) {
    response = await fetch('/embedded-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load embedded data: ${response.status}`);
    }
    isGzipped = false;
  }

  let text = await response.text();
  let jsonString = text;

  // Decompress if gzipped (either via content-encoding header or .gz URL)
  if (isGzipped || response.url.endsWith('.gz')) {
    const pakoLib = window.pako || (await import('pako')).default;
    const decompressed = pakoLib.inflate(new Uint8Array(fromHexString(text)));
    jsonString = new TextDecoder().decode(decompressed);
  }

  const raw = JSON.parse(jsonString);

  // Normalize different field names to canonical structure
  cachedData = raw.map(normalizeRecord);
  return cachedData;
}

function normalizeRecord(r) {
  return {
    name: r.name || r.full_name || r.repo_name || '',
    language: r.language || '',
    quality_score: toNumber(r.quality_score ?? r.score ?? r.qualityScore ?? 0),
    stars: toNumber(r.stars ?? r.star_count ?? r.stargazers ?? 0),
    dependency_count: toNumber(r.dependency_count ?? r.dependencies ?? r.dep_count ?? 0),
    file_count: toNumber(r.file_count ?? r.files ?? r.fileCount ?? 0),
    scan_method: r.scan_method || r.scanMethod || r.method || 'unknown',
    scan_date: r.scan_date || r.scanDate || r.date || '',
    repo_url: r.repo_url || r.url || r.repoUrl || `https://github.com/${r.name || r.full_name || ''}`,
  };
}

function toNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function fromHexString(hexStr) {
  const matches = hexStr.match(/[\da-f]{2}/gi);
  if (!matches) return new Uint8Array(0);
  return new Uint8Array(matches.map(h => parseInt(h, 16)));
}
