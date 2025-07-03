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
	"github.com/apache/incubator-devlake/plugins/template-generator/services"
)

// GenerateTemplateRequest represents the request to generate a template
type GenerateTemplateRequest struct {
	TemplateID string                 `json:"template_id"`
	Config     map[string]interface{} `json:"config"`
}

// GenerateTemplateResponse represents the response from template generation
type GenerateTemplateResponse struct {
	ID       string              `json:"id"`
	Files    []GeneratedFile     `json:"files"`
	Metadata TemplateMetadata    `json:"metadata"`
}

// GeneratedFile represents a generated file
type GeneratedFile struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Content string `json:"content"`
	Type    string `json:"type"`
}

// TemplateMetadata represents metadata about the generated template
type TemplateMetadata struct {
	TemplateID   string                 `json:"template_id"`
	TemplateName string                 `json:"template_name"`
	Version      string                 `json:"version"`
	GeneratedAt  string                 `json:"generated_at"`
	Config       map[string]interface{} `json:"config"`
}

// GetTemplates returns all available templates
func GetTemplates(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	category := input.Query.Get("category")
	
	templateService := services.NewTemplateService()
	templates, err := templateService.GetTemplates(category)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to get templates")
	}

	return &plugin.ApiResourceOutput{
		Body:   templates,
		Status: http.StatusOK,
	}, nil
}

// GenerateTemplate generates a template with the provided configuration
func GenerateTemplate(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	var request GenerateTemplateRequest
	if err := input.Body.Decode(&request); err != nil {
		return nil, errors.BadInput.Wrap(err, "failed to decode request")
	}

	templateService := services.NewTemplateService()
	result, err := templateService.GenerateTemplate(request.TemplateID, request.Config)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to generate template")
	}

	return &plugin.ApiResourceOutput{
		Body:   result,
		Status: http.StatusOK,
	}, nil
}

// PreviewTemplate previews a template with the provided configuration
func PreviewTemplate(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	templateID := input.Params["templateId"]
	if templateID == "" {
		return nil, errors.BadInput.New("template_id is required")
	}

	var config map[string]interface{}
	if input.Body != nil {
		if err := input.Body.Decode(&config); err != nil {
			return nil, errors.BadInput.Wrap(err, "failed to decode config")
		}
	}

	templateService := services.NewTemplateService()
	preview, err := templateService.PreviewTemplate(templateID, config)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to preview template")
	}

	return &plugin.ApiResourceOutput{
		Body:   preview,
		Status: http.StatusOK,
	}, nil
}

// DownloadTemplate downloads a generated template as a ZIP file
func DownloadTemplate(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	templateID := input.Params["templateId"]
	if templateID == "" {
		return nil, errors.BadInput.New("template_id is required")
	}

	templateService := services.NewTemplateService()
	zipData, filename, err := templateService.DownloadTemplate(templateID)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to download template")
	}

	return &plugin.ApiResourceOutput{
		File: &plugin.ApiResourceFile{
			Data:        zipData,
			ContentType: "application/zip",
		},
		Header: map[string][]string{
			"Content-Disposition": {`attachment; filename="` + filename + `"`},
		},
		Status: http.StatusOK,
	}, nil
}