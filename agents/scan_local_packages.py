#!/usr/bin/env python3
"""
Local Package Scanner for Atheon GitHub Scanner

Scans npm and Python packages already installed on the system for instant results.
"""

import os
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LocalPackageScanner:
    """Scan already-installed packages"""

    def __init__(self, output_dir: str = "../data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.results = []

    def scan_npm_directory(self, node_modules_path: str) -> List[Dict]:
        """Scan an existing node_modules directory"""
        logger.info(f"📦 Scanning local npm packages: {node_modules_path}")
        node_modules = Path(node_modules_path)

        if not node_modules.exists():
            logger.warning(f"node_modules not found: {node_modules_path}")
            return []

        results = []
        for item in node_modules.iterdir():
            if item.is_dir() and not item.name.startswith('.') and not item.name.startswith('@'):
                try:
                    # Try to read package.json
                    package_json = item / "package.json"
                    metadata = {
                        'name': item.name,
                        'type': 'npm_package',
                        'scan_date': datetime.now().isoformat(),
                        'total_dependencies': 0,
                        'total_files': 0,
                        'total_size_bytes': 0,
                        'quality_score': 100,
                        'tier': 'A',
                        'scan_method': 'local_node_modules',
                        'language': 'JavaScript',
                        'stars': 0
                    }

                    if package_json.exists():
                        try:
                            with open(package_json) as f:
                                pkg_data = json.load(f)
                                metadata.update({
                                    'description': pkg_data.get('description'),
                                    'version': pkg_data.get('version'),
                                    'homepage': pkg_data.get('homepage'),
                                    'repository': pkg_data.get('repository')
                                })
                        except:
                            pass

                    # Count files and size
                    try:
                        files = list(item.rglob('*'))
                        metadata['total_files'] = len([f for f in files if f.is_file()])
                        metadata['total_size_bytes'] = sum(f.stat().st_size for f in files if f.is_file())
                    except:
                        pass

                    results.append(metadata)
                except Exception as e:
                    logger.debug(f"Error scanning {item.name}: {e}")

        logger.info(f"✅ Scanned {len(results)} local npm packages")
        return results

    def scan_python_directory(self, site_packages_path: str) -> List[Dict]:
        """Scan an existing site-packages directory"""
        logger.info(f"🐍 Scanning local Python packages: {site_packages_path}")
        site_packages = Path(site_packages_path)

        if not site_packages.exists():
            logger.warning(f"site-packages not found: {site_packages_path}")
            return []

        results = []
        for item in site_packages.iterdir():
            if item.is_dir() and not item.name.startswith('.') and not item.name.endswith('.dist-info'):
                try:
                    metadata = {
                        'name': item.name,
                        'type': 'pypi_package',
                        'scan_date': datetime.now().isoformat(),
                        'total_dependencies': 0,
                        'total_files': 0,
                        'total_size_bytes': 0,
                        'quality_score': 100,
                        'tier': 'A',
                        'scan_method': 'local_site_packages',
                        'language': 'Python',
                        'stars': 0
                    }

                    # Count files and size
                    try:
                        files = list(item.rglob('*.py'))
                        metadata['total_files'] = len(files)
                        metadata['total_size_bytes'] = sum(f.stat().st_size for f in files if f.is_file())
                    except:
                        pass

                    results.append(metadata)
                except Exception as e:
                    logger.debug(f"Error scanning {item.name}: {e}")

        logger.info(f"✅ Scanned {len(results)} local Python packages")
        return results

    def save_results(self):
        """Save scan results"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = self.output_dir / f"local_packages_scan_{timestamp}.jsonl"

        with open(output_file, 'w') as f:
            for result in self.results:
                f.write(json.dumps(result) + '\n')

        logger.info(f"💾 Saved {len(self.results)} results to {output_file}")
        return output_file

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Scan local packages')
    parser.add_argument('--npm-dir', type=str, help='Path to node_modules')
    parser.add_argument('--python-dir', type=str, help='Path to site-packages')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')

    args = parser.parse_args()

    scanner = LocalPackageScanner(output_dir=args.output)

    # Scan npm packages
    if args.npm_dir:
        npm_results = scanner.scan_npm_directory(args.npm_dir)
        scanner.results.extend(npm_results)

    # Scan Python packages
    if args.python_dir:
        python_results = scanner.scan_python_directory(args.python_dir)
        scanner.results.extend(python_results)

    if scanner.results:
        output_file = scanner.save_results()
        print(f"\n📊 LOCAL SCAN RESULTS:")
        print(f"Total Packages Scanned: {len(scanner.results)}")
        print(f"Results saved to: {output_file}")
    else:
        print("No packages scanned")

if __name__ == "__main__":
    main()
