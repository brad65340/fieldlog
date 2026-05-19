'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BRAND, ROUTES, TAGLINE, USER_ROLES } from '@/constants'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const supabase = createClient()

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.user) {
      setError(signInError?.message ?? 'Sign in failed. Try again.')
      setSubmitting(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single()

    if (profileError || !profile) {
      setError('Account found but no profile is set up. Contact your operation manager.')
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    const target = profile.role === USER_ROLES.manager ? ROUTES.manager : ROUTES.contractor
    router.refresh()
    router.push(target)
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: BRAND.background, color: BRAND.text }}
    >
      <div
        className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm"
        style={{ borderColor: BRAND.border }}
      >
        <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
          FieldLog
        </h1>
        <p className="mt-1 text-sm" style={{ color: BRAND.textLight }}>
          {TAGLINE}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
              style={{ borderColor: BRAND.border }}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
              style={{ borderColor: BRAND.border }}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm" style={{ color: '#B91C1C' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded px-4 py-2 font-medium text-white transition disabled:opacity-60"
            style={{ backgroundColor: BRAND.primary }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
