// Phase 5 seed -- Caspian Ag Services demo dataset.
// Idempotent: wipes the Caspian operation (cascades through applications,
// fields, profiles) and re-inserts. Test Operation from Phase 1 bootstrap
// is left untouched. Auth users are created via admin API once; subsequent
// runs reuse them.
//
// Run with:  pnpm seed   (uses tsx --env-file=.env.local)

import { createClient, type User } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'FieldlogDemo2026!'

async function ensureAuthUser(email: string, firstName: string, lastName: string): Promise<User> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  })
  if (data?.user) {
    console.log(`    created  ${email}`)
    return data.user
  }
  if (error?.message && /registered|exists|already/i.test(error.message)) {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    if (listErr) throw listErr
    const found = list.users.find((u) => u.email === email)
    if (!found) throw new Error(`Could not locate existing auth user for ${email}`)
    console.log(`    reusing  ${email}`)
    return found
  }
  throw error
}

async function seed() {
  console.log('Seeding FieldLog -- Caspian Ag Services')

  console.log('[1/7] Auth users')
  const jake  = await ensureAuthUser('jake@caspianag.com',  'Jake',  'Caspian')
  const maria = await ensureAuthUser('maria@caspianag.com', 'Maria', 'Santos')
  const tyler = await ensureAuthUser('tyler@caspianag.com', 'Tyler', 'Reed')

  console.log('[2/7] Wiping existing Caspian operation (if any)')
  const { error: wipeErr } = await supabase
    .from('operations')
    .delete()
    .eq('name', 'Caspian Ag Services')
  if (wipeErr) throw wipeErr

  console.log('[3/7] Operation')
  const { data: op, error: opErr } = await supabase
    .from('operations')
    .insert({ name: 'Caspian Ag Services', owner_id: jake.id })
    .select()
    .single()
  if (opErr || !op) throw opErr ?? new Error('operation insert failed')

  console.log('[4/7] Profiles')
  const { error: profErr } = await supabase.from('profiles').insert([
    { id: jake.id,  operation_id: op.id, role: 'manager',    first_name: 'Jake',  last_name: 'Caspian', email: 'jake@caspianag.com'  },
    { id: maria.id, operation_id: op.id, role: 'contractor', first_name: 'Maria', last_name: 'Santos',  email: 'maria@caspianag.com' },
    { id: tyler.id, operation_id: op.id, role: 'contractor', first_name: 'Tyler', last_name: 'Reed',    email: 'tyler@caspianag.com' },
  ])
  if (profErr) throw profErr

  console.log('[5/7] Fields (NE Missouri, around Kirksville)')
  const { data: fields, error: fieldErr } = await supabase
    .from('fields')
    .insert([
      { operation_id: op.id, name: 'North Field',       acreage: 120, lat: 40.21, lng: -92.58 },
      { operation_id: op.id, name: 'South Creek Field', acreage: 85,  lat: 40.16, lng: -92.61 },
      { operation_id: op.id, name: 'East Timber Field', acreage: 60,  lat: 40.20, lng: -92.50 },
    ])
    .select()
  if (fieldErr || !fields) throw fieldErr ?? new Error('fields insert failed')
  const fieldByName = Object.fromEntries(fields.map((f) => [f.name, f]))

  console.log('[6/7] Products (upsert by epa_reg_number -- fills new label columns on re-run)')
  const productSpecs = [
    {
      name: 'Roundup PowerMax 3', epa_reg_number: '524-549', active_ingredient: 'Glyphosate',
      restricted_use: false, max_wind_speed: 10, min_temp: 40, max_temp: 90,
      re_entry_interval_hours: 4, pre_harvest_interval_days: 7,
      max_rate_per_acre: 64, rate_unit: 'oz/acre',
      signal_word: 'Caution',
      epa_label_url: 'https://www.cdms.net/ldat/ld8NC000.pdf',
      sds_url: null,
      use_classification: 'Non-restricted',
      application_method: 'Ground or aerial',
      target_pests: ['Annual broadleaf weeds', 'Annual grasses', 'Marestail', 'Waterhemp', 'Volunteer corn'],
      compatible_crops: ['Corn', 'Soybean', 'Cotton', 'Wheat', 'Fallow / pre-plant burndown'],
    },
    {
      name: 'Engenia (Dicamba)', epa_reg_number: '7969-345', active_ingredient: 'Dicamba',
      restricted_use: true, max_wind_speed: 10, min_temp: 50, max_temp: 85,
      re_entry_interval_hours: 24, pre_harvest_interval_days: 14,
      max_rate_per_acre: 12.8, rate_unit: 'oz/acre',
      signal_word: 'Caution',
      epa_label_url: 'https://www.cdms.net/ldat/ldABL000.pdf',
      sds_url: null,
      use_classification: 'Restricted Use',
      application_method: 'Ground only',
      target_pests: ['Glyphosate-resistant pigweed', 'Waterhemp', 'Palmer amaranth', 'Marestail'],
      compatible_crops: ['Dicamba-tolerant soybean', 'Corn'],
    },
    {
      name: 'Atrazine 4L', epa_reg_number: '100-497', active_ingredient: 'Atrazine',
      restricted_use: true, max_wind_speed: 10, min_temp: 40, max_temp: 90,
      re_entry_interval_hours: 12, pre_harvest_interval_days: 60,
      max_rate_per_acre: 32, rate_unit: 'oz/acre',
      signal_word: 'Caution',
      epa_label_url: 'https://www.cdms.net/ldat/ld3WF000.pdf',
      sds_url: null,
      use_classification: 'Restricted Use',
      application_method: 'Ground or aerial',
      target_pests: ['Broadleaf weeds', 'Annual grasses'],
      compatible_crops: ['Corn', 'Sorghum'],
    },
    {
      name: 'Liberty 280 SL', epa_reg_number: '264-829', active_ingredient: 'Glufosinate',
      restricted_use: false, max_wind_speed: 10, min_temp: 50, max_temp: 85,
      re_entry_interval_hours: 12, pre_harvest_interval_days: 7,
      max_rate_per_acre: 32, rate_unit: 'oz/acre',
      signal_word: 'Caution',
      epa_label_url: 'https://www.cdms.net/ldat/ldBKN000.pdf',
      sds_url: null,
      use_classification: 'Non-restricted',
      application_method: 'Ground or aerial',
      target_pests: ['Annual broadleaf weeds', 'Annual grasses', 'Waterhemp'],
      compatible_crops: ['LibertyLink soybean', 'LibertyLink corn', 'LibertyLink cotton', 'LibertyLink canola'],
    },
    {
      name: 'Headline AMP', epa_reg_number: '7969-326', active_ingredient: 'Pyraclostrobin',
      restricted_use: false, max_wind_speed: 10, min_temp: 40, max_temp: 85,
      re_entry_interval_hours: 12, pre_harvest_interval_days: 7,
      max_rate_per_acre: 14.4, rate_unit: 'oz/acre',
      signal_word: 'Caution',
      epa_label_url: 'https://www.cdms.net/ldat/ldCMQ000.pdf',
      sds_url: null,
      use_classification: 'Non-restricted',
      application_method: 'Ground or aerial',
      target_pests: ['Frogeye leaf spot', 'Cercospora leaf blight', 'Brown spot', 'Gray leaf spot'],
      compatible_crops: ['Soybean', 'Corn', 'Wheat'],
    },
  ]
  for (const spec of productSpecs) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('epa_reg_number', spec.epa_reg_number)
      .maybeSingle()
    if (existing) {
      const { error: uErr } = await supabase
        .from('products')
        .update(spec)
        .eq('id', existing.id)
      if (uErr) throw uErr
      console.log(`    updated  ${spec.epa_reg_number}  ${spec.name}`)
      continue
    }
    const { error: pErr } = await supabase.from('products').insert(spec)
    if (pErr) throw pErr
    console.log(`    created  ${spec.epa_reg_number}  ${spec.name}`)
  }
  const { data: products, error: prodFetchErr } = await supabase
    .from('products')
    .select('*')
    .in('epa_reg_number', productSpecs.map((p) => p.epa_reg_number))
  if (prodFetchErr || !products) throw prodFetchErr ?? new Error('products fetch failed')
  const productByEpa = Object.fromEntries(products.map((p) => [p.epa_reg_number, p]))

  console.log('[7/7] Applications + weather snapshots (5 compliant, 2 flagged, 1 pending)')
  const now = Date.now()
  const HOUR = 3600 * 1000
  const DAY = 24 * HOUR
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()

  const apps: Array<{
    label: string
    app: Record<string, unknown>
    weather: { wind_speed: number; wind_direction: number; temperature: number; humidity: number; conditions: string }
  }> = [
    {
      label: 'compliant -- Maria, North Field, Roundup, pre-plant burndown',
      app: {
        operation_id: op.id, contractor_id: maria.id,
        field_id: fieldByName['North Field'].id, product_id: productByEpa['524-549'].id,
        rate_applied: 24, rate_unit: 'oz/acre', acreage_treated: 95, target_pest: 'Marestail',
        application_start: iso(-14 * DAY), application_end: iso(-14 * DAY + 2 * HOUR),
        lat: 40.211, lng: -92.582,
        compliance_status: 'compliant', compliance_flags: [],
        notes: 'Pre-plant burndown.',
      },
      weather: { wind_speed: 5.2, wind_direction: 180, temperature: 68, humidity: 62, conditions: 'Clear' },
    },
    {
      label: 'compliant -- Maria, South Creek, Atrazine',
      app: {
        operation_id: op.id, contractor_id: maria.id,
        field_id: fieldByName['South Creek Field'].id, product_id: productByEpa['100-497'].id,
        rate_applied: 28, rate_unit: 'oz/acre', acreage_treated: 85, target_pest: 'Pigweed',
        application_start: iso(-11 * DAY), application_end: iso(-11 * DAY + 2 * HOUR),
        lat: 40.162, lng: -92.611,
        compliance_status: 'compliant', compliance_flags: [],
        notes: null,
      },
      weather: { wind_speed: 3.8, wind_direction: 200, temperature: 72, humidity: 55, conditions: 'Clear' },
    },
    {
      label: 'compliant -- Tyler, East Timber, Headline AMP fungicide',
      app: {
        operation_id: op.id, contractor_id: tyler.id,
        field_id: fieldByName['East Timber Field'].id, product_id: productByEpa['7969-326'].id,
        rate_applied: 12, rate_unit: 'oz/acre', acreage_treated: 60, target_pest: 'Frogeye leaf spot',
        application_start: iso(-7 * DAY), application_end: iso(-7 * DAY + 1.5 * HOUR),
        lat: 40.202, lng: -92.501,
        compliance_status: 'compliant', compliance_flags: [],
        notes: 'Routine fungicide pass.',
      },
      weather: { wind_speed: 6.5, wind_direction: 90, temperature: 70, humidity: 58, conditions: 'Clouds' },
    },
    {
      label: 'compliant -- Tyler, North Field, Liberty 280',
      app: {
        operation_id: op.id, contractor_id: tyler.id,
        field_id: fieldByName['North Field'].id, product_id: productByEpa['264-829'].id,
        rate_applied: 22, rate_unit: 'oz/acre', acreage_treated: 120, target_pest: 'Waterhemp',
        application_start: iso(-4 * DAY), application_end: iso(-4 * DAY + 2.5 * HOUR),
        lat: 40.211, lng: -92.582,
        compliance_status: 'compliant', compliance_flags: [],
        notes: null,
      },
      weather: { wind_speed: 4.0, wind_direction: 270, temperature: 75, humidity: 50, conditions: 'Clear' },
    },
    {
      label: 'compliant -- Maria, East Timber, Roundup',
      app: {
        operation_id: op.id, contractor_id: maria.id,
        field_id: fieldByName['East Timber Field'].id, product_id: productByEpa['524-549'].id,
        rate_applied: 32, rate_unit: 'oz/acre', acreage_treated: 60, target_pest: 'Volunteer corn',
        application_start: iso(-2 * DAY), application_end: iso(-2 * DAY + 1.5 * HOUR),
        lat: 40.201, lng: -92.501,
        compliance_status: 'compliant', compliance_flags: [],
        notes: null,
      },
      weather: { wind_speed: 6.2, wind_direction: 160, temperature: 64, humidity: 65, conditions: 'Clear' },
    },
    {
      label: 'FLAGGED (wind) -- Maria, North Field, Roundup, 14.2 mph > 10 mph max -- the demo money moment',
      app: {
        operation_id: op.id, contractor_id: maria.id,
        field_id: fieldByName['North Field'].id, product_id: productByEpa['524-549'].id,
        rate_applied: 24, rate_unit: 'oz/acre', acreage_treated: 95, target_pest: 'Marestail',
        application_start: iso(-3 * DAY), application_end: iso(-3 * DAY + 2 * HOUR),
        lat: 40.211, lng: -92.582,
        compliance_status: 'flagged',
        compliance_flags: ['Wind speed 14.2 mph exceeded label limit of 10 mph'],
        notes: 'Conditions deteriorated during application.',
      },
      weather: { wind_speed: 14.2, wind_direction: 230, temperature: 66, humidity: 60, conditions: 'Clear' },
    },
    {
      label: 'FLAGGED (temp) -- Tyler, South Creek, Engenia, 92F > 85F max',
      app: {
        operation_id: op.id, contractor_id: tyler.id,
        field_id: fieldByName['South Creek Field'].id, product_id: productByEpa['7969-345'].id,
        rate_applied: 11, rate_unit: 'oz/acre', acreage_treated: 85, target_pest: 'Glyphosate-resistant pigweed',
        application_start: iso(-1 * DAY - 4 * HOUR), application_end: iso(-1 * DAY - 2 * HOUR),
        lat: 40.162, lng: -92.611,
        compliance_status: 'flagged',
        compliance_flags: ['Temperature 92F exceeded label maximum of 85F'],
        notes: null,
      },
      weather: { wind_speed: 5.5, wind_direction: 200, temperature: 92, humidity: 35, conditions: 'Clear' },
    },
    {
      label: 'PENDING -- Tyler, East Timber, Liberty, submitted 30 min ago',
      app: {
        operation_id: op.id, contractor_id: tyler.id,
        field_id: fieldByName['East Timber Field'].id, product_id: productByEpa['264-829'].id,
        rate_applied: 22, rate_unit: 'oz/acre', acreage_treated: 60, target_pest: 'Waterhemp',
        application_start: iso(-2 * HOUR), application_end: iso(-30 * 60 * 1000),
        lat: 40.201, lng: -92.501,
        compliance_status: 'pending', compliance_flags: null,
        notes: 'Just finished.',
      },
      weather: { wind_speed: 5.1, wind_direction: 150, temperature: 71, humidity: 55, conditions: 'Clear' },
    },
  ]

  for (const { label, app, weather } of apps) {
    const { data: inserted, error: appErr } = await supabase
      .from('applications')
      .insert(app)
      .select('id')
      .single()
    if (appErr || !inserted) throw appErr ?? new Error(`app insert failed: ${label}`)
    const { error: wErr } = await supabase
      .from('weather_snapshots')
      .insert({ ...weather, application_id: inserted.id })
    if (wErr) throw wErr
    console.log(`    inserted ${label}`)
  }

  console.log()
  console.log('Seed complete.')
  console.log(`  Operation:    ${op.name}  (${op.id})`)
  console.log(`  Manager:      jake@caspianag.com   /  ${DEMO_PASSWORD}`)
  console.log(`  Contractors:  maria@caspianag.com, tyler@caspianag.com  /  ${DEMO_PASSWORD}`)
  console.log(`  Fields:       ${fields.length}`)
  console.log(`  Products:     ${products.length}`)
  console.log(`  Applications: ${apps.length}  (5 compliant, 2 flagged, 1 pending)`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
