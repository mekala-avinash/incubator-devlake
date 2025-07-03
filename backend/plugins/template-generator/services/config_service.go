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
	"encoding/json"

	"github.com/apache/incubator-devlake/plugins/template-generator/models"
)

// ConfigService provides template configuration management functionality
type ConfigService struct{}

// NewConfigService creates a new config service instance
func NewConfigService() *ConfigService {
	return &ConfigService{}
}

// GetConfigs returns all template configurations, optionally filtered
func (cs *ConfigService) GetConfigs(category, template string) ([]models.TemplateConfig, error) {
	// TODO: Implement database query
	// For now, return empty slice
	return []models.TemplateConfig{}, nil
}

// GetConfig returns a specific template configuration
func (cs *ConfigService) GetConfig(configID string) (*models.TemplateConfig, error) {
	// TODO: Implement database query
	// For now, return a sample config
	config := &models.TemplateConfig{
		ID:          configID,
		Name:        "Sample Config",
		Description: "A sample template configuration",
		Category:    "cicd",
		Template:    "jenkins-pipeline",
		Config:      `{"projectName": "my-project", "gitRepository": "https://github.com/user/repo"}`,
	}
	return config, nil
}

// SaveConfig saves a new template configuration
func (cs *ConfigService) SaveConfig(name, description, category, template string, config map[string]interface{}) (*models.TemplateConfig, error) {
	configJSON, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	templateConfig := &models.TemplateConfig{
		Name:        name,
		Description: description,
		Category:    category,
		Template:    template,
		Config:      string(configJSON),
	}

	// TODO: Save to database
	templateConfig.BeforeCreate()

	return templateConfig, nil
}

// UpdateConfig updates an existing template configuration
func (cs *ConfigService) UpdateConfig(configID, name, description string, config map[string]interface{}) (*models.TemplateConfig, error) {
	// TODO: Load from database first
	templateConfig := &models.TemplateConfig{
		ID:          configID,
		Name:        name,
		Description: description,
	}

	configJSON, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	templateConfig.Config = string(configJSON)
	templateConfig.BeforeUpdate()

	// TODO: Save to database

	return templateConfig, nil
}

// DeleteConfig deletes a template configuration
func (cs *ConfigService) DeleteConfig(configID string) error {
	// TODO: Implement database deletion
	return nil
}