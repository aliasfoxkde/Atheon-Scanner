package pipeline

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"
)

// PatternSuggestionEngine extracts new security patterns from scan findings
type PatternSuggestionEngine struct {
	threshold     float64
	extractedPatterns map[string]*PatternSuggestion
}

// PatternSuggestion represents a suggested new security pattern
type PatternSuggestion struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Category        string                 `json:"category"`
	Severity        string                 `json:"severity"`
	Pattern         string                 `json:"pattern"`
	Description     string                 `json:"description"`
	Examples        []string               `json:"examples"`
	CWE             string                 `json:"cwe,omitempty"`
	OWASP           string                 `json:"owasp,omitempty"`
	Confidence      float64                `json:"confidence"`
	SourceFinding   *Finding               `json:"source_finding"`
	Metadata        map[string]interface{} `json:"metadata"`
	CreatedAt       time.Time              `json:"created_at"`
	ValidationStatus string                `json:"validation_status"` // pending, validated, rejected
}

// NewPatternSuggestionEngine creates a new pattern suggestion engine
func NewPatternSuggestionEngine(threshold float64) *PatternSuggestionEngine {
	return &PatternSuggestionEngine{
		threshold:        threshold,
		extractedPatterns: make(map[string]*PatternSuggestion),
	}
}

// ExtractPatterns extracts potential new patterns from scan results
func (e *PatternSuggestionEngine) ExtractPatterns(scanResult *ScanResult) []*PatternSuggestion {
	var suggestions []*PatternSuggestion

	for _, finding := range scanResult.Findings {
		// Skip if finding severity is too low
		if finding.Severity != "critical" && finding.Severity != "high" {
			continue
		}

		// Extract potential patterns from findings
		patternSuggestion := e.analyzeFinding(finding)
		if patternSuggestion != nil && patternSuggestion.Confidence >= e.threshold {
			suggestions = append(suggestions, patternSuggestion)
		}
	}

	return suggestions
}

// analyzeFinding analyzes a single finding to extract pattern suggestions
func (e *PatternSuggestionEngine) analyzeFinding(finding *Finding) *PatternSuggestion {
	// Generate pattern ID
	patternID := fmt.Sprintf("pattern_%d_%s", time.Now().Unix(), sanitizeString(finding.Description))

	suggestion := &PatternSuggestion{
		ID:            patternID,
		Name:          generatePatternName(finding),
		Category:      finding.Category,
		Severity:      finding.Severity,
		Description:   finding.Description,
		Examples:      []string{finding.Match},
		SourceFinding: finding,
		Metadata:      make(map[string]interface{}),
		CreatedAt:     time.Now(),
		ValidationStatus: "pending",
	}

	// Analyze the match to extract pattern
	pattern := e.extractPatternFromMatch(finding.Match, finding.File)
	if pattern == "" {
		return nil
	}

	suggestion.Pattern = pattern

	// Calculate confidence based on multiple factors
	suggestion.Confidence = e.calculateConfidence(finding, pattern)

	// Extract CWE/OWASP if possible
	e.enrichWithSecurityStandards(suggestion, finding)

	// Add metadata
	suggestion.Metadata["source_file"] = finding.File
	suggestion.Metadata["source_line"] = finding.Line
	suggestion.Metadata["language"] = detectLanguage(finding.File)
	suggestion.Metadata["occurrence_count"] = 1

	return suggestion
}

// extractPatternFromMatch extracts a regex pattern from a code match
func (e *PatternSuggestionEngine) extractPatternFromMatch(match, filename string) string {
	// Try to extract patterns based on common security issues

	// API Keys/Secrets patterns
	if looksLikeAPIKey(match) {
		return generateAPIKeyPattern(match)
	}

	// SQL Injection patterns
	if looksLikeSQLInjection(match) {
		return generateSQLInjectionPattern(match)
	}

	// XSS patterns
	if looksLikeXSS(match) {
		return generateXSSPattern(match)
	}

	// Hardcoded credentials
	if looksLikeHardcodedCredential(match) {
		return generateCredentialPattern(match)
	}

	// Generic pattern extraction
	return generateGenericPattern(match)
}

// calculateConfidence calculates confidence score for a pattern suggestion
func (e *PatternSuggestionEngine) calculateConfidence(finding *Finding, pattern string) float64 {
	confidence := 0.5

	// Increase confidence if pattern is specific
	if len(pattern) > 10 {
		confidence += 0.1
	}

	// Increase confidence if finding is critical severity
	if finding.Severity == "critical" {
		confidence += 0.2
	}

	// Increase confidence if pattern appears multiple times
	if e.isRecurringPattern(pattern) {
		confidence += 0.15
	}

	// Increase confidence if pattern is well-formed
	if isWellFormedPattern(pattern) {
		confidence += 0.05
	}

	// Cap at 1.0
	if confidence > 1.0 {
		confidence = 1.0
	}

	return confidence
}

// enrichWithSecurityStandards adds CWE and OWASP references
func (e *PatternSuggestionEngine) enrichWithSecurityStandards(suggestion *PatternSuggestion, finding *Finding) {
	// Map common patterns to CWE identifiers
	cweMap := map[string]string{
		"api_key":         "CWE-798", // Use of Hard-coded Credentials
		"sql_injection":   "CWE-89",  // SQL Injection
		"xss":             "CWE-79",  // Cross-site Scripting
		"command_injection": "CWE-77", // Command Injection
		"path_traversal":   "CWE-22", // Path Traversal
		"ssrf":            "CWE-918", // Server-Side Request Forgery
	}

	// Map to OWASP categories
	owaspMap := map[string]string{
		"api_key":         "A07:2021 - Identification and Authentication Failures",
		"sql_injection":   "A03:2021 - Injection",
		"xss":             "A03:2021 - Injection",
		"command_injection": "A03:2021 - Injection",
		"path_traversal":   "A01:2021 - Broken Access Control",
		"ssrf":            "A05:2021 - Security Misconfiguration",
	}

	// Find matching CWE/OWASP based on pattern keywords
	for keyword, cwe := range cweMap {
		if strings.Contains(strings.ToLower(suggestion.Pattern), keyword) ||
		   strings.Contains(strings.ToLower(suggestion.Description), keyword) {
			suggestion.CWE = cwe
			suggestion.OWASP = owaspMap[keyword]
			break
		}
	}
}

// isRecurringPattern checks if this pattern has been seen before
func (e *PatternSuggestionEngine) isRecurringPattern(pattern string) bool {
	// Check if similar pattern already exists
	for _, existing := range e.extractedPatterns {
		if patternSimilarity(pattern, existing.Pattern) > 0.8 {
			return true
		}
	}
	return false
}

// AtheonClient handles interaction with the Atheon repository
type AtheonClient struct {
	baseURL    string
	authToken  string
}

// NewAtheonClient creates a new Atheon client
func NewAtheonClient() *AtheonClient {
	return &AtheonClient{
		baseURL: "https://api.github.com/repos/HoraDomu/Atheon",
	}
}

// CreatePatternPR creates a pull request for a new pattern
func (c *AtheonClient) CreatePatternPR(ctx context.Context, suggestion *PatternSuggestion) error {
	// Generate pattern file content
	patternContent := c.generatePatternFile(suggestion)

	// Create feature branch
	branchName := fmt.Sprintf("pattern-%s", suggestion.ID)

	// Create PR with pattern suggestion
	prData := map[string]interface{}{
		"title": fmt.Sprintf("[Pattern Suggestion] %s", suggestion.Name),
		"body":  c.generatePRDescription(suggestion),
		"head":  branchName,
		"base":  "main",
	}

	// This would make actual GitHub API calls
	log.Printf("Creating PR for pattern %s: %s", suggestion.Name, prData["title"])

	// Store suggestion for tracking
	suggestion.ValidationStatus = "submitted"

	return nil
}

// generatePatternFile generates the pattern file content for Atheon
func (c *AtheonClient) generatePatternFile(suggestion *PatternSuggestion) string {
	return fmt.Sprintf(`{
  "id": "%s",
  "name": "%s",
  "category": "%s",
  "severity": "%s",
  "pattern": "%s",
  "description": "%s",
  "examples": [%s],
  "cwe": "%s",
  "owasp": "%s",
  "confidence": %.2f,
  "metadata": {
    "source": "Atheon-GitHub-Scanner",
    "generated_at": "%s",
    "validation_status": "%s"
  }
}`,
		suggestion.ID,
		suggestion.Name,
		suggestion.Category,
		suggestion.Severity,
		suggestion.Pattern,
		suggestion.Description,
		joinStrings(suggestion.Examples, ", "),
		suggestion.CWE,
		suggestion.OWASP,
		suggestion.Confidence,
		suggestion.CreatedAt.Format(time.RFC3339),
		suggestion.ValidationStatus,
	)
}

// generatePRDescription generates the PR description
func (c *AtheonClient) generatePRDescription(suggestion *PatternSuggestion) string {
	return fmt.Sprintf(`## Pattern Suggestion: %s

**Confidence:** %.2f/1.00
**Category:** %s
**Severity:** %s

### Description
%s

### Pattern
\`\`\`regex
%s
\`\`\`

### Examples
%s

### Security Standards
- **CWE:** %s
- **OWASP:** %s

### Source
This pattern was automatically extracted from scan findings in %s:%d

### Validation Status: %s

### Metadata
- Generated by: Atheon-GitHub-Scanner
- Created at: %s
- Language: %s

### Next Steps
1. Review the pattern for accuracy
2. Test against known vulnerabilities
3. Validate performance and false positive rate
4. Add to appropriate pattern category
`,
		suggestion.Name,
		suggestion.Confidence,
		suggestion.Category,
		suggestion.Severity,
		suggestion.Description,
		suggestion.Pattern,
		joinStrings(suggestion.Examples, "\n"),
		suggestion.CWE,
		suggestion.OWASP,
		suggestion.SourceFinding.File,
		suggestion.SourceFinding.Line,
		suggestion.ValidationStatus,
		suggestion.CreatedAt.Format(time.RFC3339),
		suggestion.Metadata["language"],
	)
}

// Helper functions

func sanitizeString(s string) string {
	reg := regexp.MustCompile("[^a-zA-Z0-9_-]")
	return reg.ReplaceAllString(s, "_")
}

func generatePatternName(finding *Finding) string {
	return fmt.Sprintf("%s_%s", finding.Category, sanitizeString(finding.Description))
}

func looksLikeAPIKey(match string) bool {
	// Check for API key patterns
	return regexp.MustCompile(`(?i)(api[_-]?key|secret|token)\s*[:=]\s*['"]?[\w-]{16,}`).MatchString(match)
}

func looksLikeSQLInjection(match string) bool {
	return strings.Contains(strings.ToLower(match), "select") &&
	   (strings.Contains(strings.ToLower(match), "where") ||
	    strings.Contains(strings.ToLower(match), "union"))
}

func looksLikeXSS(match string) bool {
	return strings.Contains(strings.ToLower(match), "<script") ||
	   strings.Contains(strings.ToLower(match), "javascript:")
}

func looksLikeHardcodedCredential(match string) bool {
	return regexp.MustCompile(`(?i)(password|pass|pwd)\s*[:=]\s*['"]?\w+['"]?`).MatchString(match)
}

func generateAPIKeyPattern(match string) string {
	return `(?i)(api[_-]?key|secret|token)\s*[:=]\s*['"]?[\w-]{16,}['"]?`
}

func generateSQLInjectionPattern(match string) string {
	return `(?i)\b(SELECT|INSERT|UPDATE|DELETE)\b.*\b(WHERE|UNION)\b`
}

func generateXSSPattern(match string) string {
	return `(?i)<script[^>]*>.*javascript:|`
}

func generateCredentialPattern(match string) string {
	return `(?i)(password|pass|pwd)\s*[:=]\s*['"]?\w+['"]?`
}

func generateGenericPattern(match string) string {
	// Escape regex special characters and return as literal match
	reg := regexp.MustCompile(`([.*+?^${}()|[\]\\])`)
	return reg.ReplaceAllString(match, `\$1`)
}

func isWellFormedPattern(pattern string) bool {
	// Validate that pattern is valid regex
	_, err := regexp.Compile(pattern)
	return err == nil
}

func patternSimilarity(p1, p2 string) float64 {
	// Simple similarity check based on common substrings
	if p1 == p2 {
		return 1.0
	}

	words1 := strings.Fields(p1)
	words2 := strings.Fields(p2)

	commonWords := 0
	for _, w1 := range words1 {
		for _, w2 := range words2 {
			if w1 == w2 {
				commonWords++
				break
			}
		}
	}

	totalWords := len(words1) + len(words2)
	if totalWords == 0 {
		return 0.0
	}

	return float64(2*commonWords) / float64(totalWords)
}

func detectLanguage(filename string) string {
	ext := strings.ToLower(filename[strings.LastIndex(filename, "."):])
	langMap := map[string]string{
		".js":   "javascript",
		".ts":   "typescript",
		".py":   "python",
		".go":   "go",
		".java": "java",
		".rb":   "ruby",
		".php":  "php",
		".cs":   "csharp",
		".cpp":  "cpp",
		".c":    "c",
		".rs":   "rust",
	}

	if lang, ok := langMap[ext]; ok {
		return lang
	}
	return "unknown"
}

func joinStrings(strs []string, sep string) string {
	quoted := make([]string, len(strs))
	for i, s := range strs {
		quoted[i] = fmt.Sprintf(`"%s"`, s)
	}
	return strings.Join(quoted, sep)
}