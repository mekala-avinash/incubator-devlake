"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Play
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'performance' | 'security' | 'usage' | 'custom'
  metrics: string[]
  schedule?: 'daily' | 'weekly' | 'monthly'
  lastGenerated?: Date
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'dora-metrics',
    name: 'DORA Metrics Report',
    description: 'Deployment frequency, lead time, MTTR, and change failure rate',
    category: 'performance',
    metrics: ['deployment_frequency', 'lead_time', 'mttr', 'change_failure_rate'],
    schedule: 'weekly',
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'security-summary',
    name: 'Security Summary',
    description: 'Security vulnerabilities, compliance status, and risk assessment',
    category: 'security',
    metrics: ['vulnerabilities', 'compliance_score', 'risk_level'],
    schedule: 'daily',
    lastGenerated: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'team-productivity',
    name: 'Team Productivity',
    description: 'Team performance metrics, code quality, and delivery insights',
    category: 'usage',
    metrics: ['commits', 'pull_requests', 'code_reviews', 'deployments'],
    schedule: 'weekly',
    lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'system-health',
    name: 'System Health Overview',
    description: 'Infrastructure health, uptime, and performance metrics',
    category: 'performance',
    metrics: ['uptime', 'response_time', 'error_rate', 'resource_usage'],
    schedule: 'daily',
    lastGenerated: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
]

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [customConfig, setCustomConfig] = useState({
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    selectedMetrics: [] as string[],
  })
  const { toast } = useToast()

  const handleGenerateReport = async (template: ReportTemplate, isCustom: boolean = false) => {
    try {
      const config = isCustom ? {
        format: customConfig.format,
        start_date: customConfig.startDate,
        end_date: customConfig.endDate,
        metrics: customConfig.selectedMetrics,
      } : {
        format: 'pdf',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        metrics: template.metrics,
      }

      const result = await api.exportMetrics(config)
      
      toast({
        title: "Report Generated",
        description: `${template.name} has been generated successfully.`,
      })

      // In a real implementation, this would download the file
      console.log('Report generated:', result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="h-4 w-4" />
      case 'security':
        return <AlertTriangle className="h-4 w-4" />
      case 'usage':
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'usage':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const allMetrics = [
    'uptime',
    'error_rate',
    'deployment_frequency',
    'lead_time',
    'mttr',
    'change_failure_rate',
    'vulnerabilities',
    'compliance_score',
    'commits',
    'pull_requests',
    'code_reviews',
    'response_time',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate custom reports and export metrics data
          </p>
        </div>
        
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Custom Report
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{REPORT_TEMPLATES.length}</div>
                    <div className="text-sm text-muted-foreground">Templates</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Reports Generated</div>
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
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Scheduled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue/10 rounded-lg">
                    <Download className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2.3GB</div>
                    <div className="text-sm text-muted-foreground">Data Exported</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Templates */}
          <div className="grid gap-6 md:grid-cols-2">
            {REPORT_TEMPLATES.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryIcon(template.category)}
                          <span className="ml-1">{template.category}</span>
                        </Badge>
                        {template.schedule && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {template.schedule}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Included Metrics:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {template.lastGenerated && (
                    <div className="text-xs text-muted-foreground">
                      Last generated: {template.lastGenerated.toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleGenerateReport(template)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Generate Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
              <CardDescription>
                Build a custom report with specific metrics and date ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={customConfig.startDate}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={customConfig.endDate}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select
                  value={customConfig.format}
                  onValueChange={(value) => setCustomConfig(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metrics</label>
                <div className="grid gap-2 md:grid-cols-3">
                  {allMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={metric}
                        checked={customConfig.selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCustomConfig(prev => ({
                              ...prev,
                              selectedMetrics: [...prev.selectedMetrics, metric]
                            }))
                          } else {
                            setCustomConfig(prev => ({
                              ...prev,
                              selectedMetrics: prev.selectedMetrics.filter(m => m !== metric)
                            }))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={metric} className="text-sm">
                        {metric.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-charts"
                      checked={customConfig.includeCharts}
                      onCheckedChange={(checked) => 
                        setCustomConfig(prev => ({ ...prev, includeCharts: checked }))
                      }
                    />
                    <label htmlFor="include-charts" className="text-sm">
                      Include charts and visualizations
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-raw-data"
                      checked={customConfig.includeRawData}
                      onCheckedChange={(checked) => 
                        setCustomConfig(prev => ({ ...prev, includeRawData: checked }))
                      }
                    />
                    <label htmlFor="include-raw-data" className="text-sm">
                      Include raw data tables
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={() => handleGenerateReport({
                    id: 'custom',
                    name: 'Custom Report',
                    description: 'User-generated custom report',
                    category: 'custom',
                    metrics: customConfig.selectedMetrics,
                  }, true)}
                  disabled={!customConfig.startDate || !customConfig.endDate || customConfig.selectedMetrics.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage automated report generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No scheduled reports configured</p>
                <Button variant="outline" className="mt-4">
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}