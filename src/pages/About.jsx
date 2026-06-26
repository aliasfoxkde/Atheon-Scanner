import { useDocumentTitle } from '../hooks/useDocumentTitle';

const FEATURES = [
  'Security Analysis',
  'Quality Scoring',
  'Dependency Tracking',
  'Vulnerability Detection',
  'Code Complexity Metrics',
  'License Compliance',
];

const TECH_STACK = [
  'React',
  'Tailwind CSS',
  'Vite',
  'JavaScript',
  'GitHub API',
];

const LINKS = [
  { label: 'Documentation', href: '#' },
  { label: 'GitHub Repository', href: '#' },
  { label: 'Report an Issue', href: '#' },
];

export default function About() {
  useDocumentTitle('About — Atheon Scanner');

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Atheon GitHub Scanner
        </h1>
        <p className="text-gray-400">
          Comprehensive security and quality analysis for GitHub repositories
        </p>
      </div>

      {/* Description */}
      <section aria-labelledby="description-heading">
        <h2 id="description-heading" className="text-lg font-semibold text-gray-100 mb-3">
          About the Application
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Atheon GitHub Scanner is a powerful tool designed to help developers and security
          teams analyze GitHub repositories for potential security vulnerabilities, code
          quality issues, and dependency risks. By leveraging comprehensive scanning
          algorithms, it provides actionable insights that help maintain high standards
          of code quality and security across your projects.
        </p>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-lg font-semibold text-gray-100 mb-3">
          Features
        </h2>
        <ul className="grid grid-cols-2 gap-2">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Tech Stack */}
      <section aria-labelledby="tech-heading">
        <h2 id="tech-heading" className="text-lg font-semibold text-gray-100 mb-3">
          Technology Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Links */}
      <section aria-labelledby="links-heading">
        <h2 id="links-heading" className="text-lg font-semibold text-gray-100 mb-3">
          Links
        </h2>
        <ul className="space-y-2">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-blue-500 hover:text-blue-400 text-sm underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Version Info */}
      <section aria-labelledby="version-heading" className="pt-4 border-t border-gray-700">
        <h2 id="version-heading" className="text-lg font-semibold text-gray-100 mb-3">
          Version Information
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-4">
            <dt className="text-gray-400">Version:</dt>
            <dd className="text-gray-200">1.0.0</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-gray-400">Build:</dt>
            <dd className="text-gray-200">{__BUILD_DATE__ || 'Development'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
