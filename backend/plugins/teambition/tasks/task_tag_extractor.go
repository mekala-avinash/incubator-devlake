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

package tasks

import (
	"encoding/json"

	"github.com/apache/incubator-devlake/core/errors"
	"github.com/apache/incubator-devlake/core/plugin"
	"github.com/apache/incubator-devlake/helpers/pluginhelper/api"
	"github.com/apache/incubator-devlake/plugins/teambition/models"
)

var _ plugin.SubTaskEntryPoint = ExtractTaskTags

var ExtractTaskTagsMeta = plugin.SubTaskMeta{
	Name:             "extractTaskTags",
	EntryPoint:       ExtractTaskTags,
	EnabledByDefault: true,
	Description:      "Extract raw data into tool layer table _tool_teambition_task_tags",
	DomainTypes:      []string{plugin.DOMAIN_TYPE_TICKET},
}

func ExtractTaskTags(taskCtx plugin.SubTaskContext) errors.Error {
	rawDataSubTaskArgs, data := CreateRawDataSubTaskArgs(taskCtx, RAW_TASK_TAG_TABLE)
	extractor, err := api.NewApiExtractor(api.ApiExtractorArgs{
		RawDataSubTaskArgs: *rawDataSubTaskArgs,
		Extract: func(row *api.RawData) ([]interface{}, errors.Error) {
			userRes := models.TeambitionTaskTag{}
			err := errors.Convert(json.Unmarshal(row.Data, &userRes))
			if err != nil {
				return nil, err
			}
			toolL := models.TeambitionTaskTag{
				ConnectionId: data.Options.ConnectionId,
				Id:           userRes.Id,
				Name:         userRes.Name,
				ProjectId:    data.Options.ProjectId,
				IsArchived:   userRes.IsArchived,
				Updated:      userRes.Updated,
				Created:      userRes.Created,
			}
			return []interface{}{
				&toolL,
			}, nil
		},
	})
	if err != nil {
		return err
	}

	return extractor.Execute()
}
