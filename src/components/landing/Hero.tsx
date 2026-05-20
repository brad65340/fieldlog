import Link from 'next/link'
import { ROUTES, TAGLINE } from '@/constants'

// Hero section: brand tagline + paragraph + two CTAs (both wired to /login
// per Module 5.9 spec) + the phone-mockup SVG copied straight from the HTML
// source. Background is the same diagonal cream-to-white gradient as the
// original.

export function Hero() {
  return (
    <section
      className="border-b py-20 md:py-24"
      style={{
        borderColor: '#e8e7e5',
        background: 'linear-gradient(135deg, #f5f4f2 0%, #ffffff 100%)',
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:gap-14">
        <div>
          <h1
            className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ color: '#2C3E50' }}
          >
            {TAGLINE}
          </h1>
          <p className="mt-6 text-base leading-relaxed md:text-lg" style={{ color: '#4a4a68' }}>
            The only mobile-first platform built for mid-to-large operations managing contractors.
            Consolidate EPA regulations, weather, and contractor logs into one immutable,
            audit-ready record.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={ROUTES.login}
                className="rounded-lg px-8 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:shadow-md"
                style={{ backgroundColor: '#2C3E50' }}
              >
                Get Started
              </Link>
              <Link
                href={ROUTES.login}
                className="rounded-lg border-2 px-8 py-4 text-center text-base font-semibold transition"
                style={{ borderColor: '#2C3E50', color: '#2C3E50' }}
              >
                Sign Up for Early Access
              </Link>
            </div>
            <p className="text-xs" style={{ color: '#4a4a68' }}>
              Free seasonal pilot. No credit card required.
            </p>
          </div>
        </div>

        <PhoneMockup />
      </div>
    </section>
  )
}

function PhoneMockup() {
  return (
    <div
      className="flex h-80 items-center justify-center rounded-2xl p-10 shadow-lg md:h-96"
      style={{ background: 'linear-gradient(135deg, #52896F 0%, #5A8F6E 100%)' }}
      aria-hidden
    >
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        <rect x="30" y="10" width="140" height="260" rx="14" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" />
        <rect x="40" y="25" width="120" height="16" rx="4" fill="rgba(255,255,255,0.4)" />
        <rect x="40" y="50" width="80" height="12" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="130" y="50" width="30" height="12" rx="6" fill="#16A34A" />
        <rect x="40" y="72" width="80" height="12" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="130" y="72" width="30" height="12" rx="6" fill="#DC2626" />
        <rect x="40" y="94" width="120" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
        <rect x="40" y="112" width="100" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
        <rect x="40" y="130" width="110" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
        <rect x="40" y="155" width="120" height="55" rx="6" fill="rgba(255,255,255,0.15)" />
        <rect x="48" y="163" width="50" height="8" rx="2" fill="rgba(255,255,255,0.4)" />
        <rect x="48" y="177" width="40" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="48" y="191" width="45" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="40" y="225" width="120" height="28" rx="6" fill="rgba(255,255,255,0.9)" />
        <text
          x="100"
          y="244"
          fontFamily="system-ui, sans-serif"
          fontSize="10"
          fontWeight="600"
          fill="#2C3E50"
          textAnchor="middle"
        >
          Download Audit PDF
        </text>
      </svg>
    </div>
  )
}
