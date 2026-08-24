import { Link } from 'react-router-dom'
import { ExternalLink, Fuel, Gauge, Mail, MapPin, Navigation, Route as RouteIcon, Scale, TrendingDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CONTACT_EMAIL = 'yuehmingteng@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/yuehming-teng-6a20651b0/'

const STEPS = [
  {
    icon: MapPin,
    title: 'Set your route',
    description: 'Enter your origin and destination, or drop pins right on the map.',
  },
  {
    icon: RouteIcon,
    title: 'Get fuel-wise advice',
    description:
      'FuelWise checks live station prices along the way and ranks the best money-saving stops.',
  },
  {
    icon: Scale,
    title: 'See the real trade-off',
    description:
      "Each option shows the price per liter, total cost, and exactly how much extra time and distance the detour adds — so you only take it if it's actually worth it.",
  },
]

const FEATURES = [
  {
    icon: TrendingDown,
    title: 'Live price comparison',
    description: 'Real fuel prices pulled from stations near your route, not stale averages.',
  },
  {
    icon: Scale,
    title: 'True cost, not just cheap gas',
    description: 'Every suggestion factors in the added drive time and distance, so you see net savings, not just a lower price tag.',
  },
  {
    icon: Navigation,
    title: 'One-tap navigation',
    description: 'Pick a station and launch turn-by-turn directions straight into Google Maps.',
  },
  {
    icon: Gauge,
    title: 'Your vehicle, your numbers',
    description: 'Set your tank size and fuel efficiency once; override them anytime for a specific trip.',
  },
]

export function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="text-emerald-600" size={22} />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">FuelWise</span>
          </div>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 mb-3">Smart fuel routing</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
            Save money on every tank,
            <br className="hidden sm:block" /> not just every trip.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-8">
            FuelWise finds the cheapest fuel stop along your route — not just the nearest one — so you save real
            money without adding meaningful time to your drive.
          </p>
          <div className="flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-6 py-3 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Problem / value prop strip */}
        <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto px-6 py-10 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              Most drivers fill up at whatever station they pass, leaving savings on the table. FuelWise compares
              stations along your actual route and shows you which detour is worth taking — and which isn&apos;t.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold shrink-0">
                    {index + 1}
                  </div>
                  <step.icon className="text-emerald-600" size={22} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
              Everything you need to fill up smarter
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 mb-4">
                    <feature.icon className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Stop guessing where to fill up.
          </h2>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-block rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 transition-colors"
            >
              Create a free account
            </Link>
          )}
        </section>
        {/* Contact */}
        <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Get in touch</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">
              Questions, feedback, or just want to connect? Reach out below.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Mail size={18} className="text-emerald-600" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink size={18} className="text-emerald-600" />
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          FuelWise — smart fuel-efficient routing.
        </div>
      </footer>
    </div>
  )
}
