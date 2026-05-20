import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'

// Shared tab bar for the contractor surface. Active tab gets the brand color
// underline + bold text; inactive tabs are muted.

type TabKey = 'log' | 'history' | 'products'

const TABS: Array<{ key: TabKey; label: string; href: string }> = [
  { key: 'log', label: 'Log', href: ROUTES.contractor },
  { key: 'history', label: 'History', href: ROUTES.contractorHistory },
  { key: 'products', label: 'Products', href: ROUTES.contractorProducts },
]

export function ContractorNav({ active }: { active: TabKey }) {
  return (
    <header className="border-b" style={{ borderColor: BRAND.border, backgroundColor: '#fff' }}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-3">
        <p className="text-sm font-semibold tracking-wide" style={{ color: BRAND.primary }}>
          FieldLog
        </p>
        <SignOutButton />
      </div>
      <nav className="mx-auto flex max-w-md gap-1 px-4 pt-2" aria-label="Contractor sections">
        {TABS.map((t) => {
          const isActive = t.key === active
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 border-b-2 pb-2 pt-1 text-center text-sm"
              style={{
                borderColor: isActive ? BRAND.accent : 'transparent',
                color: isActive ? BRAND.primary : BRAND.textLight,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
