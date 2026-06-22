package scanner

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliasfoxkde/Atheon-GitHub-Scanner/pkg/database"
	"github.com/aliasfoxkde/Atheon-GitHub-Scanner/pkg/github"
	"github.com/aliasfoxkde/Atheon-GitHub-Scanner/pkg/patterns"
)

// Scanner represents the main repository scanner
type Scanner struct {
	githubClient   *github.Client
	patternScanner *patterns.Scanner
	database       interface{}
	ctx            context.Context
	workDir        string
}

// ScanResult represents the complete scan result for a repository
type ScanResult struct {
	Repository   *github.Repository `json:"repository"`
	Findings     []patterns.Finding `json:"findings"`
	Statistics   map[string]int     `json:"statistics"`
	QualityScore int                `json:"quality_score"`
	Tier         string             `json:"tier"`
	ScanDate     time.Time          `json:"scan_date"`
	Summary      ScanSummary        `json:"summary"`
}

// ScanSummary provides a high-level summary of the scan
type ScanSummary struct {
	TotalFindings      int            `json:"total_findings"`
	CriticalFindings   int            `json:"critical_findings"`
	HighFindings       int            `json:"high_findings"`
	MediumFindings     int            `json:"medium_findings"`
	LowFindings        int            `json:"low_findings"`
	Categories         map[string]int `json:"categories"`
	FilesScanned       int            `json:"files_scanned"`
	Languages          []string       `json:"languages"`
	CodeQualityMetrics CodeQuality    `json:"code_quality_metrics"`
}

// CodeQuality represents code quality metrics
type CodeQuality struct {
	TestCoverage         float64 `json:"test_coverage"`
	DocumentationPct     float64 `json:"documentation_percentage"`
	ComplexityScore      float64 `json:"complexity_score"`
	TechnicalDebt        int     `json:"technical_debt"`
	MaintainabilityIndex float64 `json:"maintainability_index"`
}

// NewScanner creates a new repository scanner
func NewScanner(ctx context.Context, githubToken string) (*Scanner, error) {
	workDir := filepath.Join(os.TempDir(), "atheon-scanner")
	if err := os.MkdirAll(workDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create working directory: %w", err)
	}

	return &Scanner{
		githubClient:   github.NewClient(githubToken),
		patternScanner: patterns.NewScanner(ctx),
		ctx:            ctx,
		workDir:        workDir,
	}, nil
}

// SetDatabase sets the database for the scanner
func (s *Scanner) SetDatabase(db *database.Database) {
	s.database = db
}

// ScanRepository scans a single repository
func (s *Scanner) ScanRepository(owner, name string) (*ScanResult, error) {
	// Get repository metadata
	repo, err := s.githubClient.GetRepository(s.ctx, owner, name)
	if err != nil {
		return nil, fmt.Errorf("failed to get repository: %w", err)
	}

	// Clone repository
	repoPath, err := s.cloneRepository(repo)
	if err != nil {
		return nil, fmt.Errorf("failed to clone repository: %w", err)
	}
	defer os.RemoveAll(repoPath) // Clean up after scan

	// Scan for patterns
	findings, err := s.patternScanner.ScanDirectory(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to scan repository: %w", err)
	}

	// Calculate statistics
	statistics := s.patternScanner.GetStatistics()

	// Calculate code quality metrics
	qualityMetrics := s.calculateCodeQuality(repoPath, repo.Language)

	// Create summary
	summary := s.createSummary(findings, statistics, qualityMetrics, repoPath)

	// Calculate quality score
	qualityScore := s.calculateQualityScore(summary, repo)

	// Determine tier
	tier := s.getTier(qualityScore)

	result := &ScanResult{
		Repository:   repo,
		Findings:     findings,
		Statistics:   statistics,
		QualityScore: qualityScore,
		Tier:         tier,
		ScanDate:     time.Now(),
		Summary:      summary,
	}

	return result, nil
}

// sanitizePath ensures a path stays within the base directory (prevents path traversal)
func sanitizePath(path string, baseDir string) (string, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", fmt.Errorf("failed to get absolute path: %w", err)
	}
	absBase, err := filepath.Abs(baseDir)
	if err != nil {
		return "", fmt.Errorf("failed to get absolute base directory: %w", err)
	}
	if !strings.HasPrefix(absPath, absBase+string(filepath.Separator)) && absPath != absBase {
		return "", fmt.Errorf("path traversal detected: %s is outside %s", path, baseDir)
	}
	return absPath, nil
}

// cloneRepository clones a repository to a local directory
func (s *Scanner) cloneRepository(repo *github.Repository) (string, error) {
	// Sanitize the repo name to prevent path traversal
	safeName := strings.ReplaceAll(repo.FullName, "/", "_")
	safeName = strings.ReplaceAll(safeName, "..", "")
	repoDir := filepath.Join(s.workDir, safeName)

	// Validate the final path stays within workDir
	if _, err := sanitizePath(repoDir, s.workDir); err != nil {
		return "", fmt.Errorf("invalid repository path: %w", err)
	}

	// Remove existing directory if it exists
	os.RemoveAll(repoDir)

	// Clone using token via environment variable instead of embedding in URL
	cmd := exec.CommandContext(s.ctx, "git", "clone", "--depth", "1", repo.CloneURL, repoDir)
	cmd.Dir = s.workDir
	cmd.Env = append(os.Environ(),
		"GIT_TERMINAL_PROMPT=0",
	)
	// Add token to environment if available
	if token := s.githubClient.GetToken(); token != "" {
		cmd.Env = append(cmd.Env, "GITHUB_TOKEN="+token)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("git clone failed: %w\nOutput: %s", err, string(output))
	}

	return repoDir, nil
}

// calculateCodeQuality calculates code quality metrics
func (s *Scanner) calculateCodeQuality(repoPath, primaryLanguage string) CodeQuality {
	// Default metrics
	metrics := CodeQuality{
		TestCoverage:         0.0,
		DocumentationPct:     0.0,
		ComplexityScore:      50.0, // Medium complexity as baseline
		TechnicalDebt:        0,
		MaintainabilityIndex: 70.0, // Baseline maintainability
	}

	// Count total files and test files
	var totalFiles, testFiles, docFiles int

	err := filepath.Walk(repoPath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}

		ext := strings.ToLower(filepath.Ext(path))
		basename := strings.ToLower(filepath.Base(path))

		// Count source files
		if s.isSourceFile(ext) {
			totalFiles++

			// Check for test files
			if strings.Contains(basename, "test") || strings.Contains(basename, "spec") {
				testFiles++
			}
		}

		// Count documentation files
		if ext == ".md" || basename == "readme" || ext == ".rst" || ext == ".adoc" {
			docFiles++
		}

		return nil
	})

	if err == nil && totalFiles > 0 {
		metrics.TestCoverage = float64(testFiles) / float64(totalFiles) * 100
		metrics.DocumentationPct = float64(docFiles) / float64(totalFiles) * 10
	}

	return metrics
}

// isSourceFile checks if a file is a source file
func (s *Scanner) isSourceFile(ext string) bool {
	sourceExts := map[string]bool{
		".go":    true,
		".py":    true,
		".js":    true,
		".ts":    true,
		".java":  true,
		".rb":    true,
		".php":   true,
		".cs":    true,
		".cpp":   true,
		".c":     true,
		".h":     true,
		".rs":    true,
		".kt":    true,
		".swift": true,
	}
	return sourceExts[ext]
}

// createSummary creates a high-level summary of the scan results
func (s *Scanner) createSummary(findings []patterns.Finding, statistics map[string]int, qualityMetrics CodeQuality, repoPath string) ScanSummary {
	summary := ScanSummary{
		TotalFindings:      len(findings),
		CriticalFindings:   statistics["critical"],
		HighFindings:       statistics["high"],
		MediumFindings:     statistics["medium"],
		LowFindings:        statistics["low"],
		Categories:         make(map[string]int),
		CodeQualityMetrics: qualityMetrics,
	}

	// Count by category
	for _, finding := range findings {
		summary.Categories[finding.Category]++
	}

	// Count files scanned
	filepath.Walk(repoPath, func(path string, info os.FileInfo, err error) error {
		if err == nil && !info.IsDir() {
			summary.FilesScanned++
		}
		return nil
	})

	return summary
}

// calculateQualityScore calculates an overall quality score (0-100)
func (s *Scanner) calculateQualityScore(summary ScanSummary, repo *github.Repository) int {
	score := 100

	// Deduct points for findings (weighted by severity with diminishing returns for large projects)
	// Use logarithmic scaling for large numbers of findings
	criticalPenalty := min(summary.CriticalFindings*25, 50) // Cap at 50 points
	highPenalty := min(summary.HighFindings*10, 30)         // Cap at 30 points
	mediumPenalty := min(summary.MediumFindings*3, 20)      // Cap at 20 points
	lowPenalty := min(summary.LowFindings/10, 10)           // Scale down low findings significantly

	score -= criticalPenalty
	score -= highPenalty
	score -= mediumPenalty
	score -= lowPenalty

	// Bonus points for code quality metrics
	score += int(summary.CodeQualityMetrics.TestCoverage / 10)
	score += int(summary.CodeQualityMetrics.DocumentationPct / 2)
	score += int(summary.CodeQualityMetrics.MaintainabilityIndex / 10)

	// Bonus for repository activity (recent updates)
	daysSinceUpdate := int(time.Since(repo.UpdatedAt).Hours() / 24)
	if daysSinceUpdate < 30 {
		score += 5
	} else if daysSinceUpdate < 90 {
		score += 2
	}

	// Bonus for having documentation
	if summary.CodeQualityMetrics.DocumentationPct > 5 {
		score += 3
	}

	// Bonus for popularity and community engagement
	if repo.Stars > 10000 {
		score += 5
	} else if repo.Stars > 1000 {
		score += 3
	}

	// Bonus for recent activity
	if summary.FilesScanned > 1000 && summary.CriticalFindings == 0 {
		score += 10 // Large, secure projects get bonus
	}

	// Ensure score is within bounds
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	return score
}

// getTier determines the quality tier based on score
func (s *Scanner) getTier(score int) string {
	switch {
	case score >= 90:
		return "A"
	case score >= 75:
		return "B"
	case score >= 60:
		return "C"
	case score >= 40:
		return "D"
	default:
		return "F"
	}
}

// ScanMultipleRepositories scans multiple repositories
func (s *Scanner) ScanMultipleRepositories(repos []*github.Repository) ([]*ScanResult, error) {
	var results []*ScanResult
	var errors []error

	for _, repo := range repos {
		parts := strings.Split(repo.FullName, "/")
		if len(parts) != 2 {
			continue
		}

		result, err := s.ScanRepository(parts[0], parts[1])
		if err != nil {
			errors = append(errors, fmt.Errorf("failed to scan %s: %w", repo.FullName, err))
			continue
		}

		results = append(results, result)
	}

	return results, nil
}

// GetGitHubClient returns the GitHub client
func (s *Scanner) GetGitHubClient() *github.Client {
	return s.githubClient
}

// GetPatternScanner returns the pattern scanner
func (s *Scanner) GetPatternScanner() *patterns.Scanner {
	return s.patternScanner
}
