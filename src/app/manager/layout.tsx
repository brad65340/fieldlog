import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES, USER_ROLES } from '@/constants'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.login)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(ROUTES.login)
  if (profile.role !== USER_ROLES.manager) redirect(ROUTES.contractor)

  return <>{children}</>
}
