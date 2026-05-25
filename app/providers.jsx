'use client'

import { ThemeProvider } from '../components/ThemeProvider'

export default function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
