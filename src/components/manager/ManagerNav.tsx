import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'
import { BRAND, ROUTES } from '@/constants'

// Mobile (< md): horizontal top tab bar -- same pattern as ContractorNav.
// Desktop (md+): fixed left sidebar. Parent page wrappers should add
// `md:pl-56` on the outer div so the main content clears the sidebar.

type TabKey = 'dashboard' | 'contractors' | 'timetable'

const TABS: Array<{ key: TabKey; label: string; href: string }> = [
  { key: 'dashboard', label: 'Dashboard', href: ROUTES.manager },
  { key: 'contractors', label: 'Contractors', href: ROUTES.managerContractors },
  { key: 'timetable', label: 'Timetable', href: ROUTES.managerTimetable },
]

export function ManagerNav({ active }: { active: TabKey }) {
  return (
    <>
      <MobileTopBar active={active} />
      <DesktopSidebar active={active} />
    </>
  )
}

function MobileTopBar({ active }: { active: TabKey }) {
  return (
    <header
      className="border-b md:hidden"
      style={{ borderColor: BRAND.border, backgroundColor: '#fff' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-3">
        <BrandText />
        <SignOutButton />
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 px-4 pt-2" aria-label="Manager sections">
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

function DesktopSidebar({ active }: { active: TabKey }) {
  return (
    <aside
      className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r md:flex"
      style={{ borderColor: BRAND.border, backgroundColor: '#fff' }}
      aria-label="Manager sections"
    >
      <div className="px-5 pt-6">
        <BrandText large />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
        {TABS.map((t) => {
          const isActive = t.key === active
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={isActive ? 'page' : undefined}
              className="rounded-md px-3 py-2 text-sm"
              style={{
                backgroundColor: isActive ? BRAND.background : 'transparent',
                color: isActive ? BRAND.primary : BRAND.textLight,
                fontWeight: isActive ? 600 : 500,
                borderLeft: isActive ? `3px solid ${BRAND.accent}` : '3px solid transparent',
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-5 py-4" style={{ borderColor: BRAND.border }}>
        <SignOutButton />
      </div>
    </aside>
  )
}

function BrandText({ large = false }: { large?: boolean }) {
  return (
    <p
      className={large ? 'text-lg font-bold tracking-tight' : 'text-sm font-semibold tracking-wide'}
      style={{ color: BRAND.primary }}
    >
      FieldLog
    </p>
  )
}
