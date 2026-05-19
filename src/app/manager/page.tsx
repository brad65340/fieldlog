import { SignOutButton } from '@/components/SignOutButton'
import { BRAND } from '@/constants'

export default function ManagerHome() {
  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: BRAND.background, color: BRAND.text }}
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
            Manager
          </h1>
          <SignOutButton />
        </header>
        <p className="text-sm" style={{ color: BRAND.textLight }}>
          Application dashboard lands here in Phase 3.
        </p>
      </div>
    </main>
  )
}
