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

package templates

import "github.com/apache/incubator-devlake/plugins/template-generator/api"

// registerGitHubActionsTemplate registers the GitHub Actions template
func registerGitHubActionsTemplate() {
	template := &TemplateDefinition{
		ID:          "github-actions",
		Name:        "GitHub Actions",
		Description: "GitHub Actions workflow with modern practices",
		Category:    "cicd",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "{{.workflowName | lower}}.yml",
				Path:    ".github/workflows/{{.workflowName | lower}}.yml",
				Type:    "yaml",
				Content: `name: {{.workflowName}}

on:
  {{range .triggers}}
  {{if eq . "push"}}
  push:
    branches: [ main, develop ]
  {{end}}
  {{if eq . "pull_request"}}
  pull_request:
    branches: [ main ]
  {{end}}
  {{if eq . "schedule"}}
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM
  {{end}}
  {{if eq . "workflow_dispatch"}}
  workflow_dispatch:
  {{end}}
  {{end}}

jobs:
  build:
    runs-on: {{.runnerType}}
    
    strategy:
      matrix:
        node-version: [{{.nodeVersion}}]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      if: success()
      
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        echo "Deploying to staging environment"
        # Add your deployment commands here
        
    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        echo "Deploying to production environment"
        # Add your deployment commands here
`,
			},
		},
		Fields: []api.TemplateField{
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
				Options: []api.Option{
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
				Options: []api.Option{
					{Label: "Ubuntu Latest", Value: "ubuntu-latest"},
					{Label: "Ubuntu 22.04", Value: "ubuntu-22.04"},
					{Label: "Ubuntu 20.04", Value: "ubuntu-20.04"},
					{Label: "Windows Latest", Value: "windows-latest"},
					{Label: "macOS Latest", Value: "macos-latest"},
				},
			},
			{
				Name:        "nodeVersion",
				Label:       "Node.js Version",
				Type:        "select",
				Required:    true,
				Default:     "18",
				Description: "Node.js version to use",
				Options: []api.Option{
					{Label: "Node.js 16", Value: "16"},
					{Label: "Node.js 18", Value: "18"},
					{Label: "Node.js 20", Value: "20"},
				},
			},
		},
		Examples: map[string]interface{}{
			"web-app": map[string]interface{}{
				"workflowName": "CI/CD Pipeline",
				"triggers":     []string{"push", "pull_request", "workflow_dispatch"},
				"runnerType":   "ubuntu-latest",
				"nodeVersion":  "18",
			},
		},
	}
	
	registerTemplate(template)
}

// registerGitLabCITemplate registers the GitLab CI template
func registerGitLabCITemplate() {
	template := &TemplateDefinition{
		ID:          "gitlab-ci",
		Name:        "GitLab CI",
		Description: "GitLab CI/CD pipeline configuration",
		Category:    "cicd",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    ".gitlab-ci.yml",
				Path:    "./.gitlab-ci.yml",
				Type:    "yaml",
				Content: `image: {{.image}}

{{if .services}}
services:
  {{range .services}}
  - {{.}}
  {{end}}
{{end}}

variables:
  NODE_ENV: "test"
  
stages:
  - install
  - test
  - build
  - deploy

cache:
  paths:
    - node_modules/
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline

install_dependencies:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

test:
  stage: test
  script:
    - npm run test
    - npm run lint
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    # Add your deployment commands here
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    # Add your deployment commands here
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
`,
			},
		},
		Fields: []api.TemplateField{
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
				Options: []api.Option{
					{Label: "PostgreSQL", Value: "postgres:13"},
					{Label: "MySQL", Value: "mysql:8"},
					{Label: "Redis", Value: "redis:6"},
					{Label: "MongoDB", Value: "mongo:5"},
				},
			},
		},
		Examples: map[string]interface{}{
			"nodejs-app": map[string]interface{}{
				"image":    "node:18",
				"services": []string{"postgres:13", "redis:6"},
			},
		},
	}
	
	registerTemplate(template)
}