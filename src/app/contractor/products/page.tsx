import { ContractorNav } from '@/components/contractor/ContractorNav'
import { ProductCard } from '@/components/contractor/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { BRAND } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types'

export const metadata = {
  title: 'Products',
}

export default async function ContractorProductsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  const products = (data as Product[] | null) ?? []

  return (
    <div style={{ backgroundColor: BRAND.background, color: BRAND.text }} className="min-h-screen">
      <ContractorNav active="products" />
      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-1 text-xl font-semibold" style={{ color: BRAND.primary }}>
          Product library
        </h1>
        <p className="mb-4 text-sm" style={{ color: BRAND.textLight }}>
          Label limits and safety info for every product you can spray on this operation.
        </p>

        {error && (
          <EmptyState
            title="Could not load products"
            body={error.message}
            tone="error"
          />
        )}

        {!error && products.length === 0 && (
          <EmptyState
            title="No products configured yet"
            body="Contact your administrator to add products to the catalog."
          />
        )}

        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
