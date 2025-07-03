"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  Info
} from 'lucide-react'
import { api } from '@/lib/api'
import { getRelativeTime } from '@/lib/utils'
import type { AlertInfo } from '@/types/metrics'

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

const STATUS_COLORS = {
  active: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
}

export default function AlertsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState({
    search: '',
    severity: '',
    status: '',
    source: '',
  })

  const { data: alertsData, isLoading, refetch } = useQuery({
    queryKey: ['alerts', currentPage, pageSize, filters],
    queryFn: () => api.getAlerts({
      page: currentPage,
      limit: pageSize,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
      source: filters.source || undefined,
    }),
    refetchInterval: 60000, // Refresh every minute
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Info className="h-4 w-4" />
      case 'low':
        return <Clock className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-warning" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      severity: '',
      status: '',
      source: '',
    })
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '')
  }

  // Mock summary data
  const alertSummary = {
    total: alertsData?.pagination.total || 0,
    active: 8,
    acknowledged: 3,
    resolved: 145,
    critical: 2,
    high: 6,
    medium: 12,
    low: 5,
  }

  const filteredAlerts = alertsData?.alerts.filter(alert => {
    if (filters.search && !alert.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !alert.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  }) || []

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
        
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
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
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts and incidents
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alertSummary.active}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alertSummary.acknowledged}</div>
                <div className="text-sm text-muted-foreground">Acknowledged</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alertSummary.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{alertSummary.total}</div>
                <div className="text-sm text-muted-foreground">Total Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>

              <Select
                value={filters.severity}
                onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.source}
                onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sources</SelectItem>
                  <SelectItem value="jenkins">Jenkins</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Alert History
            {filteredAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredAlerts.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            All alerts with current filters applied
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(alert.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS]}>
                        {getSeverityIcon(alert.severity)}
                        <span className="ml-1">{alert.severity}</span>
                      </Badge>
                      
                      <Badge className={STATUS_COLORS[alert.status as keyof typeof STATUS_COLORS]}>
                        {alert.status}
                      </Badge>
                      
                      <Badge variant="outline">
                        {alert.source}
                      </Badge>
                      
                      {Object.entries(alert.labels).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {getRelativeTime(new Date(alert.created_at))}</span>
                      {alert.resolved_at && (
                        <span>Resolved {getRelativeTime(new Date(alert.resolved_at))}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters() ? 'No alerts match your filters' : 'No alerts found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {alertsData && alertsData.pagination.total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, alertsData.pagination.total)} of {alertsData.pagination.total} alerts
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * pageSize >= alertsData.pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}