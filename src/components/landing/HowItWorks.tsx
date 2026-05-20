// Three-step workflow section. Cream background to alternate with the
// white "See It In Action" / Features sections above.

const STEPS = [
  {
    n: 1,
    title: 'Create Your Team',
    body: 'Set up your operation account and create login credentials for each contractor. Done in minutes. No complex setup.',
  },
  {
    n: 2,
    title: 'Contractors Log Applications',
    body: 'Each contractor logs their spray using the mobile app. Weather is captured automatically. EPA compliance is checked instantly. Takes 60 seconds per application.',
  },
  {
    n: 3,
    title: 'Verify & Export',
    body: 'Review all logs in your dashboard. Flagged applications appear in red immediately. Export audit-ready PDFs on demand. Know exactly what happened on your operation.',
  },
]

export function HowItWorks() {
  return (
    <section
      className="border-b py-16 md:py-20"
      style={{ backgroundColor: '#f5f4f2', borderColor: '#e8e7e5' }}
      id="how"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#2C3E50' }}>
            Simple Workflow. Real Results.
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: '#4a4a68' }}>
            From signup to audit-ready in three straightforward steps.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: '#2C3E50' }}
              >
                {s.n}
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: '#2C3E50' }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4a4a68' }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
