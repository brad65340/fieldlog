'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { BRAND, type ComplianceStatus } from '@/constants'
import { useFields } from '@/hooks/useFields'
import { useProducts } from '@/hooks/useProducts'
import type { ApplicationSubmitInput } from '@/schemas'
import { ComplianceResult } from './ComplianceResult'
import { INPUT_CLS, INPUT_STYLE, Row, Section } from './FormControls'
import { GpsCapture } from './GpsCapture'
import { ProductQuickRef } from './ProductQuickRef'
import { SprayWindowIndicator } from './SprayWindowIndicator'

interface SubmitResult {
  applicationId: string
  complianceStatus: ComplianceStatus
  flags: string[]
  submittedAt: string
}

interface FormState {
  field_id: string
  product_id: string
  rate_applied: string
  rate_unit: string
  acreage_treated: string
  target_pest: string
  application_start: string
  notes: string
}

const EMPTY: FormState = {
  field_id: '', product_id: '', rate_applied: '', rate_unit: 'oz/acre',
  acreage_treated: '', target_pest: '', application_start: '', notes: '',
}

export function ApplicationForm() {
  const { fields, loading: fieldsLoading } = useFields()
  const { products, loading: productsLoading } = useProducts()
  const [form, setForm] = useState<FormState>(EMPTY)
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === form.product_id) ?? null,
    [products, form.product_id],
  )
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function captureGps() {
    setGpsError(null)
    if (!navigator.geolocation) {
      setGpsError('Geolocation not available on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (e) => setGpsError(`Location not captured: ${e.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function reset() {
    setForm(EMPTY)
    setGps(null)
    setGpsError(null)
    setResult(null)
    setSubmitError(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    const payload: ApplicationSubmitInput = {
      field_id: form.field_id,
      product_id: form.product_id,
      rate_applied: Number(form.rate_applied),
      rate_unit: form.rate_unit,
      acreage_treated: Number(form.acreage_treated),
      target_pest: form.target_pest || undefined,
      application_start: new Date(form.application_start).toISOString(),
      lat: gps?.lat,
      lng: gps?.lng,
      notes: form.notes || undefined,
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? `Request failed (${res.status})`)
        return
      }
      setResult({
        applicationId: data.applicationId,
        complianceStatus: data.complianceStatus,
        flags: data.flags ?? [],
        submittedAt: new Date().toISOString(),
      })
    } catch {
      setSubmitError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return <ComplianceResult applicationId={result.applicationId} status={result.complianceStatus} flags={result.flags} submittedAt={result.submittedAt} onLogAnother={reset} />
  }
  if (fieldsLoading || productsLoading) {
    return <div className="space-y-3"><SkeletonCard height="9rem" /><SkeletonCard height="12rem" /></div>
  }
  if (fields.length === 0) {
    return <EmptyState title="No fields configured" body="Ask your manager to add fields before logging applications." />
  }
  if (products.length === 0) {
    return <EmptyState title="No products available" body="Contact your administrator to add products to the catalog." />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Field & Product">
        <Row label="Field">
          <select required value={form.field_id} onChange={(e) => up('field_id', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE}>
            <option value="">Select a field</option>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.name}{f.acreage ? ` (${f.acreage} ac)` : ''}</option>)}
          </select>
        </Row>

        <Row label="Product">
          <select required value={form.product_id} onChange={(e) => up('product_id', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE}>
            <option value="">Select a product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} - EPA {p.epa_reg_number}{p.restricted_use ? ' [RESTRICTED]' : ''}</option>)}
          </select>
        </Row>

        {selectedProduct && <ProductQuickRef product={selectedProduct} />}
      </Section>

      <Section title="Application Details">
        <Row label="Rate applied">
          <div className="flex gap-2">
            <input type="number" step="0.1" min="0" required placeholder="e.g. 24" value={form.rate_applied} onChange={(e) => up('rate_applied', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
            <select value={form.rate_unit} onChange={(e) => up('rate_unit', e.target.value)} className="rounded border px-3 py-2 text-base" style={INPUT_STYLE}>
              <option value="oz/acre">oz/acre</option>
              <option value="lb/acre">lb/acre</option>
              <option value="gal/acre">gal/acre</option>
            </select>
          </div>
        </Row>

        <Row label="Acreage treated">
          <input type="number" step="0.1" min="0" required placeholder="e.g. 95" value={form.acreage_treated} onChange={(e) => up('acreage_treated', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
        </Row>

        <Row label="Target pest (optional)">
          <input type="text" maxLength={200} placeholder="e.g. Marestail" value={form.target_pest} onChange={(e) => up('target_pest', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
        </Row>

        <Row label="Application start">
          <input type="datetime-local" required value={form.application_start} onChange={(e) => up('application_start', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
        </Row>

        <Row label="Notes (optional)">
          <textarea maxLength={1000} rows={3} value={form.notes} onChange={(e) => up('notes', e.target.value)} className={INPUT_CLS} style={INPUT_STYLE} />
        </Row>
      </Section>

      <Section title="Location">
        <GpsCapture gps={gps} error={gpsError} onCapture={captureGps} />
        {gps && <SprayWindowIndicator lat={gps.lat} lng={gps.lng} product={selectedProduct} />}
      </Section>

      {submitError && <p role="alert" className="text-sm" style={{ color: BRAND.error }}>{submitError}</p>}

      <button type="submit" disabled={submitting} className="w-full rounded-lg px-4 py-3 text-base font-semibold text-white disabled:opacity-60" style={{ backgroundColor: BRAND.accent }}>
        {submitting ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}
