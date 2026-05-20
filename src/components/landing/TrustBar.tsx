// Navy band immediately below the hero. Four big-number trust stats.

const ITEMS = [
  { value: 'Immutable', label: 'Audit Trail - Cannot Be Altered' },
  { value: '$50-100/mo', label: 'Validated Pricing Range' },
  { value: '30-50%', label: 'Documentation Time Saved' },
  { value: 'Offline-First', label: 'Works With No Cell Signal' },
]

export function TrustBar() {
  return (
    <section
      className="border-b py-10 text-white"
      style={{ backgroundColor: '#2C3E50', borderColor: '#e8e7e5' }}
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-5 text-center md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.value}>
            <h3 className="text-xl font-bold md:text-2xl">{item.value}</h3>
            <p className="mt-1 text-xs opacity-90">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
