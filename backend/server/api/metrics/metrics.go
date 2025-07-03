/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package metrics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/apache/incubator-devlake/server/api/shared"
)

// MetricPoint represents a single metric data point
type MetricPoint struct {
	Timestamp time.Time   `json:"timestamp"`
	Value     interface{} `json:"value"`
}

// MetricSeries represents a time series of metrics
type MetricSeries struct {
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Unit        string        `json:"unit"`
	Type        string        `json:"type"`
	Data        []MetricPoint `json:"data"`
	Labels      map[string]string `json:"labels,omitempty"`
}

// OverviewMetrics represents dashboard overview KPIs
type OverviewMetrics struct {
	Uptime struct {
		Value       float64 `json:"value"`
		Unit        string  `json:"unit"`
		Status      string  `json:"status"`
		LastUpdated time.Time `json:"last_updated"`
	} `json:"uptime"`
	
	ErrorRate struct {
		Value       float64 `json:"value"`
		Unit        string  `json:"unit"`
		Status      string  `json:"status"`
		LastUpdated time.Time `json:"last_updated"`
	} `json:"error_rate"`
	
	BuildSuccess struct {
		Value       float64 `json:"value"`
		Unit        string  `json:"unit"`
		Status      string  `json:"status"`
		LastUpdated time.Time `json:"last_updated"`
	} `json:"build_success"`
	
	DeploymentFrequency struct {
		Value       float64 `json:"value"`
		Unit        string  `json:"unit"`
		Status      string  `json:"status"`
		LastUpdated time.Time `json:"last_updated"`
	} `json:"deployment_frequency"`
}

// ToolMetrics represents tool-specific metrics
type ToolMetrics struct {
	Tool        string         `json:"tool"`
	Overview    map[string]interface{} `json:"overview"`
	TimeSeries  []MetricSeries `json:"time_series"`
	LastUpdated time.Time      `json:"last_updated"`
}

// AlertInfo represents alert information
type AlertInfo struct {
	ID          string                 `json:"id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Severity    string                 `json:"severity"`
	Status      string                 `json:"status"`
	Source      string                 `json:"source"`
	Labels      map[string]string      `json:"labels"`
	Metadata    map[string]interface{} `json:"metadata"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
	ResolvedAt  *time.Time             `json:"resolved_at,omitempty"`
}

// GetOverviewMetrics returns dashboard overview KPIs
func GetOverviewMetrics(c *gin.Context) {
	// Generate sample overview metrics
	// In a real implementation, this would fetch from Grafana/Prometheus
	overview := OverviewMetrics{}
	
	// Uptime
	overview.Uptime.Value = 99.95
	overview.Uptime.Unit = "percent"
	overview.Uptime.Status = "healthy"
	overview.Uptime.LastUpdated = time.Now()
	
	// Error Rate
	overview.ErrorRate.Value = 0.15
	overview.ErrorRate.Unit = "percent"
	overview.ErrorRate.Status = "healthy"
	overview.ErrorRate.LastUpdated = time.Now()
	
	// Build Success
	overview.BuildSuccess.Value = 98.5
	overview.BuildSuccess.Unit = "percent"
	overview.BuildSuccess.Status = "healthy"
	overview.BuildSuccess.LastUpdated = time.Now()
	
	// Deployment Frequency
	overview.DeploymentFrequency.Value = 12.5
	overview.DeploymentFrequency.Unit = "per day"
	overview.DeploymentFrequency.Status = "good"
	overview.DeploymentFrequency.LastUpdated = time.Now()
	
	shared.ApiOutputSuccess(c, overview, http.StatusOK)
}

// GetToolMetrics returns tool-specific metrics
func GetToolMetrics(c *gin.Context) {
	tool := c.Param("tool")
	
	// Generate sample tool metrics
	// In a real implementation, this would fetch from Grafana/Prometheus
	toolMetrics := ToolMetrics{
		Tool: tool,
		Overview: map[string]interface{}{
			"total_pipelines": 156,
			"success_rate":    94.2,
			"avg_duration":    "12m 34s",
			"last_run":        time.Now().Add(-15 * time.Minute),
		},
		TimeSeries: []MetricSeries{
			{
				Name:        "pipeline_success_rate",
				Description: "Pipeline success rate over time",
				Unit:        "percent",
				Type:        "gauge",
				Data:        generateSampleData(24, 90, 100),
			},
			{
				Name:        "pipeline_duration",
				Description: "Average pipeline duration",
				Unit:        "minutes",
				Type:        "gauge",
				Data:        generateSampleData(24, 8, 20),
			},
		},
		LastUpdated: time.Now(),
	}
	
	shared.ApiOutputSuccess(c, toolMetrics, http.StatusOK)
}

// GetAlerts returns alert history with filtering
func GetAlerts(c *gin.Context) {
	// Parse query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	severity := c.Query("severity")
	status := c.Query("status")
	source := c.Query("source")
	
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	
	// Generate sample alerts
	// In a real implementation, this would fetch from the database
	alerts := generateSampleAlerts(page, limit, severity, status, source)
	
	response := map[string]interface{}{
		"alerts": alerts,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": 150,
		},
	}
	
	shared.ApiOutputSuccess(c, response, http.StatusOK)
}

// ExportMetrics exports metrics data in the requested format
func ExportMetrics(c *gin.Context) {
	format := c.DefaultQuery("format", "json")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	metrics := c.QueryArray("metrics")
	
	// Parse date range if provided
	var start, end time.Time
	var err error
	
	if startDate != "" {
		start, err = time.Parse("2006-01-02", startDate)
		if err != nil {
			shared.ApiOutputError(c, err)
			return
		}
	} else {
		start = time.Now().AddDate(0, 0, -7) // Default to last 7 days
	}
	
	if endDate != "" {
		end, err = time.Parse("2006-01-02", endDate)
		if err != nil {
			shared.ApiOutputError(c, err)
			return
		}
	} else {
		end = time.Now()
	}
	
	// Generate export data
	exportData := map[string]interface{}{
		"metadata": map[string]interface{}{
			"generated_at": time.Now(),
			"date_range": map[string]interface{}{
				"start": start,
				"end":   end,
			},
			"metrics": metrics,
			"format":  format,
		},
		"data": generateExportData(start, end, metrics),
	}
	
	if format == "csv" {
		// TODO: Convert to CSV format
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment; filename=metrics_export.csv")
		// For now, return JSON
	}
	
	shared.ApiOutputSuccess(c, exportData, http.StatusOK)
}

// generateSampleData generates sample time series data
func generateSampleData(points int, min, max float64) []MetricPoint {
	data := make([]MetricPoint, points)
	for i := 0; i < points; i++ {
		timestamp := time.Now().Add(time.Duration(-i) * time.Hour)
		value := min + (max-min)*float64(i%10)/10.0
		data[i] = MetricPoint{
			Timestamp: timestamp,
			Value:     value,
		}
	}
	return data
}

// generateSampleAlerts generates sample alert data
func generateSampleAlerts(page, limit int, severity, status, source string) []AlertInfo {
	alerts := []AlertInfo{
		{
			ID:          "alert-001",
			Title:       "High Error Rate Detected",
			Description: "Error rate exceeded 5% threshold",
			Severity:    "high",
			Status:      "active",
			Source:      "jenkins",
			Labels: map[string]string{
				"pipeline": "main-ci",
				"team":     "backend",
			},
			CreatedAt: time.Now().Add(-2 * time.Hour),
			UpdatedAt: time.Now().Add(-1 * time.Hour),
		},
		{
			ID:          "alert-002",
			Title:       "Deployment Failed",
			Description: "Production deployment failed for service-api",
			Severity:    "critical",
			Status:      "resolved",
			Source:      "kubernetes",
			Labels: map[string]string{
				"service":     "api",
				"environment": "production",
			},
			CreatedAt:  time.Now().Add(-6 * time.Hour),
			UpdatedAt:  time.Now().Add(-4 * time.Hour),
			ResolvedAt: func() *time.Time { t := time.Now().Add(-3 * time.Hour); return &t }(),
		},
	}
	
	// Apply filters (simplified)
	filtered := []AlertInfo{}
	for _, alert := range alerts {
		if severity != "" && alert.Severity != severity {
			continue
		}
		if status != "" && alert.Status != status {
			continue
		}
		if source != "" && alert.Source != source {
			continue
		}
		filtered = append(filtered, alert)
	}
	
	// Apply pagination (simplified)
	start := (page - 1) * limit
	end := start + limit
	if start >= len(filtered) {
		return []AlertInfo{}
	}
	if end > len(filtered) {
		end = len(filtered)
	}
	
	return filtered[start:end]
}

// generateExportData generates export data based on date range and metrics
func generateExportData(start, end time.Time, metrics []string) []map[string]interface{} {
	data := []map[string]interface{}{}
	
	// Generate daily data points
	current := start
	for current.Before(end) {
		point := map[string]interface{}{
			"date": current.Format("2006-01-02"),
		}
		
		for _, metric := range metrics {
			switch metric {
			case "uptime":
				point[metric] = 99.0 + float64(current.Day()%5)/10.0
			case "error_rate":
				point[metric] = 0.1 + float64(current.Day()%3)/10.0
			case "build_success":
				point[metric] = 95.0 + float64(current.Day()%8)/2.0
			default:
				point[metric] = float64(current.Day() % 100)
			}
		}
		
		data = append(data, point)
		current = current.AddDate(0, 0, 1)
	}
	
	return data
}