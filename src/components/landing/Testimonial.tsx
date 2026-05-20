export function Testimonial() {
  return (
    <section
      className="border-b py-16 md:py-20"
      style={{
        borderColor: '#e8e7e5',
        background: 'linear-gradient(135deg, #f5f4f2 0%, #ffffff 100%)',
      }}
    >
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p
          className="text-2xl font-semibold italic leading-relaxed md:text-3xl"
          style={{ color: '#2C3E50' }}
        >
          &ldquo;Finally, a tool that lets me stay in control while trusting my contractors.&rdquo;
        </p>
        <p className="mt-6 text-sm font-semibold" style={{ color: '#4a4a68' }}>
          Mid-size operation operator
        </p>
        <p className="mt-1 text-xs" style={{ color: '#4a4a68' }}>
          Southeast Missouri, Pilot Program
        </p>
      </div>
    </section>
  )
}
