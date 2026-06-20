package scanner

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/aliasfoxkde/Atheon-GitHub-Scanner/pkg/github"
	"github.com/aliasfoxkde/Atheon-GitHub-Scanner/pkg/patterns"
)

// TestNewScanner tests creating a new scanner
func TestNewScanner(t *testing.T) {
	ctx := context.Background()

	scanner, err := NewScanner(ctx, "test-token")
	if err != nil {
		t.Fatalf("NewScanner failed: %v", err)
	}

	if scanner == nil {
		t.Fatal("Expected non-nil scanner")
	}

	if scanner.githubClient == nil {
		t.Error("Expected github client to be initialized")
	}

	if scanner.patternScanner == nil {
		t.Error("Expected pattern scanner to be initialized")
	}

	if scanner.workDir == "" {
		t.Error("Expected work directory to be set")
	}

	// Clean up
	os.RemoveAll(scanner.workDir)
}

// TestNewScannerWithCanceledContext tests scanner creation with canceled context
func TestNewScannerWithCanceledContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	scanner, err := NewScanner(ctx, "test-token")
	if err != nil {
		t.Fatalf("NewScanner with canceled context failed: %v", err)
	}

	if scanner == nil {
		t.Fatal("Expected non-nil scanner even with canceled context")
	}

	os.RemoveAll(scanner.workDir)
}

// TestIsSourceFile tests the source file detection
func TestIsSourceFile(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	tests := []struct {
		ext     string
		want    bool
		name    string
	}{
		{".go", true, "Go source file"},
		{".py", true, "Python source file"},
		{".js", true, "JavaScript source file"},
		{".ts", true, "TypeScript source file"},
		{".java", true, "Java source file"},
		{".rb", true, "Ruby source file"},
		{".php", true, "PHP source file"},
		{".cs", true, "C# source file"},
		{".cpp", true, "C++ source file"},
		{".c", true, "C source file"},
		{".h", true, "C header file"},
		{".rs", true, "Rust source file"},
		{".kt", true, "Kotlin source file"},
		{".swift", true, "Swift source file"},
		{".txt", false, "Text file"},
		{".md", false, "Markdown file"},
		{".json", false, "JSON file"},
		{".xml", false, "XML file"},
		{".yaml", false, "YAML file"},
		{".yml", false, "YML file"},
		{".sh", false, "Shell script"},
		{".dockerfile", false, "Dockerfile"},
		{"", false, "No extension"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := scanner.isSourceFile(tt.ext)
			if got != tt.want {
				t.Errorf("isSourceFile(%q) = %v, want %v", tt.ext, got, tt.want)
			}
		})
	}
}

// TestCalculateCodeQuality tests code quality calculation
func TestCalculateCodeQuality(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	// Create a temporary directory structure
	tmpDir := t.TempDir()

	// Create source files
	files := map[string]string{
		"main.go":           "package main",
		"main_test.go":      "package main",
		"utils.go":          "package utils",
		"utils_test.go":     "package utils",
		"README.md":         "# Test Project",
		"docs/api.md":        "API Documentation",
		"config.json":       "{}",
		"script.sh":         "#!/bin/bash",
		"helper.py":          "def helper():",
		"helper_test.py":    "def test_helper():",
		"public/Logger.java": "public class Logger",
	}

	for path, content := range files {
		fullPath := filepath.Join(tmpDir, path)
		dir := filepath.Dir(fullPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			t.Fatalf("Failed to create directory %s: %v", dir, err)
		}
		if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
			t.Fatalf("Failed to create file %s: %v", fullPath, err)
		}
	}

	// Test code quality calculation
	quality := scanner.calculateCodeQuality(tmpDir, "Go")

	// We have 6 source files (main.go, utils.go, helper.py, Logger.java, main_test.go, utils_test.go, helper_test.py)
	// 3 test files (main_test.go, utils_test.go, helper_test.py)
	// Expected test coverage: (3/6) * 100 = 50%

	if quality.TestCoverage < 40 || quality.TestCoverage > 60 {
		t.Errorf("TestCoverage %v outside expected range [40, 60]", quality.TestCoverage)
	}

	// We have 2 documentation files (README.md, docs/api.md)
	// DocumentationPct is calculated as (docFiles / totalFiles) * 10
	// With 2 doc files and 9 total files: (2/9) * 10 = 2.22
	if quality.DocumentationPct < 2 {
		t.Errorf("DocumentationPct %v too low (expected >= 2)", quality.DocumentationPct)
	}

	// Check baseline metrics
	if quality.ComplexityScore == 0 {
		t.Error("Expected non-zero ComplexityScore")
	}

	if quality.MaintainabilityIndex == 0 {
		t.Error("Expected non-zero MaintainabilityIndex")
	}
}

// TestCalculateCodeQualityEmptyDir tests code quality with empty directory
func TestCalculateCodeQualityEmptyDir(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	tmpDir := t.TempDir()

	quality := scanner.calculateCodeQuality(tmpDir, "Go")

	// Should return default values for empty directory
	if quality.TestCoverage != 0 {
		t.Errorf("Expected TestCoverage 0 for empty dir, got %f", quality.TestCoverage)
	}

	if quality.DocumentationPct != 0 {
		t.Errorf("Expected DocumentationPct 0 for empty dir, got %f", quality.DocumentationPct)
	}
}

// TestCreateSummary tests summary creation
func TestCreateSummary(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	// Create temporary directory
	tmpDir := t.TempDir()

	// Create test files
	files := []string{"file1.go", "file2.go", "file3.md"}
	for _, file := range files {
		if err := os.WriteFile(filepath.Join(tmpDir, file), []byte("content"), 0644); err != nil {
			t.Fatalf("Failed to create test file: %v", err)
		}
	}

	// Create test findings
	findings := []patterns.Finding{
		{Type: "security", Severity: "critical", Category: "injection"},
		{Type: "security", Severity: "high", Category: "auth"},
		{Type: "security", Severity: "medium", Category: "config"},
		{Type: "code-quality", Severity: "low", Category: "style"},
	}

	statistics := map[string]int{
		"critical": 1,
		"high":     1,
		"medium":   1,
		"low":      1,
	}

	qualityMetrics := CodeQuality{
		TestCoverage:         75.0,
		DocumentationPct:     50.0,
		ComplexityScore:      30.0,
		TechnicalDebt:        100,
		MaintainabilityIndex: 85.0,
	}

	summary := scanner.createSummary(findings, statistics, qualityMetrics, tmpDir)

	// Validate summary
	if summary.TotalFindings != 4 {
		t.Errorf("Expected TotalFindings 4, got %d", summary.TotalFindings)
	}

	if summary.CriticalFindings != 1 {
		t.Errorf("Expected CriticalFindings 1, got %d", summary.CriticalFindings)
	}

	if summary.HighFindings != 1 {
		t.Errorf("Expected HighFindings 1, got %d", summary.HighFindings)
	}

	if summary.FilesScanned != 3 {
		t.Errorf("Expected FilesScanned 3, got %d", summary.FilesScanned)
	}

	// Check category counts
	if len(summary.Categories) != 4 {
		t.Errorf("Expected 4 categories, got %d", len(summary.Categories))
	}

	if summary.Categories["injection"] != 1 {
		t.Errorf("Expected injection category count 1, got %d", summary.Categories["injection"])
	}
}

// TestCalculateQualityScore tests quality score calculation
func TestCalculateQualityScore(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	tests := []struct {
		name          string
		summary       ScanSummary
		repo          *github.Repository
		minScore      int
		maxScore      int
	}{
		{
			name: "perfect repository",
			summary: ScanSummary{
				TotalFindings:      0,
				CriticalFindings:   0,
				HighFindings:       0,
				MediumFindings:     0,
				LowFindings:        0,
				CodeQualityMetrics: CodeQuality{
					TestCoverage:         90.0,
					DocumentationPct:     80.0,
					MaintainabilityIndex: 90.0,
				},
			},
			repo: &github.Repository{
				Stars:     15000,
				UpdatedAt: time.Now(),
			},
			minScore: 90,
			maxScore: 100,
		},
		{
			name: "repository with critical findings",
			summary: ScanSummary{
				TotalFindings:      5,
				CriticalFindings:   2,
				HighFindings:       2,
				MediumFindings:     1,
				LowFindings:        0,
				CodeQualityMetrics: CodeQuality{
					TestCoverage:         50.0,
					DocumentationPct:     30.0,
					MaintainabilityIndex: 70.0,
				},
			},
			repo: &github.Repository{
				Stars:     100,
				UpdatedAt: time.Now(),
			},
			minScore: 40,
			maxScore: 70,
		},
		{
			name: "repository with many low findings",
			summary: ScanSummary{
				TotalFindings:      100,
				CriticalFindings:   0,
				HighFindings:       0,
				MediumFindings:     0,
				LowFindings:        100,
				CodeQualityMetrics: CodeQuality{
					TestCoverage:         80.0,
					DocumentationPct:     70.0,
					MaintainabilityIndex: 80.0,
				},
			},
			repo: &github.Repository{
				Stars:     5000,
				UpdatedAt: time.Now(),
			},
			minScore: 80,
			maxScore: 100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			score := scanner.calculateQualityScore(tt.summary, tt.repo)

			if score < tt.minScore || score > tt.maxScore {
				t.Errorf("Score %d outside expected range [%d, %d]", score, tt.minScore, tt.maxScore)
			}

			// Score should be bounded
			if score < 0 || score > 100 {
				t.Errorf("Score %d outside bounds [0, 100]", score)
			}
		})
	}
}

// TestGetTier tests tier calculation
func TestGetTier(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	tests := []struct {
		score    int
		expected string
		name     string
	}{
		{100, "A", "perfect score"},
		{95, "A", "excellent score"},
		{90, "A", "A threshold"},
		{89, "B", "just below A"},
		{85, "B", "good B score"},
		{80, "B", "high B score"},
		{75, "B", "B threshold"},
		{74, "C", "just below B"},
		{70, "C", "good C score"},
		{60, "C", "C threshold"},
		{59, "D", "just below C"},
		{50, "D", "D score"},
		{40, "D", "D threshold"},
		{39, "F", "just below D"},
		{20, "F", "F score"},
		{0, "F", "zero score"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tier := scanner.getTier(tt.score)
			if tier != tt.expected {
				t.Errorf("Score %d: expected tier %s, got %s", tt.score, tt.expected, tier)
			}
		})
	}
}

// TestScannerStruct tests the Scanner struct
func TestScannerStruct(t *testing.T) {
	ctx := context.Background()

	scanner, err := NewScanner(ctx, "test-token")
	if err != nil {
		t.Fatalf("NewScanner failed: %v", err)
	}
	defer os.RemoveAll(scanner.workDir)

	// Test scanner fields
	if scanner.githubClient == nil {
		t.Error("Expected githubClient to be initialized")
	}

	if scanner.patternScanner == nil {
		t.Error("Expected patternScanner to be initialized")
	}

	if scanner.ctx == nil {
		t.Error("Expected ctx to be initialized")
	}

	if scanner.workDir == "" {
		t.Error("Expected workDir to be set")
	}
}

// TestScanResultStruct tests the ScanResult struct
func TestScanResultStruct(t *testing.T) {
	now := time.Now()

	result := ScanResult{
		Repository: &github.Repository{
			ID:        12345,
			Name:      "testrepo",
			FullName:  "testowner/testrepo",
			Stars:     1000,
			UpdatedAt: now,
			Owner: github.Owner{
				Login: "testowner",
			},
		},
		Findings: []patterns.Finding{
			{Type: "security", Severity: "high"},
		},
		Statistics: map[string]int{
			"total": 10,
			"high":  1,
		},
		QualityScore: 85,
		Tier:         "A",
		ScanDate:     now,
		Summary: ScanSummary{
			TotalFindings:    10,
			CriticalFindings: 0,
			HighFindings:     1,
			MediumFindings:   2,
			LowFindings:      7,
			Categories:      map[string]int{"security": 10},
		},
	}

	// Validate fields
	if result.Repository.ID != 12345 {
		t.Errorf("Expected repo ID 12345, got %d", result.Repository.ID)
	}

	if result.Repository.Name != "testrepo" {
		t.Errorf("Expected repo name 'testrepo', got '%s'", result.Repository.Name)
	}

	if result.QualityScore != 85 {
		t.Errorf("Expected QualityScore 85, got %d", result.QualityScore)
	}

	if result.Tier != "A" {
		t.Errorf("Expected Tier 'A', got '%s'", result.Tier)
	}

	if len(result.Findings) != 1 {
		t.Errorf("Expected 1 finding, got %d", len(result.Findings))
	}
}

// TestCodeQualityStruct tests the CodeQuality struct
func TestCodeQualityStruct(t *testing.T) {
	quality := CodeQuality{
		TestCoverage:         85.5,
		DocumentationPct:     75.0,
		ComplexityScore:      3.2,
		TechnicalDebt:        120,
		MaintainabilityIndex: 88.0,
	}

	if quality.TestCoverage != 85.5 {
		t.Errorf("Expected TestCoverage 85.5, got %f", quality.TestCoverage)
	}

	if quality.TechnicalDebt != 120 {
		t.Errorf("Expected TechnicalDebt 120, got %d", quality.TechnicalDebt)
	}
}

// TestScanSummaryStruct tests the ScanSummary struct
func TestScanSummaryStruct(t *testing.T) {
	summary := ScanSummary{
		TotalFindings:      25,
		CriticalFindings:   2,
		HighFindings:       5,
		MediumFindings:     8,
		LowFindings:        10,
		Categories:         map[string]int{"security": 15, "quality": 10},
		FilesScanned:       150,
		Languages:          []string{"Go", "Python", "JavaScript"},
		CodeQualityMetrics: CodeQuality{
			TestCoverage:     80.0,
			DocumentationPct: 60.0,
		},
	}

	if summary.TotalFindings != 25 {
		t.Errorf("Expected TotalFindings 25, got %d", summary.TotalFindings)
	}

	if len(summary.Categories) != 2 {
		t.Errorf("Expected 2 categories, got %d", len(summary.Categories))
	}

	if len(summary.Languages) != 3 {
		t.Errorf("Expected 3 languages, got %d", len(summary.Languages))
	}
}

// TestCloneRepositoryWithInvalidURL tests cloneRepository with invalid URL
func TestCloneRepositoryWithInvalidURL(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	// Create a repository with invalid clone URL
	repo := &github.Repository{
		ID:        12345,
		Name:      "testrepo",
		FullName:  "testowner/testrepo",
		CloneURL:  "invalid://url",
		UpdatedAt: time.Now(),
		Owner: github.Owner{
			Login: "testowner",
		},
	}

	_, err := scanner.cloneRepository(repo)
	if err == nil {
		t.Error("Expected error for invalid clone URL, got nil")
	}

	if !strings.Contains(err.Error(), "git clone failed") {
		t.Errorf("Expected git clone error, got: %v", err)
	}
}

// TestCalculateCodeQualityWithInvalidPath tests code quality calculation with invalid path
func TestCalculateCodeQualityWithInvalidPath(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	quality := scanner.calculateCodeQuality("/nonexistent/path", "Go")

	// Should return default metrics for invalid path
	if quality.TestCoverage != 0 {
		t.Errorf("Expected TestCoverage 0 for invalid path, got %f", quality.TestCoverage)
	}
}

// TestQualityScoreBounds tests that quality scores stay within bounds
func TestQualityScoreBounds(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	// Test with extremely bad metrics
	badSummary := ScanSummary{
		TotalFindings:      1000,
		CriticalFindings:   100,
		HighFindings:       200,
		MediumFindings:     300,
		LowFindings:        400,
		CodeQualityMetrics: CodeQuality{
			TestCoverage:         0,
			DocumentationPct:     0,
			MaintainabilityIndex: 0,
		},
	}

	badRepo := &github.Repository{
		Stars:     0,
		UpdatedAt: time.Now().Add(-365 * 24 * time.Hour), // 1 year ago
	}

	score := scanner.calculateQualityScore(badSummary, badRepo)

	// Even with terrible metrics, score should be bounded
	if score < 0 {
		t.Errorf("Score %d below minimum 0", score)
	}
	if score > 100 {
		t.Errorf("Score %d above maximum 100", score)
	}
}

// TestCalculateCodeQualityLanguageSpecific tests language-specific file detection
func TestCalculateCodeQualityLanguageSpecific(t *testing.T) {
	ctx := context.Background()
	scanner, _ := NewScanner(ctx, "test-token")
	defer os.RemoveAll(scanner.workDir)

	// Test Go-specific files
	goDir := t.TempDir()
	goFiles := map[string]string{
		"main.go":      "package main",
		"main_test.go": "package main",
		"doc.go":       "package main // Documentation",
		"README.md":    "# Go Project",
	}

	for path, content := range goFiles {
		fullPath := filepath.Join(goDir, path)
		if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
			t.Fatalf("Failed to create file: %v", err)
		}
	}

	quality := scanner.calculateCodeQuality(goDir, "Go")

	// Go files should be counted as source files
	if quality.TestCoverage == 0 {
		t.Error("Expected non-zero test coverage for Go project with test files")
	}
}

// TestScannerWorkDirCleanup tests that work directory is properly managed
func TestScannerWorkDirCleanup(t *testing.T) {
	ctx := context.Background()

	scanner1, err := NewScanner(ctx, "test-token1")
	if err != nil {
		t.Fatalf("NewScanner failed: %v", err)
	}
	workDir1 := scanner1.workDir

	// The work directory should exist and contain the expected path
	if workDir1 == "" {
		t.Error("Expected work directory to be set")
	}

	if !strings.Contains(workDir1, "atheon-scanner") {
		t.Errorf("Expected work directory to contain 'atheon-scanner', got %s", workDir1)
	}

	// Verify directory exists
	if _, err := os.Stat(workDir1); os.IsNotExist(err) {
		t.Errorf("Work directory %s does not exist", workDir1)
	}

	// Clean up
	os.RemoveAll(workDir1)
}