// Six feature cards in a responsive grid. Numbered icon → headline → body
// copy. Matches the original .features-grid auto-fit layout (3 columns on
// desktop, 2 on tablet, 1 on mobile).

const FEATURES = [
  {
    n: 1,
    title: 'Contractor Visibility',
    body: 'See exactly what your contractors logged. One immutable record per application. No scattered spreadsheets, texts, or photos. Full transparency without micromanaging.',
  },
  {
    n: 2,
    title: 'Audit-Ready Logs',
    body: 'EPA compliance built in. Every application checked against regulations automatically. Generate audit reports instantly. Stay compliant without the paperwork nightmare.',
  },
  {
    n: 3,
    title: 'Works Offline, Syncs Anywhere',
    body: 'Contractors log in the field with no signal. Data syncs when connected. Your operation stays in control even when connectivity fails. Reliability built in.',
  },
  {
    n: 4,
    title: 'Real-Time Weather Integration',
    body: 'Weather captured automatically at the GPS location the moment a contractor submits. Wind speed, temperature, and humidity logged with every application - no manual entry.',
  },
  {
    n: 5,
    title: 'Simple Team Management',
    body: 'Create contractor logins in seconds. Manage permissions. View team dashboards. Scale your operation without adding administrative burden.',
  },
  {
    n: 6,
    title: 'PDF Exports & Records',
    body: 'Export audit-ready PDFs with one click. Share with consultants, auditors, or regulators. One source of truth for your entire spray season.',
  },
]

export function Features() {
  return (
    <section className="py-16 md:py-20" id="features">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#2C3E50' }}>
            Built for Teams Managing Teams
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: '#4a4a68' }}>
            Features designed around the real challenges mid-to-large operations face when scaling with contractors.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.n}
              className="rounded-2xl border p-8 transition hover:-translate-y-1 hover:shadow-lg hover:bg-white"
              style={{ borderColor: '#e8e7e5', backgroundColor: '#f5f4f2' }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #52896F 0%, #5A8F6E 100%)' }}
              >
                {f.n}
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: '#2C3E50' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4a4a68' }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
