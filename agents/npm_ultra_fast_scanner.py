#!/usr/bin/env python3
"""
Ultra-Fast npm Registry Scanner for Atheon GitHub Scanner

This scanner:
1. Fetches package lists directly from npm registry
2. Uses massive parallel processing
3. Downloads packages in batches
4. Scans node_modules locally for maximum speed
5. NO HARDCODED LIMITS - keeps going until stopped
"""

import os
import sys
import json
import time
import logging
import subprocess
import tempfile
import shutil
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import requests
import threading

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def sanitize_package_name(name: str) -> str:
    """Remove anything except alphanumeric, dash, underscore, dot, at"""
    return re.sub(r'[^a-zA-Z0-9._@-]', '', name)

class UltraFastNpmScanner:
    """Ultra-fast npm registry scanner with no limits"""

    def __init__(self, output_dir: str = "../data", temp_dir: str = "/nas/Temp/atheon-scanner"):
        self.output_dir = Path(output_dir)
        self.temp_dir = Path(temp_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        # NO LIMITS - these can be as large as needed
        self.scanned_count = 0
        self.results = []
        self.lock = threading.Lock()

    def fetch_popular_packages(self, count: int = 5000) -> List[str]:
        """Fetch popular packages from npm registry"""
        try:
            logger.info(f"📊 Fetching top {count} packages from npm registry...")

            # Use npm registry search to get popular packages
            packages = set()

            # Search by common patterns
            search_terms = [
                'react', 'vue', 'angular', 'express', 'koa', 'mongoose', 'mongodb',
                'lodash', 'axios', 'webpack', 'typescript', 'babel', 'eslint',
                'jest', 'mocha', 'chai', 'request', 'moment', 'dayjs',
                'material-ui', 'bootstrap', 'tailwindcss', 'redux', 'mobx',
                'graphql', 'apollo', 'prisma', 'sequelize', 'typeorm',
                'next', 'nuxt', 'gatsby', 'astro', 'svelte', 'remix',
                'socket', 'ws', 'redis', 'elasticsearch', 'kafka',
                'docker', 'kubernetes', 'terraform', 'packer',
                'aws-sdk', 'firebase', 'google-cloud', 'azure',
                'passport', 'jsonwebtoken', 'bcrypt', 'joi', 'yup',
                'winston', 'morgan', 'helmet', 'cors', 'dotenv',
                'commander', 'inquirer', 'chalk', 'ora', 'cli-table',
                'axios', 'fetch', 'superagent', 'got', 'node-fetch',
                'formidable', 'multer', 'busboy', 'sharp',
                'lodash', 'ramda', 'underscore', 'immutable',
                'rxjs', 'bluebird', 'async', 'q',
                'date-fns', 'luxon', 'moment-timezone', 'dayjs',
                'validator', 'joi', 'yup', 'zod', 'ajv',
                'eslint', 'prettier', 'babel', 'webpack-cli',
                'create-react-app', 'create-next-app', '@vue/cli',
                'vite', 'rollup', 'esbuild', 'parcel',
                'nodemon', 'pm2', 'concurrently', 'forever',
                'express-generator', 'yeoman', 'plop',
                'jest', 'mocha', 'cypress', 'playwright', 'puppeteer',
                'ava', 'tape', 'tap',
                'supertest', 'chai', 'sinon', 'nock',
                'nyc', 'istanbul', 'c8', 'jsdom',
                '@testing-library/dom', '@testing-library/react',
                'react-dom', '@types/react', 'react-dom',
                'prop-types', 'react-router-dom', '@reach/router',
                'zustand', 'jotai', 'recoil', 'mobx-react-lite',
                '@reduxjs/toolkit', 'redux-thunk', 'redux-saga',
                '@apollo/client', '@graphql-tools',
                'socket.io-client', 'socket.io-client',
                'formik', 'react-hook-form',
                'tanstack/react-query', '@tanstack/react-query',
                'react-query', 'useSWR', 'react-fetch-hook',
                '@prisma/client', '@sequelize/core', 'mongoose',
                'mongodb', 'redis', 'pg', 'mysql2',
                'bull', 'kue', 'agenda',
                'winston', 'morgan', 'pino', 'bunyan'
            ]

            for term in search_terms:
                if len(packages) >= count:
                    break
                try:
                    # Search npm registry
                    url = f"https://registry.npmjs.org/-/v1/search?text={term}&size={min(250, count - len(packages))}"
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        for obj in data.get('objects', []):
                            package_name = obj.get('name', {})
                            if isinstance(package_name, str) and package_name:
                                packages.add(package_name)
                except Exception as e:
                    logger.warning(f"Error searching for {term}: {e}")

            logger.info(f"Found {len(packages)} packages from npm registry")
            return list(packages)[:count]

        except Exception as e:
            logger.error(f"Error fetching packages: {e}")
            return []

    def download_and_scan_package(self, package_name: str, worker_id: int = 0) -> Optional[Dict]:
        """Download and scan a single npm package"""
        try:
            with self.lock:
                current_count = self.scanned_count
                if current_count % 100 == 0 and current_count > 0:
                    logger.info(f"📊 Progress: {current_count} packages scanned")

            # Sanitize package name for use in paths and commands
            safe_package_name = sanitize_package_name(package_name)
            package_dir = self.temp_dir / f"worker_{worker_id}" / safe_package_name.replace('/', '_')
            package_dir.mkdir(parents=True, exist_ok=True)

            # Download package using npm
            download_cmd = [
                'npm', 'install', '--prefix', str(package_dir),
                '--save', '--save-exact', '--silent', safe_package_name
            ]

            result = subprocess.run(
                download_cmd,
                capture_output=True,
                text=True,
                timeout=180,  # 3 minute timeout
                env={**os.environ, 'npm_config_prefix': str(package_dir)}
            )

            if result.returncode != 0:
                return None

            # Analyze the downloaded package
            node_modules_dir = package_dir / 'node_modules'

            if not node_modules_dir.exists():
                return None

            # Scan the node_modules directory
            scan_result = {
                'name': package_name,
                'type': 'npm_package',
                'scan_date': datetime.now().isoformat(),
                'total_dependencies': 0,
                'total_files': 0,
                'total_size_bytes': 0,
                'quality_score': 100,
                'tier': 'A',
                'scan_method': 'local_npm_install',
                'language': 'JavaScript',
                'stars': 0,
                'scan_id': f"npm_{package_name.replace('/', '_')}_{int(time.time())}"
            }

            # Count dependencies
            for item in node_modules_dir.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    scan_result['total_dependencies'] += 1
                    try:
                        files = list(item.rglob('*'))
                        scan_result['total_files'] += len(files)
                        scan_result['total_size_bytes'] += sum(f.stat().st_size for f in files if f.is_file())
                    except:
                        pass

            # Try to get GitHub info
            github_info = self.get_github_info(package_name)
            if github_info:
                scan_result.update(github_info)

            with self.lock:
                self.scanned_count += 1
                self.results.append(scan_result)

            # Clean up
            try:
                shutil.rmtree(package_dir)
            except:
                pass

            return scan_result

        except subprocess.TimeoutExpired:
            return None
        except Exception as e:
            logger.error(f"Error scanning {package_name}: {e}")
            return None

    def get_github_info(self, package_name: str) -> Optional[Dict]:
        """Get GitHub information for an npm package"""
        try:
            # Try to find the GitHub repository
            possible_repos = [
                f"{package_name.replace('@', '').replace('/', '/')}",
            ]

            for repo_name in possible_repos:
                try:
                    url = f"https://api.github.com/repos/{repo_name}"
                    response = requests.get(url, timeout=3)
                    if response.status_code == 200:
                        data = response.json()
                        return {
                            'github_url': data.get('html_url'),
                            'stars': data.get('stargazers_count', 0),
                            'description': data.get('description'),
                            'language': data.get('language', 'JavaScript'),
                            'full_name': data.get('full_name'),
                            'forks': data.get('forks_count', 0)
                        }
                except:
                    continue

        except:
            return None

    def run_ultra_fast_scan(self, target_count: int = 5000) -> Dict:
        """Run ultra-fast scan with no hardcoded limits"""
        logger.info(f"🚀 ULTRA-FAST SCAN: NO LIMITS - Target {target_count}+ packages")

        # Fetch popular packages from npm registry
        packages = self.fetch_popular_packages(target_count)

        if not packages:
            logger.error("No packages found")
            return {
                'scan_type': 'npm_ultra_fast',
                'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
                'packages_scanned': 0,
                'scan_method': 'parallel_npm_install',
                'workers_used': 0,
                'total_dependencies': 0,
                'total_files': 0,
                'packages_with_github': 0,
                'error': 'No packages found from npm registry'
            }

        logger.info(f"🎯 Found {len(packages)} packages to scan")

        # Use process pool for maximum parallelism
        num_workers = multiprocessing.cpu_count() * 2  # Use 2x CPU cores
        logger.info(f"⚡ Using {num_workers} parallel workers")

        all_results = []

        # Scan in parallel batches
        with ProcessPoolExecutor(max_workers=num_workers) as executor:
            futures = {
                executor.submit(self.download_and_scan_package, pkg, i % num_workers): (pkg, i)
                for i, pkg in enumerate(packages)
            }

            for future in as_completed(futures):
                try:
                    result = future.result(timeout=300)  # 5 min timeout
                    if result:
                        all_results.append(result)
                        with self.lock:
                            if len(all_results) % 100 == 0:
                                logger.info(f"📊 Progress: {len(all_results)}/{target_count}")
                except Exception as e:
                    logger.error(f"Error in future: {e}")
                    continue

        # Save final results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"npm_ultra_fast_scan_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in all_results:
                f.write(json.dumps(result) + '\n')

        # Generate summary
        summary = {
            'scan_type': 'npm_ultra_fast',
            'timestamp': timestamp,
            'packages_scanned': len(all_results),
            'scan_method': 'parallel_npm_install',
            'workers_used': num_workers,
            'total_dependencies': sum(r.get('total_dependencies', 0) for r in all_results),
            'total_files': sum(r.get('total_files', 0) for r in all_results),
            'packages_with_github': len([r for r in all_results if 'github_url' in r])
        }

        logger.info(f"✅ ULTRA-FAST SCAN COMPLETE: {len(all_results)} packages scanned")
        logger.info(f"💾 Results saved to: {output_file}")

        return summary

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Ultra-fast npm scanner with no limits')
    parser.add_argument('--count', type=int, default=5000, help='Target package count (NO HARD LIMITS)')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--temp', type=str, default='/nas/Temp/atheon-scanner', help='Temp directory')

    args = parser.parse_args()

    scanner = UltraFastNpmScanner(output_dir=args.output, temp_dir=args.temp)
    summary = scanner.run_ultra_fast_scan(target_count=args.count)

    print(f"\n📊 ULTRA-FAST SCAN RESULTS:")
    print(f"Packages Scanned: {summary.get('packages_scanned', 0)}")
    print(f"Workers Used: {summary.get('workers_used', 'N/A')}")
    print(f"Total Dependencies: {summary.get('total_dependencies', 0)}")
    print(f"Total Files: {summary.get('total_files', 0)}")
    print(f"Packages with GitHub Info: {summary.get('packages_with_github', 0)}")

if __name__ == "__main__":
    main()