import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ApplicationDetail } from '@/components/manager/ApplicationDetail'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'
import { getApplicationById } from '@/lib/queries/getApplicationById'
import { createClient } from '@/lib/supabase/server'

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
    <div className="min-h-screen" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={ROUTES.manager} className="text-sm underline" style={{ color: BRAND.textLight }}>
            &larr; Back to dashboard
          </Link>
          <SignOutButton />
        </header>
        <ApplicationDetail app={app} />
      </main>
    </div>
  )
}
