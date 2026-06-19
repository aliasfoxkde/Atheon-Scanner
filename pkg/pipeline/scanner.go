package pipeline

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// ScannerPipeline represents the automated scanning pipeline
type ScannerPipeline struct {
	scanner        *Scanner
	patternEngine  *PatternSuggestionEngine
	atheonClient   *AtheonClient
	benchmarkClient *BenchmarkClient
	database       *Database
	config         *PipelineConfig
}

// PipelineConfig defines the pipeline configuration
type PipelineConfig struct {
	// Scanning schedule
	DailyRunTime   string   // Time to run daily scans (e.g., "03:00")
	ScanInterval   time.Duration // How often to scan the same repo
	MaxConcurrent  int      // Max concurrent scans

	// Trending discovery
	TrendingLanguages []string // Languages to monitor for trending repos
	TrendingSince      string   // Time period for trending (daily, weekly, monthly)
	TrendingLimit      int      // Max trending repos to discover

	// Pattern suggestions
	PatternSuggestionThreshold float64 // Confidence threshold for suggesting new patterns
	AutoCreatePR              bool     // Whether to automatically create PRs to Atheon

	// Benchmark integration
	RunBenchmarks       bool     // Whether to run benchmarks on new patterns
	BenchmarkThreshold  float64  // Performance threshold for patterns

	// Repository management
	IncludeUserSubmitted bool     // Include user-submitted repositories
	AutoAddTrending      bool     // Automatically add trending repos
}

// PipelineResult represents the result of a pipeline run
type PipelineResult struct {
	RunID           string                   `json:"run_id"`
	RunTime         time.Time                `json:"run_time"`
	RepositoriesScanned int                  `json:"repositories_scanned"`
	NewFindings     int                      `json:"new_findings"`
	UpdatedReports  int                      `json:"updated_reports"`
	PatternSuggestions []*PatternSuggestion `json:"pattern_suggestions"`
	TrendingDiscovered []string             `json:"trending_discovered"`
	BenchmarksRun   int                      `json:"benchmarks_run"`
	Duration        time.Duration            `json:"duration"`
	Success         bool                     `json:"success"`
	Error           string                   `json:"error,omitempty"`
}

// NewScannerPipeline creates a new scanner pipeline
func NewScannerPipeline(config *PipelineConfig) (*ScannerPipeline, error) {
	pipeline := &ScannerPipeline{
		config: config,
	}

	// Initialize components
	var err error
	pipeline.scanner, err = NewScanner()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize scanner: %w", err)
	}

	pipeline.patternEngine = NewPatternSuggestionEngine(config.PatternSuggestionThreshold)
	pipeline.atheonClient = NewAtheonClient()
	pipeline.benchmarkClient = NewBenchmarkClient()

	return pipeline, nil
}

// Run executes the automated pipeline
func (p *ScannerPipeline) Run(ctx context.Context) (*PipelineResult, error) {
	result := &PipelineResult{
		RunID:   generateRunID(),
		RunTime: time.Now(),
	}

	startTime := time.Now()
	log.Printf("Starting pipeline run %s", result.RunID)

	defer func() {
		result.Duration = time.Since(startTime)
	}()

	// Step 1: Discover trending repositories
	trendingRepos, err := p.discoverTrendingRepositories(ctx)
	if err != nil {
		log.Printf("Error discovering trending repos: %v", err)
	} else {
		result.TrendingDiscovered = trendingRepos
		log.Printf("Discovered %d trending repositories", len(trendingRepos))
	}

	// Step 2: Scan repositories scheduled for today
	scheduledRepos, err := p.getScheduledRepositories(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled repositories: %w", err)
	}

	log.Printf("Scanning %d scheduled repositories", len(scheduledRepos))
	scanResults := make([]*ScanResult, 0)

	for _, repo := range scheduledRepos {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
			scanResult, err := p.scanRepository(ctx, repo)
			if err != nil {
				log.Printf("Error scanning %s: %v", repo.FullName, err)
				continue
			}
			scanResults = append(scanResults, scanResult)
			result.RepositoriesScanned++
		}
	}

	// Step 3: Store and analyze results
	for _, scanResult := range scanResults {
		// Store in database
		err := p.database.StoreAnalysis(scanResult)
		if err != nil {
			log.Printf("Error storing analysis: %v", err)
			continue
		}
		result.UpdatedReports++
		result.NewFindings += len(scanResult.Findings)

		// Extract pattern suggestions
		patternSuggestions := p.patternEngine.ExtractPatterns(scanResult)
		if len(patternSuggestions) > 0 {
			result.PatternSuggestions = append(result.PatternSuggestions, patternSuggestions...)
		}
	}

	// Step 4: Generate PRs for pattern suggestions
	if p.config.AutoCreatePR && len(result.PatternSuggestions) > 0 {
		err := p.createAtheonPullRequests(ctx, result.PatternSuggestions)
		if err != nil {
			log.Printf("Error creating PRs: %v", err)
		}
	}

	// Step 5: Run benchmarks on new patterns
	if p.config.RunBenchmarks && len(result.PatternSuggestions) > 0 {
		benchmarkResults, err := p.runPatternBenchmarks(ctx, result.PatternSuggestions)
		if err != nil {
			log.Printf("Error running benchmarks: %v", err)
		} else {
			result.BenchmarksRun = len(benchmarkResults)
		}
	}

	// Step 6: Update trending repos in database
	if p.config.AutoAddTrending && len(trendingRepos) > 0 {
		err := p.addTrendingRepositories(ctx, trendingRepos)
		if err != nil {
			log.Printf("Error adding trending repos: %v", err)
		}
	}

	result.Success = true
	log.Printf("Pipeline run %s completed successfully in %v", result.RunID, result.Duration)

	return result, nil
}

// discoverTrendingRepositories finds trending repositories
func (p *ScannerPipeline) discoverTrendingRepositories(ctx context.Context) ([]string, error) {
	var trendingRepos []string

	for _, language := range p.config.TrendingLanguages {
		repos, err := p.scanner.GetTrendingRepositories(ctx, language, p.config.TrendingSince, p.config.TrendingLimit)
		if err != nil {
			log.Printf("Error getting trending %s repos: %v", language, err)
			continue
		}

		for _, repo := range repos {
			trendingRepos = append(trendingRepos, repo.FullName)
		}
	}

	return trendingRepos, nil
}

// getScheduledRepositories gets repositories scheduled for scanning
func (p *ScannerPipeline) getScheduledRepositories(ctx context.Context) ([]*Repository, error) {
	// Get repositories that need scanning
	repos, err := p.database.GetRepositoriesForScanning(p.config.ScanInterval)
	if err != nil {
		return nil, err
	}

	// Add user-submitted repos if enabled
	if p.config.IncludeUserSubmitted {
		userRepos, err := p.database.GetUserSubmittedRepositories()
		if err != nil {
			log.Printf("Error getting user submitted repos: %v", err)
		} else {
			repos = append(repos, userRepos...)
		}
	}

	return repos, nil
}

// scanRepository scans a single repository
func (p *ScannerPipeline) scanRepository(ctx context.Context, repo *Repository) (*ScanResult, error) {
	return p.scanner.ScanRepository(ctx, repo.Owner, repo.Name)
}

// createAtheonPullRequests creates PRs for pattern suggestions
func (p *ScannerPipeline) createAtheonPullRequests(ctx context.Context, suggestions []*PatternSuggestion) error {
	for _, suggestion := range suggestions {
		err := p.atheonClient.CreatePatternPR(ctx, suggestion)
		if err != nil {
			log.Printf("Error creating PR for pattern %s: %v", suggestion.Name, err)
			continue
		}
		log.Printf("Created PR for pattern: %s", suggestion.Name)
	}

	return nil
}

// runPatternBenchmarks runs benchmarks on new patterns
func (p *ScannerPipeline) runPatternBenchmarks(ctx context.Context, suggestions []*PatternSuggestion) ([]*BenchmarkResult, error) {
	var results []*BenchmarkResult

	for _, suggestion := range suggestions {
		benchmarkResult, err := p.benchmarkClient.RunBenchmark(ctx, suggestion.Pattern)
		if err != nil {
			log.Printf("Error benchmarking pattern %s: %v", suggestion.Name, err)
			continue
		}
		results = append(results, benchmarkResult)

		// Only suggest patterns that meet performance threshold
		if benchmarkResult.Score < p.config.BenchmarkThreshold {
			log.Printf("Pattern %s failed benchmark: %.2f < %.2f",
				suggestion.Name, benchmarkResult.Score, p.config.BenchmarkThreshold)
		}
	}

	return results, nil
}

// addTrendingRepositories adds trending repositories to the database
func (p *ScannerPipeline) addTrendingRepositories(ctx context.Context, repoNames []string) error {
	for _, repoName := range repoNames {
		// Parse owner/repo
		owner, repo, err := parseRepoFullName(repoName)
		if err != nil {
			log.Printf("Error parsing repo name %s: %v", repoName, err)
			continue
		}

		// Get repo details
		repo, err := p.scanner.githubClient.GetRepository(ctx, owner, repo)
		if err != nil {
			log.Printf("Error getting repo details for %s: %v", repoName, err)
			continue
		}

		// Add to database
		err = p.database.AddRepository(repo)
		if err != nil {
			log.Printf("Error adding repo to database: %v", err)
			continue
		}

		log.Printf("Added trending repository: %s", repoName)
	}

	return nil
}

// StartScheduler starts the automated pipeline scheduler
func (p *ScannerPipeline) StartScheduler(ctx context.Context) error {
	ticker := time.NewTicker(24 * time.Hour) // Run daily
	defer ticker.Stop()

	// Run immediately on start
	go func() {
		result, err := p.Run(ctx)
		if err != nil {
			log.Printf("Error running pipeline: %v", err)
		} else {
			p.database.StorePipelineRun(result)
		}
	}()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			go func() {
				result, err := p.Run(ctx)
				if err != nil {
					log.Printf("Error running pipeline: %v", err)
				} else {
					p.database.StorePipelineRun(result)
				}
			}()
		}
	}
}

func generateRunID() string {
	return fmt.Sprintf("run_%d", time.Now().Unix())
}

func parseRepoFullName(fullName string) (owner, repo string, err error) {
	parts := strings.Split(fullName, "/")
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid repo format: %s", fullName)
	}
	return parts[0], parts[1], nil
}