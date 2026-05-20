import { ContractorsClient } from '@/components/manager/ContractorsClient'
import { ManagerNav } from '@/components/manager/ManagerNav'
import { BRAND } from '@/constants'

export const metadata = {
  title: 'Contractors',
}

export default function ContractorsPage() {
  return (
    <div className="min-h-screen md:pl-56" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <ManagerNav active="contractors" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ContractorsClient />
      </main>
    </div>
  )
}
