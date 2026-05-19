import Link from 'next/link'
import { ManagerDashboardClient } from '@/components/manager/ManagerDashboardClient'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'

export default function ManagerHome() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
            Manager
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href={ROUTES.managerContractors}
              className="text-sm underline"
              style={{ color: BRAND.textLight }}
            >
              Contractors
            </Link>
            <SignOutButton />
          </nav>
        </header>
        <ManagerDashboardClient />
      </main>
    </div>
  )
}
