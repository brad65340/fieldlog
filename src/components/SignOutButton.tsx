'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BRAND, ROUTES } from '@/constants'

export function SignOutButton() {
  const router = useRouter()
  const [signing, setSigning] = useState(false)

  async function signOut() {
    setSigning(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push(ROUTES.login)
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={signing}
      className="text-sm underline disabled:opacity-60"
      style={{ color: BRAND.textLight }}
    >
      {signing ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
