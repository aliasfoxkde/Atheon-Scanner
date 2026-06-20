#!/usr/bin/env python3
"""
High-Speed npm/Node.js Package Scanner for Atheon GitHub Scanner

This scanner:
1. Downloads npm packages directly (much faster than GitHub API)
2. Scans node_modules directories locally
3. Uses parallel processing for maximum speed
4. Focuses on JavaScript/Node.js ecosystem
5. Can scan hundreds of packages quickly
"""

import os
import sys
import json
import time
import logging
import subprocess
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import threading

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NpmPackageScanner:
    """High-speed npm package scanner using local installation and analysis"""

    def __init__(self, output_dir: str = "../data", temp_dir: str = "/nas/Temp/atheon-scanner"):
        self.output_dir = Path(output_dir)
        self.temp_dir = Path(temp_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        # Scan tracking
        self.scanned_count = 0
        self.results = []
        self.errors = []
        self.lock = threading.Lock()

        # Popular npm packages to scan
        self.popular_packages = [
            # Frameworks & Libraries
            'react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'ember',
            'express', 'koa', 'fastify', 'hapi', 'nest', 'socket.io',
            # Build Tools
            'webpack', 'rollup', 'vite', 'esbuild', 'parcel', 'babel',
            'typescript', '@babel/core', '@babel/preset-env',
            # UI Libraries
            'material-ui', '@mui/material', 'antd', 'chakra-ui', 'react-bootstrap',
            'bootstrap', 'tailwindcss', '@tailwindcss/forms',
            # State Management
            'redux', 'mobx', 'zustand', 'recoil', 'jotai',
            # Data Fetching
            'axios', 'fetch', 'request', 'superagent', 'got',
            # Utilities
            'lodash', 'underscore', 'ramda', 'dayjs', 'date-fns', 'moment',
            'immutable', 'rxjs', 'bluebird', 'q', 'async',
            # Testing
            'jest', 'mocha', 'jasmine', 'karma', 'cypress', 'playwright',
            '@testing-library/react', '@testing-library/dom',
            # Development Tools
            'eslint', 'prettier', '@typescript-eslint/parser',
            'nodemon', 'pm2', 'concurrently', 'cross-env',
            # Security
            'helmet', 'cors', 'dotenv', 'jsonwebtoken', 'bcrypt',
            # Database
            'mongoose', 'sequelize', 'pg', 'mongodb', 'redis',
            'knex', 'typeorm', 'prisma',
            # Web Frameworks
            'next.js', 'gatsby', 'astro', 'remix-run', '@remix-run/react',
            'sveltekit', '@sveltejs/kit',
            # CLI Tools
            'create-react-app', 'create-next-app', 'vue-cli', '@angular/cli',
            'react-scripts', '@vue/cli', 'vite',
            # Server Frameworks
            'fastify', 'hapi', 'sails', 'feathers', 'actionhero',
            # API Tools
            'apollo-server', 'graphql', 'graphql-yoga', 'gql', 'graphql-tools',
            # Real-time
            'socket.io', 'ws', 'signalr', 'socketcluster',
            # Logging
            'winston', 'morgan', 'pino', 'bunyan', 'log4js',
            # Validation
            'joi', 'yup', 'zod', 'ajv', 'validator',
            # File Upload
            'multer', 'formidable', 'busboy', 'form-data',
            # Utils
            'chalk', 'inquirer', 'commander', 'yargs', 'ora',
            # Performance
            'pino', 'pino-pretty', 'pino-lux', 'pino-http',
            # Monitoring
            'prom-client', 'opentelemetry', 'elastic-apm',
            # Auth
            'passport', 'express-session', 'cookie-session', 'express-jwt'
        ]

    def download_and_scan_package(self, package_name: str) -> Optional[Dict]:
        """Download and scan a single npm package"""
        try:
            logger.info(f"📦 Scanning {package_name}...")

            # Create temp directory for this package
            package_dir = self.temp_dir / package_name.replace('/', '_')
            package_dir.mkdir(exist_ok=True)

            # Download package using npm
            download_cmd = [
                'npm', 'install', '--prefix', str(package_dir),
                '--save', '--save-exact', package_name
            ]

            result = subprocess.run(
                download_cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )

            if result.returncode != 0:
                logger.warning(f"Failed to download {package_name}: {result.stderr}")
                return None

            # Analyze the downloaded package
            node_modules_dir = package_dir / 'node_modules'

            if not node_modules_dir.exists():
                logger.warning(f"No node_modules found for {package_name}")
                return None

            # Scan the node_modules directory
            scan_result = self.scan_node_modules(package_name, node_modules_dir)

            # Clean up
            try:
                shutil.rmtree(package_dir)
            except Exception as e:
                logger.warning(f"Cleanup failed for {package_name}: {e}")

            return scan_result

        except subprocess.TimeoutExpired:
            logger.error(f"Timeout scanning {package_name}")
            return None
        except Exception as e:
            logger.error(f"Error scanning {package_name}: {e}")
            return None

    def scan_node_modules(self, package_name: str, node_modules_dir: Path) -> Dict:
        """Scan node_modules directory and collect information"""
        try:
            # Count total packages and dependencies
            total_packages = 0
            total_files = 0
            total_size = 0

            # Count package directories
            if node_modules_dir.exists():
                for item in node_modules_dir.iterdir():
                    if item.is_dir() and not item.name.startswith('.'):
                        total_packages += 1
                        total_files += len(list(item.rglob('*')))

                        # Calculate size
                        size = sum(f.stat().st_size for f in item.rglob('*') if f.is_file())
                        total_size += size

            # Get package metadata
            metadata = {
                'name': package_name,
                'type': 'npm_package',
                'scan_date': datetime.now().isoformat(),
                'total_dependencies': total_packages,
                'total_files': total_files,
                'total_size_bytes': total_size,
                'quality_score': 100,  # Will be calculated later
                'tier': 'A',
                'scan_method': 'local_npm_install',
                'language': 'JavaScript',
                'stars': 0  # Will be populated from GitHub
            }

            # Try to get GitHub info for this package
            github_info = self.get_github_info(package_name)
            if github_info:
                metadata.update(github_info)

            with self.lock:
                self.scanned_count += 1
                self.results.append(metadata)
                logger.info(f"✅ {package_name}: {total_packages} dependencies, {total_files} files")

            return metadata

        except Exception as e:
            logger.error(f"Error scanning node_modules for {package_name}: {e}")
            return None

    def get_github_info(self, package_name: str) -> Optional[Dict]:
        """Try to get GitHub information for an npm package"""
        try:
            # Try common GitHub repository patterns
            possible_repos = [
                f"{package_name.replace('@', '').replace('/', '/')}",
                f"{'/'.join(package_name.split('/')[1:]) if '/' in package_name else package_name}",
                f"{'/'.join(package_name.replace('@', '').split('/'))}"
            ]

            for repo_name in possible_repos[:2]:  # Try first 2 patterns
                try:
                    url = f"https://api.github.com/repos/{repo_name}"
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        return {
                            'github_url': data.get('html_url'),
                            'stars': data.get('stargazers_count', 0),
                            'description': data.get('description'),
                            'language': data.get('language', 'JavaScript'),
                            'full_name': data.get('full_name')
                        }
                except:
                    continue

        except Exception as e:
            logger.debug(f"Could not get GitHub info for {package_name}: {e}")

        return None

    def scan_batch_packages(self, packages: List[str], max_workers: int = 10) -> List[Dict]:
        """Scan multiple packages in parallel"""
        logger.info(f"🚀 Scanning batch of {len(packages)} packages with {max_workers} workers")

        results = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_package = {
                executor.submit(self.download_and_scan_package, pkg): pkg
                for pkg in packages
            }

            for future in as_completed(future_to_package):
                pkg = future_to_package[future]
                try:
                    result = future.result(timeout=180)  # 3 min timeout per package
                    if result:
                        results.append(result)
                except Exception as e:
                    logger.error(f"Failed to scan {pkg}: {e}")
                    with self.lock:
                        self.errors.append({
                            'package': pkg,
                            'error': str(e),
                            'timestamp': datetime.now().isoformat()
                        })

        return results

    def save_results(self):
        """Save scan results"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"npm_scan_results_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in self.results:
                f.write(json.dumps(result) + '\n')

        logger.info(f"💾 Saved {len(self.results)} results to {output_file}")

    def generate_summary(self) -> Dict:
        """Generate scan summary"""
        return {
            'scan_type': 'npm_packages_local',
            'timestamp': datetime.now().isoformat(),
            'packages_scanned': len(self.results),
            'scan_method': 'local_npm_install',
            'total_dependencies': sum(r.get('total_dependencies', 0) for r in self.results),
            'total_files_scanned': sum(r.get('total_files', 0) for r in self.results),
            'errors_count': len(self.errors),
            'packages_with_github': len([r for r in self.results if 'github_url' in r])
        }

    def run_high_speed_scan(self, target_count: int = 5000) -> Dict:
        """Run high-speed scan to reach target"""
        logger.info(f"🚀 HIGH-SPEED SCAN: Target {target_count} npm packages")

        # Start with popular packages
        packages_to_scan = self.popular_packages[:target_count]

        # Scan in batches
        batch_size = 50
        all_results = []

        for i in range(0, len(packages_to_scan), batch_size):
            batch = packages_to_scan[i:i + batch_size]
            logger.info(f"Scanning batch {i//batch_size + 1}/{(len(packages_to_scan)//batch_size) + 1}")

            batch_results = self.scan_batch_packages(batch, max_workers=20)
            all_results.extend(batch_results)

            # Save incremental results
            self.save_results()

            logger.info(f"Progress: {len(all_results)}/{target_count} packages scanned")

            if len(all_results) >= target_count:
                break

            # Brief pause between batches
            time.sleep(2)

        logger.info(f"✅ HIGH-SPEED SCAN COMPLETE: {len(all_results)} packages")
        return self.generate_summary()

def main():
    import argparse

    parser = argparse.ArgumentParser(description='High-speed npm package scanner')
    parser.add_argument('--count', type=int, default=5000, help='Target package count')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--temp', type=str, default='/nas/Temp/atheon-scanner', help='Temp directory')

    args = parser.parse_args()

    scanner = NpmPackageScanner(output_dir=args.output, temp_dir=args.temp)
    summary = scanner.run_high_speed_scan(target_count=args.count)

    print(f"\n📊 HIGH-SPEED SCAN SUMMARY:")
    print(f"Packages Scanned: {summary['packages_scanned']}")
    print(f"Total Dependencies Analyzed: {summary['total_dependencies']}")
    print(f"Total Files Scanned: {summary['total_files_scanned']}")
    print(f"Packages with GitHub Info: {summary['packages_with_github']}")
    print(f"Errors Encountered: {summary['errors_count']}")

if __name__ == "__main__":
    main()