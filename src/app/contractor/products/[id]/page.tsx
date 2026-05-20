import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContractorNav } from '@/components/contractor/ContractorNav'
import { ProductDetail, type RecentUse } from '@/components/contractor/ProductDetail'
import { BRAND, ROUTES } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types'

export const metadata = {
  title: 'Product detail',
}

export default async function ContractorProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: productRow } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!productRow) notFound()

  // Recent use is RLS-scoped to the caller's operation via
  // operation_members_read_applications. Ordered by application_start (when
  // the spray happened) rather than submitted_at so a backdated entry doesn't
  // surface as "most recent" just because it was logged late.
  const { data: lastAppRow } = await supabase
    .from('applications')
    .select(
      'id, application_start, compliance_status, compliance_flags, fields(name), profiles(first_name, last_name)',
    )
    .eq('product_id', id)
    .order('application_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <ContractorNav active="products" />
      <main className="mx-auto max-w-md px-4 py-6">
        <Link
          href={ROUTES.contractorProducts}
          className="text-sm underline"
          style={{ color: BRAND.textLight }}
        >
          &larr; All products
        </Link>
        <ProductDetail
          product={productRow as Product}
          lastApp={(lastAppRow as RecentUse | null) ?? null}
        />
      </main>
    </div>
  )
}
