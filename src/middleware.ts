import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES, USER_ROLES } from '@/constants'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
