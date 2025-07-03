"use client"

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/charts/metric-card'
import { TimeSeriesCard } from '@/components/charts/time-series-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Users,
  GitBranch
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPercentage, getRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview-metrics'],
    queryFn: api.getOverviewMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: alerts } = useQuery({
    queryKey: ['alerts', { limit: 5 }],
    queryFn: () => api.getAlerts({ limit: 5 }),
    refetchInterval: 60000, // Refresh every minute
  })

  // Mock time series data for overview charts
  const generateMockSeries = (name: string, baseValue: number) => ({
    name,
    description: `${name} over time`,
    unit: name.includes('rate') ? 'percent' : 'count',
    type: 'gauge' as const,
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
      value: baseValue + (Math.random() - 0.5) * baseValue * 0.2,
    })),
  })

  const recentActivity = [
    {
      id: '1',
      type: 'deployment',
      message: 'Deployed user-service v2.1.0 to production',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'success',
    },
    {
      id: '2',
      type: 'alert',
      message: 'High memory usage detected in payment-service',
      timestamp: new Date(Date.now() - 32 * 60 * 1000),
      status: 'warning',
    },
    {
      id: '3',
      type: 'build',
      message: 'Build #1247 completed successfully',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'success',
    },
    {
      id: '4',
      type: 'incident',
      message: 'Database connection pool exhaustion resolved',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'resolved',
    },
  ]

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights into your DevOps metrics and system health
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-[80px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights into your DevOps metrics and system health
          </p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          View Full Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="System Uptime"
          value={overview?.uptime.value || 99.95}
          format="percentage"
          status={overview?.uptime.status || 'healthy'}
          trend={{
            value: 0.1,
            direction: 'up',
            period: 'vs last week',
          }}
          lastUpdated={overview?.uptime.last_updated}
        />
        
        <MetricCard
          title="Error Rate"
          value={overview?.error_rate.value || 0.15}
          format="percentage"
          status={overview?.error_rate.status || 'healthy'}
          trend={{
            value: 0.05,
            direction: 'down',
            period: 'vs last week',
          }}
          lastUpdated={overview?.error_rate.last_updated}
        />
        
        <MetricCard
          title="Build Success"
          value={overview?.build_success.value || 98.5}
          format="percentage"
          status={overview?.build_success.status || 'healthy'}
          trend={{
            value: 2.1,
            direction: 'up',
            period: 'vs last week',
          }}
          lastUpdated={overview?.build_success.last_updated}
        />
        
        <MetricCard
          title="Deployments/Day"
          value={overview?.deployment_frequency.value || 12.5}
          unit="/day"
          status={overview?.deployment_frequency.status || 'good'}
          trend={{
            value: 8.3,
            direction: 'up',
            period: 'vs last week',
          }}
          lastUpdated={overview?.deployment_frequency.last_updated}
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <TimeSeriesCard
          title="System Uptime"
          description="Overall system availability over the last 24 hours"
          series={generateMockSeries('uptime', 99.5)}
          status="healthy"
          target={99.9}
          unit="percent"
        />
        
        <TimeSeriesCard
          title="Error Rate"
          description="Application error rate trend"
          series={generateMockSeries('error_rate', 0.15)}
          status="healthy"
          target={1.0}
          unit="percent"
        />
        
        <TimeSeriesCard
          title="Build Success Rate"
          description="CI/CD pipeline success rate"
          series={generateMockSeries('build_success', 98)}
          status="healthy"
          target={95}
          unit="percent"
        />
        
        <TimeSeriesCard
          title="Deployment Frequency"
          description="Number of deployments per hour"
          series={generateMockSeries('deployment_frequency', 2)}
          status="good"
          unit="/hr"
        />
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system events and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {activity.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  {activity.status === 'warning' && (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  {activity.status === 'resolved' && (
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.message}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
              {alerts?.alerts.length ? (
                <Badge variant="destructive" className="ml-auto">
                  {alerts.alerts.length}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>
              Current system alerts and warnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts?.alerts.length ? (
              alerts.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-1 ${
                    alert.severity === 'critical' ? 'text-destructive' :
                    alert.severity === 'high' ? 'text-warning' :
                    'text-muted-foreground'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(new Date(alert.created_at))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                <p className="text-sm text-muted-foreground">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="text-center p-6">
          <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">156</div>
          <div className="text-sm text-muted-foreground">Total Pipelines</div>
        </Card>
        
        <Card className="text-center p-6">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">42</div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </Card>
        
        <Card className="text-center p-6">
          <GitBranch className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">28</div>
          <div className="text-sm text-muted-foreground">Repositories</div>
        </Card>
        
        <Card className="text-center p-6">
          <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">12m</div>
          <div className="text-sm text-muted-foreground">Avg Deploy Time</div>
        </Card>
      </div>
    </div>
  )
}