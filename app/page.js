import { createClient } from '../lib/supabase/server'
import Nav from '../Nav'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import SignUpSection from '../components/landing/SignUpSection'
import Features from '../components/landing/Features'
import TdeeCalculator from '../components/landing/TdeeCalculator'
import MetricsEducation from '../components/landing/MetricsEducation'
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let latestPlan = null
  if (user) {
    const { data } = await supabase
      .from('plans')
      .select('plan_json, plan_title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    latestPlan = data?.plan_json || null
  }

  const planJson = latestPlan?.plan_json || latestPlan
  const hasPlan = !!planJson

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })

  return (
    <div className="page-layer min-h-screen">
      <Nav user={user} variant="landing" />
      <main className="pb-8">
        <Hero
          ctaHref={user ? '/dashboard' : '/signup'}
          ctaLabel={user ? 'Go to dashboard' : 'Start your plan'}
          dateLabel={dateLabel}
        />
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <SignUpSection user={user} />
          <Features />
          {hasPlan && (
            <section className="mb-24 max-w-[420px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mb-4">
                Your targets
              </p>
              <PerformanceMetrics planData={planJson} meta="From your latest plan" />
            </section>
          )}
          <TdeeCalculator />
          <MetricsEducation />
        </div>
      </main>
      <Footer />
    </div>
  )
}
