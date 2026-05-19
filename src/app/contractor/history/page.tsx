import { HistoryList } from '@/components/contractor/HistoryList'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'
import Link from 'next/link'

export default function ContractorHistory() {
  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <main className="mx-auto max-w-md px-4 py-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold" style={{ color: BRAND.primary }}>
            History
          </h1>
          <nav className="flex items-center gap-4">
            <Link href={ROUTES.contractor} className="text-sm underline" style={{ color: BRAND.textLight }}>
              Log
            </Link>
            <SignOutButton />
          </nav>
        </header>
        <HistoryList />
      </main>
    </div>
  )
}
