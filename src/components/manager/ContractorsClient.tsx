'use client'

import { BRAND } from '@/constants'
import { useContractors } from '@/hooks/useContractors'
import { ContractorList } from './ContractorList'
import { CreateContractorForm } from './CreateContractorForm'

export function ContractorsClient() {
  const { contractors, loading, error, refetch } = useContractors()

  return (
    <div className="space-y-6">
      <CreateContractorForm onCreated={refetch} />
      {error && <p className="text-sm" style={{ color: BRAND.error }}>{error}</p>}
      {loading ? (
        <p className="text-sm" style={{ color: BRAND.textLight }}>Loading...</p>
      ) : (
        <ContractorList contractors={contractors} />
      )}
    </div>
  )
}
