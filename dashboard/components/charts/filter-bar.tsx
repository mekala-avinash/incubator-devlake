"use client"

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterState {
  search: string
  team: string[]
  namespace: string[]
  environment: string[]
  status: string[]
}

interface FilterBarProps {
  searchPlaceholder?: string
  teamOptions?: FilterOption[]
  namespaceOptions?: FilterOption[]
  environmentOptions?: FilterOption[]
  statusOptions?: FilterOption[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClear: () => void
}

const defaultTeamOptions: FilterOption[] = [
  { id: '1', label: 'Frontend Team', value: 'frontend' },
  { id: '2', label: 'Backend Team', value: 'backend' },
  { id: '3', label: 'DevOps Team', value: 'devops' },
  { id: '4', label: 'QA Team', value: 'qa' },
]

const defaultNamespaceOptions: FilterOption[] = [
  { id: '1', label: 'default', value: 'default' },
  { id: '2', label: 'production', value: 'production' },
  { id: '3', label: 'staging', value: 'staging' },
  { id: '4', label: 'development', value: 'development' },
]

const defaultEnvironmentOptions: FilterOption[] = [
  { id: '1', label: 'Production', value: 'production' },
  { id: '2', label: 'Staging', value: 'staging' },
  { id: '3', label: 'Development', value: 'development' },
  { id: '4', label: 'Testing', value: 'testing' },
]

const defaultStatusOptions: FilterOption[] = [
  { id: '1', label: 'Healthy', value: 'healthy' },
  { id: '2', label: 'Warning', value: 'warning' },
  { id: '3', label: 'Critical', value: 'critical' },
  { id: '4', label: 'Unknown', value: 'unknown' },
]

export function FilterBar({
  searchPlaceholder = "Search...",
  teamOptions = defaultTeamOptions,
  namespaceOptions = defaultNamespaceOptions,
  environmentOptions = defaultEnvironmentOptions,
  statusOptions = defaultStatusOptions,
  filters,
  onFiltersChange,
  onClear,
}: FilterBarProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const addArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[]
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value])
    }
  }

  const removeArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[]
    updateFilter(key, currentArray.filter(item => item !== value))
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.team.length > 0 ||
      filters.namespace.length > 0 ||
      filters.environment.length > 0 ||
      filters.status.length > 0
    )
  }

  const getActiveFilterCount = () => {
    return (
      filters.team.length +
      filters.namespace.length +
      filters.environment.length +
      filters.status.length +
      (filters.search ? 1 : 0)
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and main controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="h-6 min-w-[24px] rounded-full px-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>

          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter selects */}
      <div className="flex flex-wrap gap-4">
        <Select onValueChange={(value) => addArrayFilter('team', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            {teamOptions
              .filter(option => !filters.team.includes(option.value))
              .map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => addArrayFilter('namespace', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Namespace" />
          </SelectTrigger>
          <SelectContent>
            {namespaceOptions
              .filter(option => !filters.namespace.includes(option.value))
              .map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => addArrayFilter('environment', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            {environmentOptions
              .filter(option => !filters.environment.includes(option.value))
              .map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => addArrayFilter('status', value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions
              .filter(option => !filters.status.includes(option.value))
              .map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.team.map((team) => (
            <Badge key={team} variant="secondary" className="gap-1">
              Team: {teamOptions.find(opt => opt.value === team)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeArrayFilter('team', team)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.namespace.map((namespace) => (
            <Badge key={namespace} variant="secondary" className="gap-1">
              Namespace: {namespace}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeArrayFilter('namespace', namespace)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.environment.map((env) => (
            <Badge key={env} variant="secondary" className="gap-1">
              Environment: {environmentOptions.find(opt => opt.value === env)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeArrayFilter('environment', env)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {statusOptions.find(opt => opt.value === status)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeArrayFilter('status', status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}