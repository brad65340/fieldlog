'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BRAND } from '@/constants'

// Manager creates a contractor account. On success the temp password from
// the API is shown ONCE -- visible for 30s, then auto-cleared (Phase 3 doc).
// The password is never logged; it lives in component state only while
// visible. onCreated() triggers the parent to refetch the contractor list.

const EMPTY = { email: '', first_name: '', last_name: '' }
const CLEAR_AFTER_MS = 30_000

export function CreateContractorForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justCreated, setJustCreated] = useState<{ name: string; password: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  function scheduleClear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setJustCreated(null), CLEAR_AFTER_MS)
  }

  function clearNow() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setJustCreated(null)
  }

  function up<K extends keyof typeof EMPTY>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `Failed (${res.status})`)
        return
      }
      setJustCreated({
        name: `${form.first_name.trim()} ${form.last_name.trim()}`,
        password: data.tempPassword,
      })
      scheduleClear()
      setForm(EMPTY)
      onCreated()
    } catch (err) {
      console.error('[CreateContractorForm] submit failed', err)
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded border bg-white p-4" style={{ borderColor: BRAND.border }}>
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
        Add contractor
      </h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="First name" value={form.first_name} onChange={(v) => up('first_name', v)} required maxLength={100} />
          <Field label="Last name" value={form.last_name} onChange={(v) => up('last_name', v)} required maxLength={100} />
          <Field label="Email" type="email" value={form.email} onChange={(v) => up('email', v)} required />
        </div>
        {error && <p role="alert" className="text-sm" style={{ color: BRAND.error }}>{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: BRAND.primary }}
        >
          {submitting ? 'Creating...' : 'Create contractor'}
        </button>
      </form>

      {justCreated && (
        <div
          className="mt-4 rounded border-l-4 p-3 text-sm"
          style={{ backgroundColor: '#FEFCE8', borderLeftColor: '#CA8A04', color: '#713F12' }}
        >
          <p className="font-semibold">Share this password with {justCreated.name}:</p>
          <p className="mt-1 break-all font-mono">{justCreated.password}</p>
          <p className="mt-2 text-xs">
            Visible for 30 seconds. It will not be shown again.{' '}
            <button type="button" onClick={clearNow} className="underline">Hide now</button>
          </p>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false, maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email'
  required?: boolean
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: BRAND.textLight }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        className="w-full rounded border px-3 py-2 text-sm"
        style={{ borderColor: BRAND.border }}
      />
    </label>
  )
}
