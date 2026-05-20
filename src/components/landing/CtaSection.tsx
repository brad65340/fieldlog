'use client'

import { useState, type FormEvent } from 'react'

// Early-access waitlist form. There's no backend for this in the demo;
// successful submit flips to an inline success state per Module 5.9 spec
// ("CTA form shows success state inline -- no alert"). Real waitlist
// persistence would be a Phase 6+ addition.

interface FormState {
  firstName: string
  lastName: string
  email: string
  operation: string
  properties: string
  contractors: string
}

const EMPTY: FormState = {
  firstName: '', lastName: '', email: '', operation: '', properties: '', contractors: '',
}

export function CtaSection() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState<string | null>(null)

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(form.email)
  }

  return (
    <section className="py-16 text-white md:py-20" style={{ backgroundColor: '#2C3E50' }} id="cta">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to Scale Without Losing Control?</h2>
        <p className="mx-auto mt-6 text-base leading-relaxed opacity-95 md:text-lg">
          Join our early access pilot program. Free seasonal access through October. Prove it works
          with your team before you commit.
        </p>

        {submitted ? (
          <div className="mt-10 rounded-lg p-8" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div
              aria-hidden
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-bold"
              style={{ color: '#16A34A' }}
            >
              &#10003;
            </div>
            <h3 className="mt-4 text-xl font-bold">You&apos;re on the list.</h3>
            <p className="mt-2 text-sm opacity-90">
              We&apos;ll contact {submitted} within 24 hours to schedule your free pilot.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 grid gap-4 text-left md:grid-cols-2">
            <Field label="First name" value={form.firstName} onChange={(v) => up('firstName', v)} required />
            <Field label="Last name" value={form.lastName} onChange={(v) => up('lastName', v)} required />
            <Field label="Email" type="email" full value={form.email} onChange={(v) => up('email', v)} required />
            <Field label="Operation name" full placeholder="e.g., Caspian Ag Services" value={form.operation} onChange={(v) => up('operation', v)} required />
            <Field label="Properties managed" type="number" min={1} full value={form.properties} onChange={(v) => up('properties', v)} required />
            <Field label="Contractors you work with" type="number" min={1} full value={form.contractors} onChange={(v) => up('contractors', v)} required />
            <button
              type="submit"
              className="rounded-lg px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:shadow-md md:col-span-2"
              style={{ backgroundColor: '#52896F' }}
            >
              Get Early Access
            </button>
          </form>
        )}

        {!submitted && (
          <p className="mt-4 text-xs opacity-90">
            We&apos;ll contact you within 24 hours to schedule your free pilot.
          </p>
        )}
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  full,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'email' | 'number'
  placeholder?: string
  min?: number
  full?: boolean
  required?: boolean
}) {
  return (
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-xs font-semibold text-white">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        required={required}
        className="w-full rounded-lg border-0 px-4 py-3 text-sm text-zinc-900 outline-none ring-1 ring-transparent focus:ring-2"
        style={{ backgroundColor: '#ffffff' }}
      />
    </label>
  )
}
