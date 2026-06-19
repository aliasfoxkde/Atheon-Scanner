#!/usr/bin/env python3
"""
Master Orchestrator and Reporting System for Atheon GitHub Scanner

This system orchestrates all scanning activities and generates comprehensive reports:
- Coordinates multiple scanner types (mass, universal, linux, cross-platform)
- Aggregates and consolidates results from all scanners
- Generates comprehensive statistical reports
- Provides unified API and reporting interface
- Handles error recovery and retry logic
- Implements progress tracking and status reporting
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
from collections import defaultdict
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MasterOrchestrator:
    """Master orchestrator for all scanning operations"""

    def __init__(self, output_dir: str = "../data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Scanner configurations
        self.scanners = {
            'mass_repository': {
                'script': 'mass_repository_scanner.py',
                'description': 'GitHub repository mass scanner',
                'enabled': True
            },
            'universal_scanner': {
                'script': 'comprehensive_universal_scanner.py',
                'description': 'Universal package manager scanner',
                'enabled': True
            },
            'linux_packages': {
                'script': 'linux_package_scanner.py',
                'description': 'Linux package manager scanner',
                'enabled': True
            },
            'cross_platform': {
                'script': 'cross_platform_scanner.py',
                'description': 'Cross-platform scanner',
                'enabled': True
            }
        }

        # Progress tracking
        self.progress_file = self.output_dir / "master_progress.json"
        self.progress = self.load_progress()

        # Results aggregation
        self.all_results = []
        self.scanner_results = defaultdict(list)

    def load_progress(self) -> Dict:
        """Load previous progress if exists"""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load progress: {e}")
        return {
            'start_time': None,
            'last_update': None,
            'scanners_run': [],
            'total_repos_scanned': 0,
            'current_phase': 'initialization',
            'errors': []
        }

    def save_progress(self):
        """Save current progress"""
        self.progress['last_update'] = datetime.now().isoformat()
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)

    def run_scanner(self, scanner_name: str, args: List[str] = None) -> bool:
        """Run a specific scanner"""
        if scanner_name not in self.scanners:
            logger.error(f"Unknown scanner: {scanner_name}")
            return False

        scanner_config = self.scanners[scanner_name]
        if not scanner_config['enabled']:
            logger.info(f"Scanner {scanner_name} is disabled, skipping")
            return True

        script_path = Path(__file__).parent / scanner_config['script']
        if not script_path.exists():
            logger.error(f"Scanner script not found: {script_path}")
            return False

        try:
            logger.info(f"🚀 Running {scanner_name} scanner...")

            cmd = ['python3', str(script_path)]
            if args:
                cmd.extend(args)

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour timeout
            )

            if result.returncode == 0:
                logger.info(f"✅ {scanner_name} completed successfully")
                self.progress['scanners_run'].append(scanner_name)
                self.save_progress()
                return True
            else:
                logger.error(f"❌ {scanner_name} failed: {result.stderr}")
                self.progress['errors'].append({
                    'scanner': scanner_name,
                    'error': result.stderr,
                    'timestamp': datetime.now().isoformat()
                })
                return False

        except subprocess.TimeoutExpired:
            logger.error(f"⏰ {scanner_name} timed out")
            return False
        except Exception as e:
            logger.error(f"❌ Error running {scanner_name}: {e}")
            return False

    def aggregate_results(self) -> Dict:
        """Aggregate results from all scanner output files"""
        logger.info("📊 Aggregating results from all scanners...")

        aggregated = {
            'total_repos': 0,
            'by_scanner': defaultdict(int),
            'by_language': defaultdict(int),
            'by_platform': defaultdict(int),
            'quality_scores': [],
            'top_repos': []
        }

        # Find all result files
        result_files = list(self.output_dir.glob("*_results.jsonl")) + \
                      list(self.output_dir.glob("*_scan_*.jsonl"))

        for result_file in result_files:
            try:
                with open(result_file, 'r') as f:
                    for line in f:
                        try:
                            result = json.loads(line.strip())
                            aggregated['total_repos'] += 1

                            # Categorize by scanner
                            scanner_name = result.get('source', 'unknown').split(':')[0]
                            aggregated['by_scanner'][scanner_name] += 1

                            # Categorize by language
                            language = result.get('language', 'Unknown')
                            aggregated['by_language'][language] += 1

                            # Categorize by platform
                            platform = result.get('platform', 'unknown')
                            aggregated['by_platform'][platform] += 1

                            # Collect quality scores if available
                            if 'quality_score' in result:
                                aggregated['quality_scores'].append(result['quality_score'])

                            # Collect top repos
                            if 'stars' in result:
                                aggregated['top_repos'].append({
                                    'name': result.get('full_name', result.get('name', 'unknown')),
                                    'stars': result['stars'],
                                    'language': language,
                                    'scanner': scanner_name
                                })

                        except json.JSONDecodeError:
                            continue

            except Exception as e:
                logger.warning(f"Error reading {result_file}: {e}")
                continue

        # Sort top repos by stars
        aggregated['top_repos'] = sorted(
            aggregated['top_repos'],
            key=lambda x: x['stars'],
            reverse=True
        )[:50]

        # Calculate statistics
        if aggregated['quality_scores']:
            aggregated['quality_stats'] = {
                'avg': sum(aggregated['quality_scores']) / len(aggregated['quality_scores']),
                'min': min(aggregated['quality_scores']),
                'max': max(aggregated['quality_scores'])
            }

        return aggregated

    def generate_comprehensive_report(self, aggregated_data: Dict) -> Dict:
        """Generate comprehensive master report"""
        logger.info("📋 Generating comprehensive report...")

        report = {
            'report_type': 'master_orchestration_report',
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_repositories': aggregated_data['total_repos'],
                'scanners_used': list(aggregated_data['by_scanner'].keys()),
                'languages_detected': len(aggregated_data['by_language']),
                'platforms_covered': len(aggregated_data['by_platform']),
            },
            'by_scanner': dict(aggregated_data['by_scanner']),
            'by_language': dict(sorted(
                aggregated_data['by_language'].items(),
                key=lambda x: x[1],
                reverse=True
            )),
            'by_platform': dict(aggregated_data['by_platform']),
            'quality_analysis': aggregated_data.get('quality_stats', {}),
            'top_repositories': aggregated_data['top_repos'][:20],
            'scan_metadata': {
                'duration_seconds': time.time() - time.mktime(datetime.strptime(
                    self.progress['start_time'], "%Y-%m-%dT%H:%M:%S.%f").timetuple()) if self.progress['start_time'] else 0,
                'errors_encountered': len(self.progress['errors']),
                'successful_scans': len(self.progress['scanners_run'])
            }
        }

        return report

    def save_master_report(self, report: Dict):
        """Save master report to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.output_dir / f"master_report_{timestamp}.json"

        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        logger.info(f"📁 Master report saved to: {report_file}")
        return str(report_file)

    def run_complete_scan(self, target_count: int = 100) -> Dict:
        """Run complete orchestrated scan"""
        logger.info("🎯 STARTING MASTER ORCHESTRATED SCAN")
        self.progress['start_time'] = datetime.now().isoformat()
        self.progress['current_phase'] = 'running_scanners'
        self.save_progress()

        # Phase 1: Run all enabled scanners
        scanner_order = ['mass_repository', 'universal_scanner', 'linux_packages', 'cross_platform']

        for scanner_name in scanner_order:
            if self.progress['total_repos_scanned'] >= target_count:
                logger.info(f"Target count reached: {target_count}")
                break

            # Calculate remaining count for this scanner
            remaining = target_count - self.progress['total_repos_scanned']
            count_per_scanner = min(50, remaining)  # Cap at 50 per scanner

            args = ['--count', str(count_per_scanner)]

            logger.info(f"Running {scanner_name} with target: {count_per_scanner}")

            if self.run_scanner(scanner_name, args):
                # Update progress
                self.progress['current_phase'] = f'completed_{scanner_name}'
                self.progress['total_repos_scanned'] += count_per_scanner
                self.save_progress()

            time.sleep(5)  # Brief pause between scanners

        # Phase 2: Aggregate results
        self.progress['current_phase'] = 'aggregating_results'
        self.save_progress()

        aggregated_data = self.aggregate_results()

        # Phase 3: Generate comprehensive report
        self.progress['current_phase'] = 'generating_report'
        self.save_progress()

        report = self.generate_comprehensive_report(aggregated_data)
        report_file = self.save_master_report(report)

        # Final update
        self.progress['current_phase'] = 'completed'
        self.progress['total_repos_scanned'] = aggregated_data['total_repos']
        self.progress['master_report_file'] = report_file
        self.save_progress()

        logger.info("✅ MASTER ORCHESTRATED SCAN COMPLETE")
        logger.info(f"📊 Total repositories scanned: {report['summary']['total_repositories']}")
        logger.info(f"🔧 Scanners used: {', '.join(report['summary']['scanners_used'])}")
        logger.info(f"💻 Languages detected: {report['summary']['languages_detected']}")
        logger.info(f"🌍 Platforms covered: {report['summary']['platforms_covered']}")
        logger.info(f"📁 Master report: {report_file}")

        return report

    def get_status(self) -> Dict:
        """Get current orchestration status"""
        return {
            'current_phase': self.progress['current_phase'],
            'start_time': self.progress['start_time'],
            'last_update': self.progress['last_update'],
            'scanners_completed': self.progress['scanners_run'],
            'total_repos_scanned': self.progress['total_repos_scanned'],
            'errors': self.progress['errors'],
            'is_complete': self.progress['current_phase'] == 'completed'
        }

def main():
    """Main execution function"""
    import argparse

    parser = argparse.ArgumentParser(description='Master orchestrator for Atheon GitHub Scanner')
    parser.add_argument('--count', type=int, default=100, help='Target repository count')
    parser.add_argument('--output', type=str, default='../data', help='Output directory')
    parser.add_argument('--status', action='store_true', help='Show current status')
    parser.add_argument('--scanner', type=str, help='Run specific scanner')

    args = parser.parse_args()

    orchestrator = MasterOrchestrator(output_dir=args.output)

    if args.status:
        # Show current status
        status = orchestrator.get_status()
        print(f"\n📊 ORCHESTRATION STATUS:")
        print(f"Current Phase: {status['current_phase']}")
        print(f"Start Time: {status['start_time']}")
        print(f"Last Update: {status['last_update']}")
        print(f"Completed Scanners: {', '.join(status['scanners_completed'])}")
        print(f"Total Repos Scanned: {status['total_repos_scanned']}")
        print(f"Is Complete: {status['is_complete']}")
        if status['errors']:
            print(f"Errors: {len(status['errors'])}")
    elif args.scanner:
        # Run specific scanner
        orchestrator.run_scanner(args.scanner, ['--count', str(args.count)])
    else:
        # Run complete orchestrated scan
        report = orchestrator.run_complete_scan(target_count=args.count)

        print(f"\n🎯 MASTER ORCHESTRATION SUMMARY:")
        print(f"Total Repositories: {report['summary']['total_repositories']}")
        print(f"Scanners Used: {', '.join(report['summary']['scanners_used'])}")
        print(f"Languages: {report['summary']['languages_detected']}")
        print(f"Platforms: {report['summary']['platforms_covered']}")
        print(f"\nTop Repositories:")
        for repo in report['top_repositories'][:10]:
            print(f"  - {repo['name']} ({repo['stars']} stars, {repo['language']})")

if __name__ == "__main__":
    main()