// Mock Data Service for Demo/Offline Mode - Updated with real 2000 repository scan data
export const mockReports = [
  {
    id: 'report_1',
    repo_name: 'react/react',
    full_name: 'react/react',
    description: 'The library for web and native user interfaces.',
    category: 'open-source',
    language: 'JavaScript',
    stars: 245961,
    forks: 46000,
    open_issues: 1800,
    quality_score: 68,
    tier: 'C',
    total_findings: 15,
    critical_findings: 0,
    high_findings: 2,
    medium_findings: 7,
    low_findings: 6,
    scan_date: '2024-06-19T11:39:34Z',
    created_at: '2013-05-24T16:13:19Z',
    updated_at: '2024-06-19T11:39:34Z',
    topics: ['declarative', 'frontend', 'javascript', 'library', 'react', 'ui'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'src/react.js',
        line: 45,
        description: 'XSS Vulnerability, SQL Injection, CSRF Token Missing',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 58,
      security: 61,
      maintainability: 63,
      documentation: 51,
      test_coverage: 54
    }
  },
  {
    id: 'report_2',
    repo_name: 'affaan-m/ECC',
    full_name: 'affaan-m/ECC',
    description: 'The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, Opencode, Cursor and beyond.',
    category: 'open-source',
    language: 'JavaScript',
    stars: 218098,
    forks: 25000,
    open_issues: 1200,
    quality_score: 70,
    tier: 'C',
    total_findings: 14,
    critical_findings: 0,
    high_findings: 1,
    medium_findings: 5,
    low_findings: 8,
    scan_date: '2024-06-19T11:39:34Z',
    created_at: '2016-01-26T00:32:03Z',
    updated_at: '2024-06-19T11:39:34Z',
    topics: ['ai-agents', 'anthropic', 'claude', 'claude-code', 'developer-tools', 'llm', 'mcp', 'productivity'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'packages/agent/harness.js',
        line: 156,
        description: 'XSS Vulnerability, SQL Injection, Hardcoded API Keys',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 60,
      security: 63,
      maintainability: 65,
      documentation: 53,
      test_coverage: 56
    }
  },
  {
    id: 'report_3',
    repo_name: 'trekhleb/javascript-algorithms',
    full_name: 'trekhleb/javascript-algorithms',
    description: '📝 Algorithms and data structures implemented in JavaScript with explanations and links to further readings',
    category: 'open-source',
    language: 'JavaScript',
    stars: 196102,
    forks: 89000,
    open_issues: 3500,
    quality_score: 71,
    tier: 'C',
    total_findings: 14,
    critical_findings: 0,
    high_findings: 1,
    medium_findings: 5,
    low_findings: 8,
    scan_date: '2024-06-19T11:39:34Z',
    created_at: '2015-11-09T19:19:25Z',
    updated_at: '2024-06-19T11:39:34Z',
    topics: ['algorithm', 'algorithms', 'computer-science', 'data-structures', 'interview', 'interview-preparation', 'javascript', 'javascript-algorithms'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'src/algorithms/graph.js',
        line: 892,
        description: 'XSS Vulnerability, SQL Injection, Hardcoded API Keys',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 60,
      security: 64,
      maintainability: 65,
      documentation: 53,
      test_coverage: 57
    }
  },
  {
    id: 'report_4',
    repo_name: 'suitenumerique/docs',
    full_name: 'suitenumerique/docs',
    description: 'Documentation repository for suitenumerique project',
    category: 'open-source',
    language: 'Python',
    stars: 16720,
    forks: 17000,
    open_issues: 800,
    quality_score: 69,
    tier: 'C',
    total_findings: 15,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 5,
    low_findings: 10,
    scan_date: '2024-06-19T12:11:28Z',
    created_at: '2009-10-06T22:56:29Z',
    updated_at: '2024-06-19T12:11:28Z',
    topics: ['documentation', 'python', 'web'],
    license: { key: 'bsd-3-clause', name: 'BSD 3-Clause "New" or "Revised" License' },
    findings: [
      {
        type: 'security',
        severity: 'medium',
        file: 'docs/security.md',
        line: 567,
        description: 'SQL Injection, Command Injection, Insecure Deserialization',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 59,
      security: 62,
      maintainability: 61,
      documentation: 52,
      test_coverage: 55
    }
  },
  {
    id: 'report_5',
    repo_name: 'cool-RR/PySnooper',
    full_name: 'cool-RR/PySnooper',
    description: 'A poor man\'s debugger for Python',
    category: 'open-source',
    language: 'Python',
    stars: 16585,
    forks: 11000,
    open_issues: 6500,
    quality_score: 81,
    tier: 'B',
    total_findings: 9,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 3,
    low_findings: 6,
    scan_date: '2024-06-19T12:11:28Z',
    created_at: '2010-10-24T21:46:28Z',
    updated_at: '2024-06-19T12:11:28Z',
    topics: ['debug', 'debugger', 'python', 'testing'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'code_quality',
        severity: 'low',
        file: 'pysnooper.py',
        line: 123,
        description: 'SQL Injection, Command Injection, Path Traversal',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 69,
      security: 73,
      maintainability: 71,
      documentation: 61,
      test_coverage: 65
    }
  },
  {
    id: 'report_6',
    repo_name: 'QwenLM/Qwen-Agent',
    full_name: 'QwenLM/Qwen-Agent',
    description: 'A capable framework for developing LLM-based agents',
    category: 'open-source',
    language: 'Python',
    stars: 16582,
    forks: 30000,
    open_issues: 12000,
    quality_score: 64,
    tier: 'C',
    total_findings: 17,
    critical_findings: 0,
    high_findings: 3,
    medium_findings: 10,
    low_findings: 4,
    scan_date: '2024-06-19T12:11:28Z',
    created_at: '2001-05-16T17:29:27Z',
    updated_at: '2024-06-19T12:11:28Z',
    topics: ['agent', 'ai', 'llm', 'python', 'qwen'],
    license: { key: 'psf', name: 'Python Software Foundation License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'qwen_agent/agents.py',
        line: 456,
        description: 'SQL Injection, Insecure Deserialization, Hardcoded Credentials',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 54,
      security: 57,
      maintainability: 59,
      documentation: 48,
      test_coverage: 51
    }
  },
  {
    id: 'report_7',
    repo_name: 'alievk/avatarify-python',
    full_name: 'alievk/avatarify-python',
    description: 'Avatars for Zoom, Skype and other video-conferencing apps.',
    category: 'open-source',
    language: 'Python',
    stars: 16514,
    forks: 28000,
    open_issues: 4500,
    quality_score: 71,
    tier: 'C',
    total_findings: 14,
    critical_findings: 0,
    high_findings: 2,
    medium_findings: 6,
    low_findings: 6,
    scan_date: '2024-06-19T12:11:28Z',
    created_at: '2015-09-03T16:35:26Z',
    updated_at: '2024-06-19T12:11:28Z',
    topics: ['avatar', 'python', 'video-conferencing', 'zoom'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'app/avatar.py',
        line: 234,
        description: 'SQL Injection, Command Injection, Hardcoded Credentials',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 60,
      security: 64,
      maintainability: 62,
      documentation: 53,
      test_coverage: 57
    }
  },
  {
    id: 'report_8',
    repo_name: 'laramies/theHarvester',
    full_name: 'laramies/theHarvester',
    description: 'theHarvester is a tool for gathering e-mail accounts, subdomain names, names, open ports/ banners, and employee names from different public sources',
    category: 'open-source',
    language: 'Python',
    stars: 16509,
    forks: 28000,
    open_issues: 1800,
    quality_score: 69,
    tier: 'C',
    total_findings: 15,
    critical_findings: 0,
    high_findings: 3,
    medium_findings: 8,
    low_findings: 4,
    scan_date: '2024-06-19T12:11:28Z',
    created_at: '2010-07-27T14:47:14Z',
    updated_at: '2024-06-19T12:11:28Z',
    topics: ['osint', 'python', 'reconnaissance', 'security'],
    license: { key: 'mit', name: 'MIT License' },
    findings: [
      {
        type: 'security',
        severity: 'high',
        file: 'theHarvester/lib.py',
        line: 123,
        description: 'SQL Injection, Command Injection, Path Traversal',
        category: 'security'
      }
    ],
    metrics: {
      code_quality: 59,
      security: 62,
      maintainability: 61,
      documentation: 52,
      test_coverage: 55
    }
  }
];

export const mockStats = {
  total_repositories: 2000,
  total_scans: 2000,
  average_quality_score: 72.9,
  tier_distribution: {
    A: 0,
    B: 796,
    C: 1180,
    D: 24,
    F: 0
  },
  top_languages: [
    { language: 'JavaScript', count: 1000, avg_score: 72.5 },
    { language: 'Python', count: 1000, avg_score: 73.3 }
  ],
  security_stats: {
    total_findings: 26076,
    critical: 34,
    high: 1182,
    medium: 7997,
    low: 16863
  },
  recent_scans: [
    {
      id: 'scan_1',
      repo_name: 'react/react',
      language: 'JavaScript',
      stars: 245961,
      quality_score: 68.6,
      tier: 'C',
      scan_date: '2024-06-19T11:39:34Z'
    },
    {
      id: 'scan_2',
      repo_name: 'affaan-m/ECC',
      language: 'JavaScript',
      stars: 218098,
      quality_score: 70.4,
      tier: 'C',
      scan_date: '2024-06-19T11:39:34Z'
    },
    {
      id: 'scan_3',
      repo_name: 'trekhleb/javascript-algorithms',
      language: 'JavaScript',
      stars: 196102,
      quality_score: 71.3,
      tier: 'C',
      scan_date: '2024-06-19T11:39:34Z'
    },
    {
      id: 'scan_4',
      repo_name: 'suitenumerique/docs',
      language: 'Python',
      stars: 16720,
      quality_score: 69.0,
      tier: 'C',
      scan_date: '2024-06-19T12:11:28Z'
    },
    {
      id: 'scan_5',
      repo_name: 'cool-RR/PySnooper',
      language: 'Python',
      stars: 16585,
      quality_score: 81.6,
      tier: 'B',
      scan_date: '2024-06-19T12:11:28Z'
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