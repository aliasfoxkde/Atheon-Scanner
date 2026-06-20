#!/usr/bin/env python3
"""
Ultra-Fast PyPI/Python Package Scanner for Atheon GitHub Scanner

This scanner:
1. Fetches popular packages from PyPI
2. Uses pip or UV for fast local installation
3. Scans site-packages directories locally
4. Uses parallel processing for maximum speed
5. NO HARDCODED LIMITS
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
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
import requests
import threading

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UltraFastPythonScanner:
    """Ultra-fast PyPI scanner with no limits"""

    def __init__(self, output_dir: str = "../data", temp_dir: str = "/nas/Temp/atheon-scanner"):
        self.output_dir = Path(output_dir)
        self.temp_dir = Path(temp_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        self.scanned_count = 0
        self.results = []
        self.lock = threading.Lock()

        # Popular Python packages
        self.popular_packages = [
            # Web Frameworks
            'django', 'flask', 'fastapi', 'tornado', 'aiohttp', 'sanic',
            'starlette', 'pyramid', 'bottle', 'cherrypy', 'web2py',
            # Data Science
            'numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn',
            'tensorflow', 'pytorch', 'keras', 'theano', 'mxnet',
            'plotly', 'seaborn', 'bokeh', 'altair', 'dash',
            # Data Processing
            'requests', 'httpx', 'urllib3', 'beautifulsoup4', 'lxml',
            'scrapy', 'selenium', 'playwright', 'pytest',
            # Database
            'psycopg2-binary', 'pymongo', 'redis', 'celery',
            'sqlalchemy', 'peewee', 'pony', 'databases',
            'alembic', 'django-rest-framework', 'flask-sqlalchemy',
            # Authentication
            'pyjwt', 'passlib', 'bcrypt', 'cryptography',
            # Development Tools
            'pytest', 'pytest-cov', 'black', 'isort', 'flake8', 'pylint',
            'mypy', 'bandit', 'safety', 'autopep8',
            # CLI Tools
            'click', 'typer', 'clint', 'rich', 'colorama', 'tqdm',
            'django-admin', 'flask', 'invoke', 'fabric',
            # Utils
            'python-dateutil', 'pytz', 'arrow', 'pendulum',
            'pydantic', 'marshmallow', 'serpy',
            # Async
            'asyncio', 'aiofiles', 'aiohttp', 'asynctest',
            'uvloop', 'trio',
            # Performance
            'uvicorn', 'hypercorn', 'meinheld', 'gunicorn',
            # Testing
            'selenium', 'pytest', 'unittest', 'nose2',
            'faker', 'factory_boy', 'responses',
            # API Tools
            'connexion', 'flask-cors', 'flask-login',
            'django-cors', 'django-filter',
            # Monitoring
            'prometheus-client', 'sentry-sdk', 'opentelemetry-api',
            # Data Validation
            'cerberus', 'pydantic', 'marshmallow', 'schema',
            # Utils
            'python-dotenv', 'python-multipart', 'pillow',
            'image', 'pillow', 'opencv-python',
            'numpy', 'pandas', 'scipy'
        ]

    def fetch_popular_packages(self, count: int = 5000) -> List[str]:
        """Fetch popular packages from PyPI"""
        try:
            logger.info(f"📊 Fetching top {count} packages from PyPI...")

            packages = set()

            # Use PyPI simple API to get popular packages
            try:
                # Try PyPI JSON API
                url = f"https://pypi.org/pypi/{count}/json"
                response = requests.get(url, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    for entry in data.get('rows', []):
                        package_name = entry.get('name', entry.get('package', {}))
                        if isinstance(package_name, str):
                            packages.add(package_name)
                            if len(packages) >= count:
                                break
            except Exception as e:
                logger.warning(f"PyPI JSON API failed: {e}")

            # If not enough, try search
            if len(packages) < count:
                search_terms = [
                    'django', 'flask', 'numpy', 'pandas', 'requests',
                    'tensorflow', 'pytorch', 'scikit-learn', 'matplotlib',
                    'pytest', 'black', 'isort', 'flake8', 'pylint',
                    'fastapi', 'starlette', 'uvicorn', 'celery',
                    'redis', 'psycopg2', 'pymongo', 'sqlalchemy',
                    'pydantic', 'requests', 'httpx', 'beautifulsoup4',
                    'scrapy', 'selenium', 'pytest', 'django',
                    'flask', 'django-rest-framework', 'click', 'typer'
                ]

                for term in search_terms:
                    if len(packages) >= count:
                        break
                    try:
                        url = f"https://pypi.org/pypi/{term}/json"
                        response = requests.get(url, timeout=5)
                        if response.status_code == 200:
                            data = response.json()
                            info = data.get('info', {})
                            name = info.get('name', '')
                            if name:
                                packages.add(name)
                    except:
                        continue

            logger.info(f"Found {len(packages)} packages from PyPI")
            return list(packages)[:count]

        except Exception as e:
            logger.error(f"Error fetching PyPI packages: {e}")
            return []

    def download_and_scan_package(self, package_name: str, worker_id: int = 0) -> Optional[Dict]:
        """Download and scan a single Python package"""
        try:
            with self.lock:
                current_count = self.scanned_count
                if current_count % 50 == 0 and current_count > 0:
                    logger.info(f"📊 Progress: {current_count} Python packages scanned")

            package_dir = self.temp_dir / f"python_worker_{worker_id}" / package_name.replace('/', '_')
            package_dir.mkdir(parents=True, exist_ok=True)

            # Try using UV first (much faster), fallback to pip
            use_uv = self.check_uv_available()

            if use_uv:
                download_cmd = [
                    'uv', 'pip', 'install', '--target', str(package_dir / 'lib'),
                    '--quiet', package_name
                ]
            else:
                download_cmd = [
                    'pip3', 'install', '--target', str(package_dir / 'lib'),
                    '--quiet', package_name
                ]

            result = subprocess.run(
                download_cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            if result.returncode != 0:
                return None

            # Analyze the installed package
            site_packages = package_dir / 'lib' / 'python3.11' / 'site-packages'

            if not site_packages.exists():
                # Try other Python versions
                for py_version in ['3.12', '3.10', '3.9', '3.8']:
                    site_packages = package_dir / 'lib' / f'python{py_version}' / 'site-packages'
                    if site_packages.exists():
                        break

            if not site_packages.exists():
                return None

            # Scan the site-packages directory
            scan_result = {
                'name': package_name,
                'type': 'pypi_package',
                'scan_date': datetime.now().isoformat(),
                'total_dependencies': 0,
                'total_files': 0,
                'total_size_bytes': 0,
                'quality_score': 100,
                'tier': 'A',
                'scan_method': 'local_pip_install',
                'language': 'Python',
                'stars': 0,
                'scan_id': f"pypi_{package_name.replace('/', '_')}_{int(time.time())}"
            }

            # Count dependencies and files
            for item in site_packages.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    scan_result['total_dependencies'] += 1
                    try:
                        files = list(item.rglob('*.py'))
                        scan_result['total_files'] += len(files)
                        scan_result['total_size_bytes'] += sum(
                            f.stat().st_size for f in files if f.is_file()
                        )
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

    def check_uv_available(self) -> bool:
        """Check if UV package manager is available"""
        try:
            result = subprocess.run(['uv', '--version'], capture_output=True, timeout=5)
            return result.returncode == 0
        except:
            return False

    def get_github_info(self, package_name: str) -> Optional[Dict]:
        """Get GitHub information for a Python package"""
        try:
            # Try to find the GitHub repository
            possible_repos = [
                f"{package_name.replace('-', '').replace('_', '-')}",
                f"django/{package_name}",
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
                            'language': data.get('language', 'Python'),
                            'full_name': data.get('full_name'),
                            'forks': data.get('forks_count', 0)
                        }
                except:
                    continue

        except:
            return None

    def run_ultra_fast_scan(self, target_count: int = 5000) -> Dict:
        """Run ultra-fast Python scan with no limits"""
        logger.info(f"🐍 ULTRA-FAST PYTHON SCAN: NO LIMITS - Target {target_count}+ packages")

        # Fetch popular packages from PyPI
        packages = self.fetch_popular_packages(target_count)

        if not packages:
            logger.error("No Python packages found")
            return {}

        logger.info(f"🎯 Found {len(packages)} Python packages to scan")

        # Use process pool for maximum parallelism
        num_workers = multiprocessing.cpu_count()
        logger.info(f"⚡ Using {num_workers} parallel workers for Python packages")

        all_results = []

        # Scan in parallel
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
                            if len(all_results) % 50 == 0:
                                logger.info(f"📊 Progress: {len(all_results)}/{target_count}")
                except Exception as e:
                    logger.error(f"Error in future: {e}")
                    continue

        # Save final results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"python_ultra_fast_scan_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in all_results:
                f.write(json.dumps(result) + '\n')

        # Generate summary
        summary = {
            'scan_type': 'python_ultra_fast',
            'timestamp': timestamp,
            'packages_scanned': len(all_results),
            'scan_method': 'parallel_pip_install',
            'workers_used': num_workers,
            'total_dependencies': sum(r.get('total_dependencies', 0) for r in all_results),
            'total_files': sum(r.get('total_files', 0) for r in all_results),
            'packages_with_github': len([r for r in all_results if 'github_url' in r])
        }

        logger.info(f"✅ ULTRA-FAST PYTHON SCAN COMPLETE: {len(all_results)} packages scanned")
        logger.info(f"💾 Results saved to: {output_file}")

        return summary

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Ultra-fast PyPI scanner with no limits')
    parser.add_argument('--count', type=int, default=5000, help='Target package count (NO HARD LIMITS)')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--temp', type=str, default='/nas/Temp/atheon-scanner', help='Temp directory')

    args = parser.parse_args()

    scanner = UltraFastPythonScanner(output_dir=args.output, temp_dir=args.temp)
    summary = scanner.run_ultra_fast_scan(target_count=args.count)

    print(f"\n📊 ULTRA-FAST PYTHON SCAN RESULTS:")
    print(f"Python Packages Scanned: {summary['packages_scanned']}")
    print(f"Workers Used: {summary.get('workers_used', 'N/A')}")
    print(f"Total Dependencies: {summary['total_dependencies']}")
    print(f"Total Python Files: {summary['total_files']}")
    print(f"Packages with GitHub Info: {summary['packages_with_github']}")

if __name__ == "__main__":
    main()