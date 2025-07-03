"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Home, 
  AlertTriangle, 
  FileText, 
  Github,
  Wrench,
  GitBranch,
  CheckSquare,
  Cloud,
  Shield,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AVAILABLE_TOOLS } from '@/types/metrics'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const iconMap = {
  Home,
  BarChart3,
  AlertTriangle,
  FileText,
  Github,
  Wrench,
  GitBranch,
  CheckSquare,
  Cloud,
  Shield,
}

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: 'Home',
    badge: null,
  },
  {
    title: 'Tools',
    items: AVAILABLE_TOOLS.map(tool => ({
      title: tool.name,
      href: `/dashboard/${tool.id}`,
      icon: tool.icon as keyof typeof iconMap,
      badge: null,
    })),
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: 'AlertTriangle',
    badge: '3',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: 'FileText',
    badge: null,
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-semibold">DevLake</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map((item, index) => {
              if ('items' in item) {
                // Section with sub-items
                return (
                  <div key={index} className="space-y-1">
                    <div className="px-2 py-1">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {item.items.map((subItem) => {
                        const Icon = iconMap[subItem.icon] || Home
                        const isActive = pathname === subItem.href
                        
                        return (
                          <Link key={subItem.href} href={subItem.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-between",
                                isActive && "bg-secondary"
                              )}
                              onClick={onClose}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </div>
                              {subItem.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              } else {
                // Regular navigation item
                const Icon = iconMap[item.icon as keyof typeof iconMap] || Home
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-between",
                        isActive && "bg-secondary"
                      )}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )
              }
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <div>Apache DevLake</div>
              <div>Dashboard v2.0</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}