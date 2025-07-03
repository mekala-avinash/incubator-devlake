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

// registerKubernetesDeploymentTemplate registers the Kubernetes deployment template
func registerKubernetesDeploymentTemplate() {
	template := &TemplateDefinition{
		ID:          "k8s-deployment",
		Name:        "Kubernetes Deployment",
		Description: "Kubernetes deployment with service and ingress",
		Category:    "kubernetes",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "deployment.yaml",
				Path:    "./k8s/deployment.yaml",
				Type:    "yaml",
				Content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{.appName}}
  namespace: {{.namespace}}
  labels:
    app: {{.appName}}
spec:
  replicas: {{.replicas}}
  selector:
    matchLabels:
      app: {{.appName}}
  template:
    metadata:
      labels:
        app: {{.appName}}
    spec:
      containers:
      - name: {{.appName}}
        image: {{.image}}
        ports:
        - containerPort: {{.targetPort}}
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: {{.targetPort}}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {{.targetPort}}
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
`,
			},
			{
				Name:    "service.yaml",
				Path:    "./k8s/service.yaml",
				Type:    "yaml",
				Content: `apiVersion: v1
kind: Service
metadata:
  name: {{.appName}}-service
  namespace: {{.namespace}}
  labels:
    app: {{.appName}}
spec:
  selector:
    app: {{.appName}}
  ports:
  - name: http
    port: {{.port}}
    targetPort: {{.targetPort}}
    protocol: TCP
  type: ClusterIP
`,
			},
			{
				Name:    "ingress.yaml",
				Path:    "./k8s/ingress.yaml",
				Type:    "yaml",
				Content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{.appName}}-ingress
  namespace: {{.namespace}}
  labels:
    app: {{.appName}}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - {{.appName}}.example.com
    secretName: {{.appName}}-tls
  rules:
  - host: {{.appName}}.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {{.appName}}-service
            port:
              number: {{.port}}
`,
			},
		],
		Fields: []api.TemplateField{
			{
				Name:        "appName",
				Label:       "Application Name",
				Type:        "text",
				Required:    true,
				Description: "Name of the application",
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
				Name:        "image",
				Label:       "Docker Image",
				Type:        "text",
				Required:    true,
				Description: "Docker image to deploy",
			},
			{
				Name:        "replicas",
				Label:       "Replicas",
				Type:        "number",
				Required:    true,
				Default:     3,
				Description: "Number of replicas",
			},
			{
				Name:        "port",
				Label:       "Service Port",
				Type:        "number",
				Required:    true,
				Default:     80,
				Description: "Service port",
			},
			{
				Name:        "targetPort",
				Label:       "Target Port",
				Type:        "number",
				Required:    true,
				Default:     8080,
				Description: "Container port",
			},
		},
		Examples: map[string]interface{}{
			"web-app": map[string]interface{}{
				"appName":    "my-web-app",
				"namespace":  "production",
				"image":      "my-registry/my-web-app:latest",
				"replicas":   3,
				"port":       80,
				"targetPort": 3000,
			},
		},
	}
	
	registerTemplate(template)
}

// registerHelmChartTemplate registers the Helm chart template
func registerHelmChartTemplate() {
	template := &TemplateDefinition{
		ID:          "helm-chart",
		Name:        "Helm Chart",
		Description: "Complete Helm chart with best practices",
		Category:    "kubernetes",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "Chart.yaml",
				Path:    "./{{.chartName}}/Chart.yaml",
				Type:    "yaml",
				Content: `apiVersion: v2
name: {{.chartName}}
description: A Helm chart for {{.chartName}}
type: application
version: {{.chartVersion}}
appVersion: "{{.appVersion}}"
`,
			},
			{
				Name:    "values.yaml",
				Path:    "./{{.chartName}}/values.yaml",
				Type:    "yaml",
				Content: `# Default values for {{.chartName}}.
replicaCount: 1

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext: {}

securityContext: {}

service:
  type: ClusterIP
  port: 80

{{if .includeIngress}}
ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []
{{end}}

resources: {}

{{if .includeHPA}}
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
{{end}}

nodeSelector: {}

tolerations: []

affinity: {}
`,
			},
			{
				Name:    "deployment.yaml",
				Path:    "./{{.chartName}}/templates/deployment.yaml",
				Type:    "yaml",
				Content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "{{.chartName}}.fullname" . }}
  labels:
    {{- include "{{.chartName}}.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "{{.chartName}}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "{{.chartName}}.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "{{.chartName}}.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /
              port: http
          readinessProbe:
            httpGet:
              path: /
              port: http
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
`,
			},
		],
		Fields: []api.TemplateField{
			{
				Name:        "chartName",
				Label:       "Chart Name",
				Type:        "text",
				Required:    true,
				Description: "Name of the Helm chart",
			},
			{
				Name:        "chartVersion",
				Label:       "Chart Version",
				Type:        "text",
				Required:    true,
				Default:     "0.1.0",
				Description: "Version of the chart",
			},
			{
				Name:        "appVersion",
				Label:       "App Version",
				Type:        "text",
				Required:    true,
				Default:     "1.0.0",
				Description: "Version of the application",
			},
			{
				Name:        "includeIngress",
				Label:       "Include Ingress",
				Type:        "boolean",
				Required:    false,
				Default:     true,
				Description: "Include ingress configuration",
			},
			{
				Name:        "includeHPA",
				Label:       "Include HPA",
				Type:        "boolean",
				Required:    false,
				Default:     false,
				Description: "Include Horizontal Pod Autoscaler",
			},
		},
		Examples: map[string]interface{}{
			"microservice": map[string]interface{}{
				"chartName":      "my-service",
				"chartVersion":   "0.1.0",
				"appVersion":     "1.0.0",
				"includeIngress": true,
				"includeHPA":     true,
			},
		},
	}
	
	registerTemplate(template)
}