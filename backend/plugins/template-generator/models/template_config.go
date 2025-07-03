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

package models

import (
	"time"

	"github.com/apache/incubator-devlake/core/models/common"
	"github.com/google/uuid"
)

// TemplateConfig represents a saved template configuration
type TemplateConfig struct {
	common.NoPKModel
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Name        string    `json:"name" gorm:"type:varchar(255);not null"`
	Description string    `json:"description" gorm:"type:text"`
	Category    string    `json:"category" gorm:"type:varchar(100);not null"`
	Template    string    `json:"template" gorm:"type:varchar(100);not null"`
	Config      string    `json:"config" gorm:"type:text"` // JSON string of configuration
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName returns the table name for the model
func (TemplateConfig) TableName() string {
	return "_tool_template_configs"
}

// BeforeCreate sets the ID before creating
func (tc *TemplateConfig) BeforeCreate() {
	if tc.ID == "" {
		tc.ID = uuid.New().String()
	}
	tc.CreatedAt = time.Now()
	tc.UpdatedAt = time.Now()
}

// BeforeUpdate sets the updated timestamp
func (tc *TemplateConfig) BeforeUpdate() {
	tc.UpdatedAt = time.Now()
}

// TemplateCategory represents a template category
type TemplateCategory struct {
	common.NoPKModel
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(100)"`
	Name        string    `json:"name" gorm:"type:varchar(255);not null"`
	Description string    `json:"description" gorm:"type:text"`
	Icon        string    `json:"icon" gorm:"type:varchar(100)"`
	Order       int       `json:"order" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName returns the table name for the model
func (TemplateCategory) TableName() string {
	return "_tool_template_categories"
}

// GeneratedTemplate represents a generated template
type GeneratedTemplate struct {
	common.NoPKModel
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	ConfigID  string    `json:"config_id" gorm:"type:varchar(255);not null"`
	Name      string    `json:"name" gorm:"type:varchar(255);not null"`
	Content   string    `json:"content" gorm:"type:longtext"`
	FilePath  string    `json:"file_path" gorm:"type:varchar(500)"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName returns the table name for the model
func (GeneratedTemplate) TableName() string {
	return "_tool_generated_templates"
}

// BeforeCreate sets the ID before creating
func (gt *GeneratedTemplate) BeforeCreate() {
	if gt.ID == "" {
		gt.ID = uuid.New().String()
	}
	gt.CreatedAt = time.Now()
}