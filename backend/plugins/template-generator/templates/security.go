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

// registerPodSecurityPolicyTemplate registers the Pod Security Policy template
func registerPodSecurityPolicyTemplate() {
	template := &TemplateDefinition{
		ID:          "pod-security-policy",
		Name:        "Pod Security Policy",
		Description: "Kubernetes Pod Security Policy with best practices",
		Category:    "security",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "pod-security-policy.yaml",
				Path:    "./security/pod-security-policy.yaml",
				Type:    "yaml",
				Content: `apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: {{.policyName}}
  labels:
    app: {{.policyName}}
spec:
  privileged: {{.allowPrivileged}}
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: {{.allowHostNetwork}}
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
`,
			},
			{
				Name:    "rbac.yaml",
				Path:    "./security/rbac.yaml",
				Type:    "yaml",
				Content: `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: {{.policyName}}-psp-use
  labels:
    app: {{.policyName}}
rules:
- apiGroups: ['policy']
  resources: ['podsecuritypolicies']
  verbs: ['use']
  resourceNames:
  - {{.policyName}}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: {{.policyName}}-psp-use
  labels:
    app: {{.policyName}}
roleRef:
  kind: ClusterRole
  name: {{.policyName}}-psp-use
  apiGroup: rbac.authorization.k8s.io
subjects:
- kind: ServiceAccount
  name: default
  namespace: default
`,
			},
		],
		Fields: []api.TemplateField{
			{
				Name:        "policyName",
				Label:       "Policy Name",
				Type:        "text",
				Required:    true,
				Description: "Name of the security policy",
			},
			{
				Name:        "allowPrivileged",
				Label:       "Allow Privileged",
				Type:        "boolean",
				Required:    false,
				Default:     false,
				Description: "Allow privileged containers",
			},
			{
				Name:        "allowHostNetwork",
				Label:       "Allow Host Network",
				Type:        "boolean",
				Required:    false,
				Default:     false,
				Description: "Allow host network access",
			},
		},
		Examples: map[string]interface{}{
			"restrictive": map[string]interface{}{
				"policyName":       "restrictive-psp",
				"allowPrivileged":  false,
				"allowHostNetwork": false,
			},
		},
	}
	
	registerTemplate(template)
}

// registerNetworkPolicyTemplate registers the Network Policy template
func registerNetworkPolicyTemplate() {
	template := &TemplateDefinition{
		ID:          "network-policy",
		Name:        "Network Policy",
		Description: "Kubernetes Network Policy for microsegmentation",
		Category:    "security",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "network-policy.yaml",
				Path:    "./security/network-policy.yaml",
				Type:    "yaml",
				Content: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{.policyName}}
  namespace: {{.namespace}}
  labels:
    app: {{.policyName}}
spec:
  podSelector:
    matchLabels:
      app: webapp
  policyTypes:
  {{range .policyType}}
  - {{.}}
  {{end}}
  {{if has "Ingress" .policyType}}
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          name: production
    ports:
    - protocol: TCP
      port: 8080
  {{end}}
  {{if has "Egress" .policyType}}
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  {{end}}
`,
			},
			{
				Name:    "deny-all-network-policy.yaml",
				Path:    "./security/deny-all-network-policy.yaml",
				Type:    "yaml",
				Content: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-{{.namespace}}
  namespace: {{.namespace}}
  labels:
    app: security
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
`,
			},
		],
		Fields: []api.TemplateField{
			{
				Name:        "policyName",
				Label:       "Policy Name",
				Type:        "text",
				Required:    true,
				Description: "Name of the network policy",
			},
			{
				Name:        "namespace",
				Label:       "Namespace",
				Type:        "text",
				Required:    true,
				Default:     "default",
				Description: "Kubernetes namespace",
			},
			{
				Name:        "policyType",
				Label:       "Policy Type",
				Type:        "multiselect",
				Required:    true,
				Default:     []string{"Ingress", "Egress"},
				Description: "Type of network policy",
				Options: []api.Option{
					{Label: "Ingress", Value: "Ingress"},
					{Label: "Egress", Value: "Egress"},
				},
			},
		},
		Examples: map[string]interface{}{
			"webapp-policy": map[string]interface{}{
				"policyName": "webapp-network-policy",
				"namespace":  "production",
				"policyType": []string{"Ingress", "Egress"},
			},
		},
	}
	
	registerTemplate(template)
}