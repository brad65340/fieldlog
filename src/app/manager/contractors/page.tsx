import Link from 'next/link'
import { ContractorsClient } from '@/components/manager/ContractorsClient'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'

export default function ContractorsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
            Contractors
          </h1>
          <nav className="flex items-center gap-4">
            <Link href={ROUTES.manager} className="text-sm underline" style={{ color: BRAND.textLight }}>
              &larr; Dashboard
            </Link>
            <SignOutButton />
          </nav>
        </header>
        <ContractorsClient />
      </main>
    </div>
  )
}
