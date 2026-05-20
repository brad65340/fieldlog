import { CtaSection } from '@/components/landing/CtaSection'
import { Features } from '@/components/landing/Features'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SeeItInAction } from '@/components/landing/SeeItInAction'
import { Testimonial } from '@/components/landing/Testimonial'
import { TrustBar } from '@/components/landing/TrustBar'

// Landing page composition. Section order matches docs/index.html with one
// addition per Module 5.9: SeeItInAction sits between Features and
// HowItWorks as the 2-second "this is the demo" visual.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <SeeItInAction />
        <HowItWorks />
        <Testimonial />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
