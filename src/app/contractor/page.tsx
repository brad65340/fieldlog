import { ApplicationForm } from '@/components/contractor/ApplicationForm'
import { OfflineBanner } from '@/components/contractor/OfflineBanner'
import { BRAND, ROUTES } from '@/constants'
import Link from 'next/link'

export default function ContractorHome() {
  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <OfflineBanner />
      <main className="mx-auto max-w-md px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: BRAND.primary }}>
            Log application
          </h1>
          <Link href={ROUTES.contractorHistory} className="text-sm underline" style={{ color: BRAND.textLight }}>
            History
          </Link>
        </header>
        <ApplicationForm />
      </main>
    </div>
  )
}
