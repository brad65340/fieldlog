import { ManagerDashboardClient } from '@/components/manager/ManagerDashboardClient'
import { ManagerNav } from '@/components/manager/ManagerNav'
import { BRAND } from '@/constants'

export const metadata = {
  title: 'Dashboard',
}

export default function ManagerHome() {
  return (
    <div className="min-h-screen md:pl-56" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <ManagerNav active="dashboard" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ManagerDashboardClient />
      </main>
    </div>
  )
}
