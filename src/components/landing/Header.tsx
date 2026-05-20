import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Logo } from './Logo'

// Sticky top nav for the landing page. On mobile the Features / How It Works
// text links collapse and only the Login + Sign Up buttons stay visible
// (matches the original mobile.css rule .nav-links a:not(.btn) { display: none }).

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b bg-white shadow-sm"
      style={{ borderColor: '#e8e7e5' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" aria-label="FieldLog home" className="w-40">
          <Logo className="h-auto w-full" />
        </Link>
        <nav className="flex items-center gap-5 md:gap-10">
          <a
            href="#features"
            className="hidden text-sm font-medium md:block"
            style={{ color: '#1a1a2e' }}
          >
            Features
          </a>
          <a
            href="#how"
            className="hidden text-sm font-medium md:block"
            style={{ color: '#1a1a2e' }}
          >
            How It Works
          </a>
          <Link
            href={ROUTES.login}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
            style={{ borderColor: '#2C3E50', color: '#2C3E50' }}
          >
            Login
          </Link>
          <Link
            href={ROUTES.login}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: '#2C3E50' }}
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  )
}
