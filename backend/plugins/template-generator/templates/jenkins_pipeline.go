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

// registerJenkinsPipelineTemplate registers the Jenkins pipeline template
func registerJenkinsPipelineTemplate() {
	template := &TemplateDefinition{
		ID:          "jenkins-pipeline",
		Name:        "Jenkins Pipeline",
		Description: "Declarative Jenkins pipeline with best practices",
		Category:    "cicd",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "Jenkinsfile",
				Path:    "./Jenkinsfile",
				Type:    "groovy",
				Content: `pipeline {
    agent any
    
    environment {
        PROJECT_NAME = '{{.projectName}}'
        NODE_VERSION = '{{.nodeVersion}}'
    }
    
    tools {
        nodejs "node-${NODE_VERSION}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: '{{.gitRepository}}'
            }
        }
        {{range .stages}}
        {{if eq . "build"}}
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        {{end}}
        {{if eq . "test"}}
        stage('Test') {
            steps {
                sh 'npm run test'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                }
            }
        }
        {{end}}
        {{if eq . "quality"}}
        stage('Code Quality') {
            steps {
                sh 'npm run lint'
                sh 'npm run audit'
            }
        }
        {{end}}
        {{if eq . "security"}}
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level moderate'
            }
        }
        {{end}}
        {{if eq . "deploy"}}
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run deploy'
            }
        }
        {{end}}
        {{end}}
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}`,
			},
		},
		Fields: []api.TemplateField{
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
				Options: []api.Option{
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
				Options: []api.Option{
					{Label: "Build", Value: "build"},
					{Label: "Test", Value: "test"},
					{Label: "Code Quality", Value: "quality"},
					{Label: "Security Scan", Value: "security"},
					{Label: "Deploy", Value: "deploy"},
				},
			},
		},
		Examples: map[string]interface{}{
			"basic": map[string]interface{}{
				"projectName":   "my-webapp",
				"gitRepository": "https://github.com/user/my-webapp.git",
				"nodeVersion":   "18",
				"stages":        []string{"build", "test", "deploy"},
			},
		},
	}
	
	registerTemplate(template)
}