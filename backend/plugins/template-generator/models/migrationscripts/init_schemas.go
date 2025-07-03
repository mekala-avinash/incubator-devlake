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

package migrationscripts

import (
	"github.com/apache/incubator-devlake/core/context"
	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/plugins/template-generator/models"
)

// InitSchemas initializes the database schemas for the template generator plugin
type InitSchemas struct{}

// Up creates the required tables
func (u *InitSchemas) Up(basicRes context.BasicRes) errors.Error {
	return basicRes.GetDal().AutoMigrate(
		&models.TemplateConfig{},
		&models.TemplateCategory{},
		&models.GeneratedTemplate{},
	)
}

// Down drops the tables
func (u *InitSchemas) Down(basicRes context.BasicRes) errors.Error {
	return basicRes.GetDal().DropTables(
		&models.TemplateConfig{},
		&models.TemplateCategory{},
		&models.GeneratedTemplate{},
	)
}

// Version returns the migration version
func (u *InitSchemas) Version() uint64 {
	return 20240101000001
}

// Name returns the migration name
func (u *InitSchemas) Name() string {
	return "init template generator schemas"
}