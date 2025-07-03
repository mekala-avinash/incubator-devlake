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

// SaveConfigRequest represents the request to save a template configuration
type SaveConfigRequest struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Category    string                 `json:"category"`
	Template    string                 `json:"template"`
	Config      map[string]interface{} `json:"config"`
}

// UpdateConfigRequest represents the request to update a template configuration
type UpdateConfigRequest struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"`
}

// GetConfigs returns all saved template configurations
func GetConfigs(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	category := input.Query.Get("category")
	template := input.Query.Get("template")
	
	configService := services.NewConfigService()
	configs, err := configService.GetConfigs(category, template)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to get configs")
	}

	return &plugin.ApiResourceOutput{
		Body:   configs,
		Status: http.StatusOK,
	}, nil
}

// GetConfig returns a specific template configuration
func GetConfig(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	configID := input.Params["configId"]
	if configID == "" {
		return nil, errors.BadInput.New("config_id is required")
	}

	configService := services.NewConfigService()
	config, err := configService.GetConfig(configID)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to get config")
	}

	return &plugin.ApiResourceOutput{
		Body:   config,
		Status: http.StatusOK,
	}, nil
}

// SaveConfig saves a new template configuration
func SaveConfig(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	var request SaveConfigRequest
	if err := input.Body.Decode(&request); err != nil {
		return nil, errors.BadInput.Wrap(err, "failed to decode request")
	}

	configService := services.NewConfigService()
	config, err := configService.SaveConfig(request.Name, request.Description, request.Category, request.Template, request.Config)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to save config")
	}

	return &plugin.ApiResourceOutput{
		Body:   config,
		Status: http.StatusCreated,
	}, nil
}

// UpdateConfig updates an existing template configuration
func UpdateConfig(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	configID := input.Params["configId"]
	if configID == "" {
		return nil, errors.BadInput.New("config_id is required")
	}

	var request UpdateConfigRequest
	if err := input.Body.Decode(&request); err != nil {
		return nil, errors.BadInput.Wrap(err, "failed to decode request")
	}

	configService := services.NewConfigService()
	config, err := configService.UpdateConfig(configID, request.Name, request.Description, request.Config)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to update config")
	}

	return &plugin.ApiResourceOutput{
		Body:   config,
		Status: http.StatusOK,
	}, nil
}

// DeleteConfig deletes a template configuration
func DeleteConfig(input *plugin.ApiResourceInput) (*plugin.ApiResourceOutput, errors.Error) {
	configID := input.Params["configId"]
	if configID == "" {
		return nil, errors.BadInput.New("config_id is required")
	}

	configService := services.NewConfigService()
	err := configService.DeleteConfig(configID)
	if err != nil {
		return nil, errors.Default.Wrap(err, "failed to delete config")
	}

	return &plugin.ApiResourceOutput{
		Body:   map[string]string{"message": "Config deleted successfully"},
		Status: http.StatusOK,
	}, nil
}