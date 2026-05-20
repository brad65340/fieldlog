import { ApplicationForm } from '@/components/contractor/ApplicationForm'
import { ContractorNav } from '@/components/contractor/ContractorNav'
import { OfflineBanner } from '@/components/contractor/OfflineBanner'
import { BRAND } from '@/constants'

export const metadata = {
  title: 'Log application',
}

export default function ContractorHome() {
  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <OfflineBanner />
      <ContractorNav active="log" />
      <main className="mx-auto max-w-md px-4 py-6">
        <ApplicationForm />
      </main>
    </div>
  )
}
