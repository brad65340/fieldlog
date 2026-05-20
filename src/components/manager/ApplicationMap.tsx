'use client'

import L from 'leaflet'
import Link from 'next/link'
import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { ComplianceBadge } from '@/components/ui/ComplianceBadge'
import { BRAND, COMPLIANCE_PALETTE, ROUTES, type ComplianceStatus } from '@/constants'
import type { ManagerApplicationRow } from '@/hooks/useManagerApplications'

// Loaded via next/dynamic with ssr:false from ManagerDashboardClient -- leaflet
// touches `window` at import time, so it must never run on the server.
// Markers use DivIcon (HTML-rendered) instead of the default L.icon PNGs to
// sidestep the broken-image issue and to embed COMPLIANCE_PALETTE.symbol as a
// glyph inside the marker -- color + glyph = colorblind-safe at a glance.

interface Props {
  applications: ManagerApplicationRow[]
}

const DEFAULT_CENTER: [number, number] = [40.19, -92.58] // NE Missouri (seed area)
const DEFAULT_ZOOM = 14

function buildIcon(status: ComplianceStatus): L.DivIcon {
  const p = COMPLIANCE_PALETTE[status]
  const html = `
    <div style="
      background:${p.solid};
      color:#fff;
      width:28px;height:28px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:14px;line-height:1;
      border:2px solid #fff;
      box-shadow:0 1px 3px rgba(0,0,0,0.4);
    ">${p.symbol}</div>
  `
  return L.divIcon({
    className: 'fieldlog-marker',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export default function ApplicationMap({ applications }: Props) {
  const points = useMemo(
    () => applications.filter((a) => a.lat != null && a.lng != null),
    [applications],
  )

  const icons = useMemo<Record<ComplianceStatus, L.DivIcon>>(
    () => ({
      compliant: buildIcon('compliant'),
      flagged: buildIcon('flagged'),
      pending: buildIcon('pending'),
    }),
    [],
  )

  const center = useMemo<[number, number]>(() => {
    if (points.length === 0) return DEFAULT_CENTER
    const lat = points.reduce((s, p) => s + (p.lat ?? 0), 0) / points.length
    const lng = points.reduce((s, p) => s + (p.lng ?? 0), 0) / points.length
    return [lat, lng]
  }, [points])

  if (points.length === 0) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded border bg-white text-sm"
        style={{ borderColor: BRAND.border, color: BRAND.textLight }}
      >
        No applications have GPS coordinates yet.
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded border bg-white"
      style={{ borderColor: BRAND.border, height: '24rem' }}
    >
      <MapContainer center={center} zoom={DEFAULT_ZOOM} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {points.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat as number, a.lng as number]}
            icon={icons[a.compliance_status]}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-medium" style={{ color: BRAND.primary }}>
                  {a.fields?.name ?? '(unknown field)'}
                </p>
                <p style={{ color: BRAND.textLight }}>
                  {a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : '(unknown contractor)'}
                </p>
                <p style={{ color: BRAND.textLight }}>{a.products?.name ?? '(unknown product)'}</p>
                <p style={{ color: BRAND.textLight }}>
                  {new Date(a.application_start).toLocaleDateString()}
                </p>
                <div className="pt-1">
                  <ComplianceBadge status={a.compliance_status} />
                </div>
                <Link
                  href={ROUTES.managerApplication(a.id)}
                  className="block pt-1 text-xs font-medium underline"
                  style={{ color: BRAND.accent }}
                >
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
