import {
  ActiveRestrictionsList,
  type FieldRestriction,
} from '@/components/manager/ActiveRestrictionsList'
import { FieldTimeline, type TimelineField } from '@/components/manager/FieldTimeline'
import { ManagerNav } from '@/components/manager/ManagerNav'
import { BRAND } from '@/constants'
import { computeRestriction, MS_PER_DAY } from '@/lib/restrictions'
import { createClient } from '@/lib/supabase/server'
import type { Field } from '@/types'

export const metadata = {
  title: 'Timetable',
}

// RLS scopes fields + applications to the caller's operation
// (operation_members_read_fields / operation_members_read_applications).
// The manager layout already gated this route; this server component just
// fetches and computes.

interface RawApplicationRow {
  id: string
  field_id: string
  application_start: string
  fields: { name: string; acreage: number | null } | null
  products: {
    name: string
    re_entry_interval_hours: number | null
    pre_harvest_interval_days: number | null
  } | null
  profiles: { first_name: string; last_name: string } | null
}

const TIMELINE_LOOKBACK_DAYS = 30

export default async function ManagerTimetablePage() {
  const supabase = await createClient()

  const [{ data: fieldRows }, { data: appRows }] = await Promise.all([
    supabase.from('fields').select('*').order('name'),
    supabase
      .from('applications')
      .select(
        'id, field_id, application_start, fields(name, acreage), products(name, re_entry_interval_hours, pre_harvest_interval_days), profiles(first_name, last_name)',
      )
      .gte(
        'application_start',
        new Date(Date.now() - TIMELINE_LOOKBACK_DAYS * MS_PER_DAY).toISOString(),
      )
      .order('application_start', { ascending: false }),
  ])

  const fields = (fieldRows as Field[] | null) ?? []
  const applications = (appRows as RawApplicationRow[] | null) ?? []

  const restrictions: FieldRestriction[] = fields.map((field) => {
    const last = applications.find((a) => a.field_id === field.id) ?? null
    const restriction = last
      ? computeRestriction(
          last.application_start,
          last.products?.re_entry_interval_hours ?? null,
          last.products?.pre_harvest_interval_days ?? null,
        )
      : null
    return {
      field_id: field.id,
      field_name: field.name,
      field_acreage: field.acreage,
      last_application_start: last?.application_start ?? null,
      product_name: last?.products?.name ?? null,
      contractor_name: last?.profiles
        ? `${last.profiles.first_name} ${last.profiles.last_name}`
        : null,
      restriction,
    }
  })

  const timelineFields: TimelineField[] = fields.map((field) => ({
    field_id: field.id,
    field_name: field.name,
    applications: applications
      .filter((a) => a.field_id === field.id)
      .map((a) => ({
        id: a.id,
        application_start: a.application_start,
        re_entry_hours: a.products?.re_entry_interval_hours ?? null,
        product_name: a.products?.name ?? null,
      })),
  }))

  return (
    <div className="min-h-screen md:pl-56" style={{ backgroundColor: BRAND.background, color: BRAND.text }}>
      <ManagerNav active="timetable" />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
            Field timetable
          </h1>
          <p className="mt-1 text-sm" style={{ color: BRAND.textLight }}>
            Re-entry and pre-harvest restrictions across every field on your operation.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND.primary }}>
            Active restrictions
          </h2>
          <ActiveRestrictionsList rows={restrictions} />
        </section>

        <FieldTimeline fields={timelineFields} />
      </main>
    </div>
  )
}
