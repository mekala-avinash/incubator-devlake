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

package services

import (
	"archive/zip"
	"bytes"
	"fmt"
	"strings"
	"text/template"
	"time"

	"github.com/apache/incubator-devlake/plugins/template-generator/api"
	"github.com/apache/incubator-devlake/plugins/template-generator/templates"
)

// TemplateService provides template generation functionality
type TemplateService struct{}

// NewTemplateService creates a new template service instance
func NewTemplateService() *TemplateService {
	return &TemplateService{}
}

// GetTemplates returns all available templates, optionally filtered by category
func (ts *TemplateService) GetTemplates(category string) ([]api.TemplateInfo, error) {
	allTemplates := templates.GetAllTemplates()
	
	if category == "" {
		return allTemplates, nil
	}
	
	var filtered []api.TemplateInfo
	for _, tmpl := range allTemplates {
		if tmpl.Category == category {
			filtered = append(filtered, tmpl)
		}
	}
	
	return filtered, nil
}

// GenerateTemplate generates a template with the provided configuration
func (ts *TemplateService) GenerateTemplate(templateID string, config map[string]interface{}) (*api.GenerateTemplateResponse, error) {
	templateDef, err := templates.GetTemplate(templateID)
	if err != nil {
		return nil, err
	}

	// Generate files based on template
	files, err := ts.generateFiles(templateDef, config)
	if err != nil {
		return nil, err
	}

	response := &api.GenerateTemplateResponse{
		ID:    fmt.Sprintf("gen_%d", time.Now().Unix()),
		Files: files,
		Metadata: api.TemplateMetadata{
			TemplateID:   templateID,
			TemplateName: templateDef.Name,
			Version:      templateDef.Version,
			GeneratedAt:  time.Now().UTC().Format(time.RFC3339),
			Config:       config,
		},
	}

	return response, nil
}

// PreviewTemplate generates a preview of the template
func (ts *TemplateService) PreviewTemplate(templateID string, config map[string]interface{}) (*api.GenerateTemplateResponse, error) {
	return ts.GenerateTemplate(templateID, config)
}

// DownloadTemplate creates a ZIP file of the generated template
func (ts *TemplateService) DownloadTemplate(templateID string) ([]byte, string, error) {
	// For now, we'll create a simple ZIP with placeholder content
	// In a real implementation, you'd retrieve the generated template data
	
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	// Add a sample file
	fileWriter, err := zipWriter.Create("README.md")
	if err != nil {
		return nil, "", err
	}
	
	readmeContent := fmt.Sprintf("# Template: %s\n\nGenerated at: %s\n", templateID, time.Now().Format(time.RFC3339))
	_, err = fileWriter.Write([]byte(readmeContent))
	if err != nil {
		return nil, "", err
	}

	err = zipWriter.Close()
	if err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("%s_%d.zip", templateID, time.Now().Unix())
	return buf.Bytes(), filename, nil
}

// generateFiles generates the actual files based on the template definition
func (ts *TemplateService) generateFiles(templateDef *templates.TemplateDefinition, config map[string]interface{}) ([]api.GeneratedFile, error) {
	var files []api.GeneratedFile

	for _, fileTemplate := range templateDef.Files {
		content, err := ts.processTemplate(fileTemplate.Content, config)
		if err != nil {
			return nil, fmt.Errorf("failed to process template %s: %w", fileTemplate.Name, err)
		}

		fileName, err := ts.processTemplate(fileTemplate.Name, config)
		if err != nil {
			return nil, fmt.Errorf("failed to process filename %s: %w", fileTemplate.Name, err)
		}

		filePath, err := ts.processTemplate(fileTemplate.Path, config)
		if err != nil {
			return nil, fmt.Errorf("failed to process filepath %s: %w", fileTemplate.Path, err)
		}

		files = append(files, api.GeneratedFile{
			Name:    fileName,
			Path:    filePath,
			Content: content,
			Type:    fileTemplate.Type,
		})
	}

	return files, nil
}

// processTemplate processes a Go template with the provided data
func (ts *TemplateService) processTemplate(templateContent string, data map[string]interface{}) (string, error) {
	tmpl, err := template.New("template").Parse(templateContent)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, data)
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(buf.String()), nil
}