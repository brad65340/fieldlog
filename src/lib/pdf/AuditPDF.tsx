// Server-rendered audit PDF for a single application.
// Helvetica only (built-in, no Font.register). Utilitarian and official --
// what an EPA inspector expects to see, not a designed brochure.
// Styles live in ./styles.ts so this file stays focused on layout.

import { Document, Page, Text, View } from '@react-pdf/renderer'
import { COMPLIANCE_PALETTE, COMPLIANCE_STATUS } from '@/constants'
import type { ApplicationDetailRow } from '@/lib/queries/getApplicationById'
import { styles } from './styles'

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={highlight ? styles.valueViolation : styles.value}>{value}</Text>
    </View>
  )
}

export function AuditPDF({ app }: { app: ApplicationDetailRow }) {
  const flagged = app.compliance_status === COMPLIANCE_STATUS.flagged
  const flags = app.compliance_flags ?? []
  const palette = COMPLIANCE_PALETTE[app.compliance_status]
  const generatedAt = new Date().toLocaleString()

  const w = app.weather_snapshots
  const p = app.products
  const windViolation = w?.wind_speed != null && p?.max_wind_speed != null && w.wind_speed > p.max_wind_speed
  const tempLow = w?.temperature != null && p?.min_temp != null && w.temperature < p.min_temp
  const tempHigh = w?.temperature != null && p?.max_temp != null && w.temperature > p.max_temp
  const tempViolation = tempLow || tempHigh
  const rateViolation = p?.max_rate_per_acre != null && app.rate_applied > p.max_rate_per_acre

  const contractorName = app.profiles ? `${app.profiles.first_name} ${app.profiles.last_name}` : '-'
  const fieldName = app.fields?.name ?? '-'
  const gpsText = app.lat != null && app.lng != null ? `${app.lat.toFixed(5)}, ${app.lng.toFixed(5)}` : 'Not captured'

  return (
    <Document title={`FieldLog Audit - ${app.id.slice(0, 8)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.brand}>FieldLog</Text>
            <Text style={styles.subtitle}>Pesticide Application Compliance Record</Text>
          </View>
          <Text style={styles.generated}>Generated: {generatedAt}</Text>
        </View>

        <View style={styles.recordBar}>
          <View>
            <Text style={styles.recordId}>Record ID: FL-{app.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.submitted}>Submitted: {new Date(app.submitted_at).toLocaleString()}</Text>
          </View>
          <Text style={{ ...styles.badge, backgroundColor: palette.solid }}>{palette.label}</Text>
        </View>

        {flagged && flags.length > 0 && (
          <View style={styles.flagsBox}>
            <Text style={styles.flagsTitle}>COMPLIANCE FLAGS DETECTED</Text>
            {flags.map((f, i) => <Text key={i} style={styles.flagItem}>- {f}</Text>)}
            <Text style={styles.flagsDisclaimer}>
              This application was logged with conditions that did not meet all EPA label requirements.
            </Text>
          </View>
        )}

        <Text style={styles.sectionHeader}>Application Details</Text>
        <Row label="Contractor Name" value={contractorName} />
        <Row label="Operation" value={app.operations?.name ?? '-'} />
        <Row label="Field" value={fieldName} />
        <Row label="Acreage Treated" value={`${app.acreage_treated} acres`} />
        <Row label="Application Start" value={new Date(app.application_start).toLocaleString()} />
        <Row label="Application End" value={app.application_end ? new Date(app.application_end).toLocaleString() : 'Not recorded'} />
        <Row label="GPS Coordinates" value={gpsText} />
        <Row label="Target Pest" value={app.target_pest ?? 'Not specified'} />
        <Row label="Notes" value={app.notes && app.notes.length > 0 ? app.notes : 'None'} />

        <Text style={styles.sectionHeader}>Product Information</Text>
        <Row label="Product Name" value={p?.name ?? '-'} />
        <Row label="EPA Registration No." value={p?.epa_reg_number ?? '-'} />
        <Row label="Active Ingredient" value={p?.active_ingredient ?? '-'} />
        <Row label="Restricted Use" value={p?.restricted_use ? 'Yes' : 'No'} />
        <Row label="Application Rate" value={`${app.rate_applied} ${app.rate_unit}`} highlight={rateViolation} />
        <Row label="Max Rate (label)" value={p?.max_rate_per_acre != null ? `${p.max_rate_per_acre} ${p.rate_unit ?? 'oz/acre'}` : 'Not specified'} />

        <Text style={styles.sectionHeader}>Weather Conditions at Time of Application</Text>
        {w ? (
          <>
            <Row label="Wind Speed" value={w.wind_speed != null ? `${w.wind_speed} mph` : '-'} highlight={windViolation} />
            <Row label="Wind Direction" value={w.wind_direction != null ? `${w.wind_direction} degrees` : '-'} />
            <Row label="Temperature" value={w.temperature != null ? `${w.temperature}F` : '-'} highlight={tempViolation} />
            <Row label="Humidity" value={w.humidity != null ? `${w.humidity}%` : '-'} />
            <Row label="Conditions" value={w.conditions ?? '-'} />
            <Row label="Data Source" value={w.source} />
            <Row label="Captured At" value={new Date(w.captured_at).toLocaleString()} />
          </>
        ) : (
          <Row label="Weather" value="No weather data captured (no GPS provided at submit time)." />
        )}

        <Text style={styles.sectionHeader}>Product Label Requirements</Text>
        <Row label="Maximum Wind Speed" value={p?.max_wind_speed != null ? `${p.max_wind_speed} mph` : 'Not specified'} highlight={windViolation} />
        <Row label="Temperature Range" value={p?.min_temp != null && p?.max_temp != null ? `${p.min_temp}F to ${p.max_temp}F` : 'Not specified'} highlight={tempViolation} />
        <Row label="Re-entry Interval" value={p?.re_entry_interval_hours != null ? `${p.re_entry_interval_hours} hours` : 'Not specified'} />
        <Row label="Pre-harvest Interval" value={p?.pre_harvest_interval_days != null ? `${p.pre_harvest_interval_days} days` : 'Not specified'} />

        <Text style={styles.footer} fixed>
          This record was generated by FieldLog and is immutable from the time of submission. Contractor logs cannot be altered after submission. For regulatory questions, consult the official EPA label at epa.gov. Generated {generatedAt}.
        </Text>
      </Page>
    </Document>
  )
}
