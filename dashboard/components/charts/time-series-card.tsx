"use client"

import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercentage, getStatusColor } from '@/lib/utils'
import { MetricSeries } from '@/types/metrics'

interface TimeSeriesCardProps {
  title: string
  description?: string
  series: MetricSeries
  isLoading?: boolean
  status?: string
  target?: number
  height?: number
  unit?: string
}

export function TimeSeriesCard({ 
  title, 
  description, 
  series, 
  isLoading = false,
  status,
  target,
  height = 300,
  unit 
}: TimeSeriesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`h-[${height}px] w-full`} />
        </CardContent>
      </Card>
    )
  }

  const data = series.data.map(point => ({
    timestamp: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    value: typeof point.value === 'number' ? point.value : parseFloat(point.value as string) || 0,
    fullTimestamp: point.timestamp,
  }))

  const formatValue = (value: number) => {
    if (unit === 'percent' || series.unit === 'percent') {
      return formatPercentage(value)
    }
    return formatNumber(value) + (unit || series.unit || '')
  }

  const currentValue = data.length > 0 ? data[data.length - 1]?.value : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatValue(currentValue)}
            </div>
            {status && (
              <Badge variant="secondary" className={getStatusColor(status)}>
                {status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="timestamp" 
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="text-xs text-muted-foreground">
                        {new Date(data?.fullTimestamp).toLocaleString()}
                      </div>
                      <div className="text-sm font-medium">
                        {formatValue(payload[0]?.value as number)}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            {target && (
              <ReferenceLine 
                y={target} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="4 4"
                label={{ value: `Target: ${formatValue(target)}`, position: "topRight" }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}