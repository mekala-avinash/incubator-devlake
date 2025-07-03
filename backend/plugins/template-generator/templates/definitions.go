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

import (
	"fmt"

	"github.com/apache/incubator-devlake/plugins/template-generator/api"
)

// TemplateDefinition represents the complete definition of a template
type TemplateDefinition struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Category    string                 `json:"category"`
	Version     string                 `json:"version"`
	Files       []FileTemplate         `json:"files"`
	Fields      []api.TemplateField    `json:"fields"`
	Examples    map[string]interface{} `json:"examples"`
}

// FileTemplate represents a file template within a template definition
type FileTemplate struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Content string `json:"content"`
	Type    string `json:"type"`
}

// templateRegistry holds all available templates
var templateRegistry = make(map[string]*TemplateDefinition)

// init initializes all template definitions
func init() {
	registerJenkinsPipelineTemplate()
	registerGitHubActionsTemplate()
	registerGitLabCITemplate()
	registerDockerfileNodeJSTemplate()
	registerDockerfilePythonTemplate()
	registerKubernetesDeploymentTemplate()
	registerHelmChartTemplate()
	registerPodSecurityPolicyTemplate()
	registerNetworkPolicyTemplate()
}

// GetTemplate returns a template definition by ID
func GetTemplate(templateID string) (*TemplateDefinition, error) {
	template, exists := templateRegistry[templateID]
	if !exists {
		return nil, fmt.Errorf("template not found: %s", templateID)
	}
	return template, nil
}

// GetAllTemplates returns all available templates as TemplateInfo
func GetAllTemplates() []api.TemplateInfo {
	var templates []api.TemplateInfo
	for _, template := range templateRegistry {
		templates = append(templates, api.TemplateInfo{
			ID:          template.ID,
			Name:        template.Name,
			Description: template.Description,
			Category:    template.Category,
			Version:     template.Version,
			Fields:      template.Fields,
			Examples:    template.Examples,
		})
	}
	return templates
}

// registerTemplate registers a template in the registry
func registerTemplate(template *TemplateDefinition) {
	templateRegistry[template.ID] = template
}