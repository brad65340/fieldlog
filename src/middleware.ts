import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES, USER_ROLES } from '@/constants'

// Middleware runs on the Edge runtime in Next.js 15 (stable). @supabase/ssr's
// createServerClient is built for that. The non-null-asserted env reads below
// will throw a cryptic Supabase URL-parsing error if the vars are missing in
// production, which surfaces as MIDDLEWARE_INVOCATION_FAILED with no useful
// message in Vercel function logs. The explicit pre-check turns that into a
// readable "missing X" error so future deploys fail loudly with the cause.

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
      !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter(Boolean).join(', ')
    throw new Error(`[middleware] Missing required env var(s): ${missing}`)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isManagerPath = pathname.startsWith(ROUTES.manager)
  const isContractorPath = pathname.startsWith(ROUTES.contractor)
  const isLoginPath = pathname === ROUTES.login

  if (!user && (isManagerPath || isContractorPath)) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url))
  }

  if (user && (isManagerPath || isContractorPath || isLoginPath)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Authenticated but no profile row -- treat as unauthenticated.
      return NextResponse.redirect(new URL(ROUTES.login, request.url))
    }

    const role = profile.role

    if (isManagerPath && role !== USER_ROLES.manager) {
      return NextResponse.redirect(new URL(ROUTES.contractor, request.url))
    }
    if (isContractorPath && role !== USER_ROLES.contractor) {
      return NextResponse.redirect(new URL(ROUTES.manager, request.url))
    }
    if (isLoginPath) {
      const target = role === USER_ROLES.manager ? ROUTES.manager : ROUTES.contractor
      return NextResponse.redirect(new URL(target, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
