package github

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	githubAPIBase      = "https://api.github.com"
	trendingURL        = "https://github.com/trending"
	rateLimitReset     = "X-RateLimit-Reset"
	rateLimitRemaining = "X-RateLimit-Remaining"
)

// Client represents a GitHub API client
type Client struct {
	httpClient *http.Client
	token      string
	rateLimit  *RateLimit
}

// RateLimit represents GitHub API rate limit information
type RateLimit struct {
	Remaining int
	Reset     time.Time
}

// Repository represents GitHub repository information
type Repository struct {
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	FullName      string    `json:"full_name"`
	Owner         Owner     `json:"owner"`
	Description   string    `json:"description"`
	Language      string    `json:"language"`
	Stars         int       `json:"stargazers_count"`
	Forks         int       `json:"forks_count"`
	OpenIssues    int       `json:"open_issues_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	PushedAt      time.Time `json:"pushed_at"`
	Size          int       `json:"size"`
	Topics        []string  `json:"topics"`
	License       *License  `json:"license"`
	CloneURL      string    `json:"clone_url"`
	DefaultBranch string    `json:"default_branch"`
}

// Owner represents repository owner information
type Owner struct {
	Login     string `json:"login"`
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	SiteAdmin bool   `json:"site_admin"`
}

// License represents repository license information
type License struct {
	Key    string `json:"key"`
	Name   string `json:"name"`
	SPDXID string `json:"spdx_id"`
	URL    string `json:"html_url"`
}

// NewClient creates a new GitHub API client
func NewClient(token string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:       10,
				IdleConnTimeout:    30 * time.Second,
				DisableCompression: false,
			},
		},
		token:     token,
		rateLimit: &RateLimit{},
	}
}

// GetRepository fetches a repository by owner/name
func (c *Client) GetRepository(ctx context.Context, owner, name string) (*Repository, error) {
	url := fmt.Sprintf("%s/repos/%s/%s", githubAPIBase, owner, name)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if c.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	c.updateRateLimit(resp)

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitHub API returned status %d: %s", resp.StatusCode, string(body))
	}

	var repo Repository
	if err := json.NewDecoder(resp.Body).Decode(&repo); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &repo, nil
}

// SearchRepositories searches for repositories matching the query
func (c *Client) SearchRepositories(ctx context.Context, query string, sort string, order string, perPage int, page int) ([]*Repository, error) {
	url := fmt.Sprintf("%s/search/repositories?q=%s&sort=%s&order=%s&per_page=%d&page=%d",
		githubAPIBase, query, sort, order, perPage, page)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if c.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	c.updateRateLimit(resp)

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("GitHub API returned status %d: %s", resp.StatusCode, string(body))
	}

	var searchResult struct {
		Items []*Repository `json:"items"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&searchResult); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return searchResult.Items, nil
}

// GetTrendingRepositories fetches trending repositories by language and time period
// Note: GitHub doesn't provide an official API for trending, so we'll need to use web scraping or search API
func (c *Client) GetTrendingRepositories(ctx context.Context, language string, since string, limit int) ([]*Repository, error) {
	// Since GitHub doesn't have an official trending API, we'll use search with sorting by stars
	// and date filtering as a proxy for trending
	query := "stars:>0"
	if language != "" && language != "all" {
		query = fmt.Sprintf("language:%s stars:>0", language)
	}

	// Add date filter for trending approximation
	if since == "daily" {
		query += fmt.Sprintf(" pushed:>%s", time.Now().AddDate(0, 0, -1).Format("2006-01-02"))
	} else if since == "weekly" {
		query += fmt.Sprintf(" pushed:>%s", time.Now().AddDate(0, 0, -7).Format("2006-01-02"))
	} else if since == "monthly" {
		query += fmt.Sprintf(" pushed:>%s", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
	}

	repos, err := c.SearchRepositories(ctx, query, "stars", "desc", limit, 1)
	if err != nil {
		return nil, err
	}

	return repos, nil
}

// GetRepositoriesByStarCount fetches repositories with minimum star count
func (c *Client) GetRepositoriesByStarCount(ctx context.Context, minStars int, language string, limit int) ([]*Repository, error) {
	query := fmt.Sprintf("stars:>=%d", minStars)
	if language != "" {
		query = fmt.Sprintf("stars:>=%d language:%s", minStars, language)
	}

	repos, err := c.SearchRepositories(ctx, query, "stars", "desc", limit, 1)
	if err != nil {
		return nil, err
	}

	return repos, nil
}

// GetRateLimit returns current rate limit information
func (c *Client) GetRateLimit() *RateLimit {
	return c.rateLimit
}

// GetToken returns the GitHub token (for secure git operations via environment)
func (c *Client) GetToken() string {
	return c.token
}

func (c *Client) updateRateLimit(resp *http.Response) {
	if remaining := resp.Header.Get(rateLimitRemaining); remaining != "" {
		fmt.Sscanf(remaining, "%d", &c.rateLimit.Remaining)
	}

	if reset := resp.Header.Get(rateLimitReset); reset != "" {
		var timestamp int64
		fmt.Sscanf(reset, "%d", &timestamp)
		c.rateLimit.Reset = time.Unix(timestamp, 0)
	}
}

// CloneURL returns the clone URL (without embedding token for security)
// For authenticated clones, use CloneWithToken context instead
func (c *Client) CloneURL(repo *Repository) string {
	return repo.CloneURL
}
