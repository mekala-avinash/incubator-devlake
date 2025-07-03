import { OverviewMetrics, ToolMetrics, AlertInfo, ExportData } from '@/types/metrics'

const API_BASE = process.env.DEVLAKE_ENDPOINT || 'http://localhost:8080'

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  
  if (!response.ok) {
    throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status)
  }
  
  return response.json()
}

export const api = {
  // Overview metrics
  getOverviewMetrics: (): Promise<OverviewMetrics> =>
    fetchApi('/metrics/overview'),

  // Tool-specific metrics
  getToolMetrics: (tool: string): Promise<ToolMetrics> =>
    fetchApi(`/metrics/tools/${tool}`),

  // Alerts
  getAlerts: (params?: {
    page?: number
    limit?: number
    severity?: string
    status?: string
    source?: string
  }): Promise<{ alerts: AlertInfo[]; pagination: { page: number; limit: number; total: number } }> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.severity) searchParams.set('severity', params.severity)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.source) searchParams.set('source', params.source)
    
    return fetchApi(`/metrics/alerts?${searchParams.toString()}`)
  },

  // Export metrics
  exportMetrics: (params: {
    format?: 'json' | 'csv'
    start_date?: string
    end_date?: string
    metrics?: string[]
  }): Promise<ExportData> => {
    const searchParams = new URLSearchParams()
    if (params.format) searchParams.set('format', params.format)
    if (params.start_date) searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)
    if (params.metrics) params.metrics.forEach(m => searchParams.append('metrics', m))
    
    return fetchApi(`/metrics/export?${searchParams.toString()}`)
  },

  // Health check
  ping: (): Promise<{ status: string }> =>
    fetchApi('/ping'),
}

export default api