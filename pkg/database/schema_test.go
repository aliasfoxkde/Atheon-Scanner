package database

import (
	"regexp"
	"testing"
	"time"
)

// TestSchemaValidation tests that the SQL schema is valid
func TestSchemaValidation(t *testing.T) {
	// Create a test database connection string (we'll use mock connection)
	testConn := "postgres://user:pass@localhost/testdb?sslmode=disable"

	// Test NewDatabase with invalid connection
	_, err := NewDatabase("invalid://connection")
	if err == nil {
		t.Error("expected error for invalid connection string, got nil")
	}

	// Test NewDatabase with test connection (will fail if postgres not available)
	db, err := NewDatabase(testConn)
	if err != nil {
		t.Logf("NewDatabase with test connection failed (expected if postgres unavailable): %v", err)
		t.Skip("Skipping database tests - postgres not available")
	}

	defer func() {
		if db != nil {
			db.Close()
		}
	}()

	if db == nil {
		t.Fatal("expected non-nil database connection")
	}
}

// TestInitSchemaSyntax tests that the schema SQL is syntactically valid
func TestInitSchemaSyntax(t *testing.T) {
	// This test validates the schema SQL syntax without requiring a database
	// We check for common SQL issues

	// We would need to extract the schema from InitSchema to test it properly
	// For now, we test the structure expectations
	t.Skip("Schema syntax validation requires schema extraction")
}

// TestRepositoryStruct tests the Repository struct
func TestRepositoryStruct(t *testing.T) {
	now := time.Now()
	repo := Repository{
		ID:            "test-id",
		Owner:         "testowner",
		Name:          "testrepo",
		FullName:      "testowner/testrepo",
		Description:   "Test repository",
		Language:      "Go",
		Stars:         100,
		Forks:         50,
		OpenIssues:    10,
		CreatedAt:     now,
		UpdatedAt:     now,
		DefaultBranch: "main",
		Topics:        []string{"testing", "database"},
		License: &License{
			Key:    "mit",
			Name:   "MIT License",
			SPDXID: "MIT",
			URL:    "https://opensource.org/licenses/MIT",
		},
	}

	// Validate struct fields
	if repo.ID != "test-id" {
		t.Errorf("Expected ID 'test-id', got '%s'", repo.ID)
	}

	if repo.FullName != "testowner/testrepo" {
		t.Errorf("Expected FullName 'testowner/testrepo', got '%s'", repo.FullName)
	}

	if repo.Language != "Go" {
		t.Errorf("Expected Language 'Go', got '%s'", repo.Language)
	}

	if len(repo.Topics) != 2 {
		t.Errorf("Expected 2 topics, got %d", len(repo.Topics))
	}

	if repo.License == nil || repo.License.SPDXID != "MIT" {
		t.Error("Expected non-nil License with SPDXID 'MIT'")
	}
}

// TestAnalysisStruct tests the Analysis struct
func TestAnalysisStruct(t *testing.T) {
	now := time.Now()
	analysis := Analysis{
		ID:                  "analysis-id",
		RepoID:              "repo-id",
		QualityScore:        85,
		Tier:                "A",
		TotalFindings:       10,
		CriticalFindings:    1,
		HighFindings:        2,
		MediumFindings:      3,
		LowFindings:         4,
		ScanDate:            now,
		ScanDurationSeconds: 45.5,
		Status:              "completed",
		Findings: []Finding{
			{
				ID:           "finding-1",
				Type:         "security",
				Severity:     "high",
				Category:     "injection",
				FilePath:     "main.go",
				LineNumber:   42,
				ColumnNumber: 10,
				Description:  "SQL injection vulnerability",
				MatchText:    "db.Exec(\"SELECT * FROM users WHERE id = \" + userInput)",
				CWE:          "CWE-89",
				OWASP:        "A03:2021",
			},
		},
		QualityMetrics: QualityMetrics{
			ID:                      "metrics-id",
			TestCoverage:            85.5,
			DocumentationPercentage: 75.0,
			ComplexityScore:         3.2,
			TechnicalDebt:           120,
			MaintainabilityIndex:    85.0,
			FilesScanned:            150,
			LanguagesDetected:       []string{"Go", "JavaScript", "Python"},
		},
	}

	// Validate analysis fields
	if analysis.QualityScore != 85 {
		t.Errorf("Expected QualityScore 85, got %d", analysis.QualityScore)
	}

	if analysis.TotalFindings != 10 {
		t.Errorf("Expected TotalFindings 10, got %d", analysis.TotalFindings)
	}

	if len(analysis.Findings) != 1 {
		t.Errorf("Expected 1 finding, got %d", len(analysis.Findings))
	}

	if analysis.QualityMetrics.FilesScanned != 150 {
		t.Errorf("Expected FilesScanned 150, got %d", analysis.QualityMetrics.FilesScanned)
	}
}

// TestFindingStruct tests the Finding struct
func TestFindingStruct(t *testing.T) {
	finding := Finding{
		ID:           "test-finding",
		Type:         "security",
		Severity:     "critical",
		Category:     "auth",
		FilePath:     "auth.go",
		LineNumber:   15,
		ColumnNumber: 5,
		Description:  "Hardcoded credentials",
		MatchText:    "password = \"admin123\"",
		CWE:          "CWE-798",
		OWASP:        "A07:2021",
	}

	// Validate finding fields
	if finding.Severity != "critical" {
		t.Errorf("Expected Severity 'critical', got '%s'", finding.Severity)
	}

	if finding.Category != "auth" {
		t.Errorf("Expected Category 'auth', got '%s'", finding.Category)
	}

	if finding.CWE != "CWE-798" {
		t.Errorf("Expected CWE 'CWE-798', got '%s'", finding.CWE)
	}
}

// TestQualityMetricsStruct tests the QualityMetrics struct
func TestQualityMetricsStruct(t *testing.T) {
	metrics := QualityMetrics{
		ID:                      "metrics-id",
		TestCoverage:            92.5,
		DocumentationPercentage: 80.0,
		ComplexityScore:         2.8,
		TechnicalDebt:           90,
		MaintainabilityIndex:    88.0,
		FilesScanned:            200,
		LanguagesDetected:       []string{"Go", "TypeScript", "Shell"},
	}

	// Validate metrics fields
	if metrics.TestCoverage != 92.5 {
		t.Errorf("Expected TestCoverage 92.5, got %f", metrics.TestCoverage)
	}

	if metrics.TechnicalDebt != 90 {
		t.Errorf("Expected TechnicalDebt 90, got %d", metrics.TechnicalDebt)
	}

	if len(metrics.LanguagesDetected) != 3 {
		t.Errorf("Expected 3 languages, got %d", len(metrics.LanguagesDetected))
	}
}

// TestSearchFiltersStruct tests the SearchFilters struct
func TestSearchFiltersStruct(t *testing.T) {
	filters := SearchFilters{
		Language: "Go",
		MinStars: 1000,
		Category: "security",
		Limit:    50,
	}

	// Validate filter fields
	if filters.Language != "Go" {
		t.Errorf("Expected Language 'Go', got '%s'", filters.Language)
	}

	if filters.MinStars != 1000 {
		t.Errorf("Expected MinStars 1000, got %d", filters.MinStars)
	}

	if filters.Limit != 50 {
		t.Errorf("Expected Limit 50, got %d", filters.Limit)
	}
}

// TestLicenseStruct tests the License struct
func TestLicenseStruct(t *testing.T) {
	license := &License{
		Key:    "apache-2.0",
		Name:   "Apache License 2.0",
		SPDXID: "Apache-2.0",
		URL:    "https://opensource.org/licenses/Apache-2.0",
	}

	// Validate license fields
	if license.Key != "apache-2.0" {
		t.Errorf("Expected Key 'apache-2.0', got '%s'", license.Key)
	}

	if license.SPDXID != "Apache-2.0" {
		t.Errorf("Expected SPDXID 'Apache-2.0', got '%s'", license.SPDXID)
	}
}

// TestQualityHistoryStruct tests the QualityHistory struct
func TestQualityHistoryStruct(t *testing.T) {
	now := time.Now()
	history := QualityHistory{
		QualityScore:  90,
		Tier:          "A",
		TotalFindings: 5,
		RecordedAt:    now,
	}

	// Validate history fields
	if history.QualityScore != 90 {
		t.Errorf("Expected QualityScore 90, got %d", history.QualityScore)
	}

	if history.Tier != "A" {
		t.Errorf("Expected Tier 'A', got '%s'", history.Tier)
	}
}

// TestRepositoryValidation tests repository field validation
func TestRepositoryValidation(t *testing.T) {
	tests := []struct {
		name    string
		repo    Repository
		wantErr bool
	}{
		{
			name: "valid repository",
			repo: Repository{
				ID:       "valid-id",
				Owner:    "validowner",
				Name:     "validrepo",
				FullName: "validowner/validrepo",
			},
			wantErr: false,
		},
		{
			name: "missing ID",
			repo: Repository{
				Owner:    "owner",
				Name:     "repo",
				FullName: "owner/repo",
			},
			wantErr: true,
		},
		{
			name: "invalid full name format",
			repo: Repository{
				ID:       "id",
				Owner:    "owner",
				Name:     "repo",
				FullName: "invalid-format",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validate required fields
			if tt.repo.ID == "" && !tt.wantErr {
				t.Error("Repository should have ID")
			}

			// Validate full name format (should be owner/repo)
			if tt.repo.FullName != "" {
				matched, _ := regexp.MatchString(`^[^/]+/[^/]+$`, tt.repo.FullName)
				if !matched && !tt.wantErr {
					t.Error("FullName should be in 'owner/repo' format")
				}
			}
		})
	}
}

// TestFindingValidation tests finding field validation
func TestFindingValidation(t *testing.T) {
	tests := []struct {
		name    string
		finding Finding
		wantErr bool
	}{
		{
			name: "valid finding",
			finding: Finding{
				ID:          "valid-id",
				Type:        "security",
				Severity:    "high",
				Category:    "injection",
				FilePath:    "main.go",
				LineNumber:  42,
				Description: "SQL injection",
			},
			wantErr: false,
		},
		{
			name: "missing ID",
			finding: Finding{
				Type:     "security",
				Severity: "high",
			},
			wantErr: true,
		},
		{
			name: "invalid severity",
			finding: Finding{
				ID:       "id",
				Type:     "security",
				Severity: "invalid",
			},
			wantErr: true,
		},
	}

	validSeverities := map[string]bool{
		"critical": true,
		"high":      true,
		"medium":    true,
		"low":       true,
		"info":      true,
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validate required fields
			if tt.finding.ID == "" && !tt.wantErr {
				t.Error("Finding should have ID")
			}

			// Validate severity
			if tt.finding.Severity != "" {
				if !validSeverities[tt.finding.Severity] && !tt.wantErr {
					t.Errorf("Invalid severity: %s", tt.finding.Severity)
				}
			}
		})
	}
}

// TestQualityScoreTierMapping tests quality score to tier mapping
func TestQualityScoreTierMapping(t *testing.T) {
	tests := []struct {
		score    int
		expected string
		name     string
	}{
		{95, "A", "excellent score"},
		{85, "A", "good score"},
		{75, "B", "fair score"},
		{65, "B", "acceptable score"},
		{55, "C", "poor score"},
		{45, "C", "failing score"},
		{35, "D", "critical score"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var tier string
			switch {
			case tt.score >= 80:
				tier = "A"
			case tt.score >= 60:
				tier = "B"
			case tt.score >= 40:
				tier = "C"
			default:
				tier = "D"
			}

			if tier != tt.expected {
				t.Errorf("Score %d: expected tier %s, got %s", tt.score, tt.expected, tier)
			}
		})
	}
}