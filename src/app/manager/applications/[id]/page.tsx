import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ApplicationDetail } from '@/components/manager/ApplicationDetail'
import { ManagerNav } from '@/components/manager/ManagerNav'
import { BRAND, ROUTES } from '@/constants'
import { getApplicationById } from '@/lib/queries/getApplicationById'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return { title: `Audit FL-${id.slice(0, 8).toUpperCase()}` }
}

export default async function ManagerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Manager layout already auth-gated this route, but the layout can't pass
  // data to children -- re-fetch the caller's operation_id to scope the query.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('operation_id')
    .eq('id', user.id)
    .single()
  if (!profile?.operation_id) notFound()

  const app = await getApplicationById(id, profile.operation_id)
  if (!app) notFound()

  return (
    <div className="min-h-screen md:pl-56" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <ManagerNav active="dashboard" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href={ROUTES.manager}
          className="mb-4 inline-block text-sm underline"
          style={{ color: BRAND.textLight }}
        >
          &larr; Back to dashboard
        </Link>
        <ApplicationDetail app={app} />
      </main>
    </div>
  )
}
