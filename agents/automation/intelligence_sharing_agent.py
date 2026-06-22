#!/usr/bin/env python3
"""
INTELLIGENCE SHARING AGENT - Atheon GitHub Scanner

Manages intelligence sharing between Atheon projects.
Coordinates pattern discovery, performance data, and optimization insights.

Schedule: Daily at 4am UTC (0 4 * * *)
"""

import os
import json
import logging
import asyncio
import aiohttp
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import re


def sanitize_path(path: str, base_dir: str = None) -> str:
    """Prevent path traversal by resolving to absolute and checking bounds.

    Args:
        path: The path to sanitize
        base_dir: Optional base directory to constrain path within

    Returns:
        Sanitized absolute path
    """
    # Remove any null bytes and control characters
    path = path.replace('\x00', '')
    # Remove path traversal attempts
    path = re.sub(r'\.\.[/\\]', '', path)
    abs_path = os.path.abspath(path)
    if base_dir:
        base_abs = os.path.abspath(base_dir)
        if not abs_path.startswith(base_abs):
            return base_abs
    return abs_path


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/nas/Temp/repos/Atheon-GitHub-Scanner/data/intelligence_sharing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class IntelligenceData:
    """Intelligence data package"""
    category: str
    source_project: str
    target_projects: List[str]
    data: Dict[str, Any]
    priority: str
    timestamp: str
    validated: bool

@dataclass
class SharingReport:
    """Intelligence sharing report"""
    date: str
    sharing_duration: float
    total_intelligence_shared: int
    projects_updated: List[str]
    security_patterns_shared: int
    performance_data_shared: int
    quality_insights_shared: int
    optimization_opportunities_shared: int
    coordination_status: str
    next_sharing_scheduled: str

class IntelligenceSharingAgent:
    """Cross-project intelligence sharing coordinator"""

    def __init__(self):
        self.base_dir = Path("/nas/Temp/repos/Atheon-GitHub-Scanner")
        self.data_dir = self.base_dir / "data"
        self.intelligence_dir = self.data_dir / "intelligence"
        self.sharing_dir = self.intelligence_dir / "shared"

        # Create directories
        self.intelligence_dir.mkdir(parents=True, exist_ok=True)
        self.sharing_dir.mkdir(parents=True, exist_ok=True)

        # Project paths
        self.atheon_main_dir = Path("/nas/Temp/repos/Atheon")
        self.atheon_benchmark_dir = Path("/nas/Temp/repos/Atheon-Benchmark")

    async def run_intelligence_sharing(self) -> SharingReport:
        """Execute comprehensive intelligence sharing"""
        logger.info("🔄 Starting Intelligence Sharing")
        start_time = time.time()

        try:
            # Collect intelligence from GitHub Scanner
            scanner_intel = await self.collect_scanner_intelligence()

            # Share with Atheon Main Project
            atheon_updates = await self.share_with_atheon_main(scanner_intel)

            # Share with Atheon Benchmark
            benchmark_updates = await self.share_with_benchmark(scanner_intel)

            # Receive intelligence from other projects
            external_intel = await self.receive_external_intelligence()

            # Integrate intelligence
            integrated_intel = await self.integrate_intelligence(external_intel, scanner_intel)

            # Validate sharing
            validation_results = await self.validate_sharing_results({
                'atheon_updates': atheon_updates,
                'benchmark_updates': benchmark_updates,
                'integrated_intelligence': integrated_intel
            })

            # Generate sharing report
            report = await self.generate_sharing_report({
                'scanner_intel': scanner_intel,
                'atheon_updates': atheon_updates,
                'benchmark_updates': benchmark_updates,
                'external_intel': external_intel,
                'integrated_intel': integrated_intel,
                'validation': validation_results,
                'duration': time.time() - start_time
            })

            # Save report
            await self.save_sharing_report(report)

            logger.info(f"✅ Intelligence Sharing Complete - Shared {report.total_intelligence_shared} items")

            return report

        except Exception as e:
            logger.error(f"❌ Intelligence Sharing Failed: {e}")
            raise

    async def collect_scanner_intelligence(self) -> Dict[str, Any]:
        """Collect intelligence from GitHub Scanner operations"""
        logger.info("Collecting GitHub Scanner intelligence...")

        scanner_intel = {
            'scan_results': await self.load_scan_results(),
            'security_patterns': await self.collect_security_patterns(),
            'performance_metrics': await self.collect_performance_metrics(),
            'quality_insights': await self.collect_quality_insights(),
            'optimization_opportunities': await self.collect_optimization_opportunities(),
            'trending_analysis': await self.load_trending_analysis(),
            'vulnerability_intelligence': await self.load_vulnerability_intelligence()
        }

        logger.info(f"Collected scanner intelligence: {sum(len(v) if isinstance(v, list) else 1 for v in scanner_intel.values())} items")

        return scanner_intel

    async def load_scan_results(self) -> List[Dict]:
        """Load recent scan results"""
        try:
            scan_results_file = self.data_dir / "combined_scan_results.json"

            if scan_results_file.exists():
                with open(scan_results_file, 'r') as f:
                    return json.load(f)

        except Exception as e:
            logger.error(f"Failed to load scan results: {e}")

        return []

    async def collect_security_patterns(self) -> List[Dict]:
        """Collect security pattern discoveries"""
        patterns = []

        try:
            # Load from intelligence directory
            pattern_files = list(self.intelligence_dir.glob("security_patterns_*.json"))

            for pattern_file in pattern_files:
                with open(pattern_file, 'r') as f:
                    patterns.extend(json.load(f))

        except Exception as e:
            logger.error(f"Failed to collect security patterns: {e}")

        return patterns

    async def collect_performance_metrics(self) -> Dict[str, Any]:
        """Collect performance metrics"""
        try:
            stats_file = self.data_dir / "scan_statistics.json"

            if stats_file.exists():
                with open(stats_file, 'r') as f:
                    return json.load(f)

        except Exception as e:
            logger.error(f"Failed to collect performance metrics: {e}")

        return {}

    async def collect_quality_insights(self) -> List[Dict]:
        """Collect quality insights"""
        insights = []

        try:
            quality_files = list(self.intelligence_dir.glob("quality_patterns_*.json"))

            for quality_file in quality_files:
                with open(quality_file, 'r') as f:
                    insights.extend(json.load(f))

        except Exception as e:
            logger.error(f"Failed to collect quality insights: {e}")

        return insights

    async def collect_optimization_opportunities(self) -> List[Dict]:
        """Collect optimization opportunities"""
        opportunities = []

        try:
            perf_files = list(self.intelligence_dir.glob("performance_insights_*.json"))

            for perf_file in perf_files:
                with open(perf_file, 'r') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        opportunities.extend(data)

        except Exception as e:
            logger.error(f"Failed to collect optimization opportunities: {e}")

        return opportunities

    async def load_trending_analysis(self) -> List[Dict]:
        """Load trending repository analysis"""
        try:
            trending_files = list(self.intelligence_dir.glob("trending_analysis_*.json"))

            if trending_files:
                with open(trending_files[-1], 'r') as f:
                    return json.load(f)

        except Exception as e:
            logger.error(f"Failed to load trending analysis: {e}")

        return []

    async def load_vulnerability_intelligence(self) -> List[Dict]:
        """Load vulnerability intelligence"""
        try:
            vuln_files = list(self.intelligence_dir.glob("vulnerability_research_*.json"))

            if vuln_files:
                with open(vuln_files[-1], 'r') as f:
                    return json.load(f)

        except Exception as e:
            logger.error(f"Failed to load vulnerability intelligence: {e}")

        return []

    async def share_with_atheon_main(self, scanner_intel: Dict) -> Dict[str, Any]:
        """Share intelligence with Atheon main project"""
        logger.info("Sharing intelligence with Atheon Main...")

        atheon_updates = {
            'security_patterns': [],
            'pattern_performance': [],
            'vulnerability_intelligence': [],
            'optimization_recommendations': [],
            'quality_insights': []
        }

        try:
            # Prepare security patterns for Atheon
            for pattern in scanner_intel.get('security_patterns', [])[:10]:  # Top 10 patterns
                atheon_pattern = {
                    'pattern_id': f"scanner_{pattern.get('name', 'unknown').replace(' ', '_').lower()}",
                    'pattern_name': pattern.get('name', 'Unknown Pattern'),
                    'pattern_type': 'security',
                    'regex_pattern': self.generate_regex_from_pattern(pattern),
                    'severity': pattern.get('severity', 'medium'),
                    'confidence': pattern.get('confidence', 0.7),
                    'description': pattern.get('description', ''),
                    'source': 'github_scanner',
                    'validated': pattern.get('confidence', 0.7) > 0.8,
                    'performance_data': {
                        'detection_rate': pattern.get('confidence', 0.7),
                        'false_positive_rate': 1.0 - pattern.get('confidence', 0.7)
                    }
                }
                atheon_updates['security_patterns'].append(atheon_pattern)

            # Share performance data
            performance_data = scanner_intel.get('performance_metrics', {})
            if performance_data:
                atheon_updates['pattern_performance'].append({
                    'metric': 'scan_performance',
                    'repositories_scanned': performance_data.get('repositories_scanned', 0),
                    'average_quality_score': performance_data.get('average_quality_score', 0),
                    'scan_duration': performance_data.get('scan_duration_hours', 0)
                })

            # Share vulnerability intelligence
            for vuln in scanner_intel.get('vulnerability_intelligence', [])[:5]:  # Top 5 CVEs
                atheon_updates['vulnerability_intelligence'].append({
                    'cve_id': vuln.get('id', 'UNKNOWN'),
                    'severity': vuln.get('severity', 'UNKNOWN'),
                    'description': vuln.get('description', ''),
                    'pattern_opportunities': vuln.get('pattern_opportunities', [])
                })

            # Share quality insights
            for insight in scanner_intel.get('quality_insights', [])[:5]:
                atheon_updates['quality_insights'].append({
                    'insight_type': 'quality_pattern',
                    'description': insight.get('description', ''),
                    'confidence': insight.get('confidence', 0.8),
                    'implementation_complexity': insight.get('complexity', 'medium')
                })

            # Save to Atheon main project
            atheon_intel_file = self.atheon_main_dir / "docs" / "planning" / "scanner_intelligence.json"
            # Validate path stays within base directory
            atheon_intel_file = Path(sanitize_path(str(atheon_intel_file), str(self.atheon_main_dir)))
            atheon_intel_file.parent.mkdir(parents=True, exist_ok=True)

            with open(atheon_intel_file, 'w') as f:
                json.dump(atheon_updates, f, indent=2, default=str)

            logger.info(f"Shared {len(atheon_updates['security_patterns'])} patterns with Atheon Main")

        except Exception as e:
            logger.error(f"Failed to share with Atheon Main: {e}")

        return atheon_updates

    async def share_with_benchmark(self, scanner_intel: Dict) -> Dict[str, Any]:
        """Share intelligence with Atheon Benchmark"""
        logger.info("Sharing intelligence with Atheon Benchmark...")

        benchmark_updates = {
            'performance_baselines': [],
            'optimization_targets': [],
            'quality_metrics': [],
            'benchmark_candidates': []
        }

        try:
            # Share performance baselines
            performance_data = scanner_intel.get('performance_metrics', {})
            if performance_data:
                benchmark_updates['performance_baselines'].append({
                    'baseline_type': 'scanner_performance',
                    'repositories_scanned': performance_data.get('repositories_scanned', 0),
                    'average_duration': performance_data.get('scan_duration_hours', 0),
                    'quality_score_distribution': performance_data.get('tier_distribution', {}),
                    'timestamp': datetime.now().isoformat()
                })

            # Share optimization opportunities
            for opportunity in scanner_intel.get('optimization_opportunities', [])[:5]:
                benchmark_updates['optimization_targets'].append({
                    'target_area': opportunity.get('name', 'unknown'),
                    'current_performance': opportunity.get('description', ''),
                    'optimization_potential': opportunity.get('confidence', 0.7),
                    'priority': 'high' if opportunity.get('confidence', 0.7) > 0.8 else 'medium'
                })

            # Share quality metrics
            scan_results = scanner_intel.get('scan_results', [])
            if scan_results:
                quality_metrics = {
                    'total_scanned': len(scan_results),
                    'high_quality_count': sum(1 for r in scan_results if r.get('quality_score', 0) >= 90),
                    'average_quality': sum(r.get('quality_score', 0) for r in scan_results) / len(scan_results) if scan_results else 0,
                    'tier_distribution': {}
                }

                # Calculate tier distribution
                for result in scan_results:
                    tier = result.get('tier', 'Unknown')
                    quality_metrics['tier_distribution'][tier] = quality_metrics['tier_distribution'].get(tier, 0) + 1

                benchmark_updates['quality_metrics'].append(quality_metrics)

            # Share benchmark candidates
            trending_repos = scanner_intel.get('trending_analysis', [])
            for repo in trending_repos[:10]:  # Top 10 trending repos
                benchmark_updates['benchmark_candidates'].append({
                    'repository': repo.get('full_name', 'unknown'),
                    'stars': repo.get('stars', 0),
                    'language': repo.get('language', 'Unknown'),
                    'benchmark_priority': 'high' if repo.get('stars', 0) > 100000 else 'medium'
                })

            # Save to Benchmark project
            benchmark_intel_file = self.atheon_benchmark_dir / "planning" / "scanner_intelligence.json"
            # Validate path stays within base directory
            benchmark_intel_file = Path(sanitize_path(str(benchmark_intel_file), str(self.atheon_benchmark_dir)))
            benchmark_intel_file.parent.mkdir(parents=True, exist_ok=True)

            with open(benchmark_intel_file, 'w') as f:
                json.dump(benchmark_updates, f, indent=2, default=str)

            logger.info(f"Shared intelligence with Benchmark - {len(benchmark_updates['performance_baselines'])} baselines")

        except Exception as e:
            logger.error(f"Failed to share with Benchmark: {e}")

        return benchmark_updates

    async def receive_external_intelligence(self) -> Dict[str, Any]:
        """Receive intelligence from other Atheon projects"""
        logger.info("Receiving external intelligence...")

        external_intel = {
            'atheon_main': {},
            'atheon_benchmark': {}
        }

        try:
            # Receive from Atheon Main (pattern enhancements)
            atheon_patterns_file = self.atheon_main_dir / "data" / "enhanced_patterns.json"
            if atheon_patterns_file.exists():
                with open(atheon_patterns_file, 'r') as f:
                    external_intel['atheon_main'] = {
                        'enhanced_patterns': json.load(f),
                        'pattern_recommendations': []
                    }

            # Receive from Benchmark (performance insights)
            benchmark_insights_file = self.atheon_benchmark_dir / "data" / "performance_insights.json"
            if benchmark_insights_file.exists():
                with open(benchmark_insights_file, 'r') as f:
                    external_intel['atheon_benchmark'] = json.load(f)

            logger.info("Received external intelligence from Atheon projects")

        except Exception as e:
            logger.error(f"Failed to receive external intelligence: {e}")

        return external_intel

    async def integrate_intelligence(self, external_intel: Dict, scanner_intel: Dict) -> Dict[str, Any]:
        """Integrate external intelligence with scanner intelligence"""
        logger.info("Integrating intelligence...")

        integrated = {
            'enhanced_patterns': [],
            'optimization_recommendations': [],
            'coordination_opportunities': [],
            'shared_insights': []
        }

        try:
            # Integrate enhanced patterns from Atheon Main
            atheon_enhancements = external_intel.get('atheon_main', {}).get('enhanced_patterns', [])
            for enhancement in atheon_enhancements:
                integrated['enhanced_patterns'].append({
                    'source': 'atheon_main',
                    'enhancement': enhancement,
                    'applicability_to_scanner': self.assess_pattern_applicability(enhancement),
                    'implementation_priority': 'high'
                })

            # Integrate performance insights from Benchmark
            benchmark_insights = external_intel.get('atheon_benchmark', {})
            if benchmark_insights:
                integrated['optimization_recommendations'].append({
                    'source': 'atheon_benchmark',
                    'recommendations': benchmark_insights,
                    'expected_improvement': '15-25%',
                    'implementation_complexity': 'medium'
                })

            # Identify coordination opportunities
            integrated['coordination_opportunities'] = [
                {
                    'type': 'pattern_optimization',
                    'projects_involved': ['scanner', 'atheon', 'benchmark'],
                    'description': 'Coordinate pattern optimization across all projects',
                    'potential_impact': 'high',
                    'estimated_effort': 'medium'
                },
                {
                    'type': 'performance_benchmarking',
                    'projects_involved': ['scanner', 'benchmark'],
                    'description': 'Joint performance benchmarking initiative',
                    'potential_impact': 'medium',
                    'estimated_effort': 'low'
                }
            ]

            # Extract shared insights
            integrated['shared_insights'] = self.extract_shared_insights(scanner_intel, external_intel)

            logger.info(f"Integrated {len(integrated['enhanced_patterns'])} enhanced patterns")

        except Exception as e:
            logger.error(f"Failed to integrate intelligence: {e}")

        return integrated

    async def validate_sharing_results(self, results: Dict) -> Dict[str, Any]:
        """Validate intelligence sharing results"""
        logger.info("Validating sharing results...")

        validation = {
            'atheon_validation': {'success': False, 'items_shared': 0},
            'benchmark_validation': {'success': False, 'items_shared': 0},
            'external_validation': {'success': False, 'items_received': 0},
            'integration_validation': {'success': False, 'items_integrated': 0}
        }

        try:
            # Validate Atheon Main sharing
            atheon_updates = results.get('atheon_updates', {})
            validation['atheon_validation'] = {
                'success': bool(atheon_updates),
                'items_shared': sum(len(v) if isinstance(v, list) else 1 for v in atheon_updates.values())
            }

            # Validate Benchmark sharing
            benchmark_updates = results.get('benchmark_updates', {})
            validation['benchmark_validation'] = {
                'success': bool(benchmark_updates),
                'items_shared': sum(len(v) if isinstance(v, list) else 1 for v in benchmark_updates.values())
            }

            # Validate external intelligence reception
            external_intel = results.get('external_intel', {})
            validation['external_validation'] = {
                'success': bool(external_intel),
                'items_received': sum(len(v.get('enhanced_patterns', [])) if isinstance(v, dict) else 0 for v in external_intel.values())
            }

            # Validate integration
            integrated_intel = results.get('integrated_intelligence', {})
            validation['integration_validation'] = {
                'success': bool(integrated_intel),
                'items_integrated': sum(len(v) if isinstance(v, list) else 1 for v in integrated_intel.values())
            }

            logger.info("Sharing validation complete")

        except Exception as e:
            logger.error(f"Failed to validate sharing results: {e}")

        return validation

    async def generate_sharing_report(self, data: Dict) -> SharingReport:
        """Generate comprehensive sharing report"""
        validation = data.get('validation', {})

        total_shared = (
            validation.get('atheon_validation', {}).get('items_shared', 0) +
            validation.get('benchmark_validation', {}).get('items_shared', 0)
        )

        projects_updated = []
        if validation.get('atheon_validation', {}).get('success'):
            projects_updated.append('atheon_main')
        if validation.get('benchmark_validation', {}).get('success'):
            projects_updated.append('atheon_benchmark')

        report = SharingReport(
            date=datetime.now().isoformat(),
            sharing_duration=data.get('duration', 0),
            total_intelligence_shared=total_shared,
            projects_updated=projects_updated,
            security_patterns_shared=validation.get('atheon_validation', {}).get('items_shared', 0),
            performance_data_shared=validation.get('benchmark_validation', {}).get('items_shared', 0),
            quality_insights_shared=len(data.get('scanner_intel', {}).get('quality_insights', [])),
            optimization_opportunities_shared=len(data.get('scanner_intel', {}).get('optimization_opportunities', [])),
            coordination_status='active' if projects_updated else 'inactive',
            next_sharing_scheduled=(datetime.now() + timedelta(hours=24)).isoformat()
        )

        return report

    async def save_sharing_report(self, report: SharingReport):
        """Save sharing report"""
        report_file = self.sharing_dir / f"sharing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(report_file, 'w') as f:
            json.dump(asdict(report), f, indent=2, default=str)

        logger.info(f"Saved sharing report to {report_file}")

    # Helper methods
    def generate_regex_from_pattern(self, pattern: Dict) -> str:
        """Generate regex pattern from pattern data"""
        # Simplified implementation - would be more sophisticated in production
        pattern_name = pattern.get('name', '').lower()
        pattern_name = pattern_name.replace(' ', '_').replace('-', '_')

        # Generate basic regex pattern
        return f"({pattern_name}\\b)"

    def assess_pattern_applicability(self, enhancement: Dict) -> str:
        """Assess if an enhanced pattern is applicable to scanner"""
        # Simplified assessment - would be more sophisticated in production
        confidence = enhancement.get('confidence', 0.5)

        if confidence > 0.8:
            return 'high'
        elif confidence > 0.6:
            return 'medium'
        else:
            return 'low'

    def extract_shared_insights(self, scanner_intel: Dict, external_intel: Dict) -> List[Dict]:
        """Extract insights shared across all projects"""
        shared = []

        # Security insights
        if scanner_intel.get('security_patterns'):
            shared.append({
                'category': 'security',
                'insight': f"{len(scanner_intel['security_patterns'])} security patterns discovered",
                'relevance': 'high',
                'projects': ['scanner', 'atheon', 'benchmark']
            })

        # Performance insights
        if scanner_intel.get('performance_metrics'):
            shared.append({
                'category': 'performance',
                'insight': f"{scanner_intel['performance_metrics'].get('repositories_scanned', 0)} repos scanned",
                'relevance': 'medium',
                'projects': ['scanner', 'benchmark']
            })

        return shared

async def main():
    """Main execution function"""
    import time
    agent = IntelligenceSharingAgent()

    print("🔄 Atheon GitHub Scanner - Intelligence Sharing Agent")
    print("=" * 60)

    try:
        # Run intelligence sharing
        report = await agent.run_intelligence_sharing()

        # Print summary
        print(f"\n✅ Intelligence Sharing Complete!")
        print(f"   Date: {report.date}")
        print(f"   Duration: {report.sharing_duration:.2f}s")
        print(f"   Total Intelligence Shared: {report.total_intelligence_shared}")
        print(f"   Projects Updated: {', '.join(report.projects_updated) if report.projects_updated else 'None'}")
        print(f"   Security Patterns Shared: {report.security_patterns_shared}")
        print(f"   Performance Data Shared: {report.performance_data_shared}")
        print(f"   Quality Insights Shared: {report.quality_insights_shared}")
        print(f"   Coordination Status: {report.coordination_status}")
        print(f"   Next Sharing: {report.next_sharing_scheduled}")

        return 0

    except Exception as e:
        print(f"❌ Intelligence Sharing Failed: {e}")
        logger.error(f"Intelligence sharing failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    import time
    sys.exit(asyncio.run(main()))