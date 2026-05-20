import { ContractorNav } from '@/components/contractor/ContractorNav'
import { HistoryList } from '@/components/contractor/HistoryList'
import { BRAND } from '@/constants'

export const metadata = {
  title: 'History',
}

export default function ContractorHistory() {
  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <ContractorNav active="history" />
      <main className="mx-auto max-w-md px-4 py-6">
        <HistoryList />
      </main>
    </div>
  )
}
