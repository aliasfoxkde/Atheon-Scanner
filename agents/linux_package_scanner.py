#!/usr/bin/env python3
"""
Linux Package Manager Scanner for Atheon GitHub Scanner

This scanner analyzes Linux packages and their repositories across different
package managers (apt, yum, dnf, pacman, etc.) to find GitHub repositories
and analyze them using Atheon patterns.
"""

import os
import sys
import json
import time
import logging
import subprocess
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

class LinuxPackageScanner:
    """Scanner for Linux package managers and their GitHub repositories"""

    def __init__(self, output_dir: str = "../data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Linux package managers configuration
        self.package_managers = {
            'apt': {
                'name': 'APT (Debian/Ubuntu)',
                'repo_url': 'http://sources.debian.org/',
                'api_url': 'https://sources.debian.org/api/',
                'search_url': 'https://sources.debian.org/api/',
                'language_hint': 'C',
                'examples': ['nginx', 'redis', 'postgresql', 'nginx', 'apache2']
            },
            'yum': {
                'name': 'YUM (RHEL/CentOS)',
                'repo_url': 'http://mirror.centos.org/',
                'api_url': 'https://src.fedoraproject.org/api/0/',
                'search_url': 'https://src.fedoraproject.org/api/0/projects/',
                'language_hint': 'C',
                'examples': ['httpd', 'nginx', 'mariadb', 'redis', 'postgresql']
            },
            'dnf': {
                'name': 'DNF (Fedora)',
                'repo_url': 'https://src.fedoraproject.org/',
                'api_url': 'https://src.fedoraproject.org/api/0/',
                'search_url': 'https://src.fedoraproject.org/api/0/projects/',
                'language_hint': 'C',
                'examples': ['nginx', 'redis', 'mariadb', 'postgresql', 'httpd']
            },
            'pacman': {
                'name': 'Pacman (Arch Linux)',
                'repo_url': 'https://archlinux.org/packages/',
                'api_url': 'https://archlinux.org/packages/api/',
                'search_url': 'https://archlinux.org/packages/api/search/',
                'language_hint': 'C',
                'examples': ['nginx', 'redis', 'postgresql', 'apache', 'mariadb']
            },
            'zypper': {
                'name': 'Zypper (openSUSE)',
                'repo_url': 'https://software.opensuse.org/',
                'api_url': 'https://api.opensuse.org/',
                'search_url': 'https://software.opensuse.org/api/search/',
                'language_hint': 'C',
                'examples': ['nginx', 'redis', 'postgresql', 'apache2']
            },
            'emerge': {
                'name': 'Portage (Gentoo)',
                'repo_url': 'https://packages.gentoo.org/',
                'api_url': 'https://packages.gentoo.org/api/',
                'search_url': 'https://packages.gentoo.org/api/packages/',
                'language_hint': 'C',
                'examples': ['nginx', 'redis', 'postgresql', 'apache']
            }
        }

        # Popular Linux packages to scan
        self.popular_packages = [
            # Web servers
            'nginx', 'apache', 'httpd', 'caddy', 'lighttpd',
            # Databases
            'postgresql', 'mysql', 'mariadb', 'redis', 'mongodb', 'sqlite',
            # Languages
            'python', 'python3', 'nodejs', 'ruby', 'golang', 'rust', 'php',
            # Tools
            'git', 'vim', 'emacs', 'tmux', 'curl', 'wget', 'docker',
            # System
            'systemd', 'bash', 'zsh', 'coreutils', 'util-linux',
            # Security
            'openssl', 'gnutls', 'openssh', 'fail2ban',
            # Monitoring
            'prometheus', 'grafana', 'zabbix', 'nagios'
        ]

        self.scanned_count = 0
        self.github_repos_found = []

    def search_github_for_package(self, package_name: str, pm_name: str) -> List[Dict]:
        """Search GitHub for repositories related to a Linux package"""
        try:
            # Search for official GitHub repositories
            search_terms = [
                f"{package_name} {pm_name}",
                f"{package_name} linux",
                f"{package_name} official"
            ]

            results = []
            for term in search_terms:
                try:
                    # Use GitHub search API
                    search_url = f"https://api.github.com/search/repositories?q={term}+language:C&sort=stars&order=desc&per_page=5"
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
                                    'language': item.get('language', 'C'),
                                    'description': item.get('description', ''),
                                    'source': f'linux_package_search:{pm_name}',
                                    'package_name': package_name
                                })
                                logger.info(f"Found GitHub repo: {item['full_name']} for package {package_name}")

                except Exception as e:
                    logger.debug(f"Search term '{term}' failed: {e}")
                    continue

                # Don't make too many requests
                time.sleep(1)

            return results[:3]  # Return top 3 results

        except Exception as e:
            logger.error(f"Error searching GitHub for {package_name}: {e}")
            return []

    def scan_package_manager(self, pm_name: str, limit: int = 10) -> List[Dict]:
        """Scan packages for a specific package manager"""
        if pm_name not in self.package_managers:
            logger.error(f"Unknown package manager: {pm_name}")
            return []

        pm_config = self.package_managers[pm_name]
        logger.info(f"Scanning {pm_config['name']} packages")

        results = []

        # Scan popular packages
        packages_to_scan = self.popular_packages[:limit]

        for package_name in packages_to_scan:
            try:
                logger.info(f"Searching for {pm_name} package: {package_name}")

                # Search GitHub for this package
                github_repos = self.search_github_for_package(package_name, pm_name)

                for repo in github_repos:
                    results.append(repo)
                    self.github_repos_found.append(repo)
                    self.scanned_count += 1

                # Rate limiting
                time.sleep(2)

            except Exception as e:
                logger.error(f"Error scanning {package_name} for {pm_name}: {e}")
                continue

        return results

    def save_results(self, results: List[Dict], pm_name: str = "linux_packages"):
        """Save scan results to JSONL file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"linux_package_scan_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in results:
                f.write(json.dumps(result) + '\n')

        logger.info(f"Saved {len(results)} results to {output_file}")
        return str(output_file)

    def generate_summary(self) -> Dict:
        """Generate summary of Linux package scanning"""
        summary = {
            'scan_type': 'linux_packages',
            'timestamp': datetime.now().isoformat(),
            'total_packages_scanned': self.scanned_count,
            'github_repos_found': len(self.github_repos_found),
            'package_managers_analyzed': list(self.package_managers.keys()),
            'top_repos': sorted(self.github_repos_found, key=lambda x: x.get('stars', 0), reverse=True)[:10]
        }

        return summary

    def run_linux_scan(self, target_count: int = 20) -> Dict:
        """Run comprehensive Linux package scan"""
        logger.info(f"🚀 STARTING LINUX PACKAGE SCAN: {target_count} packages")

        all_results = []

        # Scan each package manager
        for pm_name in self.package_managers.keys():
            if len(all_results) >= target_count:
                break

            try:
                results = self.scan_package_manager(pm_name, limit=5)
                all_results.extend(results)

                logger.info(f"Found {len(results)} repos from {pm_name}")

            except Exception as e:
                logger.error(f"Error scanning {pm_name}: {e}")
                continue

        # Save results
        output_file = self.save_results(all_results)

        # Generate and save summary
        summary = self.generate_summary()
        summary_file = self.output_dir / f"linux_package_scan_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)

        logger.info(f"✅ LINUX PACKAGE SCAN COMPLETE: {len(all_results)} GitHub repositories found")
        logger.info(f"📁 Results saved to: {output_file}")
        logger.info(f"📊 Summary saved to: {summary_file}")

        return summary

def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='Scan Linux package managers for GitHub repositories')
    parser.add_argument('--count', type=int, default=20, help='Number of packages to scan')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--pm', type=str, help='Specific package manager to scan')

    args = parser.parse_args()

    scanner = LinuxPackageScanner(output_dir=args.output)

    if args.pm:
        # Scan specific package manager
        results = scanner.scan_package_manager(args.pm, limit=args.count)
        scanner.save_results(results, args.pm)
    else:
        # Run comprehensive scan
        summary = scanner.run_linux_scan(target_count=args.count)

        print(f"\n📊 LINUX PACKAGE SCAN SUMMARY:")
        print(f"Total repositories found: {summary['github_repos_found']}")
        print(f"Package managers analyzed: {', '.join(summary['package_managers_analyzed'])}")
        print(f"Top repositories:")
        for repo in summary['top_repos']:
            print(f"  - {repo['full_name']} ({repo['stars']} stars)")

if __name__ == "__main__":
    main()