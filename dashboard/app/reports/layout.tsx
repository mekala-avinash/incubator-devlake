import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}