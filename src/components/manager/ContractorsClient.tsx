'use client'

import { SkeletonRow } from '@/components/ui/Skeleton'
import { BRAND } from '@/constants'
import { useContractors } from '@/hooks/useContractors'
import { ContractorList } from './ContractorList'
import { CreateContractorForm } from './CreateContractorForm'

export function ContractorsClient() {
  const { contractors, loading, error, refetch } = useContractors()

  return (
    <div className="space-y-6">
      <CreateContractorForm onCreated={refetch} />
      {error && <p className="text-sm font-medium" style={{ color: BRAND.error }}>[!] {error}</p>}
      {loading ? (
        <div className="space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <ContractorList contractors={contractors} />
      )}
    </div>
  )
}
