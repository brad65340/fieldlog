import Link from 'next/link'
import { ROUTES } from '@/constants'
import { Logo } from './Logo'

// Footer at the bottom of the landing page. Four columns on desktop,
// stacked on mobile. Named "Landing" to avoid clashing with any future
// global footer component.

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Early Access', href: '#cta' },
]

const COMPANY_LINKS = ['About', 'Blog', 'Contact', 'Privacy']
const CONNECT_LINKS = ['LinkedIn', 'Twitter', 'Email', 'Support']

export function LandingFooter() {
  return (
    <footer
      className="text-white"
      style={{
        backgroundColor: '#2C3E50',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo variant="light" className="h-auto w-36" />
            <p className="mt-3 text-xs opacity-80">
              One immutable contractor record. Full operator control. Audit-ready when needed.
            </p>
          </div>

          <FooterColumn title="Product">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm opacity-80 hover:opacity-100">{l.label}</a>
              </li>
            ))}
            <li>
              <Link href={ROUTES.login} className="text-sm opacity-80 hover:opacity-100">
                Login
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Company">
            {COMPANY_LINKS.map((label) => (
              <li key={label}>
                <span className="text-sm opacity-80">{label}</span>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Connect">
            {CONNECT_LINKS.map((label) => (
              <li key={label}>
                <span className="text-sm opacity-80">{label}</span>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div
          className="mt-10 pt-5 text-center text-xs opacity-70"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          Copyright 2026 FieldLog. All rights reserved. · Contractors logged. You verify. Compliant operations.
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}
