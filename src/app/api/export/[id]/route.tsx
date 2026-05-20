// GET /api/export/[id] -- audit PDF for a single application.
// Order: auth -> manager role -> rate limit -> shared query -> render -> binary.
// 200 application/pdf; 401 wrong role; 404 not in caller's operation
// (per Hard Rule 7, no 403 for unauthorized resources); 429 rate-limited;
// 500 render failure. Never exposes internals.
//
// Runtime is forced to Node because @react-pdf/renderer depends on pdfkit
// (Node-only). dynamic = 'force-dynamic' because every PDF is freshly
// generated -- no caching.

import { renderToBuffer } from '@react-pdf/renderer'
import { type NextRequest, NextResponse } from 'next/server'
import { USER_ROLES } from '@/constants'
import { AuditPDF } from '@/lib/pdf/AuditPDF'
import { getApplicationById } from '@/lib/queries/getApplicationById'
import { rateLimit } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const err = (status: number, msg: string) =>
  NextResponse.json({ error: msg }, { status })

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return err(401, 'Unauthorized')

  // 2. Manager role + caller operation_id (for the ownership filter)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, operation_id')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== USER_ROLES.manager) return err(401, 'Unauthorized')

  // 3. Rate limit
  const allowed = await rateLimit(user.id, 'export:pdf')
  if (!allowed) return err(429, 'Too many requests')

  // 4. Fetch via shared helper (null when not found OR wrong op).
  const app = await getApplicationById(id, profile.operation_id)
  if (!app) return err(404, 'Not found')

  // 5. Render PDF.
  let buffer: Buffer
  try {
    buffer = await renderToBuffer(<AuditPDF app={app} />)
  } catch (renderErr) {
    console.error('[export] PDF render failed', renderErr)
    return err(500, 'Internal server error')
  }

  // 6. Binary response. Node 22+ types declare both Buffer and Uint8Array
  // against ArrayBufferLike (which includes SharedArrayBuffer), but
  // NextResponse's BodyInit type wants Uint8Array<ArrayBuffer> specifically.
  // The runtime is correct; cast to BodyInit to bypass the TS narrowing.
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="FieldLog-Audit-${id.slice(0, 8).toUpperCase()}.pdf"`,
      'Content-Length': String(buffer.length),
    },
  })
}
