// Mock Data Service for Demo/Offline Mode
export const mockReports = [
  {
    id: 'report_1',
    repo_name: 'facebook/react',
    full_name: 'facebook/react',
    description: 'A declarative JavaScript library for building user interfaces',
    category: 'web-framework',
    language: 'JavaScript',
    stars: 220000,
    forks: 46000,
    open_issues: 1800,
    quality_score: 85,
    tier: 'B',
    total_findings: 12,
    critical_findings: 0,
    high_findings: 2,
    medium_findings: 7,
    low_findings: 3,
    scan_date: '2024-01-15T10:30:00Z',
    created_at: '2013-05-24T16:13:19Z',
    updated_at: '2024-01-15T09:45:00Z',
    topics: ['javascript', 'library', 'framework', 'ui'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'src/auth.js',
        line: 45,
        description: 'Hardcoded API key detected',
        category: 'security'
      },
      {
        type: 'code_quality',
        severity: 'medium',
        file: 'components/Button.jsx',
        line: 23,
        description: 'Complex function with high cyclomatic complexity',
        category: 'code_quality'
      }
    ],
    metrics: {
      code_quality: 78,
      security: 92,
      maintainability: 85,
      documentation: 80,
      test_coverage: 72
    }
  },
  {
    id: 'report_2',
    repo_name: 'vercel/next.js',
    full_name: 'vercel/next.js',
    description: 'The React Framework',
    category: 'web-framework',
    language: 'TypeScript',
    stars: 115000,
    forks: 25000,
    open_issues: 1200,
    quality_score: 88,
    tier: 'B',
    total_findings: 8,
    critical_findings: 0,
    high_findings: 1,
    medium_findings: 5,
    low_findings: 2,
    scan_date: '2024-01-15T09:15:00Z',
    created_at: '2016-01-26T00:32:03Z',
    updated_at: '2024-01-15T08:30:00Z',
    topics: ['typescript', 'framework', 'ssr', 'react'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'packages/next/server/api.ts',
        line: 156,
        description: 'Potential SQL injection vulnerability',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 85,
      security: 90,
      maintainability: 88,
      documentation: 86,
      test_coverage: 80
    }
  },
  {
    id: 'report_3',
    repo_name: 'tensorflow/tensorflow',
    full_name: 'tensorflow/tensorflow',
    description: 'An Open Source Machine Learning Framework',
    category: 'ml-ai',
    language: 'Python',
    stars: 182000,
    forks: 89000,
    open_issues: 3500,
    quality_score: 72,
    tier: 'C',
    total_findings: 28,
    critical_findings: 1,
    high_findings: 5,
    medium_findings: 15,
    low_findings: 7,
    scan_date: '2024-01-14T16:45:00Z',
    created_at: '2015-11-09T19:19:25Z',
    updated_at: '2024-01-14T15:20:00Z',
    topics: ['python', 'machine-learning', 'deep-learning', 'ai'],
    license: { key: 'apache-2.0', name: 'Apache License 2.0' },
    findings: [
      {
        type: 'security',
        severity: 'critical',
        file: 'tensorflow/core/framework/op.cc',
        line: 892,
        description: 'Buffer overflow vulnerability in operation processing',
        category: 'security'
      },
      {
        type: 'code_quality',
        severity: 'medium',
        file: 'tensorflow/python/client/session.py',
        line: 234,
        description: 'Unused import statements',
        category: 'code_quality'
      }
    ],
    metrics: {
      code_quality: 68,
      security: 70,
      maintainability: 75,
      documentation: 78,
      test_coverage: 65
    }
  },
  {
    id: 'report_4',
    repo_name: 'golang/go',
    full_name: 'golang/go',
    description: 'The Go programming language',
    category: 'web-framework',
    language: 'Go',
    stars: 118000,
    forks: 17000,
    open_issues: 800,
    quality_score: 91,
    tier: 'A',
    total_findings: 5,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 3,
    low_findings: 2,
    scan_date: '2024-01-14T14:20:00Z',
    created_at: '2009-10-06T22:56:29Z',
    updated_at: '2024-01-14T13:15:00Z',
    topics: ['go', 'programming-language', 'compiler'],
    license: { key: 'bsd-3-clause', name: 'BSD 3-Clause "New" or "Revised" License' },
    findings: [
      {
        type: 'code_quality',
        severity: 'medium',
        file: 'src/runtime/mgc.go',
        line: 567,
        description: 'Complex garbage collection logic could benefit from refactoring',
        category: 'code_quality'
      }
    ],
    metrics: {
      code_quality: 92,
      security: 95,
      maintainability: 90,
      documentation: 88,
      test_coverage: 85
    }
  },
  {
    id: 'report_5',
    repo_name: 'rust-lang/rust',
    full_name: 'rust-lang/rust',
    description: 'Empowering everyone to build reliable and efficient software.',
    category: 'web-framework',
    language: 'Rust',
    stars: 87000,
    forks: 11000,
    open_issues: 6500,
    quality_score: 94,
    tier: 'A',
    total_findings: 3,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 1,
    low_findings: 2,
    scan_date: '2024-01-14T11:30:00Z',
    created_at: '2010-10-24T21:46:28Z',
    updated_at: '2024-01-14T10:45:00Z',
    topics: ['rust', 'systems-programming', 'compiler'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'code_quality',
        severity: 'low',
        file: 'compiler/rustc_codegen_llvm/src/lib.rs',
        line: 123,
        description: 'Minor code formatting inconsistency',
        category: 'code_quality'
      }
    ],
    metrics: {
      code_quality: 96,
      security: 98,
      maintainability: 92,
      documentation: 90,
      test_coverage: 92
    }
  },
  {
    id: 'report_6',
    repo_name: 'python/cpython',
    full_name: 'python/cpython',
    description: 'The Python programming language',
    category: 'web-framework',
    language: 'Python',
    stars: 58000,
    forks: 30000,
    open_issues: 12000,
    quality_score: 79,
    tier: 'C',
    total_findings: 18,
    critical_findings: 0,
    high_findings: 3,
    medium_findings: 10,
    low_findings: 5,
    scan_date: '2024-01-13T16:20:00Z',
    created_at: '2001-05-16T17:29:27Z',
    updated_at: '2024-01-13T15:10:00Z',
    topics: ['python', 'programming-language', 'interpreter'],
    license: { key: 'psf', name: 'Python Software Foundation License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'Lib/http/server.py',
        line: 456,
        description: 'Potential HTTP request smuggling vulnerability',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 75,
      security: 78,
      maintainability: 82,
      documentation: 85,
      test_coverage: 70
    }
  },
  {
    id: 'report_7',
    repo_name: 'microsoft/vscode',
    full_name: 'microsoft/vscode',
    description: 'Visual Studio Code',
    category: 'cli-tool',
    language: 'TypeScript',
    stars: 155000,
    forks: 28000,
    open_issues: 4500,
    quality_score: 86,
    tier: 'B',
    total_findings: 10,
    critical_findings: 0,
    high_findings: 2,
    medium_findings: 6,
    low_findings: 2,
    scan_date: '2024-01-13T14:45:00Z',
    created_at: '2015-09-03T16:35:26Z',
    updated_at: '2024-01-13T13:30:00Z',
    topics: ['typescript', 'editor', 'ide', 'electron'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'src/vs/base/node/processes.ts',
        line: 234,
        description: 'Unsafe child process execution',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 84,
      security: 88,
      maintainability: 86,
      documentation: 82,
      test_coverage: 78
    }
  },
  {
    id: 'report_8',
    repo_name: 'nodejs/node',
    full_name: 'nodejs/node',
    description: 'JavaScript runtime built on Chrome V8',
    category: 'cli-tool',
    language: 'JavaScript',
    stars: 102000,
    forks: 28000,
    open_issues: 1800,
    quality_score: 81,
    tier: 'B',
    total_findings: 14,
    critical_findings: 0,
    high_findings: 3,
    medium_findings: 8,
    low_findings: 3,
    scan_date: '2024-01-12T18:30:00Z',
    created_at: '2010-07-27T14:47:14Z',
    updated_at: '2024-01-12T17:15:00Z',
    topics: ['javascript', 'runtime', 'v8', 'server'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'lib/internal/process.js',
        line: 123,
        description: 'Environment variable injection vulnerability',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 80,
      security: 82,
      maintainability: 83,
      documentation: 80,
      test_coverage: 75
    }
  }
];

export const mockStats = {
  total_repositories: 156,
  total_scans: 1248,
  average_quality_score: 76.5,
  tier_distribution: {
    A: 24,
    B: 58,
    C: 42,
    D: 20,
    F: 12
  },
  top_languages: [
    { language: 'JavaScript', count: 45, avg_score: 73 },
    { language: 'Python', count: 38, avg_score: 78 },
    { language: 'TypeScript', count: 28, avg_score: 82 },
    { language: 'Go', count: 22, avg_score: 86 },
    { language: 'Rust', count: 15, avg_score: 89 },
    { language: 'Java', count: 8, avg_score: 71 }
  ],
  security_stats: {
    total_findings: 3420,
    critical: 23,
    high: 145,
    medium: 892,
    low: 2360
  },
  recent_scans: [
    {
      id: 'scan_1',
      repo_name: 'facebook/react',
      language: 'JavaScript',
      stars: 220000,
      quality_score: 85,
      tier: 'B',
      scan_date: '2024-01-15T10:30:00Z'
    },
    {
      id: 'scan_2',
      repo_name: 'vercel/next.js',
      language: 'TypeScript',
      stars: 115000,
      quality_score: 88,
      tier: 'B',
      scan_date: '2024-01-15T09:15:00Z'
    },
    {
      id: 'scan_3',
      repo_name: 'tensorflow/tensorflow',
      language: 'Python',
      stars: 182000,
      quality_score: 72,
      tier: 'C',
      scan_date: '2024-01-14T16:45:00Z'
    }
  ]
};

export const mockCategories = [
  { id: 'web-framework', name: 'Web Frameworks', count: 45, description: 'Frontend and backend web frameworks' },
  { id: 'cli-tool', name: 'CLI Tools', count: 32, description: 'Command line utilities and tools' },
  { id: 'ml-ai', name: 'ML/AI', count: 28, description: 'Machine learning and artificial intelligence libraries' },
  { id: 'database', name: 'Databases', count: 18, description: 'Database management systems' },
  { id: 'testing', name: 'Testing', count: 15, description: 'Testing frameworks and tools' },
  { id: 'devops', name: 'DevOps', count: 12, description: 'DevOps and infrastructure tools' },
  { id: 'library', name: 'Libraries', count: 58, description: 'General purpose libraries' },
  { id: 'documentation', name: 'Documentation', count: 8, description: 'Documentation and examples' }
];

export const mockLanguages = [
  { id: 'javascript', name: 'JavaScript', count: 45 },
  { id: 'python', name: 'Python', count: 38 },
  { id: 'typescript', name: 'TypeScript', count: 28 },
  { id: 'go', name: 'Go', count: 22 },
  { id: 'rust', name: 'Rust', count: 15 },
  { id: 'java', name: 'Java', count: 18 },
  { id: 'c++', name: 'C++', count: 12 },
  { id: 'c#', name: 'C#', count: 10 }
];

export const mockTrending = [
  {
    id: 'trend_1',
    name: 'vercel/next.js',
    full_name: 'vercel/next.js',
    description: 'The React Framework',
    language: 'TypeScript',
    stars: 115000,
    today_stars: 245,
    forks: 25000,
    category: 'web-framework'
  },
  {
    id: 'trend_2',
    name: 'facebook/react',
    full_name: 'facebook/react',
    description: 'A declarative JavaScript library for building user interfaces',
    language: 'JavaScript',
    stars: 220000,
    today_stars: 189,
    forks: 46000,
    category: 'web-framework'
  },
  {
    id: 'trend_3',
    name: 'openai/transformers',
    full_name: 'openai/transformers',
    description: 'Transformers: State-of-the-art natural language processing',
    language: 'Python',
    stars: 98000,
    today_stars: 156,
    forks: 20000,
    category: 'ml-ai'
  },
  {
    id: 'trend_4',
    name: 'microsoft/vscode',
    full_name: 'microsoft/vscode',
    description: 'Visual Studio Code',
    language: 'TypeScript',
    stars: 155000,
    today_stars: 134,
    forks: 28000,
    category: 'cli-tool'
  },
  {
    id: 'trend_5',
    name: 'golang/go',
    full_name: 'golang/go',
    description: 'The Go programming language',
    language: 'Go',
    stars: 118000,
    today_stars: 98,
    forks: 17000,
    category: 'web-framework'
  }
];

// Helper function to simulate API delay
export const simulateApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, data }), delay);
  });
};

// Filter reports helper
export const filterReports = (reports, filters) => {
  return reports.filter(report => {
    if (filters.category && report.category !== filters.category) return false;
    if (filters.tier && report.tier !== filters.tier) return false;
    if (filters.language && report.language !== filters.language) return false;
    if (filters.minScore && report.quality_score < filters.minScore) return false;
    if (filters.search && !report.repo_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};