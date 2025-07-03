export interface MetricPoint {
  timestamp: Date
  value: number | string
}

export interface MetricSeries {
  name: string
  description: string
  unit: string
  type: 'gauge' | 'counter' | 'histogram'
  data: MetricPoint[]
  labels?: Record<string, string>
}

export interface OverviewMetrics {
  uptime: {
    value: number
    unit: string
    status: string
    last_updated: Date
  }
  error_rate: {
    value: number
    unit: string
    status: string
    last_updated: Date
  }
  build_success: {
    value: number
    unit: string
    status: string
    last_updated: Date
  }
  deployment_frequency: {
    value: number
    unit: string
    status: string
    last_updated: Date
  }
}

export interface ToolMetrics {
  tool: string
  overview: Record<string, any>
  time_series: MetricSeries[]
  last_updated: Date
}

export interface AlertInfo {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  source: string
  labels: Record<string, string>
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
  resolved_at?: Date
}

export interface ExportData {
  metadata: {
    generated_at: Date
    date_range: {
      start: Date
      end: Date
    }
    metrics: string[]
    format: string
  }
  data: Record<string, any>[]
}

export interface TimeRange {
  start: Date
  end: Date
  label: string
}

export const TIME_RANGES: TimeRange[] = [
  {
    start: new Date(Date.now() - 1000 * 60 * 60), // 1 hour
    end: new Date(),
    label: 'Last hour',
  },
  {
    start: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours
    end: new Date(),
    label: 'Last 24 hours',
  },
  {
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days
    end: new Date(),
    label: 'Last 7 days',
  },
  {
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days
    end: new Date(),
    label: 'Last 30 days',
  },
]

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'cicd' | 'scm' | 'project' | 'monitoring' | 'testing'
}

export const AVAILABLE_TOOLS: Tool[] = [
  {
    id: 'jenkins',
    name: 'Jenkins',
    description: 'CI/CD automation server',
    icon: 'Wrench',
    color: 'blue',
    category: 'cicd',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Git repository hosting',
    icon: 'Github',
    color: 'gray',
    category: 'scm',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform',
    icon: 'GitBranch',
    color: 'orange',
    category: 'scm',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: 'Container orchestration',
    icon: 'Cloud',
    color: 'purple',
    category: 'monitoring',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project management',
    icon: 'CheckSquare',
    color: 'blue',
    category: 'project',
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    description: 'Code quality analysis',
    icon: 'Shield',
    color: 'green',
    category: 'testing',
  },
]