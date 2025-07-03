"use client"

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from '@/components/charts/metric-card'
import { TimeSeriesCard } from '@/components/charts/time-series-card'
import { FilterBar, type FilterState } from '@/components/charts/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ExternalLink, 
  Settings, 
  RefreshCw, 
  Download,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  GitCommit,
  Users
} from 'lucide-react'
import { api } from '@/lib/api'
import { AVAILABLE_TOOLS } from '@/types/metrics'
import { formatNumber, formatDuration, getRelativeTime } from '@/lib/utils'

export default function ToolPage() {
  const params = useParams()
  const toolId = params.tool as string
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    team: [],
    namespace: [],
    environment: [],
    status: [],
  })

  const tool = AVAILABLE_TOOLS.find(t => t.id === toolId)
  
  const { data: toolMetrics, isLoading, refetch } = useQuery({
    queryKey: ['tool-metrics', toolId],
    queryFn: () => api.getToolMetrics(toolId),
    refetchInterval: 30000,
    enabled: !!toolId,
  })

  // Mock data generation based on tool type
  const generateToolSpecificData = (toolId: string) => {
    switch (toolId) {
      case 'jenkins':
        return {
          pipelines: [
            { id: '1', name: 'main-ci', status: 'success', lastRun: new Date(Date.now() - 15 * 60 * 1000), duration: '12m 34s' },
            { id: '2', name: 'release-cd', status: 'running', lastRun: new Date(Date.now() - 5 * 60 * 1000), duration: '8m 12s' },
            { id: '3', name: 'feature-test', status: 'failed', lastRun: new Date(Date.now() - 32 * 60 * 1000), duration: '4m 56s' },
          ],
          recentBuilds: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            pipeline: i % 2 === 0 ? 'main-ci' : 'release-cd',
            status: ['success', 'failed', 'running'][i % 3],
            duration: `${Math.floor(Math.random() * 15) + 5}m ${Math.floor(Math.random() * 60)}s`,
            startTime: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
          }))
        }
      case 'github':
        return {
          repositories: [
            { id: '1', name: 'frontend-app', language: 'TypeScript', stars: 45, forks: 12, issues: 3 },
            { id: '2', name: 'backend-api', language: 'Go', stars: 32, forks: 8, issues: 1 },
            { id: '3', name: 'mobile-app', language: 'React Native', stars: 28, forks: 6, issues: 5 },
          ],
          pullRequests: [
            { id: '1', title: 'Add user authentication', author: 'john-doe', status: 'open', created: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { id: '2', title: 'Fix payment processing bug', author: 'jane-smith', status: 'merged', created: new Date(Date.now() - 6 * 60 * 60 * 1000) },
            { id: '3', title: 'Update dependencies', author: 'bob-wilson', status: 'review', created: new Date(Date.now() - 8 * 60 * 60 * 1000) },
          ]
        }
      case 'kubernetes':
        return {
          namespaces: [
            { name: 'production', pods: 24, services: 8, status: 'healthy' },
            { name: 'staging', pods: 12, services: 6, status: 'healthy' },
            { name: 'development', pods: 8, services: 4, status: 'warning' },
          ],
          workloads: [
            { name: 'user-service', type: 'Deployment', replicas: '3/3', status: 'Running' },
            { name: 'payment-service', type: 'Deployment', replicas: '2/3', status: 'Warning' },
            { name: 'notification-worker', type: 'Job', replicas: '1/1', status: 'Completed' },
          ]
        }
      default:
        return {
          items: [],
          metrics: {},
        }
    }
  }

  const toolData = generateToolSpecificData(toolId)

  const clearFilters = () => {
    setFilters({
      search: '',
      team: [],
      namespace: [],
      environment: [],
      status: [],
    })
  }

  if (!tool) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Tool not found</h3>
          <p className="text-sm text-muted-foreground">
            The requested tool "{toolId}" was not found.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/20`}>
            {React.createElement(
              require('lucide-react')[tool.icon] || require('lucide-react').Box,
              { className: `h-6 w-6 text-${tool.color}-600 dark:text-${tool.color}-400` }
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{tool.name} Dashboard</h1>
            <p className="text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open {tool.name}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Items"
          value={toolMetrics?.overview.total_pipelines || 156}
          trend={{
            value: 12,
            direction: 'up',
            period: 'this week',
          }}
        />
        
        <MetricCard
          title="Success Rate"
          value={toolMetrics?.overview.success_rate || 94.2}
          format="percentage"
          status="healthy"
          trend={{
            value: 2.1,
            direction: 'up',
            period: 'this week',
          }}
        />
        
        <MetricCard
          title="Avg Duration"
          value={toolMetrics?.overview.avg_duration || "12m 34s"}
          format="custom"
          trend={{
            value: 8,
            direction: 'down',
            period: 'this week',
          }}
        />
        
        <MetricCard
          title="Last Activity"
          value={getRelativeTime(new Date(toolMetrics?.overview.last_run || Date.now() - 15 * 60 * 1000))}
          format="custom"
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder={`Search ${tool.name.toLowerCase()} items...`}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={clearFilters}
      />

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Time Series Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {toolMetrics?.time_series.map((series, index) => (
              <TimeSeriesCard
                key={index}
                title={series.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                description={series.description}
                series={series}
                status="healthy"
              />
            ))}
          </div>

          {/* Tool-specific Overview */}
          {toolId === 'jenkins' && (
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Status</CardTitle>
                <CardDescription>Current status of all pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(toolData as any).pipelines?.map((pipeline: any) => (
                    <div key={pipeline.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={pipeline.status === 'success' ? 'default' : 
                                 pipeline.status === 'running' ? 'secondary' : 'destructive'}
                        >
                          {pipeline.status}
                        </Badge>
                        <span className="font-medium">{pipeline.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{pipeline.duration}</div>
                        <div className="text-xs text-muted-foreground">
                          {getRelativeTime(pipeline.lastRun)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {toolId === 'kubernetes' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Namespaces</CardTitle>
                  <CardDescription>Cluster namespace overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(toolData as any).namespaces?.map((ns: any) => (
                      <div key={ns.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={ns.status === 'healthy' ? 'default' : 'destructive'}>
                            {ns.status}
                          </Badge>
                          <span className="font-medium">{ns.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div>{ns.pods} pods</div>
                          <div className="text-muted-foreground">{ns.services} services</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workloads</CardTitle>
                  <CardDescription>Running workloads status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(toolData as any).workloads?.map((workload: any) => (
                      <div key={workload.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{workload.type}</Badge>
                          <span className="font-medium">{workload.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div>{workload.replicas}</div>
                          <div className="text-muted-foreground">{workload.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Items</CardTitle>
                <CardDescription>Complete list of {tool.name.toLowerCase()} items</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Items list would be displayed here with filtering and pagination
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Long-term performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Performance analytics charts would be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Tool usage patterns and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Usage statistics would be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent activity and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity history would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}