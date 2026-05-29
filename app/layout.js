import '../globals.css'
import { Analytics } from '@vercel/analytics/react'
import Providers from './providers'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'CleanEats — Precision Meal Planning',
  description: 'AI-powered meal plans built around your body, goals, and local ingredients.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <div className="bg-grid" aria-hidden />
        <div className="bg-tri" aria-hidden />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
