#!/usr/bin/env python3
"""
Cross-Platform Package Manager Scanner for Atheon GitHub Scanner

This scanner provides unified analysis across multiple platforms:
- Linux (apt, yum, dnf, pacman, zypper, emerge)
- BSD (pkg, ports)
- macOS (Homebrew, MacPorts)
- Windows (Chocolatey, Scoop, winget)
- Mobile platforms (CocoaPods, Gradle, Maven)

Cross-platform comparison and unified reporting.
"""

import os
import sys
import json
import time
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CrossPlatformScanner:
    """Cross-platform package manager scanner"""

    def __init__(self, output_dir: str = "../data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Cross-platform package managers
        self.platform_managers = {
            # Linux
            'linux': {
                'apt': {'name': 'APT', 'platform': 'Debian/Ubuntu', 'language': 'C'},
                'yum': {'name': 'YUM', 'platform': 'RHEL/CentOS', 'language': 'C'},
                'dnf': {'name': 'DNF', 'platform': 'Fedora', 'language': 'C'},
                'pacman': {'name': 'Pacman', 'platform': 'Arch Linux', 'language': 'C'},
                'zypper': {'name': 'Zypper', 'platform': 'openSUSE', 'language': 'C'},
            },
            # BSD
            'bsd': {
                'pkg': {'name': 'PKG', 'platform': 'FreeBSD', 'language': 'C'},
                'ports': {'name': 'Ports', 'platform': 'FreeBSD', 'language': 'C'},
            },
            # macOS
            'macos': {
                'brew': {'name': 'Homebrew', 'platform': 'macOS', 'language': 'Ruby'},
                'port': {'name': 'MacPorts', 'platform': 'macOS', 'language': 'Tcl'},
            },
            # Windows
            'windows': {
                'choco': {'name': 'Chocolatey', 'platform': 'Windows', 'language': 'PowerShell'},
                'scoop': {'name': 'Scoop', 'platform': 'Windows', 'language': 'PowerShell'},
                'winget': {'name': 'winget', 'platform': 'Windows', 'language': 'C++'},
            },
            # Mobile
            'mobile': {
                'cocoapods': {'name': 'CocoaPods', 'platform': 'iOS/macOS', 'language': 'Ruby'},
                'gradle': {'name': 'Gradle', 'platform': 'Android', 'language': 'Groovy'},
                'maven': {'name': 'Maven', 'platform': 'Android/Java', 'language': 'Java'},
            }
        }

        # Cross-platform popular packages
        self.universal_packages = [
            # Development tools
            'git', 'vim', 'emacs', 'nano', 'curl', 'wget', 'ssh',
            # Languages and runtimes
            'python', 'nodejs', 'ruby', 'golang', 'rust', 'java',
            # Databases
            'postgresql', 'mysql', 'redis', 'mongodb', 'sqlite',
            # Web servers
            'nginx', 'apache', 'caddy',
            # Build tools
            'cmake', 'make', 'gcc', 'clang',
            # Compression
            'zip', 'unzip', 'gzip', 'bzip2',
            # Network tools
            'openssl', 'openssh', 'iptables', 'nmap'
        ]

        self.scanned_count = 0
        self.cross_platform_results = []

    def search_github_cross_platform(self, package_name: str, platform: str) -> List[Dict]:
        """Search GitHub for cross-platform packages"""
        try:
            search_terms = [
                f"{package_name} {platform}",
                f"{package_name} cross-platform",
                f"{package_name} portable"
            ]

            results = []
            for term in search_terms:
                try:
                    # Multi-language search for cross-platform projects
                    languages = ['C', 'C++', 'Python', 'Java', 'Ruby', 'Go', 'Rust']

                    for lang in languages:
                        search_url = f"https://api.github.com/search/repositories?q={term}+language:{lang}&sort=stars&order=desc&per_page=3"

                        response = requests.get(search_url, timeout=10)
                        if response.status_code == 200:
                            data = response.json()
                            if 'items' in data:
                                for item in data['items']:
                                    results.append({
                                        'name': item['name'],
                                        'full_name': item['full_name'],
                                        'url': item['html_url'],
                                        'stars': item['stargazers_count'],
                                        'language': item.get('language', 'Unknown'),
                                        'description': item.get('description', ''),
                                        'source': f'cross_platform:{platform}',
                                        'package_name': package_name,
                                        'platform': platform
                                    })
                                    logger.info(f"Found cross-platform repo: {item['full_name']}")

                        time.sleep(0.5)  # Rate limiting

                except Exception as e:
                    logger.debug(f"Search failed: {e}")
                    continue

            return results

        except Exception as e:
            logger.error(f"Error in cross-platform search for {package_name}: {e}")
            return []

    def scan_platform(self, platform_name: str, limit: int = 5) -> List[Dict]:
        """Scan a specific platform's package managers"""
        if platform_name not in self.platform_managers:
            logger.error(f"Unknown platform: {platform_name}")
            return []

        platform_data = self.platform_managers[platform_name]
        logger.info(f"Scanning {platform_name.upper()} platform")

        results = []

        # Scan popular packages for this platform
        packages_to_scan = self.universal_packages[:limit]

        for package_name in packages_to_scan:
            try:
                logger.info(f"Searching for {platform_name} package: {package_name}")

                # Search GitHub for cross-platform repositories
                github_repos = self.search_github_cross_platform(package_name, platform_name)

                for repo in github_repos:
                    results.append(repo)
                    self.cross_platform_results.append(repo)
                    self.scanned_count += 1

                time.sleep(1)  # Rate limiting

            except Exception as e:
                logger.error(f"Error scanning {package_name} for {platform_name}: {e}")
                continue

        return results

    def compare_platforms(self) -> Dict:
        """Compare packages across platforms"""
        comparison = {
            'platforms': {},
            'shared_packages': [],
            'platform_specific': {},
            'cross_platform_count': 0
        }

        # Analyze cross-platform results
        for repo in self.cross_platform_results:
            package = repo.get('package_name', 'unknown')
            platform = repo.get('platform', 'unknown')

            if package not in comparison['platforms']:
                comparison['platforms'][package] = set()
            comparison['platforms'][package].add(platform)

        # Find shared packages (available on multiple platforms)
        for package, platforms in comparison['platforms'].items():
            if len(platforms) > 1:
                comparison['shared_packages'].append({
                    'package': package,
                    'platforms': list(platforms),
                    'count': len(platforms)
                })
                comparison['cross_platform_count'] += 1

        return comparison

    def save_results(self, results: List[Dict], platform: str = "cross_platform"):
        """Save scan results to JSONL file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"cross_platform_scan_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in results:
                f.write(json.dumps(result) + '\n')

        logger.info(f"Saved {len(results)} results to {output_file}")
        return str(output_file)

    def generate_cross_platform_summary(self) -> Dict:
        """Generate comprehensive cross-platform summary"""
        comparison = self.compare_platforms()

        summary = {
            'scan_type': 'cross_platform',
            'timestamp': datetime.now().isoformat(),
            'total_repos_scanned': self.scanned_count,
            'platforms_analyzed': list(self.platform_managers.keys()),
            'cross_platform_packages': comparison['cross_platform_count'],
            'most_portable_packages': sorted(
                comparison['shared_packages'],
                key=lambda x: x['count'],
                reverse=True
            )[:10],
            'total_repos_found': len(self.cross_platform_results),
            'top_cross_platform_repos': sorted(
                self.cross_platform_results,
                key=lambda x: x.get('stars', 0),
                reverse=True
            )[:10]
        }

        return summary

    def run_cross_platform_scan(self, target_count: int = 30) -> Dict:
        """Run comprehensive cross-platform scan"""
        logger.info(f"🌍 STARTING CROSS-PLATFORM SCAN: {target_count} packages")

        all_results = []

        # Scan each platform
        for platform_name in self.platform_managers.keys():
            if len(all_results) >= target_count:
                break

            try:
                results = self.scan_platform(platform_name, limit=3)
                all_results.extend(results)

                logger.info(f"Found {len(results)} repos from {platform_name}")

            except Exception as e:
                logger.error(f"Error scanning {platform_name}: {e}")
                continue

        # Save results
        output_file = self.save_results(all_results)

        # Generate and save summary
        summary = self.generate_cross_platform_summary()
        summary_file = self.output_dir / f"cross_platform_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)

        logger.info(f"✅ CROSS-PLATFORM SCAN COMPLETE: {len(all_results)} GitHub repositories found")
        logger.info(f"🌍 Cross-platform packages: {summary['cross_platform_packages']}")
        logger.info(f"📁 Results saved to: {output_file}")
        logger.info(f"📊 Summary saved to: {summary_file}")

        return summary

def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='Scan cross-platform package managers')
    parser.add_argument('--count', type=int, default=30, help='Number of packages to scan')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--platform', type=str, help='Specific platform to scan')

    args = parser.parse_args()

    scanner = CrossPlatformScanner(output_dir=args.output)

    if args.platform:
        # Scan specific platform
        results = scanner.scan_platform(args.platform, limit=args.count)
        scanner.save_results(results, args.platform)
    else:
        # Run comprehensive cross-platform scan
        summary = scanner.run_cross_platform_scan(target_count=args.count)

        print(f"\n🌍 CROSS-PLATFORM SCAN SUMMARY:")
        print(f"Total repositories found: {summary['total_repos_found']}")
        print(f"Cross-platform packages: {summary['cross_platform_packages']}")
        print(f"Platforms analyzed: {', '.join(summary['platforms_analyzed'])}")
        print(f"Most portable packages:")
        for pkg in summary['most_portable_packages']:
            print(f"  - {pkg['package']} ({pkg['count']} platforms)")

if __name__ == "__main__":
    main()