import { createClient } from '../lib/supabase/server'
import Nav from '../Nav'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import Persona from '../components/landing/Persona'
import SignUpSection from '../components/landing/SignUpSection'

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

  return (
    <div className="page-layer min-h-screen">
      <Nav user={user} variant="landing" />
      <main className="pb-8">
        <Hero
          ctaHref={user ? '/dashboard' : '/signup'}
          ctaLabel={user ? 'Go to dashboard' : 'Start your plan'}
          latestPlan={latestPlan}
        />
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <Features />
          <Persona />
          <SignUpSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
