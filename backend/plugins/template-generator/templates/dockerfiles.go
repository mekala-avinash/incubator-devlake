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

// registerDockerfileNodeJSTemplate registers the Node.js Dockerfile template
func registerDockerfileNodeJSTemplate() {
	template := &TemplateDefinition{
		ID:          "dockerfile-nodejs",
		Name:        "Node.js Dockerfile",
		Description: "Multi-stage Dockerfile for Node.js applications",
		Category:    "container",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "Dockerfile",
				Path:    "./Dockerfile",
				Type:    "dockerfile",
				Content: `# Build stage
FROM node:{{.nodeVersion}}-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
{{if eq .packageManager "yarn"}}
COPY yarn.lock ./
{{end}}
{{if eq .packageManager "pnpm"}}
COPY pnpm-lock.yaml ./
{{end}}

# Install dependencies
{{if eq .packageManager "npm"}}
RUN npm ci --only=production && npm cache clean --force
{{else if eq .packageManager "yarn"}}
RUN yarn install --frozen-lockfile --production
{{else if eq .packageManager "pnpm"}}
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod
{{end}}

# Copy source code
COPY . .

# Build application
{{if eq .packageManager "npm"}}
RUN npm run build
{{else if eq .packageManager "yarn"}}
RUN yarn build
{{else if eq .packageManager "pnpm"}}
RUN pnpm build
{{end}}

# Production stage
FROM node:{{.nodeVersion}}-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE {{.port}}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:{{.port}}/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
`,
			},
			{
				Name:    ".dockerignore",
				Path:    "./.dockerignore",
				Type:    "text",
				Content: `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.nyc_output
coverage
.npm
.eslintcache
.next
.nuxt
.vuepress/dist
.serverless/
.DS_Store
Thumbs.db
`,
			},
		},
		Fields: []api.TemplateField{
			{
				Name:        "nodeVersion",
				Label:       "Node.js Version",
				Type:        "select",
				Required:    true,
				Default:     "18",
				Description: "Node.js version",
				Options: []api.Option{
					{Label: "Node.js 16", Value: "16"},
					{Label: "Node.js 18", Value: "18"},
					{Label: "Node.js 20", Value: "20"},
				},
			},
			{
				Name:        "packageManager",
				Label:       "Package Manager",
				Type:        "select",
				Required:    true,
				Default:     "npm",
				Description: "Package manager to use",
				Options: []api.Option{
					{Label: "npm", Value: "npm"},
					{Label: "yarn", Value: "yarn"},
					{Label: "pnpm", Value: "pnpm"},
				},
			},
			{
				Name:        "port",
				Label:       "Exposed Port",
				Type:        "number",
				Required:    true,
				Default:     3000,
				Description: "Port to expose",
			},
		},
		Examples: map[string]interface{}{
			"express-app": map[string]interface{}{
				"nodeVersion":    "18",
				"packageManager": "npm",
				"port":           3000,
			},
		},
	}
	
	registerTemplate(template)
}

// registerDockerfilePythonTemplate registers the Python Dockerfile template
func registerDockerfilePythonTemplate() {
	template := &TemplateDefinition{
		ID:          "dockerfile-python",
		Name:        "Python Dockerfile",
		Description: "Multi-stage Dockerfile for Python applications",
		Category:    "container",
		Version:     "1.0.0",
		Files: []FileTemplate{
			{
				Name:    "Dockerfile",
				Path:    "./Dockerfile",
				Type:    "dockerfile",
				Content: `# Build stage
FROM python:{{.pythonVersion}}-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Production stage
FROM python:{{.pythonVersion}}-slim AS production

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/home/appuser/.local/bin:$PATH"

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE {{.port}}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:{{.port}}/health || exit 1

# Start application
CMD ["python", "app.py"]
`,
			},
			{
				Name:    ".dockerignore",
				Path:    "./.dockerignore",
				Type:    "text",
				Content: `__pycache__
*.pyc
*.pyo
*.pyd
.Python
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
.DS_Store
Thumbs.db
`,
			},
		},
		Fields: []api.TemplateField{
			{
				Name:        "pythonVersion",
				Label:       "Python Version",
				Type:        "select",
				Required:    true,
				Default:     "3.11",
				Description: "Python version",
				Options: []api.Option{
					{Label: "Python 3.9", Value: "3.9"},
					{Label: "Python 3.10", Value: "3.10"},
					{Label: "Python 3.11", Value: "3.11"},
					{Label: "Python 3.12", Value: "3.12"},
				},
			},
			{
				Name:        "port",
				Label:       "Exposed Port",
				Type:        "number",
				Required:    true,
				Default:     8000,
				Description: "Port to expose",
			},
		},
		Examples: map[string]interface{}{
			"flask-app": map[string]interface{}{
				"pythonVersion": "3.11",
				"port":          8000,
			},
		},
	}
	
	registerTemplate(template)
}