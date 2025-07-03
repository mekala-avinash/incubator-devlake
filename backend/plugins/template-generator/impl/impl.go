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

package impl

import (
	"github.com/apache/incubator-devlake/core/context"
	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/core/plugin"
	"github.com/apache/incubator-devlake/plugins/template-generator/api"
	"github.com/apache/incubator-devlake/plugins/template-generator/models"
)

// TemplateGenerator is the main implementation of the template-generator plugin
type TemplateGenerator struct{}

// Make sure TemplateGenerator satisfies the PluginMeta interface
func (TemplateGenerator) Description() string {
	return "Generate DevOps templates with best practices"
}

func (TemplateGenerator) Name() string {
	return "template-generator"
}

// GetTablesInfo returns the table information for the plugin
func (t *TemplateGenerator) GetTablesInfo() []plugin.Tabler {
	return []plugin.Tabler{
		&models.TemplateConfig{},
		&models.TemplateCategory{},
		&models.GeneratedTemplate{},
	}
}

// ApiResources returns the API resources for the plugin
func (t *TemplateGenerator) ApiResources() map[string]map[string]plugin.ApiResourceHandler {
	return map[string]map[string]plugin.ApiResourceHandler{
		"categories": {
			"GET": api.GetCategories,
		},
		"templates": {
			"GET":  api.GetTemplates,
			"POST": api.GenerateTemplate,
		},
		"templates/:templateId/download": {
			"GET": api.DownloadTemplate,
		},
		"templates/:templateId/preview": {
			"GET": api.PreviewTemplate,
		},
		"configs": {
			"GET":  api.GetConfigs,
			"POST": api.SaveConfig,
		},
		"configs/:configId": {
			"GET":    api.GetConfig,
			"PUT":    api.UpdateConfig,
			"DELETE": api.DeleteConfig,
		},
	}
}

// Init initializes the plugin
func (t *TemplateGenerator) Init(basicRes context.BasicRes) errors.Error {
	// Initialize any required resources
	return nil
}

// MigrationScripts returns the migration scripts for the plugin
func (t *TemplateGenerator) MigrationScripts() []plugin.MigrationScript {
	return []plugin.MigrationScript{
		new(models.InitSchemas),
	}
}

// Ensure the plugin implements the required interfaces
var _ plugin.PluginMeta = (*TemplateGenerator)(nil)
var _ plugin.PluginInit = (*TemplateGenerator)(nil)
var _ plugin.PluginApi = (*TemplateGenerator)(nil)
var _ plugin.PluginModel = (*TemplateGenerator)(nil)
var _ plugin.PluginMigration = (*TemplateGenerator)(nil)