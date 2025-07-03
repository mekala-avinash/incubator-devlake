"use client"

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercentage, getStatusColor, getRelativeTime } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  description?: string
  status?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'stable'
    period: string
  }
  lastUpdated?: Date
  isLoading?: boolean
  format?: 'number' | 'percentage' | 'duration' | 'custom'
  size?: 'sm' | 'md' | 'lg'
}

export function MetricCard({
  title,
  value,
  unit = '',
  description,
  status,
  trend,
  lastUpdated,
  isLoading = false,
  format = 'number',
  size = 'md',
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-8 w-[80px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    )
  }

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'percentage':
        return formatPercentage(val)
      case 'number':
        return formatNumber(val) + unit
      case 'duration':
        return `${val}${unit}`
      default:
        return val.toString() + unit
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'stable':
        return <Minus className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground'
    
    switch (trend.direction) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-destructive'
      case 'stable':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  const sizeClasses = {
    sm: {
      title: 'text-sm',
      value: 'text-lg',
      description: 'text-xs',
    },
    md: {
      title: 'text-base',
      value: 'text-2xl',
      description: 'text-sm',
    },
    lg: {
      title: 'text-lg',
      value: 'text-3xl',
      description: 'text-base',
    },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={sizeClasses[size].title}>{title}</CardTitle>
          {status && (
            <Badge variant="secondary" className={getStatusColor(status)}>
              {status}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className={`font-bold ${sizeClasses[size].value}`}>
            {formatValue(value)}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${sizeClasses[size].description} ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {formatPercentage(Math.abs(trend.value))} {trend.period}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      {(description || lastUpdated) && (
        <CardContent className="pt-0">
          {description && (
            <CardDescription className={sizeClasses[size].description}>
              {description}
            </CardDescription>
          )}
          {lastUpdated && (
            <div className={`${sizeClasses[size].description} text-muted-foreground`}>
              Updated {getRelativeTime(lastUpdated)}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}