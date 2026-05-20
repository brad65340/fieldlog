// POST /api/contractors -- manager creates a new contractor account.
// Order: auth -> role -> rate limit -> input -> business logic.
// Generates a 32-char hex temp password via crypto.randomUUID() (decision D3).
// The temp password is returned ONCE in the response body and is NEVER logged.
// 201 { contractorId, tempPassword }; 400/401/409/429/500 { error }.
// 403 NEVER used for unauthorized -- always 401 here (caller is the wrong role)
// or 404 for resources, per Hard Rule 7.

import { type NextRequest, NextResponse } from 'next/server'
import { USER_ROLES } from '@/constants'
import { rateLimit } from '@/lib/ratelimit'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { CreateContractorSchema } from '@/schemas'

const err = (status: number, msg: string) =>
  NextResponse.json({ error: msg }, { status })

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return err(401, 'Unauthorized')

  // 2. Role check + operation scope
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, operation_id')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== USER_ROLES.manager) return err(401, 'Unauthorized')

  // 3. Rate limit
  const allowed = await rateLimit(user.id, 'contractors:create')
  if (!allowed) return err(429, 'Too many requests')

  // 4. Input validation
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return err(400, 'Invalid input')
  }
  const parsed = CreateContractorSchema.safeParse(raw)
  if (!parsed.success) return err(400, 'Invalid input')
  const input = parsed.data

  // 5. Generate cryptographically secure temp password (D3).
  const tempPassword = crypto.randomUUID().replace(/-/g, '')

  // 6. Create the auth user via service-role admin API.
  const admin = createServiceClient()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { first_name: input.first_name, last_name: input.last_name },
  })
  if (createErr || !created?.user) {
    if (createErr?.message && /registered|exists|already/i.test(createErr.message)) {
      return err(409, 'Email already in use')
    }
    console.error('[contractors] auth.admin.createUser failed', createErr)
    return err(500, 'Internal server error')
  }

  // 7. Insert the profile, scoped to the caller's operation.
  const { error: profErr } = await admin.from('profiles').insert({
    id: created.user.id,
    operation_id: profile.operation_id,
    role: USER_ROLES.contractor,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
  })
  if (profErr) {
    // Profile insert failed after auth user creation. Compensate by deleting
    // the orphan auth user so a retry can use the same email.
    console.error('[contractors] profile insert failed; deleting orphan auth user', profErr)
    await admin.auth.admin.deleteUser(created.user.id)
    return err(500, 'Internal server error')
  }

  // 8. Return. tempPassword goes back to the caller exactly once.
  return NextResponse.json(
    { contractorId: created.user.id, tempPassword },
    { status: 201 }
  )
}
