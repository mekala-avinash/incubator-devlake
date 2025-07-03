import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}