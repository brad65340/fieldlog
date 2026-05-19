import { BRAND } from '@/constants'

export default function ManagerHome() {
  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: BRAND.background, color: BRAND.text }}
    >
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold" style={{ color: BRAND.primary }}>
          Manager
        </h1>
        <p className="mt-2 text-sm" style={{ color: BRAND.textLight }}>
          Application dashboard lands here in Phase 3.
        </p>
      </div>
    </main>
  )
}
