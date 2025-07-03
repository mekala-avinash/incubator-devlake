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

package api

import (
	"net/http"

	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/core/plugin"
)

// CategoryInfo represents template category information
type CategoryInfo struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Icon        string         `json:"icon"`
	Templates   []TemplateInfo `json:"templates"`
}

// TemplateInfo represents template information
type TemplateInfo struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Category    string                 `json:"category"`
	Version     string                 `json:"version"`
	Fields      []TemplateField        `json:"fields"`
	Examples    map[string]interface{} `json:"examples"`
}

// TemplateField represents a template configuration field
type TemplateField struct {
	Name        string      `json:"name"`
	Label       string      `json:"label"`
	Type        string      `json:"type"`
	Required    bool        `json:"required"`
	Default     interface{} `json:"default"`
	Description string      `json:"description"`
	Options     []Option    `json:"options,omitempty"`
}

// Option represents a field option
type Option struct {
	Label string      `json:"label"`
	Value interface{} `json:"value"`
}

// GetCategories returns all available template categories
func GetCategories(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	categories := []CategoryInfo{
		{
			ID:          "cicd",
			Name:        "CI/CD",
			Description: "Continuous Integration and Continuous Deployment templates",
			Icon:        "rocket",
			Templates: []TemplateInfo{
				{
					ID:          "jenkins-pipeline",
					Name:        "Jenkins Pipeline",
					Description: "Declarative Jenkins pipeline with best practices",
					Category:    "cicd",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "projectName",
							Label:       "Project Name",
							Type:        "text",
							Required:    true,
							Description: "Name of your project",
						},
						{
							Name:        "gitRepository",
							Label:       "Git Repository",
							Type:        "text",
							Required:    true,
							Description: "Git repository URL",
						},
						{
							Name:        "nodeVersion",
							Label:       "Node.js Version",
							Type:        "select",
							Required:    true,
							Default:     "18",
							Description: "Node.js version to use",
							Options: []Option{
								{Label: "Node.js 16", Value: "16"},
								{Label: "Node.js 18", Value: "18"},
								{Label: "Node.js 20", Value: "20"},
							},
						},
						{
							Name:        "stages",
							Label:       "Pipeline Stages",
							Type:        "multiselect",
							Required:    true,
							Default:     []string{"build", "test", "deploy"},
							Description: "Select pipeline stages",
							Options: []Option{
								{Label: "Build", Value: "build"},
								{Label: "Test", Value: "test"},
								{Label: "Code Quality", Value: "quality"},
								{Label: "Security Scan", Value: "security"},
								{Label: "Deploy", Value: "deploy"},
							},
						},
					},
				},
				{
					ID:          "github-actions",
					Name:        "GitHub Actions",
					Description: "GitHub Actions workflow with modern practices",
					Category:    "cicd",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "workflowName",
							Label:       "Workflow Name",
							Type:        "text",
							Required:    true,
							Description: "Name of the GitHub Actions workflow",
						},
						{
							Name:        "triggers",
							Label:       "Triggers",
							Type:        "multiselect",
							Required:    true,
							Default:     []string{"push", "pull_request"},
							Description: "Workflow triggers",
							Options: []Option{
								{Label: "Push", Value: "push"},
								{Label: "Pull Request", Value: "pull_request"},
								{Label: "Schedule", Value: "schedule"},
								{Label: "Manual", Value: "workflow_dispatch"},
							},
						},
						{
							Name:        "runnerType",
							Label:       "Runner Type",
							Type:        "select",
							Required:    true,
							Default:     "ubuntu-latest",
							Description: "GitHub Actions runner type",
							Options: []Option{
								{Label: "Ubuntu Latest", Value: "ubuntu-latest"},
								{Label: "Ubuntu 22.04", Value: "ubuntu-22.04"},
								{Label: "Ubuntu 20.04", Value: "ubuntu-20.04"},
								{Label: "Windows Latest", Value: "windows-latest"},
								{Label: "macOS Latest", Value: "macos-latest"},
							},
						},
					},
				},
				{
					ID:          "gitlab-ci",
					Name:        "GitLab CI",
					Description: "GitLab CI/CD pipeline configuration",
					Category:    "cicd",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "image",
							Label:       "Docker Image",
							Type:        "text",
							Required:    true,
							Default:     "node:18",
							Description: "Docker image for the pipeline",
						},
						{
							Name:        "services",
							Label:       "Services",
							Type:        "multiselect",
							Required:    false,
							Description: "Additional services to run",
							Options: []Option{
								{Label: "PostgreSQL", Value: "postgres:13"},
								{Label: "MySQL", Value: "mysql:8"},
								{Label: "Redis", Value: "redis:6"},
								{Label: "MongoDB", Value: "mongo:5"},
							},
						},
					},
				},
			},
		},
		{
			ID:          "container",
			Name:        "Container",
			Description: "Docker and containerization templates",
			Icon:        "box",
			Templates: []TemplateInfo{
				{
					ID:          "dockerfile-nodejs",
					Name:        "Node.js Dockerfile",
					Description: "Multi-stage Dockerfile for Node.js applications",
					Category:    "container",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "nodeVersion",
							Label:       "Node.js Version",
							Type:        "select",
							Required:    true,
							Default:     "18",
							Description: "Node.js version",
							Options: []Option{
								{Label: "Node.js 16", Value: "16"},
								{Label: "Node.js 18", Value: "18"},
								{Label: "Node.js 20", Value: "20"},
							},
						},
						{
							Name:        "packageManager",
							Label:       "Package Manager",
							Type:        "select",
							Required:    true,
							Default:     "npm",
							Description: "Package manager to use",
							Options: []Option{
								{Label: "npm", Value: "npm"},
								{Label: "yarn", Value: "yarn"},
								{Label: "pnpm", Value: "pnpm"},
							},
						},
						{
							Name:        "port",
							Label:       "Exposed Port",
							Type:        "number",
							Required:    true,
							Default:     3000,
							Description: "Port to expose",
						},
					},
				},
				{
					ID:          "dockerfile-python",
					Name:        "Python Dockerfile",
					Description: "Multi-stage Dockerfile for Python applications",
					Category:    "container",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "pythonVersion",
							Label:       "Python Version",
							Type:        "select",
							Required:    true,
							Default:     "3.11",
							Description: "Python version",
							Options: []Option{
								{Label: "Python 3.9", Value: "3.9"},
								{Label: "Python 3.10", Value: "3.10"},
								{Label: "Python 3.11", Value: "3.11"},
								{Label: "Python 3.12", Value: "3.12"},
							},
						},
						{
							Name:        "port",
							Label:       "Exposed Port",
							Type:        "number",
							Required:    true,
							Default:     8000,
							Description: "Port to expose",
						},
					},
				},
			},
		},
		{
			ID:          "kubernetes",
			Name:        "Kubernetes",
			Description: "Kubernetes manifests and Helm charts",
			Icon:        "kubernetes",
			Templates: []TemplateInfo{
				{
					ID:          "k8s-deployment",
					Name:        "Kubernetes Deployment",
					Description: "Kubernetes deployment with service and ingress",
					Category:    "kubernetes",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "appName",
							Label:       "Application Name",
							Type:        "text",
							Required:    true,
							Description: "Name of the application",
						},
						{
							Name:        "namespace",
							Label:       "Namespace",
							Type:        "text",
							Required:    true,
							Default:     "default",
							Description: "Kubernetes namespace",
						},
						{
							Name:        "image",
							Label:       "Docker Image",
							Type:        "text",
							Required:    true,
							Description: "Docker image to deploy",
						},
						{
							Name:        "replicas",
							Label:       "Replicas",
							Type:        "number",
							Required:    true,
							Default:     3,
							Description: "Number of replicas",
						},
						{
							Name:        "port",
							Label:       "Service Port",
							Type:        "number",
							Required:    true,
							Default:     80,
							Description: "Service port",
						},
						{
							Name:        "targetPort",
							Label:       "Target Port",
							Type:        "number",
							Required:    true,
							Default:     8080,
							Description: "Container port",
						},
					},
				},
				{
					ID:          "helm-chart",
					Name:        "Helm Chart",
					Description: "Complete Helm chart with best practices",
					Category:    "kubernetes",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "chartName",
							Label:       "Chart Name",
							Type:        "text",
							Required:    true,
							Description: "Name of the Helm chart",
						},
						{
							Name:        "chartVersion",
							Label:       "Chart Version",
							Type:        "text",
							Required:    true,
							Default:     "0.1.0",
							Description: "Version of the chart",
						},
						{
							Name:        "appVersion",
							Label:       "App Version",
							Type:        "text",
							Required:    true,
							Default:     "1.0.0",
							Description: "Version of the application",
						},
						{
							Name:        "includeIngress",
							Label:       "Include Ingress",
							Type:        "boolean",
							Required:    false,
							Default:     true,
							Description: "Include ingress configuration",
						},
						{
							Name:        "includeHPA",
							Label:       "Include HPA",
							Type:        "boolean",
							Required:    false,
							Default:     false,
							Description: "Include Horizontal Pod Autoscaler",
						},
					},
				},
			},
		},
		{
			ID:          "security",
			Name:        "Security",
			Description: "Security and compliance templates",
			Icon:        "shield",
			Templates: []TemplateInfo{
				{
					ID:          "pod-security-policy",
					Name:        "Pod Security Policy",
					Description: "Kubernetes Pod Security Policy with best practices",
					Category:    "security",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "policyName",
							Label:       "Policy Name",
							Type:        "text",
							Required:    true,
							Description: "Name of the security policy",
						},
						{
							Name:        "allowPrivileged",
							Label:       "Allow Privileged",
							Type:        "boolean",
							Required:    false,
							Default:     false,
							Description: "Allow privileged containers",
						},
						{
							Name:        "allowHostNetwork",
							Label:       "Allow Host Network",
							Type:        "boolean",
							Required:    false,
							Default:     false,
							Description: "Allow host network access",
						},
					},
				},
				{
					ID:          "network-policy",
					Name:        "Network Policy",
					Description: "Kubernetes Network Policy for microsegmentation",
					Category:    "security",
					Version:     "1.0.0",
					Fields: []TemplateField{
						{
							Name:        "policyName",
							Label:       "Policy Name",
							Type:        "text",
							Required:    true,
							Description: "Name of the network policy",
						},
						{
							Name:        "namespace",
							Label:       "Namespace",
							Type:        "text",
							Required:    true,
							Default:     "default",
							Description: "Kubernetes namespace",
						},
						{
							Name:        "policyType",
							Label:       "Policy Type",
							Type:        "multiselect",
							Required:    true,
							Default:     ["Ingress", "Egress"],
							Description: "Type of network policy",
							Options: []Option{
								{Label: "Ingress", Value: "Ingress"},
								{Label: "Egress", Value: "Egress"},
							},
						},
					},
				},
			},
		},
	}

	return &plugin.ApiResourceOutput{
		Body:   categories,
		Status: http.StatusOK,
	}, nil
}